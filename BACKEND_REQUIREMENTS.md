# Meu Painel - Banco de Dados e API (Back-end)

Documento de referência para implementação do back-end SaaS multi-tenant do **Meu Painel**.

## 1. Arquitetura Multi-Tenant (SaaS)
- **clientes** (tenants) centraliza cada empresa contratante.
- **Regra chave:** todas as tabelas de dados de negócio devem ter `cliente_id` como chave estrangeira obrigatória para isolar informações por empresa.
- **Acesso:** usuários administradores/super administradores devem receber o `cliente_id` da sessão/token para filtrar consultas; super administradores visualizam múltiplos tenants.

### Tabela: clientes
| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` (PK) | UUID | Identificador único. |
| `nome_empresa` | string | Nome legal/fantasia. |
| `status_assinatura` | enum('trial','ativo','inadimplente','cancelado') | Controle de faturamento/acesso. |
| `valor_mensal` | decimal | Ticket mensal. |

## 2. Identidade e Permissões
| Tabela | Campos essenciais | Observações |
| --- | --- | --- |
| **users** | `id` (PK), `cliente_id` (FK), `email` (unique), `password_hash`, `role` (`super_admin`\|`admin`\|`atendente`) | Criado junto com o atendente quando `role=atendente`. Super admin pode ter `cliente_id` nulo se permitido pela política. |
| **atendentes** | `id` (PK), `cliente_id` (FK), `user_id` (FK), `nome`, `codigo`, `telefone`, `salario_mensal` (numeric), `ativo` (bool) | Usa login do `user`. |

### Controles de autorização
- Associar `atendente_criativo` para restringir quais criativos cada atendente pode vender.

## 3. Catálogo de Produtos e Criativos
| Tabela | Campos | Observações |
| --- | --- | --- |
| **kits** | `id` (PK), `cliente_id` (FK), `nome`, `codigo_braip`, `comissao_fixa`, `comissao_percentual`, `ativo` | Fonte para cálculos de comissão. |
| **criativos** | `id` (PK), `cliente_id` (FK), `nome`, `campanha`, `status` (`teste`\|`aprovado`\|`ruim`) | Nome deve casar com UTM/content do postback. |
| **atendente_criativo** | `atendente_id` (FK), `criativo_id` (FK), `cliente_id` (FK) | Define permissões de venda por criativo. |

## 4. Vendas e Performance
| Tabela | Campos | Observações |
| --- | --- | --- |
| **vendas** | `id` (PK), `cliente_id` (FK), `pedido_id_braip`, `cliente_nome`, `cliente_telefone`, `cliente_cpf`, `cliente_estado`, `atendente_id` (FK), `criativo_id` (FK), `kit_id` (FK), `status`, `data_agendamento`, `data_pagamento`, `valor`, `comissao_gerada`, `desconto_valor`, `desconto_tipo`, `observacoes`, `utm_campaign`, `utm_content`, `utm_atendente`, `sem_identificacao` | Recebe dados via webhook/postback da Braip. |
| **gastos_criativos** | `id` (PK), `cliente_id` (FK), `criativo_id` (FK), `data_gasto`, `valor_gasto` | Investimento em mídia para cálculo de ROAS. |
| **metas** | `id` (PK), `cliente_id` (FK), `atendente_id` (FK), `mes`, `ano`, `meta_vendas`, `meta_valor` | Metas mensais do atendente. |

### Status da venda e regras de métrica
| Status | Código Braip | Regra no back-end |
| --- | --- | --- |
| `AGENDADO` | 11 | Entra nas projeções de comissões. |
| `AGUARDANDO_PAGAMENTO` | 1 | Entra nas projeções de comissões. |
| `PAGAMENTO_ATRASADO` | 10 | Considerado em "Ação Necessária" (cobrança) e nas projeções. |
| `PAGO` | 2 | Dispara cálculo final de `comissao_gerada` e registra `data_pagamento`. |
| `FRUSTRADO` | 12 | Mantido para taxa de frustração/performance. |
| `CANCELADA` | 3 | Excluída de métricas/projeções; zera `comissao_gerada`. |

### Regras de processamento (Webhook Braip)
1. Normalizar código de status Braip para o enum interno acima.
2. Identificar atendente (`utm_atendente`) e criativo (`utm_content`); se faltante ou sem permissão, marcar `sem_identificacao=true`.
3. Calcular `comissao_gerada` usando regra do kit ou comissão personalizada por atendente. Apenas `PAGO` gera comissão e preenche `data_pagamento`.
4. Toda inserção/atualização deve respeitar o `cliente_id` recebido do token/associação do kit/atendente.

## 5. Despesas e Logs
| Tabela | Campos | Observações |
| --- | --- | --- |
| **despesas** | `id` (PK), `cliente_id` (FK), `descricao`, `valor`, `categoria`, `data` | Despesas operacionais (não marketing). |
| **logs** | `id` (PK), `cliente_id` (FK), `usuario_nome`, `acao`, `detalhes`, `data`, `venda_id` | Trilha de auditoria para alterações manuais/automatizadas. |

## 6. API (pontos principais)
- Autenticação: JWT com `sub` (user id) e `cliente_id` para filtrar todas as consultas.
- Rotas sugeridas: `/clientes`, `/users`, `/atendentes`, `/kits`, `/criativos`, `/vendas`, `/gastos-criativos`, `/metas`, `/despesas`, `/logs`.
- Webhook Braip: endpoint POST idempotente (`pedido_id_braip` como chave natural); atualizar status existente ou criar nova venda conforme payload.

## 7. Considerações de Segurança e Escalabilidade
- Indexes por `cliente_id` e colunas de junção (`atendente_id`, `criativo_id`, `kit_id`).
- Soft delete não recomendado para `vendas` canceladas: usar status `CANCELADA` para exclusão lógica das métricas.
- Garantir que consultas de dashboard ignorem registros `CANCELADA` para projeções e valores ativos.
