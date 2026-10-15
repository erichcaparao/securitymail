'use client';
import { useMemo, useState } from 'react';

// Grid de contatos com busca, filtro por status, ordenacao por coluna e export CSV.
// Recebe `lista` ja montada pelo painel (cada item: nome,cargo,email,enviado,
// entregue,aberto,clicou,digitou,caiu,quando,token).

const COLS = [
  { key: 'nome', label: 'Nome', tipo: 'texto' },
  { key: 'cargo', label: 'Cargo', tipo: 'texto' },
  { key: 'email', label: 'E-mail', tipo: 'texto' },
  { key: 'enviado', label: 'Enviado', tipo: 'bool' },
  { key: 'entregue', label: 'Recebeu', tipo: 'bool' },
  { key: 'aberto', label: 'Abriu', tipo: 'bool' },
  { key: 'clicou', label: 'Clicou', tipo: 'bool' },
  { key: 'digitou', label: 'Digitou', tipo: 'bool' },
  { key: 'caiu', label: 'Caiu', tipo: 'bool', bad: true },
  { key: 'quando', label: 'Quando', tipo: 'texto' },
];

// Filtros rapidos por status (cada um casa com um campo booleano verdadeiro).
const STATUS = [
  { key: 'todos', label: 'Todos' },
  { key: 'enviado', label: 'Enviados' },
  { key: 'aberto', label: 'Abriram' },
  { key: 'clicou', label: 'Clicaram' },
  { key: 'digitou', label: 'Digitaram' },
  { key: 'caiu', label: 'Caíram' },
  { key: 'pendente', label: 'Não enviados' },
];

const td = { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid #eee' };

export default function GridContatos({ lista }) {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('todos');
  const [ordKey, setOrdKey] = useState('nome');
  const [ordDir, setOrdDir] = useState('asc'); // 'asc' | 'desc'

  const filtrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let out = lista.filter(p => {
      if (q && !`${p.nome} ${p.cargo} ${p.email}`.toLowerCase().includes(q)) return false;
      if (status === 'todos') return true;
      if (status === 'pendente') return !p.enviado;
      return !!p[status];
    });
    const col = COLS.find(c => c.key === ordKey) || COLS[0];
    const dir = ordDir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      let va = a[ordKey], vb = b[ordKey];
      if (col.tipo === 'bool') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      else { va = String(va ?? '').toLowerCase(); vb = String(vb ?? '').toLowerCase(); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }, [lista, busca, status, ordKey, ordDir]);

  function ordenar(key) {
    if (key === ordKey) setOrdDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setOrdKey(key); setOrdDir('asc'); }
  }

  function exportarCSV() {
    const sn = v => (v ? 'Sim' : 'Nao');
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cab = COLS.map(c => c.label);
    const linhas = filtrada.map(p => COLS.map(c =>
      c.tipo === 'bool' ? sn(p[c.key]) : (p[c.key] ?? '')));
    // BOM para o Excel reconhecer UTF-8 (acentos) e ; como separador pt-BR.
    const csv = '﻿' + [cab, ...linhas].map(l => l.map(esc).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dia = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `campanha-contatos-${dia}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const Tag = ({ on, bad }) => (
    <span style={{ padding: '3px 9px', borderRadius: 12, fontSize: 12, fontWeight: 600,
      ...(on ? (bad ? { background: '#fdeaea', color: '#ED1C24' } : { background: '#e6f4ea', color: '#086738' })
             : { background: '#eee', color: '#999' }) }}>{on ? 'Sim' : '-'}</span>
  );

  const seta = k => (k === ordKey ? (ordDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div>
      {/* Barra de ferramentas: busca, filtro de status e export */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, cargo ou e-mail..."
          style={{ flex: 1, minWidth: 240, padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
        />
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
          {STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button onClick={exportarCSV}
          style={{ background: '#086738', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
          Exportar CSV ({filtrada.length})
        </button>
      </div>

      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Mostrando {filtrada.length} de {lista.length} contato(s).
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,.06)' }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} onClick={() => ordenar(c.key)}
                  style={{ padding: '11px 12px', textAlign: 'left', fontSize: 13, background: '#231F20', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  {c.label}{seta(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrada.map(p => (
              <tr key={p.token}>
                <td style={td}>{p.nome}</td>
                <td style={td}>{p.cargo}</td>
                <td style={td}>{p.email}</td>
                <td style={td}><Tag on={p.enviado} /></td>
                <td style={td}><Tag on={p.entregue} /></td>
                <td style={td}><Tag on={p.aberto} /></td>
                <td style={td}><Tag on={p.clicou} /></td>
                <td style={td}><Tag on={p.digitou} /></td>
                <td style={td}><Tag on={p.caiu} bad /></td>
                <td style={td}>{p.quando}</td>
              </tr>
            ))}
            {filtrada.length === 0 && (
              <tr><td style={td} colSpan={COLS.length}>Nenhum contato para os filtros atuais.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
