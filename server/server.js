'use strict';
/* Kingdoms of Eternia — servidor online (HTTP + WebSocket).
   Uso:  npm install && npm start      (porta padrão 8080, variável PORT) */
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const core = require('./game-core');
const accounts = require('./accounts');
const rooms = require('./rooms');

const PORT = +process.env.PORT || 8080;
const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);   // vazio = qualquer origem
const TRUST_PROXY = process.env.TRUST_PROXY !== '0';        // atrás de Render/Railway/Fly o IP real vem em x-forwarded-for
const MAX_CONN_PER_IP = +process.env.MAX_CONN_PER_IP || 16;
const TRUST_GUEST_TOWERS = process.env.TRUST_GUEST_TOWERS === '1';   // 1 = convidados (sem conta) podem usar as torres que declararem
const STATIC = [path.join(__dirname, '..', 'web', 'index.html'), path.join(__dirname, 'index.html')].find(f => fs.existsSync(f));

const ipOf = req => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';

/* ---------------------------- HTTP ---------------------------- */
function cors(req, res) {
  const o = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED.length ? (ALLOWED.includes(o) ? o : ALLOWED[0]) : '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
function body(req) {
  return new Promise((ok, bad) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > 100000) { bad(new Error('grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { bad(e); } });
    req.on('error', bad);
  });
}
const bearer = req => { const h = req.headers.authorization || ''; return h.startsWith('Bearer ') ? h.slice(7) : ''; };

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = (req.url || '/').split('?')[0];
  try {
    if (url === '/health') return json(res, 200, { ok: true, version: core.VERSION, protocol: core.PROTOCOL, ...rooms.stats(), ...(await accounts.stats()) });
    if (url === '/api/register' && req.method === 'POST') {
      if (accounts.limited(ipOf(req), 8)) return json(res, 429, { err: 'Muitas tentativas. Aguarde um minuto.' });
      const b = await body(req), r = await accounts.register(b.user, b.pass, b.profile);
      return json(res, r.err ? 400 : 200, r);
    }
    if (url === '/api/login' && req.method === 'POST') {
      const b = await body(req);
      if (accounts.limited(ipOf(req), 20) || accounts.limited('u:' + String(b.user || '').toLowerCase().slice(0, 40), 8, 10 * 60000)) return json(res, 429, { err: 'Muitas tentativas. Aguarde alguns minutos.' });
      const r = await accounts.login(b.user, b.pass);
      return json(res, r.err ? 401 : 200, r);
    }
    if (url === '/api/logout' && req.method === 'POST') { await accounts.logout(bearer(req)); return json(res, 200, { ok: true }); }
    if (url === '/api/profile') {
      const rec = await accounts.auth(bearer(req));
      if (!rec) return json(res, 401, { err: 'Sessão expirada. Entre novamente.' });
      if (req.method === 'GET') return json(res, 200, await accounts.getProfile(rec));
      if (req.method === 'PUT') {
        if (accounts.limited('put:' + rec.key, 120)) return json(res, 429, { err: 'Muitas gravações.' });
        const b = await body(req), r = await accounts.putProfile(rec, b.profile, b.base);
        return json(res, r.conflict ? 409 : r.err ? 400 : 200, r);
      }
    }
    if ((url === '/' || url === '/index.html') && STATIC) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(STATIC).pipe(res);
    }
    if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Kingdoms of Eternia — servidor online ativo. WebSocket em /ws'); }
    json(res, 404, { err: 'Não encontrado.' });
  } catch (e) { if (!res.headersSent) json(res, e && e.message === 'grande' ? 413 : 400, { err: 'Requisição inválida.' }); else res.end(); if (!(e instanceof SyntaxError) && e.message !== 'grande') console.error('[http]', e); }
});

/* ---------------------------- WebSocket ---------------------------- */
const wss = new WebSocketServer({
  server, path: '/ws', maxPayload: 8192,
  perMessageDeflate: { threshold: 512, zlibDeflateOptions: { level: 3 } },
  verifyClient: ({ origin }, cb) => (!ALLOWED.length || ALLOWED.includes(origin)) ? cb(true) : cb(false, 403, 'origem não permitida')
});
const perIp = new Map();

