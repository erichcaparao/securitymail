-- =====================================================================
--  SIMULAÇÃO DE PHISHING INTERNA — ENGELMIG / TI
--  Banco: engelmig_phishing
--  PRIVACIDADE: não existe coluna de senha em lugar nenhum. Registramos
--  apenas eventos de engajamento (recebido/aberto/clique/submissão).
-- =====================================================================

-- Execute conectado ao banco engelmig_phishing.

-- Destinatários da campanha
CREATE TABLE IF NOT EXISTS recipients (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      VARCHAR(32)  NOT NULL UNIQUE,
  nome       VARCHAR(160) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  cargo      VARCHAR(120) DEFAULT '',
  message_id VARCHAR(190) DEFAULT NULL,   -- id retornado pelo Brevo no envio
  enviado_em DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Eventos do lado do Brevo (entregabilidade e engajamento do e-mail)
CREATE TABLE IF NOT EXISTS email_events (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  token      VARCHAR(32)  NOT NULL,
  tipo       ENUM('enviado','entregue','aberto','clique_email','bounce','spam','erro') NOT NULL,
  detalhe    VARCHAR(190) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Eventos do lado da nossa página (clique no link -> landing -> submissão)
-- NUNCA guardamos senha; email_digitado é a identificação que a pessoa digitou.
CREATE TABLE IF NOT EXISTS page_events (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  token          VARCHAR(32)  NOT NULL,
  evento         ENUM('clique','digitou_email','submeteu','viu_resultado') NOT NULL,
  email_digitado VARCHAR(190) DEFAULT '',
  ip             VARCHAR(64)  DEFAULT '',
  user_agent     VARCHAR(300) DEFAULT '',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_evento (evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
