// ===== Flerspiller på lokalnettet: én nettleser (verten) simulerer dyra, de andre speiler =====
const NET = { on: false, seen: false, ws: null, id: null, host: null, peers: new Map(), urls: [], name: 'Jeger', sendT: 0, snapT: 0 };
const isAuth = () => !NET.on || NET.host === NET.id;
// Flerspiller i spillets forstand: minst én annen er faktisk i skogen (ikke bare på tittelskjermen)
function mp() { if (!NET.on) return false; for (const r of NET.peers.values()) if (r.started) return true; return false; }
const NAME_KEY = 'skogsro.name';

// Borte = skjult fane eller tittelskjerm; serveren lar helst en som spiller styre dyra
function netAway() { netSend({ t: 'away', v: document.hidden || !G.started }); }
function netSend(m) { if (NET.on && NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(m)); }

function netConnect() {
  if (!/^https?:$/.test(location.protocol) || !window.WebSocket) return;
  let ws;
  try { ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws'); } catch (e) { return; }
  NET.ws = ws;
  ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (_) { return; } if (m && typeof m === 'object') netMsg(m); };
  ws.onclose = () => {
    const was = NET.on;
    NET.on = false; NET.ws = null; NET.host = null; NET.peers.clear(); netUi();
    if (was && G.started) msg('Mistet kontakten med serveren. Du jakter alene.', 'warn');
    // prøv igjen bare hvis vi har vært tilkoblet før (ikke når siden serveres uten spillserver)
    if (NET.seen) setTimeout(netConnect, 3000);
  };
}

// ---------- dyr over nettet ----------
const PACK = ['id', 'sp', 'sex', 'state', 'kg', 'face', 'prev', 'lastZone', 'by', 'x', 'y', 'vx', 'vy', 't', 'hp', 'aware', 'tx', 'ty', 'bleed', 'head', 'shotDist', 'deadT'];
function packA(a) {
  const o = {};
  for (const k of PACK) { const v = a[k]; if (v !== undefined) o[k] = typeof v === 'number' && k !== 'id' ? Math.round(v * 100) / 100 : v; }
  return o;
}
function applySnap(m) {
  const dT = m.T - G.t; G.t = Math.abs(dT) > 1 ? m.T : G.t + dT * 0.2;
  G.hour = m.h; G.day = m.d;
  const old = new Map(G.animals.map(a => [a.id, a]));
  G.animals = (m.an || []).filter(s => ANI[s.sp] && ANI[s.sp][s.sex]).map(s => {
    const a = old.get(s.id);
    if (!a) return Object.assign({ anim: Math.random() * 4, bloodT: 0, waterT: 0, rx: s.x, ry: s.y }, s);
    const x = a.x, y = a.y;
    Object.assign(a, s); a.rx = s.x; a.ry = s.y; a.x = x; a.y = y;
    return a;
  });
  const os = new Map(G.scentObjs.map(s => [s.id, s]));
  G.scentObjs = (m.sc || []).map(s => Object.assign(os.get(s.id) || { pt: 0 }, s));
}
// Speilede dyr glir mot siste kjente posisjon og fortsetter i farta mellom oppdateringene
function mirrorAnimal(a, dt) {
  if (a.rx === undefined) { a.rx = a.x; a.ry = a.y; }
  if (a.state === 'dead') { a.x = a.rx; a.y = a.ry; return; }
  a.rx += a.vx * dt; a.ry += a.vy * dt;
  const k = Math.min(1, dt * 10);
  a.x = lerp(a.x, a.rx, k); a.y = lerp(a.y, a.ry, k);
  if (hyp(a.x - a.rx, a.y - a.ry) > 40) { a.x = a.rx; a.y = a.ry; }
  if (Math.abs(a.vx) > 2) a.face = a.vx > 0 ? 1 : -1;
  a.anim += hyp(a.vx, a.vy) * dt * (a.state === 'flee' ? 0.085 : 0.14);
  if (a.bleed > 0) {
    a.bloodT -= dt;
    if (a.bloodT <= 0) { G.blood.push({ x: a.x + rnd(-2, 2), y: a.y + rnd(-1.5, 1.5), t: 0 }); if (G.blood.length > 500) G.blood.shift(); a.bloodT = a.state === 'flee' ? 0.22 : 1.1; }
  }
}

// ---------- andre jegere ----------
function peerState(m) {
  let r = NET.peers.get(m.from);
  if (!r) { r = { id: m.from }; NET.peers.set(m.from, r); }
  const x = +m.x || 0, y = +m.y || 0, u = Array.isArray(m.u) ? m.u : [];
  r.name = String(m.n || 'Jeger').slice(0, 16);
  if (!r.started) { r.started = true; r.x = x; r.y = y; r.walkT = 0; r.stepT = 0; if (G.started) msg(r.name + ' kom inn i skogen.', 'good'); netUi(); }
  r.tx = x; r.ty = y;
  r.face = HUN[m.f] ? m.f : 'down'; r.flip = !!m.fl; r.moving = !!m.mv; r.sneak = !!m.sn; r.run = !!m.rn; r.aim = !!m.am; r.wet = !!m.w; r.in = !!m.in;
  r.camo = clamp(u[0] | 0, 0, 2); r.deo = clamp(u[1] | 0, 0, 2); r.boots = clamp(u[2] | 0, 0, 2);
}

