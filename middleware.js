import { NextResponse } from 'next/server';

// Protege o painel e as ações administrativas com Basic Auth.
// O webhook do Brevo e o /api/track (rastreio público) ficam fora.
export const config = { matcher: ['/admin/:path*', '/api/import', '/api/enviar'] };

export function middleware(req) {
  const auth = req.headers.get('authorization') || '';
  const [, b64] = auth.split(' ');
  let user = '', pass = '';
  if (b64) {
    try { [user, pass] = atob(b64).split(':'); } catch {}
  }
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return NextResponse.next();
  }
  return new NextResponse('Acesso restrito.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Painel TI Engelmig"' },
  });
}
