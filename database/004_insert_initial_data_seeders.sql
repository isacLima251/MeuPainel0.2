-- Arquivo: 004_insert_initial_data_seeders.sql

-- NOTA: Os IDs foram definidos fixos (1, 2, 3) para que os FKs sejam consistentes.
-- O Front-end espera que o login seja feito com 'super@rai.com' e 'admin@rai.com' com a senha '123456'.

-- 1. INSERIR CLIENTE (Tenant) DE TESTE
-- Este é o cliente que o Admin e Atendente abaixo irão pertencer.
INSERT INTO clientes (id, nome_empresa, documento, status_assinatura, valor_mensal) VALUES
(1, 'Empresa de Teste - Meu Painel', '99.999.999/0001-00', 'ativa', 297.00);

-- 2. INSERIR USUÁRIOS ESSENCIAIS

-- 2a. Super Admin (Dono do Produto SaaS - NÃO tem cliente_id)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Super Admin', 'super@rai.com', 'hash_123456', 'super_admin');

-- 2b. Admin Cliente (Login de teste da Empresa 1)
INSERT INTO users (id, cliente_id, name, email, password_hash, role) VALUES
(2, 1, 'Admin Empresa', 'admin@rai.com', 'hash_123456', 'admin');

-- 2c. Atendente (Login para o Dashboard de teste)
INSERT INTO users (id, cliente_id, name, email, password_hash, role) VALUES
(3, 1, 'Isabela', 'isa@rai.com', 'hash_123456', 'atendente');

-- 3. VINCULAR O ATENDENTE À TABELA DE ATENDENTES
INSERT INTO atendentes (id, cliente_id, user_id, nome, codigo, telefone, salario_mensal) VALUES
(1, 1, 3, 'Isabela', 'ISA', '11999999999', 1500.00);

-- 4. INSERIR UM KIT DE PRODUTO BÁSICO
INSERT INTO kits (id, cliente_id, nome, codigo_braip, comissao_percentual) VALUES
(1, 1, 'Kit Teste Inicial', 'KTEST', 10.00);

-- Opcional, mas importante: Resetar as sequências de ID para garantir novos registros
-- (Se estiver a usar MySQL, pode ignorar este passo ou usar SET @dummy := (SELECT MAX(id) FROM clientes); ALTER TABLE clientes AUTO_INCREMENT = @dummy + 1;)
SELECT setval('clientes_id_seq', 1, TRUE);
SELECT setval('users_id_seq', 3, TRUE);
SELECT setval('atendentes_id_seq', 1, TRUE);
SELECT setval('kits_id_seq', 1, TRUE);