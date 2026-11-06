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
  { id: 'axe', cat: 'camp', icon: 'axe', name: 'Øks', lv: ['Ingen øks', 'Øks'], price: [0, 300],
    d: ['', 'Hogg ned trær til ved (F ved et tre), og bygg en gapahuk av seks ved (G).'] },
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
// Godbiter til hunden: én går med for hvert dyr hunden står for
const TREAT_PRICE = 150, TREAT_N = 5, TREAT_START = 3;
// Friluft: fyrstikker kjøpes i esker; hvert tre gir ved, et bål tar én kubbe og en gapahuk seks.
// Bålet brenner i FIRE_T sekunder (åtte timer i spillet). Segner du om, koster redningen RESCUE kr
const MATCH_PRICE = 40, MATCH_N = 10, HUT_WOOD = 6, FIRE_T = 240, RESCUE = 250;
const CHOP = { spruce: 2, pine: 2, birch: 2, rowan: 1, snag: 1 }, TREE_N = { spruce: 'grana', pine: 'furua', birch: 'bjørka', rowan: 'rogna', snag: 'tørrfuru' };
// Bøter: vådeskudd er skudd som går av uten at du sikter, bom er siktede skudd som ikke treffer dyr
// Hagle er bare lov på småvilt og fugl; skyter du storvilt med den, blir det bot
const FINE = { hip: 200, miss: 50, big: 300 };
const ZONES = { head: ['Hodeskudd', 2.2, 0.95], vital: ['Hjerte/lunge', 1.6, 1], body: ['Bogtreff', 1, 0.8], rear: ['Bakpart', 0.75, 0.7], leg: ['Beinskudd', 0.45, 0.6], torso: ['Kroppstreff', 1.4, 0.6], shot: ['Haglskudd', 1, 1] };
// Vekt med desimalkomma; små dyr og fugler veies på tidelen
const fmtKg = kg => String(kg).replace('.', ',') + ' kg';

