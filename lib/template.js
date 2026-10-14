// Template único da campanha, reutilizado pelo disparo e pelo preview no admin.

export const ASSUNTO_CAMPANHA =
  'Planejamento Orçamentário 2027 — base histórica para preenchimento';

export function templateEmail(nome, link) {
  const saudacao = nome ? `Prezado(a) ${nome},` : 'Prezado(a) gestor(a),';
  return `<!doctype html>
<html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f2f3f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#231F20">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.06)">
  <tr><td style="height:6px;background:#FEC40E"></td></tr>
  <tr><td style="padding:26px 36px 8px">
    <div style="font-weight:800;font-size:18px"><span style="color:#231F20">ENGELMIG</span> <span style="color:#086738">ENERGIA</span></div>
    <div style="font-size:12px;color:#888;letter-spacing:1px;margin-top:2px">PLANEJAMENTO E CONTROLADORIA</div>
  </td></tr>
  <tr><td style="padding:8px 36px 0">
    <h1 style="font-size:21px;color:#086738;margin:14px 0 6px">Ciclo de Planejamento Orçamentário 2027</h1>
    <p style="font-size:15px;line-height:1.6;margin:14px 0">${saudacao}</p>
    <p style="font-size:15px;line-height:1.6;margin:14px 0">
      Iniciamos o <strong>ciclo orçamentário de 2027</strong>. Para consolidar as metas da sua área no
      <strong>Plano (AllStrategy)</strong>, disponibilizamos a <strong>base histórica consolidada</strong>
      referente ao período de <strong>setembro/2025 a agosto/2026</strong>.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:14px 0">
      Acesse a base e valide os números da sua área. O preenchimento deve ser concluído até
      <strong>o fim desta semana</strong> para entrarmos no cronograma de aprovação da diretoria.
    </p>
    <div style="text-align:center;margin:28px 0">
      <a href="${link}" style="background:#086738;color:#fff;text-decoration:none;padding:13px 34px;border-radius:6px;font-size:15px;font-weight:600;display:inline-block">Acessar base histórica 2025–2026</a>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#666;margin:14px 0">
      O acesso é feito com sua conta corporativa Microsoft 365. Em caso de dúvidas sobre o
      preenchimento no Plano (AllStrategy), responda a este e-mail.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:18px 0 6px">Atenciosamente,<br><strong>Planejamento &amp; Controladoria — Engelmig Energia</strong></p>
  </td></tr>
  <tr><td style="padding:18px 36px;background:#fafafa;border-top:1px solid #eee;font-size:11px;color:#999">
    Esta mensagem é destinada a diretores, gestores e líderes. Confidencial.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
