-- =====================================================================
--  SIMULACAO DE PHISHING INTERNA — ENGELMIG / TI
--  Banco: libSQL / SQLite (dev: file:local.db | prod: Turso remoto)
--  PRIVACIDADE: nao existe coluna de senha em lugar nenhum. Registramos
--  apenas eventos de engajamento (recebido/aberto/clique/submissao).
-- =====================================================================

-- Destinatarios da campanha
CREATE TABLE IF NOT EXISTS recipients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL,
  cargo      TEXT DEFAULT '',
  message_id TEXT DEFAULT NULL,            -- id retornado pelo Brevo no envio
  enviado_em TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);

-- Eventos do lado do Brevo (entregabilidade e engajamento do e-mail)
CREATE TABLE IF NOT EXISTS email_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('enviado','entregue','aberto','clique_email','bounce','spam','erro')),
  detalhe    TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_email_events_token ON email_events(token);
CREATE INDEX IF NOT EXISTS idx_email_events_tipo  ON email_events(tipo);

-- Eventos do lado da nossa pagina (clique no link -> landing -> submissao)
-- NUNCA guardamos senha; email_digitado e a identificacao que a pessoa digitou.
CREATE TABLE IF NOT EXISTS page_events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  token          TEXT NOT NULL,
  evento         TEXT NOT NULL CHECK (evento IN ('clique','digitou_email','submeteu','viu_resultado')),
  email_digitado TEXT DEFAULT '',
  ip             TEXT DEFAULT '',
  user_agent     TEXT DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_page_events_token  ON page_events(token);
CREATE INDEX IF NOT EXISTS idx_page_events_evento ON page_events(evento);