wss.on('connection', (ws, req) => {
  const ip = ipOf(req), n = (perIp.get(ip) || 0) + 1;
  if (n > MAX_CONN_PER_IP) { ws.close(4429, 'conexões demais'); return; }
  perIp.set(ip, n);
  ws.q = Promise.resolve(); ws.isAlive = true; ws.cid = null; ws.name = 'Herói'; ws.owned = [0, 5, 10]; ws.tokens = 60; ws.tAt = Date.now();
  ws.on('pong', () => { ws.isAlive = true; });

  const reply = o => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
  const bindRoom = (room, player) => {
    ws.room = room; ws.player = player;
    reply({ t: 'joined', code: room.code, slot: player.id });
    reply(room.state());
    if (room.phase === 'game' && room.game) { reply(room.startMsg(player)); }
  };

  ws.on('message', raw => {
    // limite de mensagens: 60/s com reposição contínua
    const now = Date.now(); ws.tokens = Math.min(120, ws.tokens + (now - ws.tAt) * 0.06); ws.tAt = now;
    if (ws.tokens < 1) return; ws.tokens--;
    let m; try { m = JSON.parse(raw.toString()); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    ws.q = ws.q.then(() => handle(m)).catch(e => console.error('[ws]', e));   // processa em ordem, mesmo com await
  });

  async function handle(m) {

    if (m.t === 'hello') {
      if (m.v !== core.PROTOCOL) { reply({ t: 'err', fatal: 1, msg: `Versão incompatível (cliente ${m.v}, servidor ${core.PROTOCOL}). Atualize o jogo.` }); return ws.close(4001, 'versão'); }
      if (typeof m.cid !== 'string' || !/^[A-Za-z0-9]{8,40}$/.test(m.cid)) return ws.close(4002, 'cid');
      ws.cid = m.cid; ws.name = m.name;
      ws.owned = Array.isArray(m.owned) ? m.owned.filter(i => Number.isInteger(i) && i >= 0 && i < core.TOWERS.length).slice(0, 25) : [0, 5, 10];
      if (!ws.owned.length) ws.owned = [0, 5, 10];
      const acc = m.token ? await accounts.auth(m.token) : null;
      if (acc) {
        ws.name = acc.name;            // torres vêm do progresso salvo NA CONTA (não do que o cliente diz)
        const pr = (await accounts.getProfile(acc)).profile;
        ws.owned = pr && pr.owned ? Object.keys(pr.owned).map(Number).filter(i => i >= 0 && i < core.TOWERS.length) : [];
        for (const i of [0, 5, 10]) if (!ws.owned.includes(i)) ws.owned.push(i);
      } else if (!TRUST_GUEST_TOWERS) ws.owned = [0, 5, 10];
      const re = rooms.reattach(ws, ws.cid);
      reply({ t: 'welcome', protocol: core.PROTOCOL, version: core.VERSION, account: acc ? acc.name : null, guest: !acc, towers: ws.owned, inRoom: !!re });
      if (re) { re.player.owned = new Set(ws.owned); bindRoom(re.room, re.player); re.room.pushState(); }
      return;
    }
    if (!ws.cid) return;

    const room = ws.room && rooms.roomOf(ws.cid) === ws.room ? ws.room : null, p = ws.player;
    switch (m.t) {
      case 'create': {
        if (room) return;
        const r = rooms.create(ws, ws.cid, ws.name, ws.owned, m.map, m.diff);
        if (r.err) return reply({ t: 'err', msg: r.err });
        bindRoom(r.room, r.player); break;
      }
      case 'join': {
        if (room) return;
        const r = rooms.join(ws, ws.cid, ws.name, ws.owned, m.code);
        if (r.err) return reply({ t: 'err', msg: r.err, join: 1 });
        bindRoom(r.room, r.player); r.room.pushState(); break;
      }
      case 'leave': if (room) { rooms.leave(ws.cid); ws.room = null; ws.player = null; reply({ t: 'left', reason: '' }); } break;
      case 'ping': reply({ t: 'pong', ts: m.ts }); if (p && Number.isFinite(m.rtt)) p.ping = Math.max(0, Math.min(2000, Math.round(m.rtt))); break;
      case 'cfg':
        if (!room || room.hostCid !== ws.cid || room.phase !== 'lobby') return;
        if (Number.isInteger(m.map) && core.MAPS[m.map]) room.map = m.map;
        if (core.DIFFS[m.diff]) room.diff = m.diff;
        room.pushState(); break;
      case 'ready': if (room && room.phase === 'lobby' && p) { p.ready = !!m.v; room.pushState(); } break;
      case 'name': if (p) { p.name = String(m.name || '').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 14) || p.name; room.pushState(); } break;
      case 'start': if (room && room.hostCid === ws.cid && room.phase === 'lobby') room.start(); break;
      case 'kick': {
        if (!room || room.hostCid !== ws.cid) return;
        const v = room.players.find(x => x.id === m.id && x.cid !== ws.cid);
        if (v) { if (v.ws) { v.ws.room = null; v.ws.player = null; } room.remove(v, 'Você foi removido da sala pelo anfitrião.'); }
        break;
      }
      case 'act': if (room && p) room.action(p, m.a); break;
    }
  }

  ws.on('close', () => {
    const c = (perIp.get(ip) || 1) - 1; if (c <= 0) perIp.delete(ip); else perIp.set(ip, c);
    if (ws.cid && ws.room && ws.player && ws.player.ws === ws) ws.room.detach(ws.player);
  });
  ws.on('error', () => { });
});

/* heartbeat: derruba conexões mortas (WebSocket não avisa quando a rede some) */
setInterval(() => {
  for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; try { ws.ping(); } catch (e) { } }
}, 20000).unref();

accounts.init().then(() => {
  server.listen(PORT, () => {
    console.log(`Kingdoms of Eternia server v${core.VERSION} (protocolo ${core.PROTOCOL}) em http://localhost:${PORT}  — WebSocket: ws://localhost:${PORT}/ws`);
    console.log('Banco de dados: ' + require('./db').kind() + (process.env.DATABASE_URL ? '' : '  (SQLite local — defina DATABASE_URL para usar Postgres)'));
    if (STATIC) console.log('Servindo também o cliente em / (' + STATIC + ')');
  });
}).catch(e => { console.error('Falha ao iniciar o banco de dados:', e.message); process.exit(1); });
function shutdown() { console.log('Encerrando…'); wss.close(); server.close(() => { Promise.resolve(require('./db').close()).finally(() => process.exit(0)); }); setTimeout(() => process.exit(0), 3000).unref(); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
process.on('uncaughtException', e => console.error('uncaughtException', e));
process.on('unhandledRejection', e => console.error('unhandledRejection', e));
