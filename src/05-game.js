// ===== Spill: jeger, dyr, våpen, lokking og vær =====
const UPG = [
  { id: 'scope', cat: 'rifle', icon: 'scope', name: 'Sikte', lv: ['Åpne sikter', 'Kikkertsikte 3×', 'Kikkertsikte 6×', 'Variabelt 10× med avstandsmåler'], price: [0, 350, 1100, 2800],
    d: ['Kjerne og skjæring. Ingen forstørrelse å snakke om.', 'Rolig bilde og tydelig trådkors.', 'Ser dyrets bog på lang hold. Viser avstand.', 'Viser avstand, art og anslått vekt i siktet.'] },
  { id: 'barrel', cat: 'rifle', icon: 'barrel', name: 'Pipe', lv: ['Fabrikkpipe', 'Fritt flytende pipe', 'Match-pipe', 'Håndlappet match-pipe'], price: [0, 300, 900, 2400],
    d: ['Grei spredning på kort hold.', 'Strammere grupper og lengre rekkevidde.', 'Presis ut på langt hold.', 'Kula går dit du sikter.'] },
  { id: 'caliber', cat: 'rifle', icon: 'caliber', name: 'Kaliber', lv: ['.222 Remington', '6,5×55', '.308 Winchester', '9,3×62'], price: [0, 600, 1600, 3600],
    d: ['Nok til rev og rådyr.', 'Klassisk hjortekaliber.', 'Tar elg med godt treff.', 'Stopper bjørn og stor elg.'] },
  { id: 'stock', cat: 'rifle', icon: 'stock', name: 'Kolbe', lv: ['Bøkekolbe', 'Valnøtt med kinnstøtte', 'Justerbar kolbe', 'Laminert kolbe og skytestokk'], price: [0, 250, 800, 2000],
    d: ['Siktet vandrer med pusten.', 'Roligere anlegg.', 'Lite bevegelse i siktet.', 'Nesten helt stille i siktet.'] },
  { id: 'mag', cat: 'rifle', icon: 'mag', name: 'Magasin', lv: ['Enkeltskudd', '3 patroner', '4 patroner', '5 patroner'], price: [0, 200, 550, 1200],
    d: ['Ett skudd, så må du lade.', 'Rom for et oppfølgingsskudd.', 'Fire skudd før ny lading.', 'Fem skudd.'] },
  { id: 'bolt', cat: 'rifle', icon: 'bolt', name: 'Sluttstykke', lv: ['Stivt sluttstykke', 'Polert sluttstykke', 'Rett-trekk', 'Rett-trekk og lett avtrekk'], price: [0, 250, 700, 1800],
    d: ['Tregt å repetere.', 'Raskere mellom skuddene.', 'Rask repetering og lading.', 'Lynrask, og lett avtrekk gir mindre rykk.'] },
  { id: 'supp', cat: 'rifle', icon: 'supp', name: 'Lyddemper', lv: ['Ingen', 'Kort demper', 'Fullengde demper', 'Over-løps demper'], price: [0, 400, 1100, 2600],
    d: ['Smellet skremmer alt i vid omkrets.', 'Dyr lenger unna blir stående.', 'Skuddet høres som et dempet slag.', 'Nesten bare kulas smell.'] },
  { id: 'call', cat: 'lure', icon: 'call', name: 'Lokkefløyte', lv: ['Rådyrpipe', 'Hjortebrøler', 'Elgehorn', 'Mesterfløyte'], price: [0, 450, 1200, 2600],
    d: ['Lokker rådyr og rev.', 'Også hjort og rein svarer.', 'Når også elg og villsvin.', 'Selv bjørn, gaupe og ulv kommer for å se.'] },
  { id: 'scentLv', cat: 'lure', icon: 'scent', name: 'Luktstoff', lv: ['Brunstvæske', 'Sterk brunstvæske', 'Mesterblanding'], price: [0, 500, 1400],
    d: ['Trekker dyr innen kort avstand.', 'Når lenger og varer lenger.', 'Trekker dyr fra langt unna.'] },
  { id: 'camo', cat: 'gear', icon: 'camo', name: 'Kamuflasje', lv: ['Grønn jakke', 'Kamuflasjedress', '3D-løvdress'], price: [0, 300, 1000],
    d: ['Dyrene ser deg på vanlig avstand.', 'Du glir inn i skogen.', 'Du er en busk blant busker.'] },
  { id: 'deo', cat: 'gear', icon: 'deo', name: 'Luktfjerner', lv: ['Ingen', 'Luktfri såpe', 'Karbonspray'], price: [0, 250, 900],
    d: ['Vinden bærer lukten din langt.', 'Kortere luktspor i vinden.', 'Dyrene må nesten tråkke på deg.'] },
  { id: 'boots', cat: 'gear', icon: 'boots', name: 'Støvler', lv: ['Gummistøvler', 'Lette fjellstøvler', 'Ullsokker over støvlene'], price: [0, 250, 800],
    d: ['Kvister knekker under deg.', 'Stillere steg.', 'Nesten lydløse steg.'] },
  { id: 'hagle', cat: 'hagle', icon: 'hagle', name: 'Hagle', lv: ['Ingen hagle', 'Enløps hagle', 'Dobbeltløps hagle', 'Halvautomatisk hagle'], price: [0, 500, 1400, 3000],
    d: ['', 'For fugl i flukt og småvilt på kort hold. Ett skudd.', 'To løp side om side: to skudd før du lader.', 'Tre skudd og rask lading.'] },
  { id: 'choke', cat: 'hagle', icon: 'choke', name: 'Choke', lv: ['Sylinder', 'Halvchoke', 'Helchoke'], price: [0, 350, 900],
    d: ['Vid sverm som sprer seg fort. Best på kort hold.', 'Samlet sverm ut på middels hold.', 'Tett sverm som når langt, men du må treffe godt.'] },
  { id: 'shell', cat: 'hagle', icon: 'shell', name: 'Patroner', lv: ['Hagl nr. 7', 'Hagl nr. 5', 'Hagl nr. 3'], price: [0, 300, 800],
    d: ['Små hagl. Nok til rype og hare på kort hold.', 'Kraftigere hagl for orrfugl og rev.', 'Grove hagl som tar tiuren på lengre hold.'] },
];
const ST = {
  mag: [1.5, 1.9, 2.4, 3.0], fov: [40, 22, 15, 10], spread: [1.1, 0.75, 0.45, 0.25], range: [260, 340, 440, 560], dmg: [40, 70, 100, 145],
  sway: [2.4, 1.7, 1.1, 0.7], cap: [1, 3, 4, 5], cycle: [1.5, 1.05, 0.7, 0.45], reload: [2.4, 1.8, 1.3, 0.9], noise: [1500, 850, 450, 260],
  callR: [420, 520, 620, 720], scentR: [200, 300, 420], scentT: [90, 140, 200], camo: [1, 0.75, 0.55], deo: [1, 0.7, 0.45], boots: [1, 0.7, 0.48],
};
// Hagla: modellen gir antall skudd og ladetid, choken svermens spredning (radianer) og patronene antall hagl,
// kraft per hagl og holdet (piksler) der haglene begynner å miste kraft. Vidt bilde og lite uro i siktet
const HST = { cap: [0, 1, 2, 3], reload: [0, 1.5, 1.8, 1.2], cycle: [0, 0.3, 0.22, 0.3], spread: [0.07, 0.05, 0.036], pellets: [26, 20, 14], pdmg: [1.5, 2.2, 3.2], prange: [90, 115, 145], fov: 66, sway: 0.5 };
const CALLSP = [['radyr', 'rev'], ['radyr', 'rev', 'hjort', 'rein'], ['radyr', 'rev', 'hjort', 'rein', 'elg', 'villsvin'], ['radyr', 'rev', 'hjort', 'rein', 'elg', 'villsvin', 'bjorn', 'gaupe', 'ulv']];
const FLASK_PRICE = 120, M_PER_PX = 0.25;
// Bøter: vådeskudd er skudd som går av uten at du sikter, bom er siktede skudd som ikke treffer dyr
// Hagle er bare lov på småvilt og fugl; skyter du storvilt med den, blir det bot
const FINE = { hip: 200, miss: 50, big: 300 };
const ZONES = { head: ['Hodeskudd', 2.2, 0.95], vital: ['Hjerte/lunge', 1.6, 1], body: ['Bogtreff', 1, 0.8], rear: ['Bakpart', 0.75, 0.7], leg: ['Beinskudd', 0.45, 0.6], torso: ['Kroppstreff', 1.4, 0.6], shot: ['Haglskudd', 1, 1] };
// Vekt med desimalkomma; små dyr og fugler veies på tidelen
const fmtKg = kg => String(kg).replace('.', ',') + ' kg';

