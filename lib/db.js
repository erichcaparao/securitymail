import { createClient } from '@libsql/client';
import path from 'node:path';

// Banco: libSQL/SQLite.
//  - Dev local: arquivo local.db na raiz do projeto (nao precisa de servidor).
//  - Netlify/producao: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (libSQL remoto, serverless).
// Mantemos a interface pool.query(sql, params) -> [rows] usada no resto do app.
let client;

// Caminho ABSOLUTO do arquivo local: um file: relativo seria resolvido contra o
// diretorio de trabalho do processo (que no Next difere), criando um banco vazio.
function localFileUrl() {
  const abs = path.join(process.cwd(), 'local.db').replace(/\\/g, '/');
  return `file:${abs}`;
}

export function getPool() {
  if (!client) {
    const raw = createClient({
      url: process.env.TURSO_DATABASE_URL || localFileUrl(),
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
