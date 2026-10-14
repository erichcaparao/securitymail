import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// Recebe eventos transacionais do Brevo (entrega, abertura, clique, bounce).
// Configure no Brevo: Transactional > Settings > Webhook, URL:
//   {BASE_URL}/api/brevo-webhook?s=SEU_BREVO_WEBHOOK_SECRET
// Mapeamos o evento ao destinatario pela tag (=token) ou pelo e-mail.

const MAPA = {
  request: 'enviado',
  delivered: 'entregue',
  opened: 'aberto',
  unique_opened: 'aberto',
  click: 'clique_email',
  hard_bounce: 'bounce',
  soft_bounce: 'bounce',
  blocked: 'bounce',
  spam: 'spam',
  invalid_email: 'erro',
  error: 'erro',
};

export async function POST(req) {
  const url = new URL(req.url);
  if (url.searchParams.get('s') !== process.env.BREVO_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let ev = {};
  try { ev = await req.json(); } catch {}

  const tipo = MAPA[ev.event];
  if (!tipo) return NextResponse.json({ ok: true, ignored: ev.event });

  const pool = getPool();
  let token = Array.isArray(ev.tags) ? ev.tags[0] : (ev.tag || '');
  token = String(token || '').replace(/[^a-zA-Z0-9]/g, '');

  try {
    if (!token && ev.email) {
      const [r] = await pool.query('SELECT token FROM recipients WHERE email=? LIMIT 1',
        [String(ev.email).toLowerCase()]);
      if (r.length) token = r[0].token;
    }
    if (!token) return NextResponse.json({ ok: true, unmatched: true });

    await pool.query(
      'INSERT INTO email_events (token, tipo, detalhe) VALUES (?,?,?)',
      [token, tipo, String(ev.reason || ev.link || '').slice(0, 190)]
    );
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
