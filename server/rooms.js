'use strict';
/* Salas privadas + simulação autoritativa.
   O servidor roda o MESMO motor do cliente (game-core.js). Os clientes só enviam intenções
   ("construir aqui", "melhorar torre X") e recebem snapshots do estado — não existe estado
   duplicado para dessincronizar. */
const core = require('./game-core');
const { Game, MAPS, TOWERS, DIFFS, TGT, Sound, PLAYER_COLORS } = core;

const MAX_PLAYERS = 6;
const GRACE_GAME = 90e3, GRACE_LOBBY = 30e3, OVER_TO_LOBBY = 5e3;
const SNAP_HZ = Math.max(5, Math.min(30, +process.env.SNAP_HZ || 15));
const MAX_ROOMS = +process.env.MAX_ROOMS || 300;
const STEP = 1 / 60;
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TGT_KEYS = new Set(TGT.map(t => t[0]));

const rooms = new Map();   // code -> Room
const byCid = new Map();   // cid  -> Room

const cleanName = s => (String(s || '').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 14)) || 'Herói';
const send = (ws, obj) => { if (ws && ws.readyState === 1) ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj)); };

function genCode() {
  for (let i = 0; i < 50; i++) {
    let c = ''; for (let k = 0; k < 5; k++) c += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}

class Room {
  constructor(code) {
    this.code = code; this.players = []; this.hostCid = null;
    this.map = 0; this.diff = 'normal'; this.phase = 'lobby';
    this.game = null; this.gid = ''; this.acc = 0; this.snapT = 0; this.overAt = 0; this.infoT = 0;
  }
  get host() { return this.players.find(p => p.cid === this.hostCid); }
  connected() { return this.players.filter(p => p.connected); }
  state() {
    return {
      t: 'room', code: this.code, phase: this.phase, map: this.map, diff: this.diff, hostId: this.host ? this.host.id : -1,
      players: this.players.map(p => ({ id: p.id, name: p.name, color: p.color, ready: p.ready, host: p.cid === this.hostCid, connected: p.connected, ping: p.ping }))
    };
  }
  broadcast(obj) {
    const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
    for (const p of this.players) if (p.connected) send(p.ws, s);
  }
  pushState() { this.broadcast(this.state()); }
  startMsg(p) {
    const g = this.game;
    return { t: 'start', gid: this.gid, map: this.map, diff: this.diff, coop: g.coop, slot: p.id, blocked: [...g.blk], players: this.state().players };
  }
  add(ws, cid, name, owned) {
    const used = new Set(this.players.map(p => p.id));
    let id = 0; while (used.has(id)) id++;
    const p = { cid, id, name: cleanName(name), color: PLAYER_COLORS[id], ws, connected: true, ready: false, owned: new Set(owned), ping: 0, lastWave: 0, gone: 0 };
    this.players.push(p); byCid.set(cid, this);
    if (!this.host) this.hostCid = cid;
    return p;
  }
  attach(p, ws) {   // reconexão
    if (p.ws && p.ws !== ws) { try { p.ws.close(4000, 'replaced'); } catch (e) { } }
    p.ws = ws; p.connected = true; p.gone = 0;
  }
  detach(p) { p.connected = false; p.ws = null; p.gone = Date.now(); if (this.hostCid === p.cid) this.promote(); this.pushState(); }
  promote() {
    const nxt = this.players.find(p => p.connected && p.cid !== this.hostCid) || this.players.find(p => p.connected);
    if (nxt) this.hostCid = nxt.cid;
  }
  remove(p, reason) {
    this.players = this.players.filter(x => x !== p); byCid.delete(p.cid);
    if (this.hostCid === p.cid) { this.hostCid = null; this.promote(); if (!this.host && this.players[0]) this.hostCid = this.players[0].cid; }
    if (reason) send(p.ws, { t: 'left', reason });
    if (!this.players.length) { rooms.delete(this.code); return; }
    this.pushState();
  }
  /* ---- partida ---- */
  start() {
    if (this.phase !== 'lobby') return;
    this.game = new Game(this.map, this.diff, { headless: true, fair: true, coop: this.players.length });
    this.gid = require('crypto').randomBytes(6).toString('hex'); this.phase = 'game'; this.acc = 0; this.snapT = 0;
    for (const p of this.players) { p.ready = false; send(p.ws, this.startMsg(p)); }
    this.pushState();
  }
  action(p, a) {
    const g = this.game; if (this.phase !== 'game' || !g || g.over || !a || typeof a !== 'object') return;
    Sound.game = g;
    const isHost = p.cid === this.hostCid, deny = why => send(p.ws, { t: 'deny', why });
    switch (a.k) {
      case 'build': {
        const { id, c, r } = a;
        if (!Number.isInteger(id) || id < 0 || id >= TOWERS.length || !Number.isInteger(c) || !Number.isInteger(r)) return deny('bad');
        if (!p.owned.has(id)) return deny('locked');
        if (!g.canBuild(c, r)) return deny('cell');
        if (!g.buildTower(id, c, r, false, 1, undefined, p.id)) deny('gold');
        break;
      }
      case 'up': { const t = g.towers.find(x => x.uid === a.u); if (t && t.lvl < 3 && !g.upgradeTower(t)) deny('gold'); break; }
      case 'sell': { const t = g.towers.find(x => x.uid === a.u); if (!t) return; if (t.owner !== p.id && !isHost) return deny('owner'); g.sellTower(t); break; }
      case 'tgt': { const t = g.towers.find(x => x.uid === a.u); if (t && TGT_KEYS.has(a.v)) t.tgt = a.v; break; }
      case 'wave': { const now = Date.now(); if (now - p.lastWave < 800) return; p.lastWave = now; g.startWave(); break; }
      case 'pause': if (isHost) g.paused = !g.paused; else deny('host'); break;
      case 'speed': if (isHost && [1, 2, 3].includes(a.v)) g.speed = a.v; else if (!isHost) deny('host'); break;
      case 'auto': if (isHost) g.auto = !g.auto; else deny('host'); break;
    }
  }
  tick(dt, now) {
    if (this.phase === 'game' && this.game) {
      const g = this.game;
      if (this.connected().length) {            // sem jogadores conectados a partida congela
        Sound.game = g;
        if (!g.paused && !g.over) {
          this.acc += dt * g.speed; let n = 0;
          while (this.acc >= STEP && n < 12) { g.step(STEP); this.acc -= STEP; n++; }
          if (n >= 12) this.acc = 0;
        }
        this.snapT += dt;
        const every = (g.paused || g.over) ? .5 : 1 / SNAP_HZ;
        if (this.snapT >= every || g.over && this.phase === 'game') { this.snapT = 0; this.sendSnap(); }
        if (g.over) { this.phase = 'over'; this.overAt = now; this.sendSnap(); this.pushState(); }
      }
    } else if (this.phase === 'over' && now - this.overAt > OVER_TO_LOBBY) {
      this.phase = 'lobby'; this.game = null; for (const p of this.players) p.ready = false; this.pushState();
    }
    if (now - this.infoT > 3000) { this.infoT = now; if (this.players.length > 1) this.pushState(); }
  }
  sendSnap() {
    const s = this.game.snapshot(); s.t = 'snap'; s.gid = this.gid;
    const str = JSON.stringify(s);
    for (const p of this.players) if (p.connected && p.ws.bufferedAmount < 512 * 1024) send(p.ws, str);
  }
  housekeeping(now) {
    for (const p of [...this.players]) {
      if (!p.connected && now - p.gone > (this.phase === 'lobby' ? GRACE_LOBBY : GRACE_GAME)) this.remove(p);
    }
  }
}

/* ---------- API usada por server.js ---------- */
function create(ws, cid, name, owned, map, diff) {
  if (rooms.size >= MAX_ROOMS) return { err: 'Servidor cheio. Tente mais tarde.' };
  const code = genCode(); if (!code) return { err: 'Não foi possível criar a sala.' };
  const r = new Room(code); rooms.set(code, r);
  if (Number.isInteger(map) && MAPS[map]) r.map = map;
  if (DIFFS[diff]) r.diff = diff;
  const p = r.add(ws, cid, name, owned);
  return { room: r, player: p };
}
function join(ws, cid, name, owned, code) {
  const r = rooms.get(String(code || '').toUpperCase().trim());
  if (!r) return { err: 'Sala não encontrada.' };
  const prev = r.players.find(p => p.cid === cid);
  if (prev) { r.attach(prev, ws); if (name) prev.name = cleanName(name); prev.owned = new Set(owned); return { room: r, player: prev }; }
  if (r.players.length >= MAX_PLAYERS) return { err: 'A sala está cheia (6 jogadores).' };
  return { room: r, player: r.add(ws, cid, name, owned) };
}
function reattach(ws, cid) {
  const r = byCid.get(cid); if (!r) return null;
  const p = r.players.find(x => x.cid === cid); if (!p) return null;
  r.attach(p, ws); return { room: r, player: p };
}
function leave(cid) { const r = byCid.get(cid); if (!r) return; const p = r.players.find(x => x.cid === cid); if (p) r.remove(p); }
function roomOf(cid) { return byCid.get(cid) || null; }

let last = process.hrtime.bigint();
setInterval(() => {
  const nowN = process.hrtime.bigint(), dt = Math.min(.25, Number(nowN - last) / 1e9); last = nowN;
  const now = Date.now();
  for (const r of rooms.values()) { try { r.tick(dt, now); } catch (e) { console.error('[room ' + r.code + '] erro no tick:', e); r.phase = 'lobby'; r.game = null; r.pushState(); } }
}, 1000 / 60).unref();
setInterval(() => { const now = Date.now(); for (const r of [...rooms.values()]) r.housekeeping(now); }, 2000).unref();

module.exports = { create, join, reattach, leave, roomOf, MAX_PLAYERS, stats: () => ({ rooms: rooms.size, players: [...rooms.values()].reduce((a, r) => a + r.connected().length, 0) }) };
