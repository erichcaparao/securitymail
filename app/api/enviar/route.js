import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { baseUrl } from '@/lib/base';
import { enviarEmail } from '@/lib/brevo';

// Dispara a campanha para quem ainda nao recebeu.
// body opcional: { reenviar: true } para incluir quem ja recebeu.
export async function POST(req) {
  try {
    return await disparar(req);
  } catch (e) {
    // Erro de nivel geral (banco indisponivel, tabela ausente, config faltando...).
    // Sem este catch o Next devolve um 500 sem corpo JSON e o painel so mostra
    // "Falha no disparo." sem dizer o motivo.
    return NextResponse.json(
      { ok: false, erro: String(e?.message || e) },
      { status: 500 }
    );
  }
}

async function disparar(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const reenviar = !!body.reenviar;

  // Checagem de configuracao essencial, com mensagem clara.
  const faltando = [];
  if (!process.env.BREVO_API_KEY) faltando.push('BREVO_API_KEY');
  if (!process.env.SENDER_EMAIL) faltando.push('SENDER_EMAIL');
  if (faltando.length) {
    return NextResponse.json(
      { ok: false, erro: `Variavel de ambiente ausente: ${faltando.join(', ')}` },
      { status: 500 }
    );
  }

  const pool = getPool();
  const base = baseUrl();

  const [recips] = await pool.query(
    reenviar
      ? 'SELECT token,nome,email FROM recipients ORDER BY id'
      : 'SELECT token,nome,email FROM recipients WHERE enviado_em IS NULL ORDER BY id'
  );

  let enviados = 0;
  const falhas = [];

  for (const r of recips) {
    const link = `${base}/acesso?id=${encodeURIComponent(r.token)}`;
    try {
      const messageId = await enviarEmail({ token: r.token, nome: r.nome, email: r.email, link });
      await pool.query('UPDATE recipients SET enviado_em=CURRENT_TIMESTAMP, message_id=? WHERE token=?',
        [messageId, r.token]);
      await pool.query('INSERT INTO email_events (token, tipo, detalhe) VALUES (?,?,?)',
        [r.token, 'enviado', messageId || '']);
      enviados++;
    } catch (e) {
      falhas.push(`${r.email}: ${e.message}`);
      await pool.query('INSERT INTO email_events (token, tipo, detalhe) VALUES (?,?,?)',
        [r.token, 'erro', String(e.message).slice(0, 190)]);
    }
    await new Promise(s => setTimeout(s, 350)); // respeita rate limit do Brevo
  }

  // So e sucesso se ao menos um foi enviado (ou nao havia ninguem para enviar).
  const ok = enviados > 0 || recips.length === 0;
  return NextResponse.json({ ok, total: recips.length, enviados, falhas });
}