const G = {
  t: 0, hour: 6.6, day: 1, money: 0, scents: 2, treats: TREAT_START, wood: 0, matches: 0, meat: 0, fires: [], huts: [], falls: [], cut: new Set(), crackT: 0, journal: [], up: {}, started: false, paused: false, panel: null, gun: 'rifle',
  wind: { a: 0, s: 0.5, x: 1, y: 0 }, animals: [], scentObjs: [], blood: [], parts: [], msgs: [], spawnT: 0, quiet: [], dayl: 1, hunters: [], saveT: 15, pauseT: 0,
};
for (const u of UPG) G.up[u.id] = 0;
const P = { x: 0, y: 30, face: 'down', flip: false, walkT: 0, moving: false, sneak: false, aim: false, breath: 1, hold: false, ammo: 1, ammo2: 0, cycle: 0, reload: 0, callCd: 0, stepT: 0, wet: false, deep: false, cold: 0, chill: false, sway: [0, 0], unrest: 0, winded: false, bph: 0, hp: 100, sick: false, risk: 0, warm: false, work: null, sneezeT: 20 };
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
function save() {
  try {
    // som gjest hos en annen vert er gapahukene og stubbene vertens, så da beholdes de du hadde lagret fra før
    const old = isAuth() ? null : JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {};
    localStorage.setItem(SAVE_KEY, JSON.stringify({ money: G.money, up: G.up, scents: G.scents, treats: G.treats, journal: G.journal, day: G.day, hour: G.hour,
      wood: G.wood, matches: G.matches, meat: G.meat, hp: Math.round(P.hp), sick: P.sick,
      huts: old ? old.huts || [] : G.huts.map(h => [Math.round(h.x), Math.round(h.y)]), cut: old ? old.cut || [] : [...G.cut] }));
  } catch (e) { }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (!s) return false;
    G.money = s.money | 0; Object.assign(G.up, s.up || {}); G.scents = s.scents ?? 2; G.treats = s.treats ?? TREAT_START; G.journal = s.journal || []; G.day = s.day || 1; if (typeof s.hour === 'number') G.hour = s.hour;
    G.wood = s.wood | 0; G.matches = s.matches | 0; G.meat = s.meat | 0; P.hp = clamp(s.hp ?? 100, 1, 100); P.sick = !!s.sick;
    G.huts = (s.huts || []).map(([x, y]) => ({ id: Math.random(), x, y })); G.cut = new Set(s.cut || []);
    return true;
  } catch (e) { return false; }
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
  // står hunden for dyret, blir det stående og se på hunden i stedet for å trekke videre; jegeren kan fortsatt skremme det
  if (a.bay > 0) { a.bay -= dt; if (a.state !== 'flee' && a.state !== 'alert') { a.state = 'stand'; a.t = 1; a.face = a.bayX > a.x ? 1 : -1; } }
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
  const kr = Math.round(A.value * (a.kg / mean) * Z[2] * (a.sex === 'm' ? 1.25 : 1) / 5) * 5, meat = a.kg >= 100 ? 3 : a.kg >= 20 ? 2 : 1;
  G.money += kr; G.meat += meat;
  G.journal.unshift({ sp: a.sp, sex: a.sex, kg: a.kg, m: Math.round((a.shotDist || 0) * M_PER_PX), zone: a.lastZone || 'body', kr, day: G.day, h: G.hour });
  sfx.coin(); msg('+' + kr + ' kr · ' + A.name + ', ' + A.sexn[a.sex] + ', ' + fmtKg(a.kg) + ' · +' + meat + ' kjøtt', 'money');
  save();
}
// Hva F gjør der du står: [tekst til hjelpelinja, handling]
function action() {
  const a = nearestDead(); if (a) return ['Ta vare på ' + SPEC[a.sp].name.toLowerCase() + ' (' + SPEC[a.sp].sexn[a.sex] + ')', () => collect(a)];
  const c = nearestCabin(P.x, P.y);
  if (hyp(P.x - (c.x - 13), P.y - (c.y + 6)) < 26) return ['Gå inn i bua', openShop];
  // i åpningen av gapahuken sover du; ellers ved bålet steker du
  const h = nearHut(P.x, P.y, 18);
  if (h) return nearFire(h.x, h.y, 60) ? ['Sov i gapahuken', sleepHut] : ['Tenn bål foran gapahuken (B) for å sove her', () => msg('Du trenger et bål foran gapahuken for å holde varmen i natt. Trykk B.')];
  if (G.meat > 0 && P.hp < 99.5 && nearFire(P.x, P.y, 30)) return ['Stek kjøtt over bålet og spis', cook];
  const t = lv('axe') && nearTree(); if (t) return ['Hogg ned ' + TREE_N[t.k], () => chop(t)];
  return null;
}
function interact() {
  if (!G.started || G.paused || P.work) return;
  const ac = action(); if (ac) ac[1]();
}

