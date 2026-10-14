// Cria as tabelas no banco libSQL/SQLite.
// Uso: npm run db:init
//  - Sem TURSO_DATABASE_URL -> cria/atualiza o arquivo local file:local.db
//  - Com TURSO_DATABASE_URL -> aplica no banco remoto (Turso)
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

await client.executeMultiple(schema);
console.log(`Schema aplicado em: ${url}`);
client.close();
