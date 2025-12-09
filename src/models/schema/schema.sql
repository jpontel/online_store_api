-- ============================================
-- TIPOS ENUM
-- ============================================

CREATE TYPE tipo_usuario AS ENUM ('COMPRADOR', 'VENDEDOR');
CREATE TYPE status_usuario AS ENUM ('ATIVO', 'INATIVO', 'EXCLUIDO');
CREATE TYPE metodo_pagamento AS ENUM ('CARTAO', 'PIX', 'BOLETO');
CREATE TYPE status_pedido AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'CANCELADO');

-- ============================================
-- TABELA: usuarios
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo tipo_usuario NOT NULL,
  status status_usuario DEFAULT 'ATIVO' NOT NULL,

  -- Campos opcionais para VENDEDOR
  nome_loja VARCHAR(255),
  cnpj VARCHAR(18),

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: produtos
-- ============================================

CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
  descricao TEXT,
  url_imagens TEXT[] DEFAULT '{}', 
  publicado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT TRUE,

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: carrinho
-- ============================================

CREATE TABLE carrinho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(cliente_id, produto_id)
);

-- ============================================
-- TABELA: favoritos
-- ============================================

CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(cliente_id, produto_id)
);

-- ============================================
-- TABELA: pedidos
-- ============================================

CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  endereco JSONB NOT NULL, -- Stores full address object
  metodo_pagamento metodo_pagamento NOT NULL,
  status status_pedido DEFAULT 'PENDENTE' NOT NULL,

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: itens_pedido
-- ============================================

CREATE TABLE itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,

  -- Snapshot do produto no momento da compra
  nome_produto VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_total INTEGER NOT NULL CHECK (valor_total > 0),

  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGERS PARA data_ultima_atualizacao
-- ============================================

-- Função para atualizar data_ultima_atualizacao
CREATE OR REPLACE FUNCTION trigger_set_data_ultima_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_ultima_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
CREATE TRIGGER set_usuarios_data_ultima_atualizacao
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_data_ultima_atualizacao();

-- Trigger para produtos
CREATE TRIGGER set_produtos_data_ultima_atualizacao
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_data_ultima_atualizacao();

-- Trigger para pedidos
CREATE TRIGGER set_pedidos_data_ultima_atualizacao
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_data_ultima_atualizacao();