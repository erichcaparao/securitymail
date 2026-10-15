'use client';
import { useEffect } from 'react';

export default function Resultado({ searchParams }) {
  const token = (searchParams?.id || '').replace(/[^a-zA-Z0-9]/g, '');
  useEffect(() => {
    if (token) fetch('/api/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: token, evento: 'viu_resultado' }),
    }).catch(() => {});
  }, []); // eslint-disable-line

  return (
    <div style={{ fontFamily: "'Segoe UI',Roboto,Arial,sans-serif", background: '#f3f4f6', minHeight: '100vh', margin: 0, color: '#231F20' }}>
      <div style={{ height: 8, background: 'linear-gradient(90deg,#FEC40E,#086738)' }} />
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 10px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <div style={{ background: '#086738', color: '#fff', padding: '36px 40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '3px solid #FEC40E', marginBottom: 16 }}>
              <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#FEC40E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
            </div>
            <h1 style={{ margin: '6px 0 4px', fontSize: 26 }}>Isto foi uma simulação de phishing</h1>
            <p style={{ margin: 0, opacity: .9, fontSize: 15 }}>Exercício de conscientização do Departamento de TI — Engelmig Energia</p>
          </div>
          <div style={{ padding: '34px 40px', lineHeight: 1.55 }}>
            <h2 style={{ color: '#086738', fontSize: 19, margin: '0 0 10px' }}>Calma — nenhum dado seu foi comprometido.</h2>
            <p>O e-mail sobre o <b>Planejamento Orçamentário 2027</b> <b>não era real</b>. Foi enviado pela Segurança da Informação da Engelmig como treinamento interno.</p>
            <div style={{ background: '#fff8e1', borderLeft: '4px solid #FEC40E', padding: '14px 18px', borderRadius: 6, margin: '18px 0' }}>
              <b>Você clicou no link e chegou à tela de login.</b> Num ataque real, a partir daqui um criminoso tentaria roubar suas credenciais do Microsoft 365. <b>Sua senha NÃO foi capturada</b> — ela nunca saiu do seu navegador.
            </div>
            <div style={{ background: '#f0f7f3', borderRadius: 10, padding: '20px 24px', marginTop: 22 }}>
              <h3 style={{ margin: '0 0 10px', color: '#086738', fontSize: 16 }}>Como identificar um phishing</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Confira o domínio do link antes de clicar (é mesmo <i>engelmig.com.br</i>/<i>microsoft.com</i>?).</li>
                <li>Desconfie de urgência ("prazo hoje", "acesso será bloqueado").</li>
                <li>Login inesperado? Pare e verifique.</li>
                <li>Na dúvida, encaminhe a mensagem suspeita para o Departamento de TI.</li>
                <li>Ative o <b>MFA</b> — protege mesmo se a senha vazar.</li>
              </ul>
            </div>
            <div style={{ marginTop: 30 }}>
              <h3 style={{ color: '#086738', fontSize: 18, margin: '0 0 6px' }}>Tipos de ameaças que chegam por e-mail</h3>
              <p style={{ margin: '0 0 16px', color: '#555', fontSize: 14 }}>
                Material de conscientização da Segurança da Informação — Engelmig Energia.
              </p>
              {['img1', 'img2', 'img3', 'img4', 'img5'].map((n, i) => (
                <img key={n} src={`/img/${n}.png`} loading="lazy"
                  alt={['Quais ameaças podem surgir através do e-mail', 'Ransomware', 'Phishing', 'Spam', 'Botnet'][i]}
                  style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(0,0,0,.10)', margin: '0 0 16px' }} />
              ))}
            </div>

            <p style={{ marginTop: 22 }}>Nenhuma ação disciplinar decorre deste teste — o objetivo é exclusivamente educativo.</p>
          </div>
          <div style={{ padding: '22px 40px', background: '#fafafa', borderTop: '1px solid #eee', fontSize: 13, color: '#666', textAlign: 'center' }}>
            <b><span style={{ color: '#231F20' }}>ENGELMIG</span> <span style={{ color: '#086738' }}>ENERGIA</span></b><br />
            Tecnologia da Informação · Segurança da Informação
          </div>
        </div>
      </div>
    </div>
  );
}
