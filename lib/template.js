// Template único da campanha, reutilizado pelo disparo e pelo preview no admin.
// Estilo "caixa postal": e-mail simples, como se fosse um recado interno comum,
// sem cabeçalho com logo, sem botão e sem rodapé institucional. Apenas texto
// e um link em linha para o usuário clicar.

export const ASSUNTO_CAMPANHA =
  'Orçamento 2027 — validar a base histórica da sua área';

export function templateEmail(nome, link) {
  const primeiro = nome ? nome.trim().split(/\s+/)[0] : '';
  const saudacao = primeiro ? `Olá, ${primeiro}.` : 'Olá.';
  return `<!doctype html>
<html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#ffffff;font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">
<div style="max-width:620px;margin:0;padding:16px 4px">
  <p style="margin:0 0 14px">${saudacao}</p>
  <p style="margin:0 0 14px">
    Estamos começando o ciclo orçamentário de 2027 e preciso que você valide os números da
    sua área na base histórica consolidada (setembro/2025 a agosto/2026) antes de mandarmos
    para a aprovação da diretoria.
  </p>
  <p style="margin:0 0 14px">
    Dá uma conferida nos dados da sua área por aqui:
    <a href="${link}">acessar a base histórica 2025–2026</a>.
  </p>
  <p style="margin:0 0 14px">
    O preenchimento no Plano (AllStrategy) precisa estar concluído até o fim desta semana.
    O acesso é com a sua conta Microsoft 365.
  </p>
  <p style="margin:0 0 14px">Qualquer dúvida é só responder este e-mail.</p>
  <p style="margin:0">
    Obrigado,<br>
    Planejamento e Controladoria
  </p>
</div>
</body></html>`;
}
