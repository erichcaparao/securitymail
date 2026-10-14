import Link from 'next/link';

export const metadata = { title: 'Painel — Simulação Phishing Engelmig' };

export default function AdminLayout({ children }) {
  const nav = [
    ['Indicadores', '/admin'],
    ['Contatos', '/admin/contatos'],
    ['Template', '/admin/template'],
  ];
  return (
    <div style={{ fontFamily: "'Segoe UI',Roboto,Arial,sans-serif", background: '#f3f4f6', minHeight: '100vh', color: '#231F20' }}>
      <header style={{ background: '#086738', color: '#fff', padding: '16px 30px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>
          <span>ENGELMIG</span> <span style={{ color: '#FEC40E' }}>ENERGIA</span>
          <span style={{ fontWeight: 400, fontSize: 13, opacity: .85, marginLeft: 10 }}>· Simulação de Phishing — TI</span>
        </div>
        <nav style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {nav.map(([t, h]) => (
            <Link key={h} href={h} style={{ color: '#fff', textDecoration: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 14, background: 'rgba(255,255,255,.12)' }}>{t}</Link>
          ))}
        </nav>
      </header>
      <main style={{ maxWidth: 1040, margin: '24px auto', padding: '0 20px' }}>{children}</main>
    </div>
  );
}
