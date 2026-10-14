import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const EVENTOS = ['clique', 'digitou_email', 'submeteu', 'viu_resultado'];

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const token = String(body.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
  const evento = EVENTOS.includes(body.evento) ? body.evento : null;
  const email = String(body.email || '').trim().slice(0, 190);
  // Blindagem: qualquer campo de senha que chegue e simplesmente ignorado.

  if (!token || !evento) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('x-real-ip') || '';
  const ua = (req.headers.get('user-agent') || '').slice(0, 300);

  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 FROM recipients WHERE token=? LIMIT 1', [token]);
    if (rows.length === 0) return NextResponse.json({ ok: false }, { status: 404 });

    await pool.query(
      'INSERT INTO page_events (token, evento, email_digitado, ip, user_agent) VALUES (?,?,?,?,?)',
      [token, evento, email, ip, ua]
    );
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