const G = {
  t: 0, hour: 6.6, day: 1, money: 0, scents: 2, journal: [], up: {}, started: false, paused: false, panel: null, gun: 'rifle',
  wind: { a: 0, s: 0.5, x: 1, y: 0 }, animals: [], scentObjs: [], blood: [], parts: [], msgs: [], spawnT: 0, quiet: [], dayl: 1, hunters: [], saveT: 15, pauseT: 0,
};
for (const u of UPG) G.up[u.id] = 0;
const P = { x: 0, y: 30, face: 'down', flip: false, walkT: 0, moving: false, sneak: false, aim: false, breath: 1, hold: false, ammo: 1, ammo2: 0, cycle: 0, reload: 0, callCd: 0, stepT: 0, wet: false, deep: false, cold: 0, chill: false, sway: [0, 0], unrest: 0, winded: false, bph: 0 };
const lv = id => G.up[id];
const hagle = () => G.gun === 'hagle';
const gunCap = g => (g || G.gun) === 'hagle' ? HST.cap[lv('hagle')] : ST.cap[lv('mag')];
// Lader begge våpnene (ved start og i bua); ammo2 er det andre våpenet sitt
function refill() { P.ammo = gunCap(); P.ammo2 = gunCap(hagle() ? 'rifle' : 'hagle'); P.reload = 0; }
function switchGun(g) {
  if (g === G.gun || !G.started || G.paused) return;
  if (g === 'hagle' && !lv('hagle')) { sfx.deny(); msg('Du har ingen hagle ennå. Kjøp en i bua.'); return; }
  [P.ammo, P.ammo2] = [P.ammo2, P.ammo]; G.gun = g; P.reload = 0; P.cycle = 0.4; sfx.bolt();
  msg(g === 'hagle' ? UPG.find(u => u.id === 'hagle').lv[lv('hagle')] + ' i hendene.' : 'Rifla i hendene.');
}

// ---------- lagring (localStorage i denne nettleseren) ----------
const SAVE_KEY = 'skogsro.v1';
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ money: G.money, up: G.up, scents: G.scents, journal: G.journal, day: G.day, hour: G.hour })); } catch (e) { } }
function load() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (!s) return false; G.money = s.money | 0; Object.assign(G.up, s.up || {}); G.scents = s.scents ?? 2; G.journal = s.journal || []; G.day = s.day || 1; if (typeof s.hour === 'number') G.hour = s.hour; return true; } catch (e) { return false; }
}

// ---------- meldinger ----------
function msg(text, kind) { G.msgs.push({ text, kind: kind || '', t: 0 }); if (G.msgs.length > 5) G.msgs.shift(); HUD.dirtyMsg = true; }

// ---------- jegere dyra kan merke (deg og de andre på nettet) ----------
function hunters() {
  const L = [];
  if (G.started && G.panel !== 'shop') L.push({ id: NET.id, x: P.x, y: P.y, moving: P.moving, sneak: P.sneak, wet: P.wet, camo: lv('camo'), deo: lv('deo') });
  for (const r of NET.peers.values()) if (r.started && !r.in) L.push(r);
  return L;
}
// Steder dyr skal finnes rundt: deg og alle andre som er i skogen
function anchors() {
  const L = [P];
  for (const r of NET.peers.values()) if (r.started) L.push(r);
  return L;
}
function stepNoise(h) {
  const nr = (h.sneak ? 32 : h.run ? 170 : 95) * ST.boots[h.boots] * (h.wet ? 1.4 : 1);
  for (const a of G.animals) if (a.state !== 'dead' && a.state !== 'flee') { const d = hyp(a.x - h.x, a.y - h.y); if (d < nr) a.aware = Math.min(1.6, a.aware + 0.45 * (1 - d / nr) * SPEC[a.sp].hear); }
}
const canTake = (a, pid) => !a.by || a.by === pid || (a.by !== NET.id && !NET.peers.has(a.by));

