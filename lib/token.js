import { randomBytes } from 'node:crypto';

// Token curto, único por destinatário, usado no link ?id=
export function gerarToken() {
  return randomBytes(8).toString('hex'); // 16 caracteres
}