// ---------- jakthunden ----------
// Hunden går ved foten. Sendt ut (H) søker den opp nærmeste dyr og står for det: dyret blir stående, og hunden
// gjør los til du kommer. Hver gang den står for et dyr, går det med en godbit; finner den ingenting, beholder du den.
const DOG_R = 1000, DOG_ST = ['heel', 'search', 'mark', 'back'];
const D = { x: 0, y: 0, st: 'heel', face: 1, anim: 0, spd: 0, a: null, tx: 0, ty: 0, t: 0, ph: 0, barkT: 0, waterT: 0, wet: false, netT: 0 };
const dogOk = a => !!a && a.state !== 'dead' && a.state !== 'flee' && !(a.z > 0) && G.animals.includes(a);
function dogFind(x, y, r) {
  let best = null, bd = r;
  for (const a of G.animals) if (dogOk(a)) { const d = hyp(a.x - x, a.y - y); if (d < bd) { bd = d; best = a; } }
  return best;
}
function dogReset() { Object.assign(D, { x: P.x - 14, y: P.y + 4, st: 'heel', a: null, spd: 0 }); }
function holdAnimal(a, x) { a.bay = 1.2; a.bayX = x; }
function sendDog() {
  if (!G.started || G.paused) return;
  // er hunden ute, kaller H den inn; den sendes ikke ut igjen før den er tilbake ved foten
  if (D.st !== 'heel') { sfx.whistle(); msg(D.st === 'back' ? 'Hunden er på vei inn.' : 'Du kaller inn hunden.'); D.st = 'back'; D.a = null; return; }
  if (G.treats <= 0) { sfx.deny(); msg('Tom for godbiter. Kjøp flere i bua.'); return; }
  // finnes det ikke dyr innen rekkevidde, slår hunden ut mot pekeren og ser etter dyr der
  const an = Math.atan2(MOUSE.wy - P.y, MOUSE.wx - P.x);
  D.st = 'search'; D.a = dogFind(P.x, P.y, DOG_R); D.t = 25; D.tx = P.x + Math.cos(an) * 360; D.ty = P.y + Math.sin(an) * 300;
  sfx.whistle(); msg('Hunden går ut og søker.');
}
function dogBack(text) { D.st = 'back'; D.a = null; if (text) msg(text, 'warn'); }
function dogUpdate(dt) {
  if (!G.started) return;
  D.t -= dt; D.ph += dt * 2.6;
  const dp = hyp(P.x - D.x, P.y - D.y);
  let tx = P.x, ty = P.y, spd = 110;
  if (D.st === 'heel') {
    // følger etter et par steg unna; har du flyttet deg langt (T), er den straks hos deg igjen
    if (dp > 600) { dogReset(); return; }
    spd = dp > 60 ? 105 : clamp((dp - 14) * 3, 0, 80);
  } else if (D.st === 'search') {
    if (!dogOk(D.a)) { if (D.a) { D.tx = D.a.x; D.ty = D.a.y; } D.a = dogFind(D.x, D.y, 400); }
    if (D.a) {
      tx = D.a.x; ty = D.a.y;
      if (hyp(tx - D.x, ty - D.y) < 64) {
        D.st = 'mark'; D.barkT = 0; G.treats--; save();
        msg('Hunden står for vilt ' + Math.round(dp * M_PER_PX) + ' m unna. Følg losen.', 'good');
      }
    } else { tx = D.tx; ty = D.ty; if (hyp(tx - D.x, ty - D.y) < 12) D.t = 0; }
    if (D.st === 'search' && D.t <= 0) dogBack('Hunden fant ingenting og kommer tilbake.');
  } else if (D.st === 'mark') {
    if (!dogOk(D.a)) dogBack(D.a && D.a.state === 'flee' ? 'Dyret brøt ut. Hunden kommer tilbake.' : '');
    else {
      spd = 0; D.face = D.a.x > D.x ? 1 : -1;
      if (isAuth()) holdAnimal(D.a, D.x);
      else if ((D.netT -= dt) <= 0) { D.netT = 0.4; netSend({ t: 'bay', to: NET.host, id: D.a.id, x: D.x }); }
      if ((D.barkT -= dt) <= 0) { D.barkT = rnd(0.9, 1.6); sfx.woof(clamp(1 - dp / 1400, 0.08, 1), clamp((D.x - P.x) / 500, -0.9, 0.9)); }
    }
  } else if (dp < 24) D.st = 'heel';
  // litt slingrende når den søker, sakte i vann; stammer og stein dytter den rundt
  const ex = tx - D.x, ey = ty - D.y, ed = hyp(ex, ey);
  if (spd > 0 && ed > 1) {
    const h = Math.atan2(ey, ex) + (D.st === 'search' ? Math.sin(D.ph) * 0.6 * smooth(40, 160, ed) : 0);
    D.waterT -= dt; if (D.waterT <= 0) { D.waterT = 0.25; D.wet = isWater(D.x, D.y); }
    const s = Math.min(spd * (D.wet ? 0.45 : 1), ed / Math.max(dt, 1e-3)), vx = Math.cos(h) * s;
    const c = collide(D.x + vx * dt, D.y + Math.sin(h) * s * 0.85 * dt, 2);
    D.spd = hyp(c.x - D.x, c.y - D.y) / Math.max(dt, 1e-3); D.x = c.x; D.y = c.y;
    if (Math.abs(vx) > 2) D.face = vx > 0 ? 1 : -1;
  } else D.spd = 0;
  D.anim += D.spd * dt * (D.spd > 60 ? 0.085 : 0.14);
}
function dogSprite(d) {
  if (d.st === 'mark') return DOGSPR.mark[0];
  return d.spd > 60 ? DOGSPR.run[(d.anim | 0) & 3] : d.spd > 3 ? DOGSPR.walk[(d.anim | 0) & 3] : DOGSPR.stand[0];
}

