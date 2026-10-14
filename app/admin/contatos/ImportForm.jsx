'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportForm() {
  const router = useRouter();
  const [csv, setCsv] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function enviarTexto() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const d = await r.json();
      setMsg(d);
      if (d.ok) { setCsv(''); router.refresh(); }
    } catch (e) { setMsg({ ok: false, erro: String(e) }); }
    setBusy(false);
  }

  async function enviarArquivo(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData(); fd.append('arquivo', file);
      const r = await fetch('/api/import', { method: 'POST', body: fd });
      const d = await r.json();
      setMsg(d); if (d.ok) router.refresh();
    } catch (e) { setMsg({ ok: false, erro: String(e) }); }
    setBusy(false); e.target.value = '';
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 22, boxShadow: '0 4px 14px rgba(0,0,0,.06)', marginBottom: 24 }}>
      <h2 style={{ fontSize: 17, margin: '0 0 6px', color: '#086738' }}>Importar contatos</h2>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Formato por linha: <b>nome, email, cargo</b> (o cabeçalho é opcional; a ordem das colunas é detectada pelo e-mail). Um token único é gerado por pessoa.
      </p>

      <textarea value={csv} onChange={e => setCsv(e.target.value)}
        placeholder={'Nome,Email,Cargo\nJoão Diretor,joao@engelmig.com.br,Diretor Financeiro\nMaria Gestora,maria@engelmig.com.br,Gerente'}
        style={{ width: '100%', minHeight: 140, fontFamily: 'monospace', fontSize: 13, padding: 12, border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' }} />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={enviarTexto} disabled={busy || !csv.trim()}
          style={{ background: '#086738', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 6, fontSize: 14, cursor: 'pointer', opacity: busy ? .6 : 1 }}>
          {busy ? 'Importando...' : 'Importar texto colado'}
        </button>
        <label style={{ fontSize: 14, color: '#086738', cursor: 'pointer' }}>
          ou enviar arquivo .csv
          <input type="file" accept=".csv,text/csv" onChange={enviarArquivo} style={{ display: 'none' }} />
        </label>
      </div>

      {msg && (
        <div style={{ marginTop: 14, fontSize: 14, padding: '10px 14px', borderRadius: 6,
          background: msg.ok ? '#e6f4ea' : '#fdeaea', color: msg.ok ? '#086738' : '#ED1C24' }}>
          {msg.ok
            ? `Importação concluída: ${msg.inseridos} novo(s), ${msg.atualizados} atualizado(s), ${msg.ignorados} ignorado(s).`
            : `Erro: ${msg.erro || 'falha na importação'}`}
          {msg.erros?.length ? <div style={{ marginTop: 6, fontSize: 12 }}>{msg.erros.join(' · ')}</div> : null}
        </div>
      )}
    </div>
  );
}
