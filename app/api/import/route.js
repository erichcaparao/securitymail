import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { gerarToken } from '@/lib/token';

// Importa a lista de destinatarios (CSV ou texto colado).
// Colunas aceitas (com ou sem cabecalho): nome, email, cargo.
// Linha sem e-mail valido e ignorada; e-mail ja existente e atualizado.
export async function POST(req) {
  let texto = '';
  const ct = req.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const b = await req.json();
      texto = String(b.csv || '');
    } else if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('arquivo');
      texto = file ? await file.text() : String(form.get('csv') || '');
    } else {
      texto = await req.text();
    }
  } catch {}

  const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const pool = getPool();
  let inseridos = 0, atualizados = 0, ignorados = 0;
  const erros = [];
  const reEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  for (let i = 0; i < linhas.length; i++) {
    const cols = linhas[i].split(/[;,]/).map(c => c.trim().replace(/^"|"$/g, ''));
    if (i === 0 && /nome|email|e-mail|cargo/i.test(linhas[i]) && !linhas[i].includes('@')) continue;

    const idxEmail = cols.findIndex(c => reEmail.test(c));
    if (idxEmail === -1) { ignorados++; continue; }
    const email = cols[idxEmail].toLowerCase();
    const nome = cols[idxEmail === 0 ? 1 : 0] || '';
    const cargo = cols.find((c, k) => k !== idxEmail && c !== nome) || '';

    try {
      const [ex] = await pool.query('SELECT token FROM recipients WHERE email=? LIMIT 1', [email]);
      if (ex.length) {
        await pool.query('UPDATE recipients SET nome=?, cargo=? WHERE email=?',
          [nome.slice(0, 160), cargo.slice(0, 120), email]);
        atualizados++;
      } else {
        await pool.query('INSERT INTO recipients (token, nome, email, cargo) VALUES (?,?,?,?)',
          [gerarToken(), nome.slice(0, 160), email.slice(0, 190), cargo.slice(0, 120)]);
        inseridos++;
      }
    } catch (e) {
      erros.push(`${email}: ${e.code || e.message}`);
    }
  }

  return NextResponse.json({ ok: true, inseridos, atualizados, ignorados, erros });
}