// ---------- friluft: øks, ved, bål, gapahuk og helse ----------
// Arbeid (hogge, bygge, steke) tar litt tid og avbrytes hvis du går eller sikter
function startWork(kind, dur, done, o) { if (!P.work) P.work = Object.assign({ kind, t: 0, dur, done, beat: 0 }, o); }
function workUpdate(dt) {
  const w = P.work; if (!w) return;
  if (P.moving || P.aim || G.panel || w.tree && !CHOP[w.tree.k]) { P.work = null; return; }
  w.t += dt; w.beat -= dt;
  if (w.tree) chopStep(w, dt);
  else if (w.beat <= 0) {
    w.beat = w.kind === 'cook' ? 1.1 : 0.55;
    if (w.kind === 'cook') sfx.sizzle();
    else { sfx.chop(); for (let i = 0; i < 3; i++) G.parts.push({ x: P.x + (P.flip ? -6 : 6), y: P.y - 1, z: rnd(4, 9), vx: rnd(-18, 18), vy: rnd(-5, 5), vz: rnd(6, 16), life: rnd(0.3, 0.6), col: '#d8c090', grav: 1 }); }
  }
  if (w.t >= w.dur) { P.work = null; w.done(); }
}
function nearTree() {
  let best = null, bd = 16;
  for (let cy = Math.floor((P.y - 16) / CS); cy <= Math.floor((P.y + 16) / CS); cy++) for (let cx = Math.floor((P.x - 16) / CS); cx <= Math.floor((P.x + 16) / CS); cx++)
    for (const o of getChunk(cx, cy).objs) if (CHOP[o.k]) { const d = hyp(o.x - P.x, o.y - P.y); if (d < bd) { bd = d; best = o; } }
  return best;
}
// Fallet bråker: vilt i nærheten flykter, og lenger unna blir de urolige
function scare(x, y, r) {
  for (const a of G.animals) {
    if (a.state === 'dead' || a.state === 'flee') continue;
    const d = hyp(a.x - x, a.y - y);
    if (d < r * 0.5) { a.aware = 1.5; startFlee(a, x, y); } else if (d < r) a.aware = Math.max(a.aware, 0.6);
  }
}
// Jegeren stiller seg et skaftlengde fra stammen (side: hvilken side av stammen hakket er på) og hogger.
// Det siste hogget kommer idet arbeidet er ferdig, og treet velter vekk fra jegeren
function chop(o) {
  P.face = 'side'; P.flip = o.x < P.x;
  const side = P.flip ? 1 : -1, gx = o.x + side * 10, gy = o.y + 2;
  startWork('chop', 3.2, () => {
    const n = CHOP[o.k]; if (!n) return; // en annen rakk å felle det
    fellTree(o.x, o.y, -side); netSend({ t: 'cut', x: o.x, y: o.y, d: -side }); if (isAuth()) scare(o.x, o.y, 420);
    G.wood += n; msg('Treet faller! +' + n + ' ved (' + G.wood + ' i alt).', 'good'); save();
  }, Object.assign({ tree: o, side, hits: 0, beat: 0.4 }, isWater(gx, gy) ? {} : { gx, gy }));
}
// Hoggebildet ut fra tida til neste hogg: øksa sitter i stammen, dras løs, svinges opp bak hodet og kommer ned
const chopFrame = w => w.beat > 0.43 ? 2 : w.beat > 0.36 ? 3 : w.beat > 0.08 ? 0 : 1;
const LEAF_C = { spruce: '#39704e', pine: '#558847', birch: '#e2b03a', rowan: '#cc7a38' };
// Hvert hogg sprøyter flis ut av hakket, rister kronen så nåler og blader drysser ned, og gjør hakket dypere
function chopStep(w, dt) {
  const o = w.tree;
  if (w.gx !== undefined) { const k = Math.min(1, dt * 12), c = collide(lerp(P.x, w.gx, k), lerp(P.y, w.gy, k), 3); P.x = c.x; P.y = c.y; }
  if (w.beat > 0) return;
  w.beat = 0.55; w.hits++; o.hit = G.t; o.hitD = -w.side; sfx.chop();
  for (let i = 0; i < 6; i++) G.parts.push({ x: o.x + w.side * 2, y: o.y + 0.5, z: rnd(5, 7), vx: w.side * rnd(10, 36), vy: rnd(-6, 6), vz: rnd(8, 24), life: rnd(0.6, 1.2), col: ['#f0dcac', '#d8c090', '#c8a474', '#5a4030'][i & 3], grav: 1 });
  const s = SPR[o.k][o.v], lc = LEAF_C[o.k];
  if (lc) for (let i = 0; i < 3; i++) G.parts.push({ x: o.x + rnd(-10, 10), y: o.y + rnd(0, 2), z: s.ay * rnd(0.5, 0.85), vx: 0, vy: 0, vz: -rnd(14, 24), life: rnd(3, 4.5), col: lc, leaf: Math.random() * TAU, grav: 0 });
}
// Treet velter (dir: 1 mot høyre, -1 mot venstre): sakte først mens det knaker, så fortere og fortere,
// et brak når det slår i bakken og en liten sprett før det blir liggende. Det fjernes først når det er utenfor skjermen
const FALL_T = 1.6;
const nearK = (x, y) => clamp(1 - hyp(x - P.x, y - P.y) / 700, 0, 1);
function fellTree(x, y, dir) {
  const ch = chunks.get(Math.floor(x / CS) + ',' + Math.floor(y / CS)), o = ch && ch.objs.find(o => o.x === x && o.y === y && CHOP[o.k]);
  if (o) { G.falls.push({ x, y, s: SPR[o.k][o.v], lc: LEAF_C[o.k], dir: dir < 0 ? -1 : 1, t: 0 }); const k = nearK(x, y); if (k > 0) sfx.creak(k); }
  cutTree(x, y);
}
function fallAng(f) {
  if (f.t < FALL_T) return Math.PI / 2 * Math.pow(f.t / FALL_T, 2.6);
  const v = f.t - FALL_T; return Math.PI / 2 - 0.1 * Math.abs(Math.sin(v * 12)) * Math.exp(-v * 5);
}
function fallUpdate(dt) {
  for (const f of G.falls) {
    f.t += dt;
    if (f.t < FALL_T || f.hit) continue;
    // nedslaget: jord og støv langs stammen, og nåler eller blader som spruter fra kronen
    f.hit = 1; const k = nearK(f.x, f.y); if (k > 0) sfx.crash(k);
    const L = f.s.ay - 6;
    for (let i = 0; i < 30; i++) {
      const a = rnd(0.15, 1) * L, crown = a > L * 0.55;
      G.parts.push({ x: f.x + f.dir * a, y: f.y + rnd(-3, 3), z: rnd(0, 3), vx: rnd(-14, 14), vy: rnd(-5, 5), vz: rnd(8, crown ? 30 : 18), life: rnd(0.5, 1.2), col: crown && f.lc && i & 1 ? f.lc : ['#8a7a5c', '#6a5a44', '#c8a474'][i % 3], grav: 1 });
    }
    for (let i = 0; i < 10; i++) G.parts.push({ x: f.x + f.dir * rnd(0.3, 1) * L, y: f.y + rnd(-2, 2), z: rnd(1, 5), vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(2, 6), life: rnd(1, 2), col: '#b8ae96', smoke: 1 });
  }
  G.falls = G.falls.filter(f => f.t < FALL_T + 1 || Math.abs(f.x - CAM.x) < CAM.w / 2 + 120 && Math.abs(f.y - CAM.y) < CAM.h / 2 + 40);
}
const fireSpr = f => FX.fire[((G.t * 8 + f.id * 7) | 0) % 3];
const nearFire = (x, y, r) => G.fires.find(f => f.t > 0 && hyp(f.x - x, f.y - y) < r);
const nearHut = (x, y, r) => G.huts.find(h => hyp(h.x - x, h.y - y) < r);
function addFire(f) { G.fires.push({ id: Math.random(), x: +f.x, y: +f.y, t: FIRE_T, pt: 0 }); }
function addHut(h) { G.huts.push({ id: Math.random(), x: +h.x, y: +h.y }); }
// B: bålet tennes foran deg (ved en gapahuk: foran åpningen) og tar én ved og én fyrstikk
function lightFire() {
  if (!G.started || G.paused || P.aim || P.work) return;
  if (G.wood < 1) { sfx.deny(); msg(lv('axe') ? 'Du har ingen ved. Hogg et tre (F).' : 'Du har ingen ved. Kjøp en øks i bua og hogg et tre.'); return; }
  if (G.matches < 1) { sfx.deny(); msg('Du har ingen fyrstikker. Kjøp en eske i bua.'); return; }
  const h = nearHut(P.x, P.y, 30);
  const x = h ? h.x : Math.round(P.x + (P.face === 'side' ? (P.flip ? -12 : 12) : 0)), y = h ? h.y + 16 : Math.round(P.y + (P.face === 'down' ? 12 : P.face === 'up' ? -10 : 2));
  if (isWater(x, y)) { sfx.deny(); msg('Du kan ikke tenne bål i vannet.'); return; }
  if (nearFire(x, y, 24)) { sfx.deny(); msg('Det brenner allerede et bål her.'); return; }
  G.wood--; G.matches--; sfx.strike(); save();
  if (isAuth()) addFire({ x, y }); else netSend({ t: 'fire', to: NET.host, x, y });
  msg('Bålet brenner. Det tørker og varmer, og du kan steke kjøtt over det (F).', 'good');
}
// G: gapahuken bygges like bak deg, så du står foran åpningen
function buildHut() {
  if (!G.started || G.paused || P.aim || P.work) return;
  if (!lv('axe')) { sfx.deny(); msg('Du trenger en øks for å bygge gapahuk. Kjøp en i bua.'); return; }
  if (G.wood < HUT_WOOD) { sfx.deny(); msg('En gapahuk trenger ' + HUT_WOOD + ' ved. Du har ' + G.wood + '.'); return; }
  const x = Math.round(P.x), y = Math.round(P.y - 6), c = collide(x, y - 8, 14);
  if (hyp(c.x - x, c.y - (y - 8)) > 0.5 || isWater(x, y) || isWater(x, y - 12) || nearestCabin(x, y).d < 90) { sfx.deny(); msg('Finn en tørr og åpen plass til gapahuken.'); return; }
  P.face = 'up';
  startWork('build', 6, () => {
    if (G.wood < HUT_WOOD) return;
    G.wood -= HUT_WOOD; if (isAuth()) addHut({ x, y }); else netSend({ t: 'hut', to: NET.host, x, y });
    sfx.fall(); msg('Gapahuken står ferdig. Tenn et bål foran den (B), så kan du sove her (F).', 'good'); save();
  });
}
function cook() {
  startWork('cook', 4, () => {
    if (G.meat < 1) return;
    G.meat--; P.hp = Math.min(100, P.hp + 25); msg('Du stekte et kjøttstykke over bålet og spiste det. +25 helse.', 'good'); save();
  });
}
function healFull() { P.hp = 100; P.sick = false; P.risk = 0; P.cold = 0; P.chill = false; }
// Søvn til morgengry (alene): natta går, dyr og bål er borte, og du våkner uthvilt
function sleepToDawn(text) {
  if (G.hour > 5.5) G.day++;
  G.hour = 5.5; G.animals = []; G.scentObjs = []; G.fires = []; dogReset(); healFull(); msg(text, 'good'); save();
}
function sleepHut() {
  if (mp()) { healFull(); msg('Du hvilte i gapahuken ved bålet. Du er varm og frisk igjen.', 'good'); save(); return; }
  sleepToDawn('Du sov godt i gapahuken ved bålet. Det lysner over skogen, og du er frisk igjen.');
}
// Helse: våt og kald tærer på kroppen, og er du kald lenge nok, blir du forkjølet. Forkjølelsen trekker
// helsa jevnt ned til du kommer deg i bua eller sover i en gapahuk ved bål. Ved bålet tørker du fort
function healthUpdate(dt) {
  if (!G.started || G.panel === 'shop') return;
  P.warm = !P.wet && !!nearFire(P.x, P.y, 44);
  if (P.warm) P.cold = Math.max(0, P.cold - dt / 8);
  if (P.cold > 0.05) { P.hp -= dt * P.cold * (P.wet ? 1.2 : 0.5); P.risk += dt * P.cold * 0.04; }
  else P.risk = Math.max(0, P.risk - dt * (P.warm ? 0.05 : 0.01));
  if (!P.sick && P.risk >= 1) { P.sick = true; P.risk = 0; P.sneezeT = rnd(3, 6); msg('Du har blitt forkjølet. Helsa synker til du kommer deg i bua eller sover i en gapahuk ved bål.', 'warn'); }
  if (P.sick) { P.hp -= dt * 0.2; if ((P.sneezeT -= dt) <= 0) { P.sneezeT = rnd(18, 40); sfx.sneeze(); } }
  if (P.hp <= 0) collapse();
}
// Helsa er brukt opp: du blir båret til nærmeste bu og må betale for redningen
function collapse() {
  const c = nearestCabin(P.x, P.y);
  P.x = c.x - 13; P.y = c.y + 16; CAM.x = P.x; CAM.y = P.y - 10; P.aim = false; P.work = null;
  healFull(); P.hp = 40; dogReset();
  fine(RESCUE, 'Du segnet om av kulde og sykdom og ble båret til bua.');
}
// Bålet: røyk og gnister, knitring når du er i nærheten, og det brenner ned etter en stund
function fireUpdate(dt) {
  for (const f of G.fires) {
    f.t -= dt; f.pt -= dt;
    if (f.pt <= 0) {
      f.pt = 0.12;
      G.parts.push({ x: f.x + rnd(-2, 2), y: f.y, z: 12, vx: G.wind.x * 6 * G.wind.s + rnd(-2, 2), vy: G.wind.y * 4 * G.wind.s, vz: rnd(6, 10), life: rnd(1.5, 3), col: '#b8b4a8', smoke: 1 });
      if (Math.random() < 0.4) G.parts.push({ x: f.x + rnd(-3, 3), y: f.y, z: 8, vx: rnd(-6, 6), vy: rnd(-2, 2), vz: rnd(12, 24), life: rnd(0.4, 0.9), col: '#ffd060', glow: 1 });
    }
  }
  if (isAuth()) G.fires = G.fires.filter(f => f.t > 0);
  if ((G.crackT -= dt) <= 0) { G.crackT = rnd(0.3, 0.9); const f = G.started && nearFire(P.x, P.y, 300); if (f) sfx.crackle(1 - hyp(f.x - P.x, f.y - P.y) / 300); }
}