// ---------- dyr ----------
function pickSpecies(x, y) {
  const f = fields(x, y, cabinsNear(x, y)), F = f[0], Cn = f[1], night = 1 - G.dayl;
  const w = { radyr: 3, rev: 1.5, hjort: F > 0.4 && Cn < 0.65 ? 1.8 : 0.8, rein: F < 0.42 ? 1.6 : 0.15, villsvin: Cn < 0.5 ? 1.3 : 0.4, elg: 1 + (f[2] < 4 ? 1 : 0), bjorn: (Cn > 0.5 ? 0.35 : 0.12) * (1 + night),
    gaupe: Cn > 0.45 ? 0.22 : 0.1, ulv: F < 0.6 ? 0.16 : 0.06, hare: 1.6, grevling: (F > 0.3 ? 0.4 : 0.1) * (1 + night * 2),
    storfugl: Cn > 0.5 && F > 0.4 ? 1.1 : 0.25, orrfugl: F < 0.55 ? 1.1 : 0.35, rype: F < 0.42 ? 1.5 : 0.08 };
  let tot = 0; for (const k in w) tot += w[k];
  let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; }
  return 'radyr';
}
function spawnAnimal(sp, x, y, sex) {
  const A = SPEC[sp]; sex = sex || (Math.random() < 0.5 ? 'm' : 'f');
  const kr = A.kg[sex], k = lerp(kr[0], kr[1], Math.pow(Math.random(), 1.3)), kg = k < 10 ? Math.round(k * 10) / 10 : Math.round(k);
  const a = { sp, sex, x, y, z: 0, vx: 0, vy: 0, face: Math.random() < 0.5 ? 1 : -1, state: 'graze', t: rnd(2, 10), hp: A.hp * (sex === 'm' ? 1.1 : 1), aware: 0, kg, anim: Math.random() * 4, tx: x, ty: y, bleed: 0, bloodT: 0, waterT: 0, head: Math.random() * TAU, id: Math.random() };
  G.animals.push(a); return a;
}
function trySpawn(h) {
  const alive = G.animals.filter(a => a.state !== 'dead' && hyp(a.x - h.x, a.y - h.y) < 1400).length;
  if (alive >= 8) return;
  const ang = Math.random() * TAU, dist = rnd(650, 1200), x = h.x + Math.cos(ang) * dist, y = h.y + Math.sin(ang) * dist;
  // der det nylig er skutt, kommer det ikke nye dyr på en god stund
  if (G.quiet.some(q => hyp(x - q.x, y - q.y) < q.r)) return;
  const f = fields(x, y, cabinsNear(x, y));
  if (f[2] < 2 || nearestCabin(x, y).d < 220) return;
  const sp = pickSpecies(x, y), g = SPEC[sp].grp, n = g[0] + ((Math.random() * (g[1] - g[0] + 1)) | 0);
  for (let i = 0; i < n; i++) { const a = spawnAnimal(sp, x + rnd(-30, 30), y + rnd(-20, 20)); a.grp = ang; }
}
function startFlee(a, fx, fy, dur) {
  if (a.state === 'dead') return;
  const bird = SPEC[a.sp].bird;
  a.state = 'flee'; a.t = bird ? rnd(3, 5) : dur || rnd(5, 9); a.fx = fx; a.fy = fy; if (bird) a.fz = rnd(16, 32);
  const d = hyp(a.x - fx, a.y - fy) || 1; a.head = Math.atan2((a.y - fy) / d, (a.x - fx) / d) + rnd(-0.4, 0.4);
  if (a.sp === 'rev' && Math.random() < 0.5) sfx.bark();
  for (const b of G.animals) if (b !== a && b.sp === a.sp && b.state !== 'dead' && b.state !== 'flee' && hyp(b.x - a.x, b.y - a.y) < 140) { b.state = 'flee'; b.t = a.t + rnd(-1, 1); b.fx = fx; b.fy = fy; b.head = a.head + rnd(-0.3, 0.3); b.aware = 1.2; if (bird) b.fz = rnd(16, 32); }
}
function wander(a) {
  const A = SPEC[a.sp], d = rnd(50, a.sp === 'rev' ? 260 : 180) * (A.bird ? 0.3 : 1), an = a.head + rnd(-1.4, 1.4);
  a.tx = a.x + Math.cos(an) * d; a.ty = a.y + Math.sin(an) * d * 0.8; a.state = 'walk'; a.head = an;
}
function killAnimal(a) {
  a.state = 'dead'; a.bleed = 0; a.deadT = 0;
  if (!(a.z > 0)) a.vx = a.vy = 0; // fugl skutt i lufta faller videre i farta
  tell(a.by, SPEC[a.sp].name + (a.sex === 'm' ? ' (' + SPEC[a.sp].sexn.m + ')' : ' (' + SPEC[a.sp].sexn.f + ')') + ' ligger. Gå bort og trykk F.', 'good', 'thud');
}
function animalUpdate(a, dt) {
  const A = SPEC[a.sp];
  if (a.state === 'dead') {
    a.deadT += dt;
    if (a.z > 0) { const k = Math.exp(-dt * 1.5); a.vz = (a.vz || 0) + 100 * dt; a.z = Math.max(0, a.z - a.vz * dt); a.x += a.vx * dt; a.y += a.vy * dt; a.vx *= k; a.vy *= k; if (!a.z) a.vx = a.vy = 0; }
    return;
  }
  if (a.bleed > 0) {
    a.hp -= a.bleed * dt; a.bloodT -= dt;
    if (a.bloodT <= 0) { G.blood.push({ x: a.x + rnd(-2, 2), y: a.y + rnd(-1.5, 1.5), t: 0 }); if (G.blood.length > 500) G.blood.shift(); a.bloodT = a.state === 'flee' ? 0.22 : 1.1; }
    if (a.hp <= 0) { killAnimal(a); return; }
  }
  let gain = 0, th = P, nd = 1e9;
  for (const h of G.hunters) {
    const dx = h.x - a.x, dy = h.y - a.y, d = hyp(dx, dy);
    if (d < nd) { nd = d; th = h; }
    const vis = (h.moving ? (h.sneak ? 0.55 : 1) : 0.42) * ST.camo[h.camo] * lerp(0.5, 1, G.dayl) * (a.state === 'toScent' || a.nearScent ? 0.7 : 1);
    const sr = A.sight * vis;
    if (d < sr) gain += ((1 - d / sr) * 2.3 + 0.12) * dt;
    if (d > 1) {
      const dot = (-dx * G.wind.x - dy * G.wind.y) / d, sm = A.smell * ST.deo[h.deo] * (0.55 + 0.6 * G.wind.s);
      if (dot > 0.82 && d < sm) { gain += (3 * (1 - d / sm) + 0.5) * dt; a.smelled = h; }
    }
  }
  const dx = th.x - a.x;
  a.aware = clamp(gain > 0 ? a.aware + gain : a.aware - 0.11 * dt, 0, 1.6);
  if (a.state !== 'flee' && a.aware >= 1) { startFlee(a, th.x, th.y); if (a.smelled) tell(a.smelled.id, SPEC[a.sp].name + ' fikk teven av deg i vinden.', 'warn'); a.smelled = null; }
  else if (a.aware > 0.35 && a.state !== 'flee' && a.state !== 'alert') { a.prev = a.state; a.state = 'alert'; a.t = rnd(2.5, 5); }
  let spd = 0;
  switch (a.state) {
    case 'graze': case 'stand':
      a.t -= dt; if (a.t <= 0) { if (Math.random() < 0.55) wander(a); else { a.state = Math.random() < 0.7 ? 'graze' : 'stand'; a.t = rnd(4, 12); } }
      break;
    case 'walk': case 'approach': case 'toScent': {
      const ex = a.tx - a.x, ey = a.ty - a.y, ed = hyp(ex, ey);
      spd = A.walk * (a.state === 'approach' ? 1.7 : 1);
      if (ed < 4) {
        if (a.state === 'approach') { a.state = 'stand'; a.t = rnd(7, 13); a.face = dx > 0 ? 1 : -1; }
        else if (a.state === 'toScent') { a.state = 'graze'; a.t = rnd(12, 22); }
        else { a.state = Math.random() < 0.65 ? 'graze' : 'stand'; a.t = rnd(4, 12); }
        spd = 0;
      } else a.head = Math.atan2(ey, ex);
      break;
    }
    case 'alert':
      a.face = dx > 0 ? 1 : -1; a.t -= dt;
      if (a.t <= 0 && a.aware < 0.5) { a.state = a.prev === 'approach' || a.prev === 'toScent' ? a.prev : 'graze'; a.t = rnd(3, 8); }
      break;
    case 'flee':
      if (A.bird) {
        // fuglen letter, flyr unna og daler ned et stykke borte; er det vann under, flyr den videre
        a.t -= dt;
        a.z = a.t > 1.2 ? Math.min(a.fz || 24, a.z + dt * 36) : Math.max(0, a.z - dt * 16);
        spd = a.z > 0.5 ? A.fly * (a.bleed > 0 ? 0.75 : 1) : A.run;
        a.head += Math.sin(G.t * 1.7 + a.id * 9) * 0.3 * dt;
        if (a.t <= 0 && a.z <= 0) { if (isWater(a.x, a.y)) a.t = 1.6; else { a.aware = 0.5; a.prev = 'graze'; a.state = 'alert'; a.t = rnd(3, 6); } }
        break;
      }
      spd = A.run * (a.bleed > 0 ? 0.8 : 1) * (a.t < 1.2 ? 0.6 : 1);
      a.head += Math.sin(G.t * 2 + a.id * 9) * 0.6 * dt;
      a.t -= dt; if (a.t <= 0) { a.aware = 0.3; wander(a); }
      break;
  }
  if (spd > 0) {
    a.waterT -= dt;
    if (a.waterT <= 0 && !(a.z > 0)) {
      a.waterT = 0.3;
      const lx = a.x + Math.cos(a.head) * 16, ly = a.y + Math.sin(a.head) * 16;
      if (isWater(lx, ly)) { a.head += (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random()); if (a.state === 'walk' || a.state === 'toScent' || a.state === 'approach') { a.state = 'stand'; a.t = rnd(1, 3); spd = 0; } }
    }
    a.vx = Math.cos(a.head) * spd; a.vy = Math.sin(a.head) * spd * 0.8;
  } else { a.vx *= 0.8; a.vy *= 0.8; }
  const c = a.z > 2 ? { x: a.x + a.vx * dt, y: a.y + a.vy * dt } : collide(a.x + a.vx * dt, a.y + a.vy * dt, 2);
  a.x = c.x; a.y = c.y;
  if (Math.abs(a.vx) > 2) a.face = a.vx > 0 ? 1 : -1;
  a.anim += hyp(a.vx, a.vy) * dt * (a.state === 'flee' ? 0.085 : 0.14);
}
function animalSprite(a) {
  const o = ANI[a.sp][a.sex];
  switch (a.state) {
    case 'dead': return o.dead[0];
    case 'flee': return a.z > 0.5 && o.fly ? o.fly[a.t > 1.2 ? (a.anim | 0) & 3 : 1] : o.run[(a.anim | 0) & 3];
    case 'alert': return o.alert[0];
    case 'graze': return o.graze[((G.t * 0.7 + a.id * 5) | 0) & 1];
    case 'stand': return o.stand[0];
    default: return hyp(a.vx, a.vy) > 1 ? o.walk[(a.anim | 0) & 3] : o.stand[0];
  }
}
function hitTest(a, tx, ty) {
  const s = animalSprite(a), rx = Math.round(a.x), ry = Math.round(a.y - (a.z || 0));
  const lx = a.face > 0 ? Math.floor(tx - rx) + s.ax : s.ax - 1 - Math.floor(tx - rx), ly = Math.floor(ty - ry) + s.ay;
  return hitZone(a, s, lx, ly);
}
// Hvilken del av dyret pikselen (lx, ly) i spriten s er, eller null utenfor dyret
function hitZone(a, s, lx, ly) {
  if (!s.pix.get(lx, ly)) return null;
  const A = SPEC[a.sp], u = lx - s.ax, v = ly - s.ay;
  if (s.hc && hyp(u - s.hc.x, v - s.hc.y) < s.hc.r) return 'head';
  if (A.bird) return v > s.legY ? 'leg' : 'torso';
  const byl = a.state === 'dead' ? -A.Hh * 0.42 : -A.leg - A.Hh / 2 + (s.bob || 0);
  if (v > byl + A.Hh / 2 + 1) return 'leg';
  if (u > A.L / 2 - A.chestR * 2 && u < A.L / 2 && Math.abs(v - byl) < A.Hh * 0.38) return 'vital';
  if (u < -A.L / 4) return 'rear';
  return 'body';
}