// ---------- meldinger ----------
function netMsg(m) {
  switch (m.t) {
    case 'hello':
      NET.on = NET.seen = true; NET.id = m.id; NET.host = m.host; NET.urls = m.urls || [];
      NET.peers.clear(); for (const id of m.peers || []) NET.peers.set(id, { id });
      netAway();
      netUi(); break;
    case 'join': NET.peers.set(m.id, { id: m.id }); netUi(); break;
    case 'leave': {
      const r = NET.peers.get(m.id);
      if (r && r.started && G.started) msg(r.name + ' gikk hjem.');
      NET.peers.delete(m.id); netUi(); break;
    }
    case 'host': NET.host = m.id; break;
    case 'p': peerState(m); break;
    case 'snap': if (!isAuth() && m.from === NET.host) applySnap(m); break;
    case 'shot': {
      const k = clamp(1 - hyp(m.x - P.x, m.y - P.y) / 2200, 0.1, 1);
      sfx.shot(clamp(m.supp | 0, 0, 3), k); muzzle(m.x, m.y, +m.ang || 0);
      if (m.bl) { G.blood.push({ x: m.bl[0], y: m.bl[1], t: 0 }); for (let i = 0; i < 4; i++) G.parts.push({ x: m.hx, y: m.hy + 2, z: 0, vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(4, 10), life: rnd(0.2, 0.4), col: '#a8302a', grav: 1 }); }
      if (isAuth()) applyShot(m, m.from);
      break;
    }
    case 'call': {
      const k = clamp(1 - hyp(m.x - P.x, m.y - P.y) / 1000, 0, 1);
      if (k > 0.05) sfx.call(clamp(m.L | 0, 0, 3), k);
      if (isAuth()) applyCall(m, m.from);
      break;
    }
    case 'scent': if (isAuth()) addScent(m); break;
    case 'collect': {
      if (!isAuth()) break;
      const a = G.animals.find(x => x.id === m.id && x.state === 'dead');
      if (a && canTake(a, m.from)) { G.animals.splice(G.animals.indexOf(a), 1); netSend({ t: 'got', to: m.from, a: packA(a) }); }
      break;
    }
    case 'got': if (m.a && SPEC[m.a.sp]) credit(m.a); break;
    case 'msg': msg(String(m.text), m.kind); if (typeof sfx[m.snd] === 'function') sfx[m.snd](); break;
  }
}

// Meldinger om utfallet går til jegeren det gjelder, lokalt eller over nettet
function tell(pid, text, kind, snd) {
  if (!NET.on || pid == null || pid === NET.id) { msg(text, kind); if (snd) sfx[snd](); }
  else netSend({ t: 'msg', to: pid, text, kind, snd });
}

// ---------- hver frame ----------
function netUpdate(dt) {
  if (!NET.on) return;
  const auth = isAuth();
  for (const r of NET.peers.values()) {
    if (!r.started) continue;
    const k = Math.min(1, dt * 12);
    r.x = lerp(r.x, r.tx, k); r.y = lerp(r.y, r.ty, k);
    if (hyp(r.x - r.tx, r.y - r.ty) > 80) { r.x = r.tx; r.y = r.ty; }
    if (r.moving) r.walkT += dt * (r.sneak ? 0.55 : r.run ? 1.7 : 1);
    if (auth && r.moving && !r.in) { r.stepT -= dt; if (r.stepT <= 0) { r.stepT = r.sneak ? 0.55 : r.run ? 0.2 : 0.32; stepNoise(r); } }
  }
  if (!NET.peers.size) return;
  NET.sendT -= dt;
  if (G.started && NET.sendT <= 0) {
    NET.sendT = 1 / 15;
    netSend({ t: 'p', n: NET.name, x: Math.round(P.x * 10) / 10, y: Math.round(P.y * 10) / 10, f: P.face, fl: P.flip, mv: P.moving, sn: P.sneak, rn: P.run, am: P.aim, w: P.wet, in: G.panel === 'shop', u: [lv('camo'), lv('deo'), lv('boots')] });
  }
  if (auth) {
    NET.snapT -= dt;
    if (NET.snapT <= 0) {
      NET.snapT = 0.1;
      netSend({ t: 'snap', T: Math.round(G.t * 100) / 100, h: Math.round(G.hour * 1000) / 1000, d: G.day, an: G.animals.map(packA), sc: G.scentObjs.map(s => ({ id: s.id, x: s.x, y: s.y, r: s.r, t: Math.round(s.t * 10) / 10 })) });
    }
  }
}

// ---------- tittelskjerm ----------
function netUi() {
  $('mpTxt').hidden = !NET.on;
  if (!NET.on) return;
  const n = NET.peers.size, url = NET.urls[0];
  setText('mpTxt', (n === 0 ? 'Ingen andre er koblet til ennå.' : n === 1 ? '1 annen jeger er koblet til.' : n + ' andre jegere er koblet til.') + (url ? ' Andre på samme nett kan åpne ' + url : ''));
}
function netInit() {
  let name = '';
  try { name = localStorage.getItem(NAME_KEY) || ''; } catch (e) { }
  $('nameIn').value = name || 'Jeger ' + (10 + ((Math.random() * 90) | 0));
  netSetName(); $('nameIn').addEventListener('input', netSetName);
  document.addEventListener('visibilitychange', netAway);
  netConnect();
}
function netSetName() {
  NET.name = ($('nameIn').value.trim() || 'Jeger').slice(0, 16);
  try { localStorage.setItem(NAME_KEY, NET.name); } catch (e) { }
}
