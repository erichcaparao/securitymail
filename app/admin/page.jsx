import { getPool } from '@/lib/db';

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
    clicou: false, caiu: false, quando: '',
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
    if (e.evento === 'submeteu') { p.caiu = true; p.quando = new Date(e.created_at).toLocaleString('pt-BR'); }
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
    ['Cairam', d.cairam, '#ED1C24'],
  ];
  const Tag = ({ on, bad }) => (
    <span style={{ padding: '3px 9px', borderRadius: 12, fontSize: 12, fontWeight: 600,
      ...(on ? (bad ? { background: '#fdeaea', color: '#ED1C24' } : { background: '#e6f4ea', color: '#086738' })
             : { background: '#eee', color: '#999' }) }}>{on ? 'Sim' : '-'}</span>
  );

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

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
        <thead><tr>{['Nome', 'Cargo', 'E-mail', 'Enviado', 'Recebeu', 'Abriu', 'Clicou', 'Caiu', 'Quando'].map(h =>
          <th key={h} style={{ padding: '11px 12px', textAlign: 'left', fontSize: 13, background: '#231F20', color: '#fff' }}>{h}</th>)}</tr></thead>
        <tbody>
          {d.lista.map(p => (
            <tr key={p.token}>
              <td style={td}>{p.nome}</td>
              <td style={td}>{p.cargo}</td>
              <td style={td}>{p.email}</td>
              <td style={td}><Tag on={p.enviado} /></td>
              <td style={td}><Tag on={p.entregue} /></td>
              <td style={td}><Tag on={p.aberto} /></td>
              <td style={td}><Tag on={p.clicou} /></td>
              <td style={td}><Tag on={p.caiu} bad /></td>
              <td style={td}>{p.quando}</td>
            </tr>
          ))}
          {d.lista.length === 0 && (
            <tr><td style={td} colSpan={9}>Nenhum contato importado ainda. Va em Contatos para importar a lista.</td></tr>
          )}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: '#888', marginTop: 16 }}>
        Nenhuma senha e registrada. "Receberam/Abriram" vem do Brevo (webhook); "Clicou/Caiu" do rastreio da propria pagina.
      </p>
    </>
  );
}
const td = { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid #eee' };