// ---------- jeger-handlinger ----------
// Uro i siktet fra pusten; i tillegg gir store sving med børsa kraftige rykk, og kulde store, ujevne sveip.
// Holder du pusten, roer rykkene seg fortere, men kulda blir værende
function aimSway() {
  const hg = hagle(), s = hg ? HST.sway : ST.sway[lv('stock')], t = G.t, n = (u, row) => (vnoise(t * u, row, 71) - 0.5) * 2;
  const c = P.cold * (5 + 1.2 * s) * (hg ? 0.6 : 1), m = P.unrest * (7 + 2.5 * s) * (hg ? 0.3 : 1);
  return [P.sway[0] + (n(0.8, 0) + n(1.9, 4) * 0.35) * c + (n(3.1, 16) + n(7.3, 20) * 0.5) * m,
    P.sway[1] + (n(0.8, 8) + n(1.9, 12) * 0.35) * c * 0.8 + (n(3.1, 24) + n(7.3, 28) * 0.5) * m * 0.8];
}
function muzzle(x, y, ang) {
  for (let i = 0; i < 6; i++) G.parts.push({ x: x + Math.cos(ang) * 10, y: y + 0.5, z: 9, vx: Math.cos(ang) * rnd(10, 40) + rnd(-8, 8), vy: Math.sin(ang) * rnd(10, 40), vz: rnd(-4, 8), life: rnd(0.05, 0.14), col: i < 2 ? '#fff6c8' : '#ffb84a' });
  for (let i = 0; i < 5; i++) G.parts.push({ x: x + Math.cos(ang) * 10, y: y + 0.5, z: 9, vx: Math.cos(ang) * rnd(4, 12), vy: Math.sin(ang) * rnd(4, 12), vz: rnd(2, 6), life: rnd(0.6, 1.4), col: '#c8c8bc', smoke: 1 });
}
function shoot() {
  if (!G.started || G.paused) return;
  if (P.reload > 0 || P.cycle > 0) return;
  const hg = hagle();
  if (P.ammo <= 0) { sfx.deny(); msg(hg ? 'Hagla er tom. Trykk R for å lade.' : 'Magasinet er tomt. Trykk R for å lade.'); return; }
  P.ammo--; P.cycle = hg ? HST.cycle[lv('hagle')] : ST.cycle[lv('bolt')];
  const supp = hg ? 0 : lv('supp');
  sfx.shot(supp); if (!hg) setTimeout(() => { if (P.ammo > 0) sfx.bolt(); }, 380);
  // i siktet (3D) går skuddet etter trådkorset/perla, ellers fra hofta mot musepekeren på kartet
  const r = P.aim ? (hg ? aimShotgun() : aimShot()) : hipShot(hg);
  muzzle(P.x, P.y, r.ang);
  let hits = r.hits;
  if (!hg) {
    const rng_ = ST.range[lv('barrel')], cal = ST.dmg[lv('caliber')];
    hits = r.a ? [{ a: r.a, zone: r.zone, d: r.d, hx: r.hx, hy: r.hy, cal, dmg: cal * ZONES[r.zone][1] * clamp(1 - (r.d - rng_) / rng_, 0.35, 1) }] : [];
  }
  const sh = { x: P.x, y: P.y, ang: r.ang, supp, hits: hits.map(h => ({ id: h.a.id, zone: h.zone, dmg: h.dmg, d: h.d, cal: h.cal })) };
  if (hits.length) { Object.assign(sh, { hx: hits[0].hx, hy: hits[0].hy, bl: [hits[0].a.x, hits[0].a.y] }); for (const h of hits) G.blood.push({ x: h.a.x, y: h.a.y, t: 0 }); }
  netSend({ t: 'shot', ...sh });
  if (isAuth()) applyShot(sh, NET.id);
  if (!P.aim) fine(FINE.hip, 'Vådeskudd – du skjøt uten å sikte.');
  else if (hg && hits.some(h => !SPEC[h.a.sp].small)) fine(FINE.big, 'Hagle er ikke lov på storvilt.');
  else if (!hits.length) { if (hg) msg('Bom.', 'warn'); else fine(FINE.miss, 'Bom.'); }
}
// Skade fra ett hagl: full kraft ut til patronens hold, så avtar den til null på dobbelt hold
function pelletDmg(d) { const r = HST.prange[lv('shell')]; return HST.pdmg[lv('shell')] * clamp(2 - d / r, 0, 1); }
// Samler haglene som traff hvert dyr til ett treff med summert skade
function pelletHit(by, a, d, hx, hy) {
  let e = by.get(a); if (!e) by.set(a, e = { a, zone: 'shot', dmg: 0, d, hx, hy });
  e.dmg += pelletDmg(d);
}
// Trekker boten fra kassa, men aldri under null
function fine(kr, text) {
  const k = Math.min(kr, G.money); G.money -= k;
  msg(text + (k ? ' −' + k + ' kr' : ''), 'warn'); save();
}
function hipShot(hg) {
  let tx = MOUSE.wx, ty = MOUSE.wy;
  const d = hyp(tx - P.x, ty - (P.y - 8));
  if (hg) {
    // haglsverm fra hofta: hvert hagl testes for seg, trestammer stopper dem
    const sd = HST.spread[lv('choke')] * d, by = new Map(), list = G.animals.filter(a => a.state !== 'dead').sort((a, b) => b.y - a.y);
    for (let i = 0; i < HST.pellets[lv('shell')]; i++) {
      const x = tx + gauss() * sd, y = ty + gauss() * sd * 0.8;
      if (trunkBlock(P.x, P.y, x, y)) continue;
      const a = list.find(a => hitTest(a, x, y));
      if (a) pelletHit(by, a, hyp(a.x - P.x, a.y - P.y), x, y);
      else if (i < 8) G.parts.push({ x, y, z: 0, vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(4, 12), life: rnd(0.2, 0.5), col: isWater(x, y) ? '#a4ccc6' : '#8a7a5c', grav: 1 });
    }
    return { ang: Math.atan2(ty - P.y + 8, tx - P.x), hits: [...by.values()].filter(e => e.dmg > 0) };
  }
  const sd = ST.spread[lv('barrel')] * d / 100 * 4;
  tx += gauss() * sd; ty += gauss() * sd * 0.8;
  const r = { ang: Math.atan2(ty - P.y + 8, tx - P.x), a: null, zone: null, block: null, d, hx: tx, hy: ty };
  const tr = trunkBlock(P.x, P.y, tx, ty);
  if (tr) {
    r.block = tr.k;
    for (let i = 0; i < 6; i++) G.parts.push({ x: tr.x + rnd(-1, 1), y: tr.y + 0.5, z: rnd(6, 14), vx: rnd(-20, 20), vy: rnd(-6, 6), vz: rnd(5, 20), life: rnd(0.3, 0.7), col: '#c8a474', grav: 1 });
    msg('Kula traff en trestamme.', 'warn');
    return r;
  }
  const list = G.animals.filter(a => a.state !== 'dead').sort((a, b) => b.y - a.y);
  for (const a of list) { const z = hitTest(a, tx, ty); if (z) { r.a = a; r.zone = z; break; } }
  if (r.a) for (let i = 0; i < 4; i++) G.parts.push({ x: tx, y: ty + 2, z: 0, vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(4, 10), life: rnd(0.2, 0.4), col: '#a8302a', grav: 1 });
  else for (let i = 0; i < 5; i++) G.parts.push({ x: tx, y: ty, z: 0, vx: rnd(-14, 14), vy: rnd(-4, 4), vz: rnd(8, 22), life: rnd(0.3, 0.6), col: isWater(tx, ty) ? '#a4ccc6' : '#8a7a5c', grav: 1 });
  return r;
}
// Verten avgjør hva skuddet gjør med dyra, uansett hvem som skjøt. Et haglskudd kan treffe flere dyr
function applyShot(sh, pid) {
  const hits = [];
  for (const h of Array.isArray(sh.hits) ? sh.hits : []) {
    const a = ZONES[h.zone] ? G.animals.find(a => a.id === h.id && a.state !== 'dead') : null;
    if (a && !hits.some(x => x[0] === a)) hits.push([a, h]);
  }
  // smellet bærer langt: dyr i stor omkrets flykter, og området holdes tomt for nye dyr en stund etterpå
  const R = ST.noise[clamp(sh.supp | 0, 0, 3)];
  for (const a of G.animals) {
    if (a.state === 'dead' || hits.some(x => x[0] === a)) continue;
    const dd = hyp(a.x - sh.x, a.y - sh.y);
    if (dd < R * 0.8) { a.aware = 1.5; startFlee(a, sh.x, sh.y); }
    else if (dd < R) { a.aware = Math.max(a.aware, 0.6); }
  }
  G.quiet.push({ x: sh.x, y: sh.y, r: R, t: 90 });
  for (const [a, h] of hits) hitAnimal(a, h, sh, pid);
}
function hitAnimal(hitA, h, sh, pid) {
  const A = SPEC[hitA.sp], zone = h.zone, Z = ZONES[zone], dmg = +h.dmg || 0;
  hitA.hp -= dmg; hitA.lastZone = zone; hitA.shotDist = +h.d || 0; hitA.by = pid;
  if (hitA.hp <= 0) {
    if (zone === 'vital' && !A.bird && Math.random() < 0.6) { const run = rnd(1.6, 3); hitA.hp = 1; hitA.bleed = 1 / run; startFlee(hitA, sh.x, sh.y, run + 1); tell(pid, Z[0] + '. Dyret tar et dødsløp. Følg blodsporet.', 'good'); }
    else killAnimal(hitA);
  } else {
    hitA.bleed = dmg * (zone === 'vital' ? 0.3 : zone === 'body' ? 0.08 : zone === 'shot' || zone === 'torso' ? 0.12 : 0.05);
    hitA.aware = 1.5; startFlee(hitA, sh.x, sh.y, rnd(7, 11));
    tell(pid, Z[0] + ' – ' + A.name.toLowerCase() + ' er skadet og ' + (A.bird ? 'flyr' : 'flykter') + '. Følg blodsporet.' + (h.cal && h.cal < A.hp * 0.7 ? ' Kaliberet er lite for denne arten.' : ''), 'warn');
  }
}
function startReload() {
  if (P.reload > 0 || P.ammo >= gunCap()) return;
  P.reload = hagle() ? HST.reload[lv('hagle')] : ST.reload[lv('bolt')]; sfx.reload();
}
function doCall() {
  if (!G.started || P.callCd > 0) return;
  const L = lv('call'); sfx.call(L); P.callCd = 9;
  const c = { x: P.x, y: P.y, L };
  netSend({ t: 'call', ...c });
  if (isAuth()) applyCall(c, NET.id);
}
function applyCall(c, pid) {
  const L = clamp(c.L | 0, 0, 3), R = ST.callR[L], spp = CALLSP[L]; let n = 0;
  for (const a of G.animals) {
    if (a.state === 'dead' || a.state === 'flee' || a.aware > 0.6 || !spp.includes(a.sp)) continue;
    const d = hyp(a.x - c.x, a.y - c.y); if (d > R || Math.random() > 0.8) continue;
    const stop = rnd(80, 140), ux = (a.x - c.x) / d, uy = (a.y - c.y) / d;
    a.state = 'approach'; a.tx = c.x + ux * stop + rnd(-25, 25); a.ty = c.y + uy * stop + rnd(-20, 20); n++;
  }
  if (n) tell(pid, n === 1 ? 'Noe svarer i det fjerne. Hold deg i ro.' : n + ' dyr har hørt deg. Hold deg i ro.', 'good', 'answer');
  else tell(pid, 'Lyden bærer gjennom skogen. Ingen svarer ennå.');
}
function placeScent() {
  if (!G.started) return;
  if (G.scents <= 0) { sfx.deny(); msg('Tom for luktstoff. Kjøp mer i bua.'); return; }
  G.scents--; sfx.scent();
  const L = lv('scentLv'), s = { x: P.x + 4, y: P.y + 2, r: ST.scentR[L], dur: ST.scentT[L] };
  if (isAuth()) addScent(s); else netSend({ t: 'scent', to: NET.host, ...s });
  msg('Luktstoffet er satt ut. Vinden tar det med seg.');
  save();
}
function addScent(s) { G.scentObjs.push({ id: Math.random(), x: +s.x, y: +s.y, r: +s.r, t: +s.dur, pt: 0 }); }
function nearestDead() {
  let best = null, bd = 24;
  for (const a of G.animals) if (a.state === 'dead' && canTake(a, NET.id)) { const d = hyp(a.x - P.x, a.y - P.y); if (d < bd) { bd = d; best = a; } }
  return best;
}
function collect(a) {
  G.animals.splice(G.animals.indexOf(a), 1);
  if (isAuth()) credit(a); else netSend({ t: 'collect', to: NET.host, id: a.id });
}
function credit(a) {
  const A = SPEC[a.sp], Z = ZONES[a.lastZone || 'body'], mean = (A.kg[a.sex][0] + A.kg[a.sex][1]) / 2;
  const kr = Math.round(A.value * (a.kg / mean) * Z[2] * (a.sex === 'm' ? 1.25 : 1) / 5) * 5;
  G.money += kr;
  G.journal.unshift({ sp: a.sp, sex: a.sex, kg: a.kg, m: Math.round((a.shotDist || 0) * M_PER_PX), zone: a.lastZone || 'body', kr, day: G.day, h: G.hour });
  sfx.coin(); msg('+' + kr + ' kr · ' + A.name + ', ' + A.sexn[a.sex] + ', ' + fmtKg(a.kg), 'money');
  save();
}
function interact() {
  if (!G.started || G.paused) return;
  const a = nearestDead(); if (a) { collect(a); return; }
  const c = nearestCabin(P.x, P.y);
  if (hyp(P.x - (c.x - 13), P.y - (c.y + 6)) < 26) openShop();
}

