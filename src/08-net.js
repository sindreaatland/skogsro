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
    if (was && G.started) msg(NET.kicked ? 'Du ble kastet ut av spillet. Du jakter alene.' : 'Mistet kontakten med serveren. Du jakter alene.', 'warn');
    // prøv igjen bare hvis vi har vært tilkoblet før (ikke når siden serveres uten spillserver), og ikke etter å ha blitt kastet ut
    if (NET.seen && !NET.kicked) setTimeout(netConnect, 3000);
  };
}

// ---------- dyr over nettet ----------
const PACK = ['id', 'sp', 'sex', 'state', 'kg', 'face', 'prev', 'lastZone', 'by', 'bow', 'x', 'y', 'z', 'vx', 'vy', 't', 'hp', 'aware', 'tx', 'ty', 'bleed', 'head', 'shotDist', 'deadT', 'left'];
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
  const ofi = new Map(G.fires.map(f => [f.id, f]));
  G.fires = (m.fi || []).map(f => Object.assign(ofi.get(f.id) || { pt: 0 }, f));
  G.huts = (m.hu || []).map(h => ({ id: h.id, x: +h.x, y: +h.y }));
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
  const x = clamp(+m.x || 0, -WORLD, WORLD), y = clamp(+m.y || 0, -WORLD, WORLD), u =Array.isArray(m.u) ? m.u : [];
  r.name = String(m.n || 'Jeger').slice(0, 16);
  if (!r.started) { r.started = true; r.x = x; r.y = y; r.walkT = 0; r.stepT = 0; if (G.started) msg(r.name + ' kom inn i skogen.', 'good'); netUi(); }
  r.tx = x; r.ty = y;
  r.face = HUN[m.f] ? m.f : 'down'; r.flip = !!m.fl; r.moving = !!m.mv; r.sneak = !!m.sn; r.run = !!m.rn; r.aim = !!m.am; r.wet = !!m.w; r.in = !!m.in;
  // u: [hvor godt dyrene ser dem, luktfjerneren, hvor mye skrittene bråker] (se CLO)
  r.camo = clamp(+u[0] || 1, 0.3, 1.5); r.deo = clamp(u[1] | 0, 0, 2); r.noise = clamp(+u[2] || 1, 0.3, 2);
  // hunden deres: [x, y, tilstand, retning]
  if (Array.isArray(m.dg)) {
    const g = r.dog || (r.dog = { x: +m.dg[0] || 0, y: +m.dg[1] || 0, hd: 0, anim: 0, spd: 0 });
    g.tx = +m.dg[0] || 0; g.ty = +m.dg[1] || 0; g.st = DOG_ST[m.dg[2]] || 'heel'; g.face = m.dg[3] < 0 ? -1 : 1;
    // står den for vilt, vises den i profil mot den siden viltet er
    if (g.st === 'mark') g.hd = g.face > 0 ? 0 : Math.PI;
  }
  // hesten deres, hvis de har en: [x, y, retning, rir, fart 0–1, sal og ekstra sekk (se horseKit)]; r.horse er farta
  // mens de rir (hovslagene skremmer vilt)
  if (Array.isArray(m.av)) {
    r.av = { x: clamp(+m.av[0] || 0, -WORLD, WORLD), y: clamp(+m.av[1] || 0, -WORLD, WORLD), h: +m.av[2] || 0, on: !!m.av[3], kit: m.av[5] & 6 };
    r.horse = r.av.on ? clamp(+m.av[4] || 0, 0.05, 1) : 0;
  } else { r.av = null; r.horse = 0; }
}
// T: teleporter bort til en annen jeger; trykker du igjen, kommer du til den neste
function goToHunter() {
  if (P.aim || onHorse()) return;
  const L = [...NET.peers.values()].filter(r => r.started);
  if (!L.length) { sfx.deny(); msg('Det er ingen andre jegere i skogen.'); return; }
  const r = L[(L.findIndex(q => q.id === NET.goTo) + 1) % L.length];
  NET.goTo = r.id;
  // et steg ved siden av, helst på tørt land og utenfor trær og steiner
  let x = r.tx, y = r.ty;
  for (let k = 0; k < 8; k++) {
    const an = Math.PI / 2 + k * Math.PI / 4, c = collide(r.tx + Math.cos(an) * 16, r.ty + Math.sin(an) * 12, 3);
    if (!isWater(c.x, c.y)) { x = c.x; y = c.y; break; }
  }
  P.x = x; P.y = y; CAM.x = x; CAM.y = y - 10;
  msg('Du er hos ' + r.name + '.', 'good'); sfx.ui();
}

