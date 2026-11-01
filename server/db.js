'use strict';
/* Camada de banco de dados.
   - Com DATABASE_URL definido  -> PostgreSQL (pacote "pg"). Recomendado em produção: o banco fica
     FORA do servidor, então os dados sobrevivem a deploys/reinícios em qualquer hospedagem.
   - Sem DATABASE_URL           -> SQLite embutido do Node (node:sqlite) em DATA_DIR/eternia.db.
     Ótimo para desenvolvimento; em produção exige disco persistente (volume).
   O SQL abaixo é o mesmo para os dois bancos (placeholders "?" são convertidos para $1,$2… no Postgres). */
const fs = require('fs'), path = require('path');

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     key TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     salt TEXT NOT NULL,
     hash TEXT NOT NULL,
     created_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS tokens (
     hash TEXT PRIMARY KEY,
     user_key TEXT NOT NULL,
     exp BIGINT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS tokens_user ON tokens (user_key)`,
  `CREATE TABLE IF NOT EXISTS profiles (
     user_key TEXT PRIMARY KEY,
     data TEXT NOT NULL,
     server_at BIGINT NOT NULL,
     coins INTEGER NOT NULL DEFAULT 0,
     level INTEGER NOT NULL DEFAULT 1,
     best_wave INTEGER NOT NULL DEFAULT 0,
     wins INTEGER NOT NULL DEFAULT 0)`
];

let impl = null, kind = '';

async function init() {
  if (impl) return impl;
  if (process.env.DATABASE_URL) {
    let Pool;
    try { ({ Pool } = require('pg')); }
    catch (e) { throw new Error('DATABASE_URL definido, mas o pacote "pg" não está instalado. Rode: npm install'); }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: +process.env.PG_POOL_MAX || 5,
      ssl: process.env.PGSSL === 'disable' ? false : undefined,   // Neon/Supabase/Render usam sslmode=require na própria URL
      idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000
    });
    pool.on('error', e => console.error('[db] erro no pool:', e.message));
    kind = 'postgres';
    impl = {
      async q(sql, params = []) {
        let i = 0; const r = await pool.query(sql.replace(/\?/g, () => '$' + (++i)), params);
        return { rows: r.rows || [], count: r.rowCount || 0 };
      },
      close: () => pool.end()
    };
  } else {
    let DatabaseSync;
    try { ({ DatabaseSync } = require('node:sqlite')); }
    catch (e) { throw new Error('SQLite embutido requer Node 22.5+. Defina DATABASE_URL (Postgres) ou atualize o Node.'); }
    const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
    fs.mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(path.join(dir, 'eternia.db'));
    db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA busy_timeout=5000;');
    kind = 'sqlite';
    impl = {
      async q(sql, params = []) {
        const st = db.prepare(sql);
        if (/^\s*select/i.test(sql)) return { rows: st.all(...params), count: 0 };
        const r = st.run(...params); return { rows: [], count: Number(r.changes) };
      },
      close: () => db.close()
    };
  }
  for (const s of SCHEMA) await impl.q(s);
  return impl;
}
const q = async (sql, params) => (await init()).q(sql, params);
module.exports = { init, q, kind: () => kind, SCHEMA, close: () => impl && impl.close() };