// ---------- oppdatering ----------
const KEYS = {}, MOUSE = { x: 0, y: 0, wx: 0, wy: 0, locked: false };
function playerUpdate(dt) {
  P.cycle = Math.max(0, P.cycle - dt); P.callCd = Math.max(0, P.callCd - dt);
  if (P.reload > 0) { P.reload -= dt; if (P.reload <= 0) { P.reload = 0; P.ammo = gunCap(); } }
  aimUpdate(dt);
  // du står i ro mens du tar børsa opp og sikter
  let mx = 0, my = 0;
  if (G.started && !G.paused && !P.aim && !AIM.want) {
    if (KEYS.KeyA || KEYS.ArrowLeft) mx -= 1; if (KEYS.KeyD || KEYS.ArrowRight) mx += 1;
    if (KEYS.KeyW || KEYS.ArrowUp) my -= 1; if (KEYS.KeyS || KEYS.ArrowDown) my += 1;
  }
  P.sneak = !!(KEYS.ShiftLeft || KEYS.ShiftRight);
  const br = bridgeAt(P.x, P.y), wv = br ? 9 : fields(P.x, P.y, cabinsNear(P.x, P.y))[2];
  P.wet = wv < 1.1; P.deep = wv < 0.55;
  // vassing gjør deg våt og kald, svømming enda mer; på land tørker klærne sakte
  if (P.wet) P.cold = Math.max(P.cold, Math.min(P.deep ? 1 : 0.6, P.cold + dt * 0.6));
  else P.cold = Math.max(0, P.cold - dt / 80);
  if (G.started && !P.chill && P.cold >= 0.3) { P.chill = true; msg('Du er våt og kald. Helsa synker og siktet skjelver til klærne har tørket. Et bål tørker deg fort.', 'warn'); }
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
  workUpdate(dt);
  fallUpdate(dt);
  healthUpdate(dt);
  dogUpdate(dt);
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
  fireUpdate(dt);
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
