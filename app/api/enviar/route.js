import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { enviarEmail } from '@/lib/brevo';

// Dispara a campanha para quem ainda nao recebeu.
// body opcional: { reenviar: true } para incluir quem ja recebeu.
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const reenviar = !!body.reenviar;

  const pool = getPool();
  const base = (process.env.BASE_URL || '').replace(/\/$/, '');

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
      await pool.query('UPDATE recipients SET enviado_em=NOW(), message_id=? WHERE token=?',
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

  return NextResponse.json({ ok: true, total: recips.length, enviados, falhas });
}