// ---------- oppdatering ----------
const KEYS = {}, MOUSE = { x: 0, y: 0, wx: 0, wy: 0, locked: false };
function playerUpdate(dt) {
  P.cycle = Math.max(0, P.cycle - dt); P.callCd = Math.max(0, P.callCd - dt);
  if (P.reload > 0) { P.reload -= dt; if (P.reload <= 0) { P.reload = 0; P.ammo = gunCap(); } }
  let mx = 0, my = 0;
  if (G.started && !G.paused && !P.aim) {
    if (KEYS.KeyA || KEYS.ArrowLeft) mx -= 1; if (KEYS.KeyD || KEYS.ArrowRight) mx += 1;
    if (KEYS.KeyW || KEYS.ArrowUp) my -= 1; if (KEYS.KeyS || KEYS.ArrowDown) my += 1;
  }
  P.sneak = !!(KEYS.ShiftLeft || KEYS.ShiftRight);
  const br = bridgeAt(P.x, P.y), wv = br ? 9 : fields(P.x, P.y, cabinsNear(P.x, P.y))[2];
  P.wet = wv < 1.1; P.deep = wv < 0.55;
  // vassing gjør deg våt og kald, svømming enda mer; på land tørker klærne sakte
  if (P.wet) P.cold = Math.max(P.cold, Math.min(P.deep ? 1 : 0.6, P.cold + dt * 0.6));
  else P.cold = Math.max(0, P.cold - dt / 80);
  if (G.started && !P.chill && P.cold >= 0.3) { P.chill = true; msg('Du er våt og kald. Siktet skjelver til klærne har tørket.', 'warn'); }
  else if (P.chill && P.cold === 0) { P.chill = false; msg('Klærne har tørket. Du er varm igjen.', 'good'); }
  P.moving = mx !== 0 || my !== 0;
  // Space mens du går: spring. Det går fort, men bråker og tar pusten, og er lufta tom, må du hente deg inn
  P.run = P.moving && !P.sneak && !P.winded && !!KEYS.Space;
  if (P.moving) {
    const l = hyp(mx, my), sp = (P.sneak ? 16 : P.run ? 72 : 40) * (P.deep ? 0.35 : P.wet ? 0.55 : 1);
    let nx = P.x + mx / l * sp * dt, ny = P.y + my / l * sp * dt * 0.85;
    // rekkverket holder deg på brua til du går av i en av endene
    if (br) {
      const dx = nx - br.x, dy = ny - br.y, s = dx * br.tx + dy * br.ty;
      if (s > br.a && s < br.b) { const q = clamp(dy * br.tx - dx * br.ty, 1.5 - br.hw, br.hw - 1.5); nx = br.x + br.tx * s - br.ty * q; ny = br.y + br.ty * s + br.tx * q; }
    }
    const c = collide(nx, ny, 3); P.x = c.x; P.y = c.y;
    P.walkT += dt * (P.sneak ? 0.55 : P.run ? 1.7 : 1);
    if (Math.abs(mx) >= Math.abs(my)) { P.face = 'side'; P.flip = mx < 0; } else P.face = my > 0 ? 'down' : 'up';
    P.stepT -= dt;
    if (P.stepT <= 0) {
      P.stepT = P.sneak ? 0.55 : P.run ? 0.2 : 0.32; sfx.step(P.sneak, P.wet);
      if (isAuth()) stepNoise({ x: P.x, y: P.y, sneak: P.sneak, run: P.run, wet: P.wet, boots: lv('boots') });
    }
  }
  // sikte: pust og ro. Små justeringer går greit, men svinger du børsa langt (f.eks. fra ett dyr til et annet),
  // kommer den i uro som tar rundt et sekund å roe seg. Holder du pusten (Space), står siktet stille, og bare i
  // noen få sekunder; går lufta tom, hiver du etter pusten, og du kan ikke holde den igjen før du har hentet deg inn
  const swayA = (hagle() ? HST.sway : ST.sway[lv('stock')]) * (P.sneak ? 0.85 : 1) * (1 + 1.2 * P.cold);
  if (P.winded && P.breath >= 0.8) P.winded = false;
  P.hold = P.aim && !P.winded && !!KEYS.Space;
  // hvileretningen følger siktet etter; hvor langt siktet er fra den, sier hvor stort svinget er (radianer)
  const ra = 1 - Math.exp(-dt / 0.6);
  AIM.ry += (AIM.yaw - AIM.ry) * ra; AIM.rp += (AIM.pitch - AIM.rp) * ra;
  const sw = hyp(AIM.yaw - AIM.ry, AIM.pitch - AIM.rp), swing = !P.aim ? 0 : hagle() ? smooth(0.5, 1.2, sw) : smooth(0.05, 0.2, sw);
  P.unrest = swing > P.unrest ? lerp(P.unrest, swing, Math.min(1, dt * 8)) : Math.max(swing, P.unrest - dt * (P.hold ? 2 : 0.9));
  if (P.aim) {
    if (P.hold && P.breath > 0) { P.breath = Math.max(0, P.breath - dt / 3); if (!P.breath) P.winded = true; }
    else P.breath = Math.min(1, P.breath + dt / 3);
    P.bph += dt * (P.winded ? 2.4 : 1);
    const k = P.winded ? 3.2 : P.hold ? 0 : P.breath < 0.25 ? 1.8 : 1, t = P.bph;
    const tgx = (Math.sin(t * 1.1) * 0.7 + Math.sin(t * 2.3 + 1) * 0.3) * swayA * k, tgy = (Math.sin(t * 1.7 + 2) * 0.6 + Math.sin(t * 0.8) * 0.4) * swayA * 0.8 * k;
    P.sway[0] = lerp(P.sway[0], tgx, Math.min(1, dt * 6)); P.sway[1] = lerp(P.sway[1], tgy, Math.min(1, dt * 6));
    const dx = Math.cos(AIM.yaw), dy = Math.sin(AIM.yaw);
    if (Math.abs(dx) > Math.abs(dy) * 0.8) { P.face = 'side'; P.flip = dx < 0; } else P.face = dy > 0 ? 'down' : 'up';
  } else if (P.run) { P.breath = Math.max(0, P.breath - dt / 5); if (!P.breath) P.winded = true; }
  else P.breath = Math.min(1, P.breath + dt / 2);
}
function update(dt) {
  G.t += dt;
  // alene fryser verden mens bua eller jaktboka er åpen; med andre på nettet går tida videre
  const frozen = G.paused && !mp();
  if (!frozen) {
    G.hour += dt / 30;
    if (G.hour >= 24) { G.hour -= 24; G.day++; }
  }
  if (G.started) { G.saveT -= dt; if (G.saveT <= 0) { G.saveT = 15; save(); } }
  const h = G.hour; G.dayl = clamp(Math.min(smooth(4.8, 7.5, h), 1 - smooth(18.5, 21.2, h)), 0, 1);
  const wa = vnoise(G.t / 45, 3.3, 99) * TAU * 1.6 + 0.6, ws = clamp(0.15 + 0.85 * vnoise(G.t / 20, 7.7, 98), 0, 1);
  G.wind.a = wa; G.wind.s = ws; G.wind.x = Math.cos(wa); G.wind.y = Math.sin(wa);
  if (frozen) return;
  G.hunters = hunters();
  playerUpdate(dt);
  netUpdate(dt);
  if (isAuth()) {
    for (const a of G.animals.slice()) animalUpdate(a, dt);
    const anc = anchors();
    G.quiet = G.quiet.filter(q => (q.t -= dt) > 0);
    G.spawnT -= dt; if (G.spawnT <= 0) { G.spawnT = 2.5 / anc.length; trySpawn(anc[(Math.random() * anc.length) | 0]); }
    G.animals = G.animals.filter(a => { const r = a.state === 'dead' ? 2200 : 1400; return anc.some(h => hyp(a.x - h.x, a.y - h.y) < r); });
  } else for (const a of G.animals) mirrorAnimal(a, dt);
  // vingesus når fugl letter i nærheten (én gang per flokk og bilde)
  let flushed = false;
  for (const a of G.animals) {
    const fl = a.state === 'flee' && !!SPEC[a.sp].bird;
    if (fl && !a._fl && !flushed && G.started) { const k = 1 - hyp(a.x - P.x, a.y - P.y) / 500; if (k > 0) { sfx.flush(k); flushed = true; } }
    a._fl = fl;
  }
  // luktstoff
  for (const s of G.scentObjs) {
    s.t -= dt; s.pt -= dt;
    if (s.pt <= 0) { s.pt = 0.35; G.parts.push({ x: s.x, y: s.y, z: 5, vx: G.wind.x * 8 * G.wind.s + rnd(-2, 2), vy: G.wind.y * 6 * G.wind.s, vz: rnd(1, 3), life: rnd(2, 4), col: '#e8dc84', smoke: 1, glow: 1 }); }
    if (isAuth() && ((G.t * 2) | 0) !== (((G.t - dt) * 2) | 0)) for (const a of G.animals) {
      if (a.state === 'dead' || a.state === 'flee' || a.state === 'approach' || a.state === 'toScent' || a.state === 'alert') continue;
      const d = hyp(a.x - s.x, a.y - s.y); a.nearScent = d < 40;
      if (d < s.r && d > 30 && Math.random() < 0.3) { a.state = 'toScent'; a.tx = s.x + rnd(-24, 24); a.ty = s.y + rnd(-14, 14); }
    }
  }
  G.scentObjs = G.scentObjs.filter(s => s.t > 0);
  for (const b of G.blood) b.t += dt;
  G.blood = G.blood.filter(b => b.t < 240);
  // jegerens lukt, synlig som svake fnugg i vinden
  if (G.started && Math.random() < dt * 4 * ST.deo[lv('deo')]) G.parts.push({ x: P.x + rnd(-3, 3), y: P.y, z: rnd(6, 14), vx: G.wind.x * (10 + 22 * G.wind.s), vy: G.wind.y * (8 + 18 * G.wind.s), vz: rnd(-0.5, 0.5), life: rnd(1.5, 3), col: '#dfe6dc', smoke: 1, faint: 1 });
  // blader og ildfluer
  if (Math.random() < dt * 2.2) G.parts.push({ x: CAM.x + rnd(-CAM.w / 2, CAM.w / 2), y: CAM.y + rnd(-CAM.h / 2, CAM.h / 2), z: rnd(40, 80), vx: G.wind.x * 8, vy: 0, vz: -rnd(5, 9), life: 12, col: ['#e6bd52', '#cf9a34', '#c2682a', '#f3d262'][(Math.random() * 4) | 0], leaf: Math.random() * TAU, grav: 0 });
  if (G.dayl < 0.4 && Math.random() < dt * 3) G.parts.push({ x: CAM.x + rnd(-CAM.w / 2, CAM.w / 2), y: CAM.y + rnd(-CAM.h / 2, CAM.h / 2), z: rnd(3, 16), vx: rnd(-3, 3), vy: rnd(-2, 2), vz: rnd(-1, 1), life: rnd(3, 6), col: '#e8f08a', fly: 1 });
  for (const p of G.parts) {
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.grav) { p.vz -= 60 * dt; if (p.z < 0) { p.z = 0; p.vx *= 0.5; p.vy *= 0.5; p.vz = 0; } }
    if (p.leaf !== undefined) { p.leaf += dt * 2; p.x += Math.sin(p.leaf) * 6 * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; p.vx = 0; p.life = Math.min(p.life, 3); } }
    if (p.smoke) { p.vx *= 0.98; p.vy *= 0.98; }
    if (p.fly) { p.vx += rnd(-6, 6) * dt; p.vy += rnd(-6, 6) * dt; }
  }
  G.parts = G.parts.filter(p => p.life > 0);
  if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
  for (const m of G.msgs) m.t += dt;
  if (G.msgs.length && G.msgs[0].t > 7) { G.msgs.shift(); HUD.dirtyMsg = true; }
  if (AU.ctx) auAmbient(dt, G.dayl, G.wind.s);
}
