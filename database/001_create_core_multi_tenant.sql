-- Arquivo: 001_create_core_multi_tenant.sql

-- 1. Tabela: clientes (Tenants)
-- Gerencia as empresas que compraram o Meu Painel (SaaS)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    documento VARCHAR(18), -- CNPJ/CPF da empresa
    status_assinatura VARCHAR(50) DEFAULT 'ativa' NOT NULL, -- ativa, inativa, trial
    valor_mensal DECIMAL(10, 2) DEFAULT 0.00, -- Valor MRR
    data_cadastro TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Tabela: users (Logins e Acessos)
-- Armazena logins e vincula à sua respectiva empresa (cliente_id)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER, -- FK para a tabela clientes
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- super_admin, admin, atendente
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);