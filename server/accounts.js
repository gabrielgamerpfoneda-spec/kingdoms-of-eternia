'use strict';
/* Contas e progresso dos jogadores (persistidos no banco via db.js).
   - Senhas: scrypt com sal aleatório por usuário (nunca guardadas em texto puro).
   - Sessões: token aleatório de 256 bits; no banco fica apenas o SHA-256 do token.
   - Perfil: validado e limitado campo a campo antes de gravar. */
const crypto = require('crypto');
const db = require('./db');

const MAX_USERS = +process.env.MAX_USERS || 20000;
const TOKEN_TTL = 90 * 24 * 3600 * 1000;
const MAX_TOKENS_PER_USER = 6;

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const scrypt = (pass, salt) => new Promise((res, rej) => crypto.scrypt(pass, salt, 32, (e, k) => e ? rej(e) : res(k.toString('hex'))));
const validUser = u => typeof u === 'string' && /^[A-Za-z0-9_\-]{3,16}$/.test(u);
const validPass = p => typeof p === 'string' && p.length >= 6 && p.length <= 72;
const num = (v, lo, hi, d = 0) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
const int = (v, lo, hi, d = 0) => Math.floor(num(v, lo, hi, d));

/* Mantém só campos conhecidos e limita valores. O servidor NÃO consegue provar que o progresso
   enviado pelo cliente é legítimo (ver README, "Limitações"), mas impede dados malformados/gigantes. */
function sanitizeProfile(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  let raw; try { raw = JSON.stringify(p); } catch (e) { return null; }
  if (raw.length > 60000) return null;
  const o = {
    xp: int(p.xp, 0, 1e6), level: int(p.level, 1, 30, 1), coins: int(p.coins, 0, 1e7),
    mapsWon: {}, stars: {}, best: {}, upg: {}, ach: {}, owned: {}, hist: [], claimed: [],
    gacha: { pulls: int(p.gacha && p.gacha.pulls, 0, 1e6), sinceEpic: int(p.gacha && p.gacha.sinceEpic, 0, 1000) },
    stats: {}, set: {},
    hardWin: !!p.hardWin, extWin: !!p.extWin, perfectWin: !!p.perfectWin
  };
  for (let i = 0; i < 10; i++) {
    if (p.mapsWon && p.mapsWon[i]) o.mapsWon[i] = true;
    if (p.stars && p.stars[i]) o.stars[i] = int(p.stars[i], 0, 3);
    if (p.best && p.best[i]) o.best[i] = int(p.best[i], 0, 99);
  }
  for (let i = 0; i < 25; i++) if (p.owned && p.owned[i]) o.owned[i] = 1;
  for (const k of ['gold', 'lives', 'dmg', 'range', 'loot', 'disc', 'xp']) if (p.upg && p.upg[k]) o.upg[k] = int(p.upg[k], 0, 10);
  if (p.ach && typeof p.ach === 'object') for (const k of Object.keys(p.ach).slice(0, 80)) if (/^[A-Za-z0-9]{1,12}$/.test(k)) o.ach[k] = int(p.ach[k], 0, 4e12);
  for (const k of ['kills', 'wins', 'losses', 'built', 'bosses', 'gold', 'games', 'waves', 'upgrades', 'bestWave']) o.stats[k] = int(p.stats && p.stats[k], 0, 1e9);
  if (Array.isArray(p.hist)) o.hist = p.hist.slice(-25).map(h => ({ m: int(h && h.m, 0, 9), d: ['easy', 'normal', 'hard', 'extreme'].includes(h && h.d) ? h.d : 'normal', w: h && h.w ? 1 : 0, s: int(h && h.s, 0, 3), wv: int(h && h.wv, 0, 99) }));
  if (Array.isArray(p.claimed)) o.claimed = p.claimed.slice(-30).filter(x => typeof x === 'string' && /^[A-Za-z0-9]{6,24}$/.test(x));
  const s = p.set || {};
  o.set = { master: num(s.master, 0, 1, .7), music: num(s.music, 0, 1, .5), sfx: num(s.sfx, 0, 1, .7), range: s.range !== false, shake: s.shake !== false, auto: !!s.auto, name: String(s.name || 'Herói').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 14) || 'Herói' };
  return o;
}
const cols = o => [o.coins, o.level, Math.max(o.stats.bestWave || 0, ...Object.values(o.best), 0), o.stats.wins || 0];

async function issueToken(key) {
  const raw = crypto.randomBytes(32).toString('hex'), now = Date.now();
  await db.q('INSERT INTO tokens (hash,user_key,exp) VALUES (?,?,?)', [sha(raw), key, now + TOKEN_TTL]);
  await db.q('DELETE FROM tokens WHERE user_key=? AND hash NOT IN (SELECT hash FROM tokens WHERE user_key=? ORDER BY exp DESC LIMIT ?)', [key, key, MAX_TOKENS_PER_USER]);
  return raw;
}
async function loadProfile(key) {
  const r = (await db.q('SELECT data,server_at FROM profiles WHERE user_key=?', [key])).rows[0];
  if (!r) return { profile: null, serverAt: 0 };
  let profile = null; try { profile = JSON.parse(r.data); } catch (e) { }
  return { profile, serverAt: Number(r.server_at) };
}