// ---------- meldinger ----------
function netMsg(m) {
  switch (m.t) {
    case 'hello':
      NET.on = NET.seen = true; NET.id = m.id; NET.host = m.host; NET.urls = m.urls || []; NET.admin = !!m.admin;
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
    case 'kicked': NET.kicked = true; break;
    case 'reload': devReload(); break;
    case 'p': peerState(m); break;
    case 'snap': if (!isAuth() && m.from === NET.host) applySnap(m); break;
    case 'shot': {
      const k = clamp(1 - hyp(m.x - P.x, m.y - P.y) / 2200, 0.1, 1);
      // buen høres bare på nært hold, og har ikke munningsglimt
      if (m.bow) { if (k > 0.85) sfx.bow((k - 0.85) / 0.15); } else { sfx.shot(clamp(m.supp | 0, 0, 3), k); muzzle(m.x, m.y, +m.ang || 0); }
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
    case 'fire': if (isAuth()) addFire(m); break;
    case 'hut': if (isAuth()) addHut(m); break;
    case 'cut': fellTree(m.x | 0, m.y | 0, +m.d || 1); if (isAuth()) scare(+m.x, +m.y, 420); break;
    case 'bay': { const a = isAuth() && G.animals.find(x => x.id === m.id); if (a) holdAnimal(a, +m.x || a.x); break; }
    case 'collect': {
      if (!isAuth()) break;
      const a = G.animals.find(x => x.id === m.id && x.state === 'dead');
      // gjesten sier hvor mye plass den har i sekken; verten skjærer ut det og sier hvor mye som ble med
      if (a && canTake(a, m.from)) { const r = cutMeat(a, Math.max(0, +m.cap || 0)); if (r.take > 0) netSend({ t: 'got', to: m.from, a: packA(a), kg: r.take, first: r.first }); }
      break;
    }
    case 'got': P.collectT = 0; if (m.a && SPEC[m.a.sp] && SPEC[m.a.sp].kg[m.a.sex]) credit(m.a, kg1(Math.max(0, +m.kg || 0)), !!m.first); break;
    case 'msg': msg(String(m.text), m.kind); if (typeof sfx[m.snd] === 'function') sfx[m.snd](); break;
    case 'fine': { const k = fine(clamp(+m.kr || 0, 0, 1e5) | 0, String(m.text)); if (m.rot) rotNotice(String(m.text), k); break; }
  }
}

// Meldinger om utfallet går til jegeren det gjelder, lokalt eller over nettet
function tell(pid, text, kind, snd) {
  if (!NET.on || pid == null || pid === NET.id) { msg(text, kind); if (snd) sfx[snd](); }
  else netSend({ t: 'msg', to: pid, text, kind, snd });
}
// Bot til den som skal ha den: deg selv, eller en annen jeger over nettet (verten avgjør når felt vilt råtner).
// rot: boten er for vilt som har råtnet, og kommer opp som en beskjed du må lukke
function fineTo(pid, kr, text, rot) {
  if (!NET.on || pid == null || pid === NET.id) { const k = fine(kr, text); if (rot) rotNotice(text, k); }
  else netSend({ t: 'fine', to: pid, kr, text, rot: !!rot });
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
    if (auth && (r.moving || r.horse) && !r.in) { r.stepT -= dt; if (r.stepT <= 0) { r.stepT = r.horse ? 0.3 : r.sneak ? 0.55 : r.run ? 0.2 : 0.32; stepNoise(r); } }
    const g = r.dog;
    if (g) {
      const x0 = g.x, y0 = g.y; g.x = lerp(g.x, g.tx, k); g.y = lerp(g.y, g.ty, k);
      if (hyp(g.x - g.tx, g.y - g.ty) > 80) { g.x = g.tx; g.y = g.ty; }
      g.spd = lerp(g.spd, hyp(g.x - x0, g.y - y0) / Math.max(dt, 1e-3), Math.min(1, dt * 6)); g.anim += g.spd * dt * (g.spd > 60 ? 0.085 : 0.14);
      // retningen den går, så den kan vises bakfra og forfra i 3D
      if (g.spd > 3 && hyp(g.x - x0, g.y - y0) > 0.01) g.hd = Math.atan2(g.y - y0, g.x - x0);
    }
  }
  if (!NET.peers.size) return;
  NET.sendT -= dt;
  if (G.started && NET.sendT <= 0) {
    NET.sendT = 1 / 15;
    netSend({ t: 'p', n: NET.name, x: Math.round(P.x * 10) / 10, y: Math.round(P.y * 10) / 10, f: P.face, fl: P.flip, mv: P.moving, sn: P.sneak || P.aim, rn: P.run, am: P.aim, w: P.wet, in: G.panel === 'shop', u: [Math.round(cloMul('camo') * 100) / 100, lv('deo'), Math.round(cloMul('noise') * 100) / 100], dg: [Math.round(D.x), Math.round(D.y), DOG_ST.indexOf(D.st), D.face],
      av: lv('horse') ? [Math.round(HORSE.x), Math.round(HORSE.y), Math.round(HORSE.h * 100) / 100, HORSE.on ? 1 : 0, Math.round(Math.abs(HORSE.v) / HORSE_MAX * 100) / 100, horseKit(false)] : 0 });
  }
  if (auth) {
    NET.snapT -= dt;
    if (NET.snapT <= 0) {
      NET.snapT = 0.1;
      netSend({ t: 'snap', T: Math.round(G.t * 100) / 100, h: Math.round(G.hour * 1000) / 1000, d: G.day, an: G.animals.map(packA), sc: G.scentObjs.map(s => ({ id: s.id, x: s.x, y: s.y, r: s.r, t: Math.round(s.t * 10) / 10 })),
        fi: G.fires.map(f => ({ id: f.id, x: f.x, y: f.y, t: Math.round(f.t) })), hu: G.huts.map(h => ({ id: h.id, x: h.x, y: h.y })) });
    }
  }
}

