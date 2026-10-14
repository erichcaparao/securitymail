import { getPool } from '@/lib/db';
import { templateEmail, ASSUNTO_CAMPANHA } from '@/lib/template';
import SendButton from './SendButton';

export const dynamic = 'force-dynamic';

export default async function TemplatePage() {
  const pool = getPool();
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM recipients');
  const [[{ pend }]] = await pool.query('SELECT COUNT(*) AS pend FROM recipients WHERE enviado_em IS NULL');

  const base = (process.env.BASE_URL || '').replace(/\/$/, '');
  // Preview com um token de exemplo
  const html = templateEmail('Fulano de Tal', `${base}/acesso?id=EXEMPLO_TOKEN`);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '4px 0 6px' }}>Template da campanha</h1>
      <p style={{ fontSize: 14, color: '#666', marginTop: 0 }}>
        Assunto: <b>{ASSUNTO_CAMPANHA}</b> · Remetente: <b>{process.env.SENDER_NAME} &lt;{process.env.SENDER_EMAIL}&gt;</b>
      </p>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 4px 14px rgba(0,0,0,.06)', marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 6px', color: '#086738' }}>Disparo</h2>
        <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
          {total} contato(s) na lista · {pend} pendente(s). O link de cada pessoa é personalizado com o token dela.
        </p>
        <SendButton pendentes={pend} />
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
        <h2 style={{ fontSize: 16, margin: '0 0 12px', color: '#086738' }}>Pré-visualização do e-mail</h2>
        <iframe title="preview" srcDoc={html}
          style={{ width: '100%', height: 640, border: '1px solid #ddd', borderRadius: 8 }} />
      </div>
    </>
  );
}
