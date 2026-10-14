'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SendButton({ pendentes }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);

  async function disparar(reenviar) {
    const alvo = reenviar ? 'TODOS os contatos (inclusive quem já recebeu)' : `${pendentes} contato(s) que ainda não receberam`;
    if (!confirm(`Confirmar disparo da campanha para ${alvo}?`)) return;
    setBusy(true); setRes(null);
    try {
      const r = await fetch('/api/enviar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reenviar }),
      });
      const d = await r.json();
      setRes(d); router.refresh();
    } catch (e) { setRes({ ok: false, falhas: [String(e)] }); }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => disparar(false)} disabled={busy || pendentes === 0}
          style={{ background: '#086738', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 6, fontSize: 15, cursor: 'pointer', opacity: (busy || pendentes === 0) ? .6 : 1 }}>
          {busy ? 'Enviando...' : `Disparar para pendentes (${pendentes})`}
        </button>
        <button onClick={() => disparar(true)} disabled={busy}
          style={{ background: '#fff', color: '#086738', border: '1px solid #086738', padding: '11px 24px', borderRadius: 6, fontSize: 15, cursor: 'pointer', opacity: busy ? .6 : 1 }}>
          Reenviar para todos
        </button>
      </div>
      {res && (
        <div style={{ marginTop: 14, fontSize: 14, padding: '10px 14px', borderRadius: 6,
          background: res.ok ? '#e6f4ea' : '#fdeaea', color: res.ok ? '#086738' : '#ED1C24' }}>
          {res.ok ? `Disparo concluído: ${res.enviados}/${res.total} enviados.` : 'Falha no disparo.'}
          {res.falhas?.length ? <div style={{ marginTop: 6, fontSize: 12 }}>Falhas: {res.falhas.join(' · ')}</div> : null}
        </div>
      )}
    </div>
  );
}
