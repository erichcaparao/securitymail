import { getPool } from '@/lib/db';
import FunilSankey from './FunilSankey';
import GridContatos from './GridContatos';

export const dynamic = 'force-dynamic';

async function getDados() {
  const pool = getPool();
  const [recips] = await pool.query('SELECT token,nome,email,cargo,enviado_em FROM recipients ORDER BY nome');
  const [ee] = await pool.query('SELECT token,tipo FROM email_events');
  const [pe] = await pool.query('SELECT token,evento,created_at FROM page_events');

  const map = {};
  for (const r of recips) map[r.token] = {
    ...r,
    enviado: !!r.enviado_em, entregue: false, aberto: false,
    clicou: false, digitou: false, caiu: false, quando: '',
  };
  for (const e of ee) {
    const p = map[e.token]; if (!p) continue;
    if (e.tipo === 'enviado') p.enviado = true;
    if (e.tipo === 'entregue') p.entregue = true;
    if (e.tipo === 'aberto') p.aberto = true;
    if (e.tipo === 'clique_email') p.clicou = true;
  }
  for (const e of pe) {
    const p = map[e.token]; if (!p) continue;
    if (e.evento === 'clique') p.clicou = true;
    if (e.evento === 'digitou_email') p.digitou = true;
    if (e.evento === 'submeteu') { p.caiu = true; p.quando = new Date(e.created_at).toLocaleString('pt-BR'); }
  }

  // Funil monotonico: um evento posterior implica os anteriores. Sem o webhook do
  // Brevo, "recebeu/abriu" nao chegam; mas quem caiu necessariamente digitou o
  // e-mail, clicou, recebeu e abriu o e-mail, entao inferimos para manter coerencia.
  for (const p of Object.values(map)) {
    if (p.caiu) p.digitou = true;
    if (p.digitou) p.clicou = true;
    if (p.clicou) p.aberto = true;
    if (p.aberto) p.entregue = true;
  }

  const lista = Object.values(map);
  const n = (f) => lista.filter(f).length;
  return {
    lista,
    tot: lista.length,
    enviados: n(p => p.enviado),
    recebidos: n(p => p.entregue),
    abriram: n(p => p.aberto),
    clicaram: n(p => p.clicou),
    digitaram: n(p => p.digitou),
    cairam: n(p => p.caiu),
  };
}

export default async function Dashboard() {
  const d = await getDados();
  const pct = (x) => d.tot ? Math.round(x / d.tot * 100) : 0;
  const cards = [
    ['Destinatarios', d.tot, '#231F20'],
    ['Enviados', d.enviados, '#086738'],
    ['Receberam', d.recebidos, '#086738'],
    ['Abriram', d.abriram, '#0a7d45'],
    ['Clicaram', d.clicaram, '#c58a00'],
    ['Digitaram e-mail', d.digitaram, '#d2691e'],
    ['Cairam', d.cairam, '#ED1C24'],
  ];
  return (
    <>
      <h1 style={{ fontSize: 22, margin: '4px 0 18px' }}>Indicadores da campanha "Planejamento Orcamentario 2027"</h1>

      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        {cards.map(([l, nn, c]) => (
          <div key={l} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 140, boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c }}>{nn}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['Taxa de abertura', pct(d.abriram)], ['Taxa de clique', pct(d.clicaram)], ['Taxa de falha (cairam)', pct(d.cairam)]].map(([l, p]) => (
          <div key={l} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', flex: 1, minWidth: 180, boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{l}</div>
            <div style={{ background: '#eee', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div style={{ width: p + '%', height: '100%', background: l.includes('falha') ? '#ED1C24' : '#086738' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{p}%</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '18px 20px 8px', marginBottom: 24, boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Funil da campanha</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
          Do envio até a submissão do login. "Caiu" = chegou na tela de senha e clicou em Entrar (inseriu os dados).
        </div>
        <FunilSankey
          enviados={d.enviados}
          abriram={d.abriram}
          naoAbriram={Math.max(d.enviados - d.abriram, 0)}
          clicaram={d.clicaram}
          digitaram={d.digitaram}
          cairam={d.cairam}
        />
      </div>

      {d.lista.length === 0
        ? <p style={{ fontSize: 14, color: '#666' }}>Nenhum contato importado ainda. Va em Contatos para importar a lista.</p>
        : <GridContatos lista={d.lista} />}
      <p style={{ fontSize: 13, color: '#888', marginTop: 16 }}>
        Nenhuma senha e registrada. "Receberam/Abriram" vem do Brevo (webhook) ou sao inferidos quando houve clique; "Clicou/Digitou/Caiu" do rastreio da propria pagina. "Digitou" = avancou para a tela de senha; "Caiu" = clicou em Entrar (submeteu o login).
      </p>
    </>
  );
}
