import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { baseUrl } from '@/lib/base';
import { enviarEmail } from '@/lib/brevo';

// Dispara a campanha para quem ainda nao recebeu, em lotes.
// body opcional:
//   { limite: N }    -> envia ate N pendentes nesta chamada (0/ausente = todos)
//   { reiniciar: true } -> zera os marcadores de envio (base do "reenviar para todos")
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
  const reiniciar = !!body.reiniciar;
  // Quantos enviar nesta requisicao. O painel chama em lotes pequenos e repete
  // ate zerar os pendentes, mantendo cada requisicao curta (evita o timeout 504
  // de gateway/proxy quando a lista e grande). 0 = sem limite (envia todos).
  const limite = Number.isInteger(body.limite) && body.limite > 0 ? body.limite : 0;

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

  // "Reenviar para todos": zera os marcadores de envio e devolve na hora. O painel
  // segue chamando o loop de pendentes, que agora reprocessa todo mundo em lotes.
  if (reiniciar) {
    await pool.query('UPDATE recipients SET enviado_em = NULL, message_id = NULL');
    return NextResponse.json({ ok: true, reiniciado: true });
  }

  const base = baseUrl();

  const [recips] = await pool.query(
    'SELECT token,nome,email FROM recipients WHERE enviado_em IS NULL ORDER BY id'
    + (limite ? ` LIMIT ${limite}` : '')
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

  // Quantos ainda faltam (usado pelo painel para decidir se chama outro lote).
  const [cnt] = await pool.query(
    'SELECT COUNT(*) AS n FROM recipients WHERE enviado_em IS NULL'
  );
  const restantes = Number(cnt?.[0]?.n ?? 0);

  // So e sucesso se ao menos um foi enviado (ou nao havia ninguem para enviar).
  const ok = enviados > 0 || recips.length === 0;

  // Quando NINGUEM foi enviado, promove a 1a causa a mensagem principal (erro),
  // para o painel mostrar o motivo em destaque e nao so na linha miuda de falhas.
  let erro;
  if (!ok && falhas.length) {
    const [, causa] = falhas[0].split(/:\s(.+)/); // "email: motivo" -> motivo
    erro = `0/${recips.length} enviados. ${causa || falhas[0]}`;
  }

  return NextResponse.json({ ok, total: recips.length, enviados, falhas, erro, restantes });
}
