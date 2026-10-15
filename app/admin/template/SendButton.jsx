'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Envios por requisicao. Mantem cada chamada curta para nao estourar o timeout
// de gateway/proxy (erro 504 "Inactivity Timeout") quando a lista e grande.
const LOTE = 8;

export default function SendButton({ pendentes }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [progresso, setProgresso] = useState('');

  async function chamar(payload) {
    const r = await fetch('/api/enviar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // A resposta pode nao ser JSON (ex.: erro 500/504 com pagina HTML).
    const texto = await r.text();
    let d;
    try { d = JSON.parse(texto); }
    catch { d = { ok: false, erro: `HTTP ${r.status}: ${texto.slice(0, 300) || r.statusText}` }; }
    if (!r.ok && d.ok === undefined) d.ok = false;
    return d;
  }

  async function disparar(reiniciar) {
    const alvo = reiniciar
      ? 'TODOS os contatos (inclusive quem já recebeu)'
      : `${pendentes} contato(s) que ainda não receberam`;
    if (!confirm(`Confirmar disparo da campanha para ${alvo}?`)) return;

    setBusy(true); setRes(null); setProgresso('');
    try {
      // Reenvio: zera os marcadores; depois o loop abaixo reprocessa todos.
      if (reiniciar) {
        const d0 = await chamar({ reiniciar: true });
        if (!d0.ok) { setRes(d0); setBusy(false); return; }
      }

      let enviados = 0;
      const falhasMap = new Map(); // dedup por e-mail (um lote pode reprocessar quem falhou)

      // Envia em lotes pequenos ate acabar os pendentes.
      for (;;) {
        const d = await chamar({ limite: LOTE });

        // Erro geral (config/banco/HTTP) — aborta e mostra o motivo.
        if (d.ok === false && d.erro && !d.falhas?.length) {
          setRes(d); setProgresso(''); setBusy(false); return;
        }

        enviados += d.enviados || 0;
        for (const f of (d.falhas || [])) falhasMap.set(f.split(':')[0], f);
        setProgresso(`Enviando... ${enviados} enviado(s), ${d.restantes ?? 0} restante(s).`);

        // Para quando nao ha mais pendentes, ou quando um lote nao enviou nada
        // (os que sobram estao falhando de forma persistente — evita loop infinito).
        if ((d.restantes ?? 0) === 0 || (d.enviados || 0) === 0) break;
      }

      const falhas = [...falhasMap.values()];
      const total = enviados + falhas.length;
      const erro = (enviados === 0 && falhas.length)
        ? (falhas[0].split(/:\s(.+)/)[1] || falhas[0])
        : undefined;
      setRes({ ok: enviados > 0, total, enviados, falhas, erro });
      router.refresh();
    } catch (e) {
      setRes({ ok: false, erro: String(e?.message || e) });
    }
    setProgresso('');
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
      {busy && progresso && (
        <div style={{ marginTop: 14, fontSize: 14, padding: '10px 14px', borderRadius: 6, background: '#eef2f7', color: '#334155' }}>
          {progresso}
        </div>
      )}
      {!busy && res && (
        <div style={{ marginTop: 14, fontSize: 14, padding: '10px 14px', borderRadius: 6,
          background: res.ok ? '#e6f4ea' : '#fdeaea', color: res.ok ? '#086738' : '#ED1C24' }}>
          {res.ok
            ? `Disparo concluído: ${res.enviados}/${res.total} enviados.`
            : `Falha no disparo${res.erro ? `: ${res.erro}` : '.'}`}
          {res.falhas?.length ? <div style={{ marginTop: 6, fontSize: 12 }}>Falhas: {res.falhas.join(' · ')}</div> : null}
        </div>
      )}
    </div>
  );
}
