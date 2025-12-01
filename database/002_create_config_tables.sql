-- Arquivo: 002_create_config_tables.sql

-- 1. Tabela: atendentes (Informações da Equipe)
-- Vincula o perfil do atendente ao login (users) e à empresa (clientes)
CREATE TABLE atendentes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS (Empresa)
    user_id INTEGER UNIQUE NOT NULL, -- Vínculo com o Login na tabela users
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL, -- Ex: ISA, ANA (para o UTM)
    telefone VARCHAR(20),
    salario_mensal DECIMAL(10, 2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 2. Tabela: kits (Produtos e Regras de Comissão Padrão)
CREATE TABLE kits (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS (Empresa)
    nome VARCHAR(255) NOT NULL,
    codigo_braip VARCHAR(50),
    comissao_fixa DECIMAL(10, 2) DEFAULT 0.00,
    comissao_percentual DECIMAL(5, 2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

-- 3. Tabela: criativos (Anúncios/UTM Content)
CREATE TABLE criativos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Vínculo SaaS (Empresa)
    nome VARCHAR(255) NOT NULL, -- utm_content
    campanha VARCHAR(255),
    status VARCHAR(50) DEFAULT 'teste', -- teste, aprovado, ruim
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

-- 4. Tabela: atendente_criativo (SEGURANÇA: Vínculo de Autorização)
-- Associa quais criativos cada atendente PODE vender.
CREATE TABLE atendente_criativo (
    id SERIAL PRIMARY KEY,
    atendente_id INTEGER NOT NULL,
    criativo_id INTEGER NOT NULL,

    FOREIGN KEY (atendente_id) REFERENCES atendentes (id),
    FOREIGN KEY (criativo_id) REFERENCES criativos (id),
    -- Garante que um atendente só possa ter 1 autorização por criativo:
    UNIQUE (atendente_id, criativo_id)
);

-- 5. Tabela: comissoes_personalizadas (Estrutura de Override)
-- Regras de comissão que substituem o padrão do Kit para um atendente específico.
CREATE TABLE comissoes_personalizadas (
    id SERIAL PRIMARY KEY,
    atendente_id INTEGER NOT NULL,
    kit_id INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'fixo' ou 'percentual'
    valor DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (atendente_id) REFERENCES atendentes (id),
    FOREIGN KEY (kit_id) REFERENCES kits (id)
);