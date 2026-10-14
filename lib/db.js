import { createClient } from '@libsql/client';

// Banco: libSQL/SQLite.
//  - Dev local: file:local.db (arquivo no projeto, nao precisa de servidor).
//  - Netlify/producao: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (libSQL remoto, serverless).
// Mantemos a interface pool.query(sql, params) -> [rows] usada no resto do app.
let client;

export function getPool() {
  if (!client) {
    const raw = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN, // ignorado quando url e file:
    });
    client = {
      async query(sql, params = []) {
        const rs = await raw.execute(
          params && params.length ? { sql, args: params } : sql
        );
        return [rs.rows, rs];
      },
      async end() {
        raw.close();
      },
      _raw: raw,
    };
  }
  return client;
}
