// Disparo da campanha via linha de comando (alternativa ao botao do painel).
// Uso: npm run enviar          -> envia so para pendentes
//      npm run enviar -- todos  -> reenvia para todos
import { readFileSync } from 'node:fs';

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const { templateEmail, ASSUNTO_CAMPANHA } = await import('../lib/template.js');
const { getPool } = await import('../lib/db.js');
const { baseUrl } = await import('../lib/base.js');
const reenviar = process.argv.includes('todos');
const base = baseUrl();

const pool = getPool();

const [recips] = await pool.query(
  reenviar ? 'SELECT token,nome,email FROM recipients ORDER BY id'
           : 'SELECT token,nome,email FROM recipients WHERE enviado_em IS NULL ORDER BY id');

console.log(`Enviando para ${recips.length} destinatario(s)...`);
for (const r of recips) {
  const link = `${base}/acesso?id=${encodeURIComponent(r.token)}`;
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: process.env.SENDER_EMAIL, name: process.env.SENDER_NAME },
        to: [{ email: r.email, name: r.nome }],
        subject: ASSUNTO_CAMPANHA,
        htmlContent: templateEmail(r.nome, link),
        tags: [r.token],
      }),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${txt}`);
    let mid = ''; try { mid = JSON.parse(txt).messageId || ''; } catch {}
    await pool.query('UPDATE recipients SET enviado_em=CURRENT_TIMESTAMP, message_id=? WHERE token=?', [mid, r.token]);
    await pool.query('INSERT INTO email_events (token,tipo,detalhe) VALUES (?,?,?)', [r.token, 'enviado', mid]);
    console.log(`  ok  ${r.email}`);
  } catch (e) {
    await pool.query('INSERT INTO email_events (token,tipo,detalhe) VALUES (?,?,?)', [r.token, 'erro', String(e.message).slice(0,190)]);
    console.error(`  ERRO ${r.email} -> ${e.message}`);
  }
  await new Promise(s => setTimeout(s, 350));
}
await pool.end();
console.log('Concluido.');
