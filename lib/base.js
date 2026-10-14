// URL publica base da simulacao, sem barra no final.
// Prioridade:
//   1) BASE_URL           -> se voce quiser fixar manualmente
//   2) URL                -> dominio principal, preenchido automaticamente pelo Netlify
//   3) DEPLOY_PRIME_URL   -> URL do deploy atual no Netlify (previews/branches)
//   4) http://localhost:3000 (dev local)
// Assim, no Netlify basta NAO definir BASE_URL que o dominio real e usado sozinho.
export function baseUrl() {
  const raw =
    process.env.BASE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '');
}
