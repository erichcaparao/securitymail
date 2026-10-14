import { getPool } from '@/lib/db';
import { baseUrl } from '@/lib/base';
import ImportForm from './ImportForm';

export const dynamic = 'force-dynamic';

export default async function Contatos() {
  const pool = getPool();
  const [recips] = await pool.query(
    'SELECT token,nome,email,cargo,enviado_em FROM recipients ORDER BY nome'
  );
  const base = baseUrl();

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '4px 0 18px' }}>Contatos da campanha</h1>
      <ImportForm />

      <div style={{ background: '#fff', borderRadius: 10, padding: 22, boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
        <h2 style={{ fontSize: 17, margin: '0 0 12px', color: '#086738' }}>
          Lista atual ({recips.length})
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Nome', 'E-mail', 'Cargo', 'Enviado', 'Link individual'].map(h =>
            <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontSize: 13, borderBottom: '2px solid #231F20' }}>{h}</th>)}</tr></thead>
          <tbody>
            {recips.map(r => (
              <tr key={r.token}>
                <td style={td}>{r.nome}</td>
                <td style={td}>{r.email}</td>
                <td style={td}>{r.cargo}</td>
                <td style={td}>{r.enviado_em ? new Date(r.enviado_em).toLocaleString('pt-BR') : '—'}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{base}/acesso?id={r.token}</td>
              </tr>
            ))}
            {recips.length === 0 && <tr><td style={td} colSpan={5}>Nenhum contato ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
const td = { padding: '9px 10px', fontSize: 14, borderBottom: '1px solid #eee' };
