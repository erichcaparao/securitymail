// Envio transacional via API do Brevo (com rastreio de abertura/clique).
// Usamos a tag = token para mapear os eventos do webhook de volta ao destinatario.

import { templateEmail, ASSUNTO_CAMPANHA } from './template.js';

export async function enviarEmail({ token, nome, email, link }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: process.env.SENDER_EMAIL, name: process.env.SENDER_NAME },
      to: [{ email, name: nome || undefined }],
      subject: ASSUNTO_CAMPANHA,
      htmlContent: templateEmail(nome, link),
      tags: [token],
    }),
  });

  const texto = await res.text();
  let data = {};
  try { data = JSON.parse(texto); } catch {}
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${texto}`);
  return data.messageId || null;
}