async function register(user, pass, profile) {
  if (!validUser(user)) return { err: 'Usuário: 3 a 16 caracteres (letras, números, _ ou -).' };
  if (!validPass(pass)) return { err: 'Senha: de 6 a 72 caracteres.' };
  const key = user.toLowerCase();
  const n = Number((await db.q('SELECT COUNT(*) AS n FROM users')).rows[0].n);
  if (n >= MAX_USERS) return { err: 'Servidor com o limite de contas atingido.' };
  const salt = crypto.randomBytes(16).toString('hex'), hash = await scrypt(pass, salt);
  try { await db.q('INSERT INTO users (key,name,salt,hash,created_at) VALUES (?,?,?,?,?)', [key, user, salt, hash, Date.now()]); }
  catch (e) { if (/UNIQUE|23505|duplicate/i.test(String(e.code || '') + ' ' + e.message)) return { err: 'Este usuário já existe.' }; throw e; }   // PRIMARY KEY garante unicidade mesmo com cadastros simultâneos
  let prof = sanitizeProfile(profile), serverAt = 0;
  if (prof) {
    serverAt = Date.now(); const c = cols(prof);
    await db.q('INSERT INTO profiles (user_key,data,server_at,coins,level,best_wave,wins) VALUES (?,?,?,?,?,?,?)', [key, JSON.stringify(prof), serverAt, ...c]);
  }
  return { token: await issueToken(key), name: user, profile: prof, serverAt };
}
async function login(user, pass) {
  const rec = typeof user === 'string' ? (await db.q('SELECT key,name,salt,hash FROM users WHERE key=?', [user.toLowerCase().slice(0, 40)])).rows[0] : null;
  const h = await scrypt(String(pass || '').slice(0, 72), rec ? rec.salt : '00'.repeat(16));    // custo constante mesmo para usuário inexistente
  if (!rec || !crypto.timingSafeEqual(Buffer.from(h), Buffer.from(rec.hash))) return { err: 'Usuário ou senha incorretos.' };
  const p = await loadProfile(rec.key);
  return { token: await issueToken(rec.key), name: rec.name, profile: p.profile, serverAt: p.serverAt };
}
async function auth(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
  const r = (await db.q('SELECT u.key AS key,u.name AS name,t.exp AS exp FROM tokens t JOIN users u ON u.key=t.user_key WHERE t.hash=?', [sha(token)])).rows[0];
  if (!r || Number(r.exp) < Date.now()) return null;
  return { key: r.key, name: r.name };
}
const logout = token => db.q('DELETE FROM tokens WHERE hash=?', [sha(String(token))]).catch(() => { });
const getProfile = async rec => ({ ...(await loadProfile(rec.key)), name: rec.name });

/* Gravação com controle de concorrência otimista: só grava se "base" for a versão atual do servidor.
   Isso evita que um dispositivo com dados antigos sobrescreva o progresso mais novo de outro. */
async function putProfile(rec, profile, base) {
  const clean = sanitizeProfile(profile);
  if (!clean) return { err: 'Perfil inválido.' };
  const cur = await loadProfile(rec.key), c = cols(clean), data = JSON.stringify(clean);
  const next = Math.max(Date.now(), cur.serverAt + 1);
  if (!cur.serverAt) {
    try { await db.q('INSERT INTO profiles (user_key,data,server_at,coins,level,best_wave,wins) VALUES (?,?,?,?,?,?,?)', [rec.key, data, next, ...c]); return { ok: true, serverAt: next }; }
    catch (e) { const again = await loadProfile(rec.key); return { conflict: true, profile: again.profile, serverAt: again.serverAt }; }
  }
  const r = await db.q('UPDATE profiles SET data=?,server_at=?,coins=?,level=?,best_wave=?,wins=? WHERE user_key=? AND server_at=?', [data, next, ...c, rec.key, Number(base) || 0]);
  if (r.count === 1) return { ok: true, serverAt: next };
  return { conflict: true, profile: cur.profile, serverAt: cur.serverAt };
}

/* limite de tentativas (memória do processo) */
const hits = new Map();
function limited(id, max = 12, windowMs = 60000) {
  const now = Date.now(); let h = hits.get(id);
  if (!h || h.reset < now) { h = { n: 0, reset: now + windowMs }; hits.set(id, h); }
  return ++h.n > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, 60000).unref();
setInterval(() => db.q('DELETE FROM tokens WHERE exp<?', [Date.now()]).catch(() => { }), 6 * 3600 * 1000).unref();

module.exports = { register, login, auth, logout, putProfile, getProfile, limited, sanitizeProfile, stats: async () => ({ users: Number((await db.q('SELECT COUNT(*) AS n FROM users')).rows[0].n), db: db.kind() }), init: db.init };