// ---------- tittelskjerm ----------
function netUi() {
  plMenu();
  $('mpTxt').hidden = !NET.on && !NET.kicked;
  if (!NET.on) { if (NET.kicked) setText('mpTxt', 'Du ble kastet ut av spillet. Last inn siden på nytt for å bli med igjen.'); return; }
  const n = NET.peers.size, url = NET.urls[0];
  setText('mpTxt', (n === 0 ? 'Ingen andre er koblet til ennå.' : n === 1 ? '1 annen jeger er koblet til.' : n + ' andre jegere er koblet til.') + (url ? ' Andre på samme nett kan åpne ' + url : ''));
}
// ---------- omlasting når koden endres: serveren har bygget spillet på nytt ----------
// Var du i skogen, lagres jakta, og etter omlastingen står du på samme sted og ser samme vei, uten tittelskjermen.
// Spillet åpner med pausemenyen, siden nettleseren vil ha et klikk før den gir fra seg musepekeren og lyden
const RELOAD_KEY = 'skogsro.reload';
function devReload() {
  try { if (G.started) { save(); sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ x: P.x, y: P.y, f: P.face, fl: P.flip })); } } catch (e) { }
  location.reload();
}
function devResume() {
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem(RELOAD_KEY) || 'null'); sessionStorage.removeItem(RELOAD_KEY); } catch (e) { }
  if (!s) return;
  P.x = +s.x || 0; P.y = +s.y || 0; CAM.x = P.x; CAM.y = P.y - 30; if (HUN[s.f]) P.face = s.f; P.flip = !!s.fl;
  startGame(false);
  G.msgs = []; msg('Koden er oppdatert.', 'good');
  openPause();
}
// ---------- «Spillere» i pausemenyen: bare på maskinen som kjører serveren, med «Kast ut» ----------
function plMenu() {
  const ok = NET.on && NET.admin;
  $('plBtn').hidden = !ok; $('plBtn').textContent = 'Spillere (' + NET.peers.size + ')';
  if (G.panel === 'plSheet') { if (ok) plList(); else pauseBack(); }
}
function plList() {
  const el = $('plList'); el.textContent = '';
  if (!NET.peers.size) { const p = document.createElement('p'); p.className = 'side-note'; p.textContent = 'Ingen andre er koblet til.'; el.appendChild(p); return; }
  for (const r of NET.peers.values()) {
    const row = document.createElement('div'), who = document.createElement('div'), nm = document.createElement('div'), st = document.createElement('div'), bt = document.createElement('button');
    row.className = 'pl-row'; who.className = 'pl-who'; nm.className = 'pl-name'; st.className = 'side-note';
    nm.textContent = r.started ? r.name : 'Jeger ' + r.id; st.textContent = r.started ? 'I skogen' : 'På tittelskjermen';
    bt.type = 'button'; bt.className = 'xbtn'; bt.textContent = 'Kast ut';
    bt.onclick = () => { netSend({ t: 'kick', id: r.id }); bt.disabled = true; bt.textContent = 'Kaster ut …'; sfx.ui(); };
    who.append(nm, st); row.append(who, bt); el.appendChild(row);
  }
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
