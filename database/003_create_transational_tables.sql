-- Arquivo: 003_create_transational_tables.sql

-- 1. Tabela: vendas (Registro Central de Vendas)
-- Esta tabela armazena os pedidos, seus status críticos e os vínculos
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    pedido_id_braip VARCHAR(255) UNIQUE NOT NULL,

    -- Informações do Cliente
    cliente_nome VARCHAR(255),
    cliente_telefone VARCHAR(20),
    cliente_cpf VARCHAR(15),
    cliente_estado VARCHAR(2), -- UF

    -- Vínculos de Atribuição
    atendente_id INTEGER, -- FK
    criativo_id INTEGER, -- FK
    kit_id INTEGER NOT NULL, -- FK

    -- Status e Datas
    -- Valores Aceitos: AGENDADO, AGUARDANDO_PAGAMENTO, PAGAMENTO_ATRASADO, PAGO, FRUSTRADO, CANCELADA
    status VARCHAR(50) NOT NULL, 
    data_agendamento TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    data_pagamento TIMESTAMP WITHOUT TIME ZONE, -- Data de efetivação do pagamento

    -- Valores Financeiros
    valor DECIMAL(10, 2) NOT NULL, -- Valor Bruto da Venda
    comissao_gerada DECIMAL(10, 2) DEFAULT 0.00,
    desconto_valor DECIMAL(10, 2) DEFAULT 0.00,
    desconto_tipo VARCHAR(50) DEFAULT 'nao_afeta', -- proporcional, zerar, nao_afeta

    -- UTMs e Identificação
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_atendente VARCHAR(10),
    sem_identificacao BOOLEAN DEFAULT FALSE, -- Flag para UTMs faltando
    observacoes TEXT,
    
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (atendente_id) REFERENCES atendentes (id),
    FOREIGN KEY (criativo_id) REFERENCES criativos (id),
    FOREIGN KEY (kit_id) REFERENCES kits (id)
);

-- 2. Tabela: despesas (Custos Operacionais - Não é Mídia Paga)
CREATE TABLE despesas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Infra, Pessoal, Outros
    data DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

-- 3. Tabela: gastos_criativos (Investimento em Mídia Paga - Novo Módulo)
CREATE TABLE gastos_criativos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    criativo_id INTEGER NOT NULL, -- FK
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (criativo_id) REFERENCES criativos (id)
);

-- 4. Tabela: logs (Auditoria do Sistema)
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    usuario_nome VARCHAR(255) NOT NULL, -- Quem fez a ação
    acao VARCHAR(255) NOT NULL, -- Ex: Edição Manual, Exclusão
    detalhes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

-- 5. Tabela: historico_status_venda (Rastreio de Mudanças)
CREATE TABLE historico_status_venda (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    venda_id INTEGER NOT NULL,
    status_antigo VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    origem VARCHAR(50), -- WEBHOOK ou MANUAL
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (venda_id) REFERENCES vendas (id)
);

-- 6. Tabela: metas_mensais (Metas para a Motivação)
CREATE TABLE metas_mensais (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS
    atendente_id INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    meta_vendas_qtd INTEGER DEFAULT 0,
    meta_valor DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (atendente_id) REFERENCES atendentes (id),
    UNIQUE (atendente_id, mes, ano) -- Apenas uma meta por atendente por mês/ano
);