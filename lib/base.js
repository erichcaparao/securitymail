// URL publica base da simulacao, sem barra no final.
// O link do e-mail precisa SEMPRE apontar para o site publicado, nao importa
// de onde o disparo roda (painel na nuvem ou CLI local).
// Prioridade:
//   1) URL              -> dominio principal, preenchido automaticamente pelo Netlify
//   2) DEPLOY_PRIME_URL -> URL do deploy atual (previews/branches)
//   3) SITE_CANONICO    -> fallback fixo, garante o dominio certo em qualquer caso
// Obs.: NAO usamos mais BASE_URL aqui de proposito, pois o valor antigo ficou
// preso nas variaveis do Netlify. Para trocar o dominio, altere SITE_CANONICO.
const SITE_CANONICO = 'https://engelmig-sec.netlify.app';

export function baseUrl() {
  const raw =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    SITE_CANONICO;
  return raw.replace(/\/$/, '');
}
