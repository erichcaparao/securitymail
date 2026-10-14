'use client';
import { useEffect, useState } from 'react';

export default function Acesso({ searchParams }) {
  const token = (searchParams?.id || '').replace(/[^a-zA-Z0-9]/g, '');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  useEffect(() => { if (token) log('clique'); }, []); // eslint-disable-line

  async function log(evento, cb) {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: token, evento, email }),
      });
    } finally { if (cb) cb(); }
  }

  function proximo() {
    if (!email.trim()) return;
    log('digitou_email');
    setStep(2);
  }
  function entrar() {
    log('submeteu', () => {
      window.location.href = `/resultado?id=${encodeURIComponent(token)}`;
    });
  }

  return (
    <div style={S.bg}>
      <div style={S.box}>
        <svg style={{ height: 24, marginBottom: 16 }} viewBox="0 0 108 24">
          <rect width="10" height="10" x="0" y="0" fill="#f25022" />
          <rect width="10" height="10" x="11" y="0" fill="#7fba00" />
          <rect width="10" height="10" x="0" y="11" fill="#00a4ef" />
          <rect width="10" height="10" x="11" y="11" fill="#ffb900" />
          <text x="26" y="17" fontFamily="Segoe UI" fontSize="15" fill="#5e5e5e">Microsoft</text>
        </svg>
        <div style={S.org}>Acesso corporativo - Engelmig Energia</div>

        {step === 1 && (
          <>
            <h1 style={S.h1}>Entrar</h1>
            <input style={S.input} type="email" placeholder="E-mail corporativo"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && proximo()} autoComplete="username" />
            <div style={S.links}>Nao consegue acessar sua conta?</div>
            <div style={S.row}><button style={S.btn} onClick={proximo}>Avancar</button></div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.back} onClick={() => setStep(1)}>&larr; {email}</div>
            <h1 style={S.h1}>Insira a senha</h1>
            <input style={S.input} type="password" placeholder="Senha"
              onKeyDown={e => e.key === 'Enter' && entrar()} autoComplete="current-password" />
            <div style={S.links}><a style={{ color: '#0067b8' }} href="#" onClick={e => e.preventDefault()}>Esqueci minha senha</a></div>
            <div style={S.row}><button style={S.btn} onClick={entrar}>Entrar</button></div>
          </>
        )}

        <div style={S.foot}>Termos de uso - Privacidade e cookies</div>
      </div>
    </div>
  );
}

const S = {
  bg: { margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI',system-ui,Arial,sans-serif",
        backgroundImage: 'linear-gradient(135deg,#086738 0%,#0a5c33 55%,#231F20 100%)' },
  box: { background: '#fff', width: 440, maxWidth: '94vw', padding: 44, boxShadow: '0 2px 6px rgba(0,0,0,.3)' },
  org: { display: 'flex', gap: 8, marginBottom: 12, fontSize: 13, color: '#555' },
  h1: { fontSize: 24, fontWeight: 600, margin: '0 0 4px' },
  input: { width: '100%', border: 'none', borderBottom: '1px solid #666', padding: '10px 0', fontSize: 15, outline: 'none', margin: '6px 0 18px' },
  links: { fontSize: 13, margin: '12px 0' },
  row: { display: 'flex', justifyContent: 'flex-end', marginTop: 6 },
  btn: { background: '#0067b8', color: '#fff', border: 'none', padding: '8px 26px', fontSize: 15, cursor: 'pointer' },
  back: { display: 'inline-flex', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 15 },
  foot: { marginTop: 50, textAlign: 'right', fontSize: 12, color: '#666' },
};
