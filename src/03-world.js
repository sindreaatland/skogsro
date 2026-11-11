// ===== Verden: evig skog generert bit for bit fra støyfunksjoner =====
const SEED = 4711, CS = 256, CABCELL = 1600;
// Jaktfeltet er avgrenset: 3 km hver vei fra bua du starter ved, så ingen kan gå seg uendelig langt bort
const WORLD = 12000;
const inWorld = (x, y) => Math.abs(x) <= WORLD && Math.abs(y) <= WORLD;
const chunks = new Map();
const _cab = {};

// Stedene i jaktfeltet (PLACES, landhandelen først). I landsbyen der du starter kan du gå inn i sju hus: landhandelen
// («bua»), børsemakeren, viltmottaket, garden til grunneieren, smia, stallen og puben (resten av landsbyen står under «landsbyen»
// lenger ned). Langt ute ligger tre utposter med smalt utvalg, og spredt i et grovt rutenett står ubetjente koier der
// du bare får ly. kind: store, gun, game, farm, smith, stable, pub, post eller koie. Hvert sted har midten av huset (x, y), hvor mye
// det er dreid (rot), punktet foran døra (door) og retningen ut av døra (out)
function mkPlace(kind, x, y, name, deg = 0) {
  const rot = deg * Math.PI / 180, d = houseDoor(kind, rot);
  return { kind, x, y, name, rot, door: [x + d.door[0], y + d.door[1]], out: d.out };
}
// [slag, x, y, dreining i grader]
const VILLAGE = [['store', -72, -232, 15], ['gun', 165, -205, 35], ['game', 150, -95, 20], ['farm', -195, -275, -8], ['smith', -115, -78, -28], ['stable', -222, -192, 0], ['pub', 88, -90, 0]];
const POSTS = [[0, -5, 'Fjellstua'], [-5, 4, 'Vestgarden'], [5, 1, 'Austbua']];
const PLACES = VILLAGE.map(([kind, x, y, deg]) => mkPlace(kind, x, y, 'Landsbyen', deg));
for (let ky = -8; ky < 8; ky++) for (let kx = -8; kx < 8; kx++) {
  if ((kx === 0 || kx === -1) && (ky === 0 || ky === -1)) continue; // ikke inntil landsbyen
  const post = POSTS.find(p => p[0] === kx && p[1] === ky);
  if (!post && hash2(kx, ky, 903) > 0.12) continue;
  const x = Math.round((kx + 0.2 + 0.6 * hash2(kx, ky, 901)) * CABCELL), y = Math.round((ky + 0.2 + 0.6 * hash2(kx, ky, 902)) * CABCELL);
  if (Math.abs(x) < WORLD - 300 && Math.abs(y) < WORLD - 300) PLACES.push(mkPlace(post ? 'post' : 'koie', x, y, post ? post[2] : 'Koia'));
}
const inVillage = c => c.name === 'Landsbyen';
// ---------- landsbyen ----------
// Landsbyen ligger innenfor palisaden (VPOLY, en åttekant med urviseren). Husene står tett og i ulike vinkler rundt
// torget med brønnen, og stiene bukter seg mellom dem og ut gjennom fire grinder.
// HOUSES er husene du ikke kan gå inn i ([slag, x, y, grader, navn]), V_PLAZA sirklene som utgjør torget (brostein),
// V_PATH stiene ([halv bredde, punkt, punkt, …]) og V_FIELD åkeren og kjøkkenhagene. VB har alle husene etter navn
const VPOLY = [[-216, -344], [200, -344], [272, -272], [272, -48], [176, 48], [-192, 48], [-264, -24], [-264, -296]];
const VBB = [-264, -344, 272, 48];
const HOUSES = [['bakery', -150, -178, -35, 'bakery'], ['church', 28, -275, 50, 'church'], ['home0', -215, -95, 80, 'h0'], ['home2', 205, -270, 70, 'h1'], ['home3', 232, -112, -40, 'h2'],
  ['home1', -70, 5, 8, 'h3'], ['home5', 70, -5, -15, 'h4'], ['home4', 165, -15, 65, 'h5']].map(([kind, x, y, deg, id]) => Object.assign(mkPlace(kind, x, y, 'Landsbyen', deg), { id }));
const VB = {};
for (const c of PLACES) if (c.name === 'Landsbyen') VB[c.kind] = c;
for (const c of HOUSES) VB[c.id] = c;
const V_PLAZA = [[0, -150, 52], [-38, -142, 36], [42, -158, 38]];
const V_PATH = [
  [8, [-300, -150], [-230, -146], [-170, -128], [-110, -135], [-50, -145]], [8, [310, -160], [240, -158], [180, -140], [110, -150], [50, -152]],
  [8, [0, 85], [4, 20], [-12, -30], [-4, -95]], [7, [120, -380], [122, -300], [105, -235], [60, -195]],
  [6, [-45, -185], [-85, -198], [-150, -222], [-190, -240]], [6, [-170, -128], [-180, -80], [-150, -30], [-95, -28], [-12, -30]],
  [6, [-2, -40], [50, -55], [110, -45], [145, -52], [195, -68]], [5, [20, -196], [50, -238]],
  [5, [-68, 28], [-30, 34], [2, 30]], [5, [157, 5], [120, 12], [75, 18], [40, 26], [4, 22]], [5, [216, -238], [226, -195], [234, -160]],
];
const V_FIELD = [[-152, -336, -40, -272], [-186, -12, -138, 20], [18, -28, 50, 4], [140, -330, 188, -298], [200, -62, 248, -30]];
// stiene som stykker [x0, y0, x1, y1, halv bredde]
const V_SEG = [];
for (const [hw, ...pt] of V_PATH) for (let i = 0; i < pt.length - 1; i++) V_SEG.push([pt[i][0], pt[i][1], pt[i + 1][0], pt[i + 1][1], hw]);
// avstanden fra (x, y) til stykket s, og nærmeste punkt på det (i SEGP)
const SEGP = [0, 0];
function segDist(x, y, s) {
  const ex = s[2] - s[0], ey = s[3] - s[1], t = clamp(((x - s[0]) * ex + (y - s[1]) * ey) / (ex * ex + ey * ey), 0, 1);
  SEGP[0] = s[0] + ex * t; SEGP[1] = s[1] + ey * t;
  return hyp(x - SEGP[0], y - SEGP[1]);
}
// en stikkvei fra hver dør til nærmeste sti
for (const c of [...PLACES.filter(c => c.name === 'Landsbyen'), ...HOUSES]) {
  let bd = 70, bp = null;
  for (const sg of V_SEG.slice()) { const d = segDist(c.door[0], c.door[1], sg); if (d < bd) { bd = d; bp = SEGP.slice(); } }
  V_SEG.push([c.door[0] - c.out[0] * 4, c.door[1] - c.out[1] * 4, c.door[0] + c.out[0] * 6, c.door[1] + c.out[1] * 6, 5]);
  if (bp) V_SEG.push([c.door[0] + c.out[0] * 6, c.door[1] + c.out[1] * 6, bp[0], bp[1], 4.5]);
}
// ligger (x, y) i et av rektanglene, utvidet med m?
const inRects = (L, x, y, m = 0) => { for (const r of L) if (x >= r[0] - m && x < r[2] + m && y >= r[1] - m && y < r[3] + m) return true; return false; };
// Avstanden til skigarden: negativ innenfor
function villDist(x, y) {
  let d = 1e9, inside = true;
  for (let i = 0; i < VPOLY.length; i++) {
    const a = VPOLY[i], b = VPOLY[(i + 1) % VPOLY.length], ex = b[0] - a[0], ey = b[1] - a[1], px = x - a[0], py = y - a[1], t = clamp((px * ex + py * ey) / (ex * ex + ey * ey), 0, 1);
    d = Math.min(d, hyp(px - ex * t, py - ey * t)); if (ex * py - ey * px < 0) inside = false;
  }
  return inside ? -d : d;
}
const inVill = (x, y) => x > VBB[0] && x < VBB[2] && y > VBB[1] && y < VBB[3] && villDist(x, y) < 0;
// VK_D: avstanden fra det siste punktet villKind så på til nærmeste sti eller torget (til slitasjen i villColor).
// VHB: grunnflatene til husene i landsbyen [x, y, cos, sin, halv lengde, halv bredde]
let VK_D = 0;
const VHB = [...PLACES.filter(c => c.name === 'Landsbyen'), ...HOUSES].map(c => { const st = HOUSE_STYLE[CABIN_V[c.kind]]; return [c.x, c.y, Math.cos(c.rot), Math.sin(c.rot), st ? (st.L || 48) / 2 : 37.5, st ? (st.D || 32) / 2 : 15]; });
// Bakken i landsbyen og i stiene ut gjennom grindene: 0 utenfor, 1 tun, 2 sti, 3 brostein, 4 åker, 5 kantstein
// (rundt torget og åkrene). Med jit får stiene og torget en ujevn rand
function villKind(x, y, jit) {
  if (x < VBB[0] - 40 || x > VBB[2] + 40 || y < VBB[1] - 40 || y > VBB[3] + 40) return 0;
  const j = jit ? (vnoise(x / 6, y / 6, 22) - 0.5) * 5 : 0;
  let dp = 1e9; for (const [cx, cy, r] of V_PLAZA) dp = Math.min(dp, hyp(x - cx, y - cy) - r);
  if (dp + j < -2.5) return 3;
  let ds = 1e9;
  for (const sg of V_SEG) { const d = segDist(x, y, sg) - sg[4]; if (d + j * 0.7 < 0) return 2; if (d < ds) ds = d; }
  VK_D = Math.min(ds, dp);
  if (dp + j < 0) return 5;
  if (!inVill(x, y)) return 0;
  return inRects(V_FIELD, x, y) ? 4 : inRects(V_FIELD, x, y, 2) ? 5 : 1;
}
// Palisaden: [x, y, variant, 'pal'] for hvert stykke (16 px rett fram, eller 12 px bort og 12 ned på skrå). Der en sti
// går ut, står det en port (GATES: midten, bredden w, og vert når veien går øst–vest gjennom den). Etterpå kommer
// skigardene rundt åkeren og noen av hagene
const FENCE_SEGS = [], GATES = [];
for (let i = 0; i < VPOLY.length; i++) {
  const a = VPOLY[i], b = VPOLY[(i + 1) % VPOLY.length], dx = b[0] - a[0], dy = b[1] - a[1], diag = dx && dy, n = Math.abs(dx || dy) / (diag ? 12 : 16);
  let run = 0;
  for (let k = 0; k <= n; k++) {
    const x = a[0] + dx * (k + 0.5) / n, y = a[1] + dy * (k + 0.5) / n;
    if (k < n && [-0.5, 0, 0.5].some(q => villKind(x + dx / n * q, y + dy / n * q) === 2)) { run++; continue; }
    if (run && !diag) { const t = (k - run / 2) / n; GATES.push({ x: Math.round(a[0] + dx * t), y: Math.round(a[1] + dy * t), w: run * 16, vert: !dx, in: a[0] < 0 ? 1 : -1 }); }
    run = 0;
    if (k < n) FENCE_SEGS.push([x, y, diag ? (dx > 0) === (dy > 0) ? 2 : 3 : dx ? 0 : 1, 'pal']);
  }
}
for (const [x0, y0, x1, y1, sides] of [[-152, -336, -40, -272, 'SE'], [-186, -12, -138, 20, 'WSE'], [140, -330, 188, -298, 'WNE'], [200, -62, 248, -30, 'NES']]) {
  for (let x = x0 + 8; x < x1; x += 16) { if (sides.includes('N')) FENCE_SEGS.push([x, y0 - 3, 0]); if (sides.includes('S') && x > x0 + 16) FENCE_SEGS.push([x, y1 + 3, 0]); }
  for (let y = y0 + 8; y < y1; y += 16) { if (sides.includes('W')) FENCE_SEGS.push([x0 - 3, y, 1]); if (sides.includes('E')) FENCE_SEGS.push([x1 + 3, y, 1]); }
}
// Det som står i landsbyen utenom husene: [slag, x, y, variant] (se SPR). Først portene, i samme rekkefølge som
// bildene lages i (genGates): ett bilde der veien går nord–sør, ellers en stolpe i nord og en i sør
// foran portene holdes det åpent, så ingen trær eller busker sperrer veien ut og inn
const nearGate = (x, y) => GATES.some(g => hyp(x - g.x, y - g.y) < 36);
let gateV = 0;
const VOBJ = [
  ...GATES.flatMap(g => g.vert ? [['gate', g.x, g.y - g.w / 2 - 2, gateV++], ['gate', g.x, g.y + g.w / 2 + 2, gateV++]] : [['gate', g.x, g.y, gateV++]]),
  // torget: brønn, tre boder med de to som selger grønnsaker og fisk (bakeren går selv til brødboden), benker og varer
  ['well', 0, -150, 0], ['stall', -50, -120, 0], ['stall', 44, -124, 2], ['stall', 58, -178, 1],
  ['npc', 68, -122, NPC_PAL.length + 10], ['npc', 82, -176, NPC_PAL.length + 11],
  ['vprop', -28, -182, 7], ['vprop', 24, -110, 7], ['vprop', -74, -118, 0], ['vprop', 20, -128, 1], ['vprop', 34, -182, 0],
  // lykter langs stiene
  ...[[-82, -158], [86, -148], [68, -226], [14, -84], [-196, -142], [204, -146], [-140, -44], [100, -34], [110, -292], [-140, -236], [20, 34]].map(([x, y]) => ['lamp', x, y, 0]),
  // garden: høysåter og hesjer; smia: ambolt; kjerre, sekker, tønner og kasser mellom husene; vedstabel og hoggestabbe i sør
  ['vprop', -160, -318, 3], ['vprop', -164, -300, 3], ['vprop', -184, -206, 8], ['vprop', -240, -228, 8],
  ['vprop', -82, -42, 4], ['vprop', 112, -64, 6], ['vprop', -118, -150, 2], ['vprop', -40, -212, 1], ['vprop', -32, -216, 0], ['vprop', 128, -168, 0],
  ['vprop', 178, -64, 1], ['vprop', -238, -70, 0], ['vprop', 104, -8, 0], ['vprop', -112, 34, 5], ['vprop', -112, 10, 9], ['vprop', 228, -228, 5],
  // busker og trær her og der
  ...[[-232, -240], [-128, -200], [-20, -262], [62, -306], [150, -262], [250, -240], [210, -170], [120, -120], [54, -78], [-60, -70], [-200, -40], [-30, -60], [130, 25], [-240, -120], [95, -188], [-110, -10]].map(([x, y], i) => [i % 4 === 3 ? 'juniper' : 'shrub', x, y, i % 3]),
  ...[[-245, -250], [-18, -236], [75, -328], [-225, -30], [256, -216]].map(([x, y], i) => ['birch', x, y, i % 4]),
  ...[[252, -198], [100, 30], [-22, 28], [-110, -250], [215, -20]].map(([x, y], i) => ['rowan', x, y, i % 3]),
];
// Stedene som kan nå inn i ruta (x, y) ligger i: de rydder skogen rundt seg (se fields)
function cabinsNear(x, y) {
  const kx = Math.floor(x / CABCELL), ky = Math.floor(y / CABCELL), key = kx + ',' + ky;
  let l = _cab[key];
  if (!l) { const cx = (kx + 0.5) * CABCELL, cy = (ky + 0.5) * CABCELL, r = CABCELL / 2 + 320; l = _cab[key] = PLACES.filter(c => Math.abs(c.x - cx) < r && Math.abs(c.y - cy) < r); }
  return l;
}
// Nærmeste sted (c), med avstanden d; ok velger hvilke steder som teller
function nearestCabin(x, y, ok) {
  let b = PLACES[0], bd = 1e9;
  for (const c of PLACES) { if (ok && !ok(c)) continue; const d = hyp(c.x - x, c.y - y); if (d < bd) { bd = d; b = c; } }
  return { x: b.x, y: b.y, d: bd, c: b };
}

// Elvene følger nullkonturen til et støyfelt
const riverN = (x, y) => fbm(x / 560, y / 560, SEED + 37, 2) - 0.5;
// Stiene er lagt mellom stedene (se «stier» lenger ned). _trail har stykkene [x0, y0, x1, y1] som går gjennom eller
// like forbi hver rute på TG × TG piksler, og trailAt gir avstanden til nærmeste sti i halve stibredder (under 1 er sti)
const TG = 32, TR_HW = 4, TR_FAR = 12, _trail = new Map(), tkey = (i, j) => (i + 512) * 1024 + j + 512;
function trailAt(x, y) {
  const L = _trail.get(tkey(Math.floor(x / TG), Math.floor(y / TG)));
  let d = TR_FAR;
  if (L) for (const s of L) d = Math.min(d, segDist(x, y, s));
  return d / TR_HW;
}
// Klimaet over jaktfeltet: 1 er kaldt fjell i nord, −1 er mildt lavland i sørvest og 0 er skogen rundt bua.
// Grov støy gjør overgangene ujevne, så de ikke følger rette linjer
function climate(x, y) {
  const n = (vnoise(x / 1900, y / 1900, SEED + 71) - 0.5) * 0.3;
  return smooth(0.2, 0.75, -y / WORLD + n) - smooth(0.15, 0.6, (y - x) / (2 * WORLD) - n);
}
// Felt som styrer landskapet: [skogtetthet, bartre-andel, vann, sti, lyng, grov variasjon, klima]
function fields(x, y, cabs) {
  // mot nord blir det mer bartre og så åpent fjell over skoggrensa; mot sørvest mer løvskog
  const Kl = climate(x, y), kc = Math.max(0, Kl), km = Math.max(0, -Kl);
  let F = clamp((fbm(x / 330, y / 330, SEED + 11, 3) - 0.5) * 2.4 + 0.5, 0, 1) * (1 - 0.55 * smooth(0.5, 1, kc));
  const Cn = clamp((fbm(x / 470, y / 470, SEED + 23, 2) - 0.5) * 2.8 + 0.5 + 0.35 * kc - 0.45 * km, 0, 1);
  const r = Math.abs(riverN(x, y)), pd = vnoise(x / 820 + 5.2, y / 820 - 3.1, SEED + 41);
  let Wv = r / (0.010 + Math.max(0, pd - 0.6) * 0.18);
  let Tr = trailAt(x, y);
  const He = vnoise(x / 110, y / 110, SEED + 61), Va = vnoise(x / 37, y / 37, SEED + 5);
  for (const c of cabs) {
    const d = hyp(x - c.x, (y - c.y) * 1.3);
    if (d < 160) { const k = smooth(50, 160, d); F *= k; Wv += (1 - k) * 5; if (d < 70) Tr = Math.min(Tr, d / 42); }
  }
  // landsbyen: ingen skog og ikke vann innenfor skigarden eller like utenfor, og bare de anlagte veiene
  const vd = x < VBB[0] - 70 || x > VBB[2] + 70 || y < VBB[1] - 70 || y > VBB[3] + 70 ? 70 : villDist(x, y);
  if (vd < 70) {
    F *= smooth(0, 70, vd); Wv += (1 - smooth(0, 45, vd)) * 6;
    const vk = villKind(x, y);
    if (vk === 2 || vk === 3 || vk === 5 && vd < 0) Tr = 0.4; else if (vd < 0) Tr = 3;
  }
  return [F, Cn, Wv, Tr, He, Va, Kl];
}
// ---------- høyder ----------
// Høyden på bakken i piksler over vannet. Elver og vann ligger i bunnen av dalene (høyde 0), landet stiger ut fra dem
// til åser, og åsene er høyest mot fjellet i nord. Hver bit har høydene i et grovt rutenett (ch.hg, HG piksler mellom
// punktene og ett punkt utenfor kanten på hver side), og heightAt leser dem av derfra
const HG = 32, HN = CS / HG + 3;
function heightRaw(x, y) {
  const wv = Math.abs(riverN(x, y)) / (0.010 + Math.max(0, vnoise(x / 820 + 5.2, y / 820 - 3.1, SEED + 41) - 0.6) * 0.18);
  if (wv <= 1) return 0;
  const hl = fbm(x / 1100, y / 1100, SEED + 91, 3);
  return smooth(1, 12, wv) * (10 + hl * Math.sqrt(hl) * (140 + 360 * smooth(0.2, 0.9, climate(x, y))));
}
function chunkHg(ch) {
  const g = ch.hg = new Float32Array(HN * HN), x0 = ch.cx * CS - HG, y0 = ch.cy * CS - HG;
  for (let j = 0; j < HN; j++) for (let i = 0; i < HN; i++) g[j * HN + i] = heightRaw(x0 + i * HG, y0 + j * HG);
  return g;
}
// høyden i biten ch, lx og ly piksler inn fra hjørnet
function chunkH(ch, lx, ly) {
  const g = ch.hg, u = lx / HG, v = ly / HG, i = Math.floor(u), j = Math.floor(v), a = (j + 1) * HN + i + 1, fu = u - i, h0 = g[a] + (g[a + 1] - g[a]) * fu, h1 = g[a + HN] + (g[a + HN + 1] - g[a + HN]) * fu;
  return h0 + (h1 - h0) * (v - j);
}
function heightAt(x, y) { const ch = getChunk(Math.floor(x / CS), Math.floor(y / CS)); return chunkH(ch, x - ch.cx * CS, y - ch.cy * CS); }
// Lys fra nordvest: bakker som heller mot lyset er lysere, de som heller fra, mørkere. s er hellingen mot sørøst.
// Kurven er bratt for slake bakker og flater ut mot de bratteste, så både små og store bakker skiller seg ut
const shadeK = s => 1 + 0.6 * s / (0.3 + Math.abs(s));
// Bakken i lyset k: sola varmer fargen, skyggen er kjølig og blå
function lightC(c, k) {
  const w = k - 1;
  return (0xff000000 | Math.min(255, ((c >>> 16) & 255) * (1 + 0.72 * w)) << 16 | Math.min(255, ((c >>> 8) & 255) * k) << 8 | Math.min(255, (c & 255) * (1 + 1.12 * w))) >>> 0;
}
// Bratt bakke er berg og ur, og over skoggrensa på de høyeste åsene er det snaufjell. g er hvor bratt det er (stigning
// per piksel), h høyden og n støy fra 0 til 1 som gjør kanten ujevn
const BRATT = 1, SNAU = 215;
const rocky = (g, h, n) => g + (n - 0.5) * 0.25 > BRATT || h + (n - 0.5) * 50 > SNAU;
// hvor bratt det er i biten ch, lx og ly piksler inn fra hjørnet
const chunkG = (ch, lx, ly) => hyp(chunkH(ch, lx + 16, ly) - chunkH(ch, lx - 16, ly), chunkH(ch, lx, ly + 16) - chunkH(ch, lx, ly - 16)) / 32;
// stigningen fra (x, y) i retningen (ux, uy). Landsbyen regnes som flat
const gradeAt = (x, y, ux, uy) => inVill(x, y) ? 0 : (heightAt(x + ux * 3, y + uy * 3) - heightAt(x - ux * 3, y - uy * 3)) / 6;
// Farten i en bakke med stigning s: tyngre jo brattere det går oppover (de bratteste skrentene må du klyve sakte opp),
// litt lettere i slak nedoverbakke og varsomt ned de bratteste
function gradeK(s) {
  if (s >= 0) return Math.max(0.12, 1 / (1 + 1.2 * s + 0.8 * s * s));
  s = -s;
  return s < 0.25 ? 1 + 0.48 * s : s < 0.6 ? lerp(1.12, 1, (s - 0.25) / 0.35) : Math.max(0.6, 1 - (s - 0.6) * 0.45);
}
function shadeC(c, k) {
  return (0xff000000 | Math.min(255, ((c >>> 16) & 255) * k) << 16 | Math.min(255, ((c >>> 8) & 255) * k) << 8 | Math.min(255, (c & 255) * k)) >>> 0;
}

// Vanndybde (vann under 1, djupt under 0,55); på en bro er det tørt
function waterAt(x, y) { const w = fields(x, y, cabinsNear(x, y))[2]; return w < 1.6 && bridgeAt(x, y) ? 9 : w; }
function isWater(x, y) { return waterAt(x, y) < 1; }

// ---------- navngitte områder og landemerker ----------
// Jaktfeltet er delt i REG_N × REG_N områder med ujevne grenser. Hvert område får et navn satt sammen av et forledd og
// et etterledd som passer landskapet der (type: fjell, vat, lav, skog eller open), og et landemerke (mk) omtrent midt
// i: varde på fjellet, bautastein i lavlandet og jakttårn ellers. Området rundt landsbyen heter Heimemarka
const REG_N = 7, REG_S = 2 * WORLD / REG_N, REGIONS = [], MARKS = [];
function regionAt(x, y) {
  const wx = x + (vnoise(x / 700, y / 700, SEED + 81) - 0.5) * 900, wy = y + (vnoise(x / 700, y / 700, SEED + 82) - 0.5) * 900;
  return REGIONS[clamp(Math.floor((wy + WORLD) / REG_S), 0, REG_N - 1) * REG_N + clamp(Math.floor((wx + WORLD) / REG_S), 0, REG_N - 1)];
}
{
  const pre = ['Stor', 'Bjørne', 'Ulve', 'Tiur', 'Orre', 'Elg', 'Svart', 'Kvit', 'Lang', 'Brei', 'Gaupe', 'Reve', 'Trolle', 'Kråke', 'Stein', 'Gran', 'Furu', 'Bjørke', 'Seter',
    'Kvern', 'Hauk', 'Ørne', 'Djup', 'Litle', 'Raud', 'Grå', 'Varg', 'Hjorte', 'Rype', 'Skar', 'Tore', 'Finn', 'Budeie', 'Kol', 'Tjære', 'Hegg', 'Vier', 'Nord', 'Sør', 'Midt'];
  // etterleddene med preposisjonen som hører til («på Storheia», «i Bjørnelia», «ved Langtjønna»)
  const suf = { fjell: ['fjellet på', 'høgda på', 'heia på', 'nuten på', 'egga på'], skog: ['skogen i', 'lia i', 'åsen på', 'holtet i', 'marka i'], open: ['vollen på', 'enga på', 'sletta på', 'moen på', 'haugen på'],
    vat: ['myra på', 'tjønna ved', 'vika i', 'osen ved'], lav: ['dalen i', 'lunden i', 'bakkane i', 'hagen i'] };
  const used = new Set(), mid = (REG_N * REG_N) >> 1;
  for (let j = 0; j < REG_N; j++) for (let i = 0; i < REG_N; i++) {
    const idx = j * REG_N + i, x = (i + 0.5) * REG_S - WORLD, y = (j + 0.5) * REG_S - WORLD;
    let F = 0, wet = 0, Kl = 0;
    for (let k = 0; k < 9; k++) { const f = fields(x + (k % 3 - 1) * 700, y + ((k / 3 | 0) - 1) * 700, []); F += f[0] / 9; Kl += f[6] / 9; if (f[2] < 1.5) wet++; }
    const type = Kl > 0.5 ? 'fjell' : wet >= 2 ? 'vat' : Kl < -0.45 ? 'lav' : F > 0.5 ? 'skog' : 'open';
    let name = 'Heimemarka', prep = 'i';
    if (idx !== mid) for (let k = 0; ; k++) {
      const [sf, pp] = suf[type][(hash2(i, j, 951 + k) * suf[type].length) | 0].split(' ');
      name = pre[(hash2(i, j, 911 + k) * pre.length) | 0] + sf; prep = pp;
      if (!used.has(name)) break;
    }
    used.add(name);
    // at: navnet med preposisjon, til setninger som «fell en rev på Stormyra»
    const rg = { idx, name, at: prep + ' ' + name, type, x, y, mk: null };
    REGIONS.push(rg);
    if (idx === mid) continue;
    // landemerket står på tørr og åpen mark et stykke fra hus
    for (let k = 0; k < 12 && !rg.mk; k++) {
      const mx = Math.round(x + (hash2(i, j, 921 + k) - 0.5) * 1200), my = Math.round(y + (hash2(i, j, 931 + k) - 0.5) * 1200);
      if (fields(mx, my, [])[2] > 2.5 && inWorld(mx, my) && nearestCabin(mx, my).d > 300) MARKS.push(rg.mk = { k: type === 'fjell' ? 'cairn' : type === 'lav' ? 'bauta' : 'tower', x: mx, y: my });
    }
  }
}

// ---------- bruer der stiene krysser bekker og elver ----------
// Brua ligger rett over elva i retningen (tx, ty) stien har der den krysser (x, y). Biten punktet ligger i eier brua.
const _br = new Map(), BR_HW = 5, BR_MAX = 64, NO_BR = [];
function makeBridge(x, y, tx, ty) {
  const cabs = cabinsNear(x, y), wv = (px, py) => fields(px, py, cabs)[2];
  if (wv(x, y) >= 1) return null;
  // gå langs stien til land på begge sider; begge kantene av dekket må også nå land
  const reach = dir => {
    let m = 0;
    for (const q of [-BR_HW, 0, BR_HW]) {
      let s = 0;
      while (wv(x + tx * s * dir - ty * q, y + ty * s * dir + tx * q) < 1.6) if (++s > BR_MAX) return -1;
      m = Math.max(m, s);
    }
    return m + 2;
  };
  const a = reach(-1), b = reach(1);
  if (a < 0 || b < 0) return null; // for bredt vann (innsjø): ingen bro
  const bb = [1e9, 1e9, -1e9, -1e9];
  for (const s of [-a, b]) for (const q of [-BR_HW - 1, BR_HW + 1]) {
    const px = x + tx * s - ty * q, py = y + ty * s + tx * q;
    bb[0] = Math.min(bb[0], px); bb[1] = Math.min(bb[1], py); bb[2] = Math.max(bb[2], px); bb[3] = Math.max(bb[3], py + 2);
  }
  return { x, y, tx, ty, a: -a, b, hw: BR_HW, id: (hash2(x | 0, y | 0, 5) * 1e6) | 0, bb };
}
const bridgesOf = (cx, cy) => _br.get(cx + ',' + cy) || NO_BR;

// ---------- stier ----------
// Ingen sti går på måfå: alle fører til et sted. Stiene går fra de fire portene i landsbyen og ut til hver utpost, hver
// koie og hvert landemerke. Stedene kobles på ett og ett, det nærmeste først, med en sti som legges (A*) i rutenettet
// høydene står i, fra stedet og mot det nærmeste stedet som alt har sti. Den stopper der den møter en sti som ligger
// der fra før, så stiene møtes i stidele og henger sammen i ett nett: følger du en sti, kommer du alltid fram til noe.
// Stien går helst der det er slakt: stigning langs stien og bratt sideli koster mye, så den går rundt skrentene
// i stedet for rett opp. Den krysser elver der de er smale (med bru) og går rundt innsjøene, om det ikke er eneste
// vei fram (en koie på en holme). Alt regnes ut fra støyfeltene, så alle jegere på nettet får de samme stiene.
{
  const N = 2 * WORLD / TG + 1, O = WORLD / TG, NN = N * N;
  // per punkt i rutenettet: høyde, elvefelt, hvor bratt det er, BL (1 sperret av landsbyen, 2 innsjø), på en sti (ON) og hvor
  // stien går der (PX, PY: punktet etter at stien er glattet)
  const H = new Float32Array(NN).fill(NaN), RV = new Float32Array(NN), SG = new Float32Array(NN).fill(-1), BL = new Uint8Array(NN), ON = new Uint8Array(NN);
  const PX = new Float32Array(NN), PY = new Float32Array(NN), GS = new Float32Array(NN), FR = new Int32Array(NN), ST = new Int32Array(NN), CL = new Int32Array(NN);
  const nx = a => (a % N - O) * TG, ny = a => ((a / N | 0) - O) * TG, at = (x, y) => clamp(Math.round(y / TG) + O, 0, N - 1) * N + clamp(Math.round(x / TG) + O, 0, N - 1);
  const node = a => {
    if (H[a] === H[a]) return a;
    const x = nx(a), y = ny(a);
    RV[a] = riverN(x, y); H[a] = heightRaw(x, y);
    BL[a] = Math.abs(x) < 400 && Math.abs(y + 150) < 300 && villDist(x, y) < 30 ? 1 : H[a] === 0 && vnoise(x / 820 + 5.2, y / 820 - 3.1, SEED + 41) > 0.65 ? 2 : 0;
    return a;
  };
  const steep = a => {
    if (SG[a] < 0) { const i = a % N, j = a / N | 0; SG[a] = hyp(H[node(i < N - 1 ? a + 1 : a)] - H[node(i ? a - 1 : a)], H[node(j < N - 1 ? a + N : a)] - H[node(j ? a - N : a)]) / (2 * TG); }
    return SG[a];
  };
  // haug med de åpne punktene, det billigste øverst
  const hk = [], hv = [];
  const push = (v, k) => {
    let i = hk.length; hk.push(k); hv.push(v);
    while (i) { const p = (i - 1) >> 1; if (hk[p] <= k) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; }
    hk[i] = k; hv[i] = v;
  };
  const pop = () => {
    const top = hv[0], k = hk.pop(), v = hv.pop(), n = hk.length;
    if (n) {
      let i = 0;
      for (;;) { let c = i * 2 + 1; if (c >= n) break; if (c + 1 < n && hk[c + 1] < hk[c]) c++; if (hk[c] >= k) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; }
      hk[i] = k; hv[i] = v;
    }
    return top;
  };
  // billigste vei fra punktet sa mot (gx, gy), til første punkt som alt ligger på en sti
  let sid = 0;
  const route = (sa, gx, gy) => {
    sid++; hk.length = hv.length = 0;
    node(sa); GS[sa] = 0; ST[sa] = sid; FR[sa] = -1; push(sa, 0);
    while (hk.length) {
      const a = pop(); if (CL[a] === sid) continue; CL[a] = sid;
      if (ON[a]) { const L = []; for (let q = a; q >= 0; q = FR[q]) L.push(q); return L.reverse(); }
      const i = a % N, j = a / N | 0;
      for (let k = 0; k < 8; k++) {
        const di = [1, -1, 0, 0, 1, 1, -1, -1][k], dj = [0, 0, 1, -1, 1, -1, 1, -1][k], bi = i + di, bj = j + dj;
        if (bi < 0 || bj < 0 || bi >= N || bj >= N) continue;
        const b = node(bj * N + bi); if (CL[b] === sid || BL[b] === 1 && !ON[b]) continue;
        const len = k < 4 ? TG : TG * Math.SQRT2, s = Math.abs(H[b] - H[a]) / len, sg = steep(b), s2 = Math.max(0, s - 0.45);
        const g = GS[a] + len * (1 + 40 * s * s + 400 * s2 * s2 + 10 * sg * sg) + ((RV[a] < 0) !== (RV[b] < 0) ? 400 : 0) + (BL[b] === 2 ? 2000 : H[b] === 0 ? 600 : 0);
        if (ST[b] !== sid || g < GS[b]) { GS[b] = g; ST[b] = sid; FR[b] = a; push(b, g + hyp(bi - gx, bj - gy) * TG); }
      }
    }
    return null;
  };
  // legger et stykke sti i rutene det går gjennom eller like forbi, og bygger bru der det krysser en elv
  const seg = (x0, y0, x1, y1, onBr) => {
    const l = hyp(x1 - x0, y1 - y0); if (l < 0.01) return;
    const s = [x0, y0, x1, y1];
    for (let j = Math.floor((Math.min(y0, y1) - TR_FAR) / TG); j <= Math.floor((Math.max(y0, y1) + TR_FAR) / TG); j++)
      for (let i = Math.floor((Math.min(x0, x1) - TR_FAR) / TG); i <= Math.floor((Math.max(x0, x1) + TR_FAR) / TG); i++) { const k = tkey(i, j), L = _trail.get(k); if (L) L.push(s); else _trail.set(k, [s]); }
    const neg = riverN(x0, y0) < 0;
    if (onBr || neg === riverN(x1, y1) < 0) return;
    let lo = 0, hi = 1;
    for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (riverN(lerp(x0, x1, m), lerp(y0, y1, m)) < 0 === neg) lo = m; else hi = m; }
    const tx = (x1 - x0) / l, ty = (y1 - y0) / l, bx = lerp(x0, x1, lo), by = lerp(y0, y1, lo);
    let br = makeBridge(bx, by, tx, ty);
    // når stien ikke fram på skrå over elva, legges brua tvers over, der det er kortest
    if (!br) { const gx = riverN(bx + 0.5, by) - riverN(bx - 0.5, by), gy = riverN(bx, by + 0.5) - riverN(bx, by - 0.5), gl = hyp(gx, gy) * (gx * tx + gy * ty < 0 ? -1 : 1); if (gl) br = makeBridge(bx, by, gx / gl, gy / gl); }
    if (!br) return;
    const k = Math.floor(bx / CS) + ',' + Math.floor(by / CS), L = _br.get(k); if (L) L.push(br); else _br.set(k, [br]);
    // stien går rett fram til begge endene av brua
    seg(bx + br.tx * (br.a - 4), by + br.ty * (br.a - 4), bx + br.tx * (br.b + 4), by + br.ty * (br.b + 4), 1);
  };
  // legger en sti fra d mot t, fram til første sti på veien
  const lay = (d, t) => {
    const path = route(at(d[0], d[1]), t[0] / TG + O, t[1] / TG + O);
    if (!path) return false;
    // punktene skyves litt hit og dit, så stien bukter seg i stedet for å følge rutenettet på rette strekk
    const wob = (a, k) => (vnoise(nx(a) / 75, ny(a) / 75, SEED + 53 + k) - 0.5) * 30;
    const pts = [d, ...path.map(a => ON[a] ? [PX[a], PY[a]] : [nx(a) + wob(a, 0), ny(a) + wob(a, 1)])];
    // og knekkene glattes ut; endene ligger fast
    for (let n = 0; n < 3; n++) for (let i = 1, p = pts[0]; i < pts.length - 1; i++) { const q = pts[i], r = pts[i + 1]; pts[i] = [(p[0] + 2 * q[0] + r[0]) / 4, (p[1] + 2 * q[1] + r[1]) / 4]; p = q; }
    path.forEach((a, i) => { ON[a] = 1; PX[a] = pts[i + 1][0]; PY[a] = pts[i + 1][1]; });
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    return true;
  };
  // stiene ut av portene er der fra før (de fire første i V_PATH)
  const gates = V_PATH.slice(0, 4).map(p => p[1]), tree = gates.slice();
  for (const [x, y] of gates) { const a = node(at(x, y)); ON[a] = 1; PX[a] = x; PY[a] = y; }
  // til døra på husene og til foten av landemerkene
  const dests = [...PLACES.filter(c => !inVillage(c)).map(c => [c.door[0] + c.out[0] * 6, c.door[1] + c.out[1] * 6]), ...MARKS.map(q => [q.x, q.y + 3])];
  const join = (i, t) => { const d = dests.splice(i, 1)[0]; if (lay(d, t)) tree.push(d); };
  // først en sti ut av hver port, til det nærmeste stedet på den kanten av landsbyen
  for (const g of gates) {
    let bi = -1, bd = 1e9;
    dests.forEach((d, i) => { const dx = d[0] - g[0], dy = d[1] - g[1], q = hyp(dx, dy); if (q < bd && dx * g[0] + dy * (g[1] + 150) > 0.5 * q * hyp(g[0], g[1] + 150)) { bd = q; bi = i; } });
    if (bi >= 0) join(bi, g);
  }
  // så resten, det som ligger nærmest et sted med sti først
  while (dests.length) {
    let bi = 0, bt = null, bd = 1e9;
    dests.forEach((d, i) => { for (const t of tree) { const q = hyp(d[0] - t[0], d[1] - t[1]); if (q < bd) { bd = q; bi = i; bt = t; } } });
    join(bi, bt);
  }
}
// Står (x, y) på en av bruene i lista? m utvider brua i alle retninger
function inBridge(list, x, y, m) {
  for (const br of list) {
    const dx = x - br.x, dy = y - br.y, s = dx * br.tx + dy * br.ty, q = dy * br.tx - dx * br.ty;
    if (s >= br.a - m && s <= br.b + m && Math.abs(q) <= br.hw + m) return br;
  }
  return null;
}
const bridgeAt = (x, y, m) => inBridge(getChunk(Math.floor(x / CS), Math.floor(y / CS)).br, x, y, m || 0);

const GT = {
  water: T('#1e3b48', '#28525f', '#376c76'), spark: C('#a4ccc6'),
  shore: T('#565040', '#6c6450', '#857c62'), peb: C('#8e948c'),
  dirt: T('#4b3c2f', '#5c4a39', '#705c46'),
  needle: T('#2b3a2d', '#33462f', '#3d5334', '#475c38'), ndl: C('#5c4a32'),
  mixed: T('#3a5232', '#46623a', '#557440', '#648446'),
  meadow: T('#54703c', '#668344', '#7b964c', '#93a858'),
  heath: T('#5e4658', '#805a74', '#a0728c', '#be90a6'),
  moss: T('#557a34', '#6f9440', '#8aac4c'),
  leaf: T('#a87428', '#cf9a34', '#e6bd52', '#c2682a'),
  snow: T('#aab6be', '#c4ced4', '#dce4e8', '#f0f4f4'), rim: C('#8496a6'),
  lichen: T('#6e7462', '#8a8e76', '#a6a88a', '#c2c09e'),
  lush: T('#4a7234', '#5a873c', '#6e9c44', '#86b24e'),
  rock: T('#4c504e', '#646864', '#7c807a', '#96988e'),
  // landsbyen: tun, grus, brostein og åkerjord
  yard: T('#515e36', '#5f6b3c', '#6d7842', '#7c8549'), gravel: T('#75614a', '#8a745a', '#9e886a', '#b09a7a'),
  mud: T('#4a3b2c', '#594836', '#69563f', '#79654a'), puddle: T('#3a3d38', '#4c524c'), straw: C('#c2a654'),
  cob: T('#55534f', '#737069', '#8b877d', '#a29d90'), soil: T('#4a3626', '#5e4630', '#735a3e'), sprout: C('#7aa048'),
};
// Bakken i landsbyen (vk fra villKind): brostein i forband, stier av jord, åker med furer og spirer, og et tun som
// er slitt av folk: bar, hardtråkket jord langs stiene, rundt torget og inntil husveggene og i flekker ellers, med
// sølepytter, halmstrå og småstein, og blekt, nedtråkket gress imellom
function villColor(x, y, vk) {
  const n = hash2(x, y, 7), n2 = vnoise(x / 11, y / 11, 3);
  if (vk === 3) {
    const row = Math.floor(y / 5), u = x + (row & 1) * 3;
    if (y - row * 5 === 0 || u - Math.floor(u / 6) * 6 === 0) return GT.cob[0];
    return GT.cob[1 + ((hash2(Math.floor(u / 6), row, 31) * 3) | 0)];
  }
  if (vk === 5) return (x + y * 3) % 5 === 0 ? GT.cob[1] : GT.cob[3];
  if (vk === 2) return n > 0.98 ? GT.peb : n > 0.9 ? GT.mud[0] : vnoise(x / 8, y / 8, 93) < 0.14 ? GT.puddle[n > 0.5 ? 1 : 0] : tone(GT.gravel, 0.2 + n2 * 0.5 + n * 0.3, x, y, 2);
  if (vk === 4) {
    const row = Math.floor(y / 4), r = y - row * 4;
    return r === 0 ? GT.soil[0] : r === 2 && (x + row) % 3 === 0 ? GT.sprout : tone(GT.soil, 0.4 + n * 0.5, x, y, 2);
  }
  // slitasjen: 1 er bar jord, 0 er gress
  let dh = 1e9;
  for (const [hx, hy, c, sn, hl, hd] of VHB) { const dx = x - hx, dy = y - hy, d = hyp(Math.max(0, Math.abs(dx * c + dy * sn) - hl), Math.max(0, Math.abs(dy * c - dx * sn) - hd)); if (d < dh) dh = d; }
  const w = Math.max(1 - VK_D / 18, 1 - dh / 13, smooth(0.55, 0.75, vnoise(x / 34, y / 34, 91)) * 0.95) + (vnoise(x / 7, y / 7, 92) - 0.5) * 0.55;
  if (w > 0.35 && (w > 0.75 || dith(x, y) < (w - 0.35) / 0.4)) {
    if (w > 0.7 && vnoise(x / 8, y / 8, 93) < 0.15) return GT.puddle[n > 0.5 ? 1 : 0];
    return n > 0.985 ? GT.peb : n > 0.955 ? GT.straw : n < 0.05 ? GT.mud[0] : tone(GT.mud, 0.3 + n2 * 0.5 + n * 0.25, x, y, 2);
  }
  // gresset er blekere der det er tråkket mest
  return n > 0.992 ? GT.straw : tone(GT.yard, 0.5 - w * 0.5 + n2 * 0.35 + n * 0.2, x, y, 2);
}
// hh er høyden på bakken og g hvor bratt den er
function groundColor(x, y, f, hh, g) {
  const vk = villKind(x, y, 1); if (vk) return villColor(x, y, vk);
  const F = f[0], Cn = f[1], Wv = f[2], Tr = f[3], He = f[4], n3 = f[5], Kl = f[6];
  const n = hash2(x, y, 7), n2 = vnoise(x / 11, y / 11, 3);
  if (Wv < 1) { if (n > 0.9945) return GT.spark; return tone(GT.water, 0.1 + Wv * 0.85 + (n2 - 0.5) * 0.3, x, y, 2); }
  if (Wv < 1.4 + (n2 - 0.5) * 0.4) { if (n > 0.965) return GT.peb; return tone(GT.shore, n2 * 0.7 + n * 0.2, x, y, 2); }
  if (Tr < 1 + (n2 - 0.5) * 0.6) { if (n > 0.978) return GT.peb; return tone(GT.dirt, n2 * 0.6 + n3 * 0.3 + n * 0.1, x, y, 2.5); }
  const v = n2 * 0.5 + n3 * 0.42 + n * 0.08, Fj = F + (n2 - 0.5) * 0.12;
  // snøflekker i nord, flest der skogen er åpen. Kanten er ditret og har en blågrå rand, og snøen er lysest midt i
  // flekken, så flekkene ikke ser utklipt ut
  if (Kl > 0.3) {
    const s = n3 + (n2 - 0.5) * 0.35 - (1.05 - (Kl - 0.3) * 0.75 + Fj * 0.15) + (dith(x, y) - 0.5) * 0.05;
    if (s > 0) return s < 0.03 ? GT.rim : tone(GT.snow, Math.min(0.3, s * 5) + n2 * 0.5 + n * 0.2, x, y, 2);
  }
  // berg og ur i det bratte og snaufjell på toppene, med sprekker og flekker av lav
  if (rocky(g, hh, n2)) return n > 0.95 ? GT.rock[0] : n < 0.03 ? GT.lichen[1] : tone(GT.rock, n2 * 0.55 + n3 * 0.3 + n * 0.15, x, y, 2);
  // løvet på bakken følger klimaet: mest i skogen rundt landsbyen, lite på fjellet og i det grønne lavlandet
  const lf = 1 - 0.75 * Math.abs(Kl);
  if (Fj > 0.56) {
    if (Cn + (n3 - 0.5) * 0.2 > 0.5) {
      if (He > 0.7 && n2 > 0.45) return tone(GT.moss, v, x, y, 2);
      if (n > 0.94) return GT.ndl;
      return tone(GT.needle, v, x, y, 2.5);
    }
    if (n < (0.05 + 0.12 * (1 - Cn)) * lf) return GT.leaf[((n * 997) | 0) % 4];
    return tone(GT.mixed, v * 0.85, x, y, 2.5);
  }
  if (Fj < 0.3) {
    // lav og grå fjellvegetasjon i nord, frodigere eng i sørvest
    const kd = Kl + (n2 - 0.5) * 0.3;
    if (kd > 0.5) return tone(GT.lichen, v, x, y, 2);
    // lyngen brer seg oppover åsene
    if (He > 0.64 - 0.4 * smooth(110, 190, hh) && n2 > 0.4) return tone(GT.heath, v + (n - 0.5) * 0.5, x, y, 2);
    return tone(kd < -0.4 ? GT.lush : GT.meadow, v, x, y, 2.5);
  }
  if (n < (0.012 + 0.035 * (1 - Cn)) * lf) return GT.leaf[((n * 997) | 0) % 4];
  return tone(GT.mixed, v, x, y, 2.5);
}

function stamps(p, ch) {
  const r = rng((hash2(ch.cx, ch.cy, 77) * 4294967296) >>> 0);
  const gl = T('#7b964c', '#93a858', '#aebc62'), gd = T('#2f4a30', '#3d5c36', '#52703c');
  const fl = T('#f2eee0', '#f0d050', '#b88ad0', '#e88aa0');
  for (let i = 0; i < 640; i++) {
    const x = (r() * CS) | 0, y = (r() * CS) | 0, h = r();
    if (x < 3 || y < 4 || x > CS - 4 || y > CS - 3) continue;
    // i landsbyen står det bare noen gresstuster på tunet
    const vk = villKind(ch.cx * CS + x, ch.cy * CS + y, 1);
    if (vk) { if (vk === 1 && h < 0.3) { p.set(x, y, gl[1]); p.set(x - 1, y - 1, gl[1]); p.set(x + 1, y - 1, gl[2]); } continue; }
    const f = fields(ch.cx * CS + x, ch.cy * CS + y, ch.cabs), F = f[0], Cn = f[1], Wv = f[2], Tr = f[3], cold = f[6] > 0.4;
    if (GT.snow.includes(p.d[y * CS + x])) continue; // ingenting stikker opp av snøen
    if (rocky(chunkG(ch, x, y), chunkH(ch, x, y), 0.5)) continue; // og ingenting gror på berget
    if (Wv < 0.7) { if (h < 0.14) { p.rect(x, y, 3, 2, C('#4e7a44')); p.set(x + 1, y, C('#6a9a50')); if (h < 0.04) p.set(x + 2, y - 1, C('#f2eee0')); } continue; }
    if (Wv < 1.5 || Tr < 1.2) { if (h < 0.25) { p.set(x, y, C('#9da19a')); p.set(x + 1, y, C('#787d7c')); p.set(x, y + 1, C('#50565a')); p.set(x + 1, y + 1, C('#50565a')); } continue; }
    const tuft = (cs) => { const c1 = cs[(r() * cs.length) | 0], c2 = cs[(r() * cs.length) | 0]; if (r() < 0.5) { p.set(x - 1, y - 1, c1); p.set(x, y, c1); p.set(x + 1, y - 1, c2); } else { p.set(x, y, c1); p.set(x, y - 1, c1); p.set(x - 1, y - 2, c2); p.set(x + 1, y - 2, c2); } };
    const pebble = () => { p.set(x, y, C('#979c94')); p.set(x + 1, y, C('#727876')); p.set(x, y + 1, C('#50565a')); };
    const twig = () => { const c = C('#5a4636'); p.set(x, y, c); p.set(x + 1, y, c); p.set(x + 2, y - 1, c); if (h * 77 % 1 < 0.5) p.set(x + 3, y - 1, c); };
    if (F < 0.3) {
      if (h < 0.5) tuft(gl);
      else if (h < 0.7 && !cold) { const c = fl[(r() * 4) | 0]; p.set(x, y, C('#4a6a34')); if (r() < 0.25) { p.set(x, y - 2, c); p.set(x - 1, y - 1, c); p.set(x + 1, y - 1, c); p.set(x, y - 1, C('#f0d050')); } else p.set(x, y - 1, c); }
      else if (h < 0.76) pebble();
    } else if (F > 0.56 && Cn > 0.5) {
      if (h < 0.24) tuft(gd);
      else if (h < 0.32) { p.set(x, y, C('#f2eee0')); p.set(x - 1, y - 1, C('#d8402c')); p.set(x, y - 1, C('#f2eee0')); p.set(x + 1, y - 1, C('#d8402c')); p.set(x, y - 2, C('#d8402c')); }
      else if (h < 0.45) twig();
      else if (h < 0.5) pebble();
      else if (h < 0.57) { p.set(x, y, C('#6a4a30')); p.set(x, y - 1, C('#84603c')); }
    } else {
      if (h < 0.36) tuft(F > 0.45 ? gd : gl);
      else if (h < 0.6) { if (h < 0.36 + 0.24 * (1 - 0.75 * Math.abs(f[6]))) { const c = GT.leaf[(r() * 4) | 0]; p.set(x, y, c); if (r() < 0.5) p.set(x + 1, y, c); } }
      else if (h < 0.66) { p.set(x, y, C('#e8b030')); p.set(x - 1, y - 1, C('#f0c848')); p.set(x, y - 1, C('#f0c848')); p.set(x + 1, y - 1, C('#f0c848')); }
      else if (h < 0.72) twig();
      else if (h < 0.79) { p.rect(x, y, 3, 2, C('#34502e')); p.set(x + 1, y, C('#4c6c8c')); p.set(x, y + 1, C('#3c4c84')); }
      else if (h < 0.82) pebble();
    }
  }
}

function genChunk(cx, cy) {
  const x0 = cx * CS, y0 = cy * CS, ch = { cx, cy, objs: [], col: [], ground: null, cabs: cabinsNear(x0 + 128, y0 + 128), br: [] };
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) for (const br of bridgesOf(cx + i, cy + j))
    if (br.bb[0] < x0 + CS && br.bb[2] >= x0 && br.bb[1] < y0 + CS && br.bb[3] >= y0) ch.br.push(br);
  const inC = (x, y) => x >= x0 && x < x0 + CS && y >= y0 && y < y0 + CS;
  chunkHg(ch);
  const marks = MARKS.filter(q => q.x > x0 - 40 && q.x < x0 + CS + 40 && q.y > y0 - 40 && q.y < y0 + CS + 40);
  const nearCab = (x, y, d) => { for (const c of ch.cabs) if (hyp(x - c.x, y - c.y + 12) < d) return true; for (const q of marks) if (hyp(x - q.x, y - q.y) < d * 0.45) return true; return false; };
  // trær
  const TC = 34;
  for (let gy = Math.floor(y0 / TC) - 1; gy * TC < y0 + CS; gy++) for (let gx = Math.floor(x0 / TC) - 1; gx * TC < x0 + CS; gx++) {
    const x = Math.round((gx + 0.12 + 0.76 * hash2(gx, gy, 101)) * TC), y = Math.round((gy + 0.12 + 0.76 * hash2(gx, gy, 102)) * TC);
    if (!inC(x, y) || inVill(x, y) || nearGate(x, y)) continue;
    const f = fields(x, y, ch.cabs), F = f[0], Wv = f[2], Tr = f[3];
    if (Wv < 1.8 || Tr < 1.7 || nearCab(x, y, 62)) continue;
    if (hash2(gx, gy, 103) > smooth(0.2, 0.8, F) * 0.74 + 0.02) continue;
    // ingen trær i berg og ur eller på snaufjellet
    if (rocky(chunkG(ch, x - x0, y - y0), chunkH(ch, x - x0, y - y0), hash2(gx, gy, 111))) continue;
    const t = hash2(gx, gy, 104), cn = f[1] + (hash2(gx, gy, 107) - 0.5) * 0.18;
    let k;
    if (cn > 0.6) k = t < 0.76 ? 'spruce' : t < 0.9 ? 'pine' : t < 0.975 ? 'birch' : 'snag';
    else if (cn > 0.36) k = t < 0.26 ? 'spruce' : t < 0.62 ? 'pine' : t < 0.92 ? 'birch' : t < 0.98 ? 'rowan' : 'snag';
    else k = t < 0.7 ? 'birch' : t < 0.82 ? 'rowan' : t < 0.93 ? 'pine' : 'spruce';
    // mot skoggrensa i nord står det mest fjellbjørk
    if (f[6] > 0.55 && hash2(gx, gy, 108) < (f[6] - 0.55) * 1.8) k = 'birch';
    const o = { k, x, y, v: (hash2(gx, gy, 105) * SPR[k].length) | 0, ph: hash2(gx, gy, 106) * TAU, a: 1, r: SPR[k][0].r || 0 };
    // løvet på bjørka følger klimaet: visnet og gult mot fjellet, ennå grønt i lavlandet og høstfarger imellom
    if (k === 'birch') { const z = f[6] + (hash2(gx, gy, 109) - 0.5) * 0.4, tn = BIRCH_ZONE[z > 0.35 ? 1 : z < -0.35 ? 2 : 0]; o.v = tn[(hash2(gx, gy, 105) * tn.length) | 0] + (hash2(gx, gy, 110) < 0.5 ? 0 : BIRCH_TONES.length); }
    if (G.cut.has(x + ',' + y)) toStump(o);
    ch.objs.push(o); ch.col.push(o);
  }
  // undervegetasjon
  const UC = 22;
  for (let gy = Math.floor(y0 / UC) - 1; gy * UC < y0 + CS; gy++) for (let gx = Math.floor(x0 / UC) - 1; gx * UC < x0 + CS; gx++) {
    const x = Math.round((gx + 0.1 + 0.8 * hash2(gx, gy, 201)) * UC), y = Math.round((gy + 0.1 + 0.8 * hash2(gx, gy, 202)) * UC);
    if (!inC(x, y) || inVill(x, y) || nearGate(x, y)) continue;
    const f = fields(x, y, ch.cabs), F = f[0], Cn = f[1], Wv = f[2], Tr = f[3], He = f[4], h = hash2(gx, gy, 203);
    let k = null;
    if (Wv < 1) continue;
    if (Wv < 2) { if (h < 0.55 && !inBridge(ch.br, x, y, 3)) k = 'reed'; }
    else if (Tr < 1.4 || nearCab(x, y, 58)) continue;
    else if (F > 0.5 && Cn > 0.55) k = h < 0.15 ? 'fern' : h < 0.2 ? 'rock' : h < 0.22 ? 'stump' : h < 0.235 ? 'log' : h < 0.28 ? 'shrub' : h < 0.29 ? 'juniper' : null;
    else if (F > 0.45) k = h < 0.12 ? 'shrub' : h < 0.2 ? 'fern' : h < 0.24 ? 'rock' : h < 0.32 ? 'grassT' : h < 0.335 ? 'log' : h < 0.35 ? 'stump' : null;
    else if (F > 0.25) k = h < 0.07 ? 'juniper' : h < 0.15 ? 'shrub' : h < 0.23 ? (He > 0.55 ? 'heather' : 'grassT') : h < 0.28 ? 'rock' : h < 0.4 ? 'grassT' : null;
    else k = h < 0.3 ? 'grassT' : h < 0.42 ? (He > 0.6 ? 'heather' : 'grassT') : h < 0.45 ? 'rock' : h < 0.47 ? 'juniper' : null;
    if (!k || k !== 'rock' && k !== 'reed' && rocky(chunkG(ch, x - x0, y - y0), chunkH(ch, x - x0, y - y0), hash2(gx, gy, 206))) continue;
    const v = (hash2(gx, gy, 205) * SPR[k].length) | 0, s = SPR[k][v], o = { k, x, y, v, ph: 0, a: 1, r: s.r || 0 };
    ch.objs.push(o); if (o.r) ch.col.push(o);
  }
  // husene: butikker, koier og utposter (ch.cabs) og resten av husene i landsbyen
  for (const c of [...ch.cabs, ...HOUSES]) if (inC(c.x, c.y)) { const v = houseV(c.kind, c.rot), o = { k: 'cabin', x: c.x, y: c.y, v, ph: 0, a: 1, r: 0, obb: SPR.cabin[v].obb }; ch.objs.push(o); ch.col.push(o); }
  // den som holder til i huset, står ute ved veggen ved siden av døra
  for (const c of ch.cabs) {
    const x = Math.round(c.door[0] + Math.cos(c.rot) * 12 - c.out[0] * 2), y = Math.round(c.door[1] + Math.sin(c.rot) * 12 - c.out[1] * 2);
    if (NPC_V[c.kind] != null && inC(x, y)) { const o = { k: 'npc', x, y, v: NPC_V[c.kind], ph: 0, a: 1, r: 3 }; ch.objs.push(o); ch.col.push(o); }
  }
  for (const q of marks) if (inC(q.x, q.y)) { const o = { k: q.k, x: q.x, y: q.y, v: 0, ph: 0, a: 1, r: SPR[q.k][0].r }; ch.objs.push(o); ch.col.push(o); }
  // palisaden rundt landsbyen og skigardene inni
  for (const [x, y, v, pal] of FENCE_SEGS) if (inC(x, y)) {
    const o = { k: pal || 'fence', x, y, v, ph: 0, a: 1, r: 0 }, t = pal ? 2 : 1;
    if (v > 1) o.obb = [8.5, t, Math.SQRT1_2, v === 2 ? Math.SQRT1_2 : -Math.SQRT1_2]; else o.rect = v ? [-t, -8, t, 8] : [-8, -t, 8, t];
    ch.objs.push(o); ch.col.push(o);
  }
  // og det som står i landsbyen
  for (const [k, x, y, v] of VOBJ) if (inC(x, y)) {
    const s = SPR[k][v], o = { k, x, y, v, ph: hash2(x, y, 3) * TAU, a: 1, r: s.r || 0 };
    if (s.rect) o.rect = s.rect;
    if (CHOP[k] && G.cut.has(x + ',' + y)) toStump(o);
    ch.objs.push(o); if (o.r || o.rect) ch.col.push(o);
  }
  // høyden hver ting står på (til 3D-siktet)
  for (const o of ch.objs) o.h = chunkH(ch, o.x - x0, o.y - y0);
  return ch;
}
// Plankedekke på tvers av stien, rekkverk med stolper langs kantene og skygge på vannet under
const BRT = { plank: T('#5a412d', '#6e5038', '#836244', '#977452'), gap: C('#2c2017'), rail: C('#45321f'), post: C('#a88660') };
function paintBridges(p, ch) {
  const x0 = ch.cx * CS, y0 = ch.cy * CS;
  for (const br of ch.br) {
    const i0 = Math.max(0, Math.floor(br.bb[0]) - x0), i1 = Math.min(CS - 1, Math.ceil(br.bb[2]) - x0);
    const j0 = Math.max(0, Math.floor(br.bb[1]) - y0), j1 = Math.min(CS - 1, Math.ceil(br.bb[3]) - y0);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = x0 + i + 0.5 - br.x, dy = y0 + j + 0.5 - br.y, s = dx * br.tx + dy * br.ty, q = dy * br.tx - dx * br.ty, k = j * CS + i;
      if (s < br.a || s > br.b || Math.abs(q) > br.hw + 1) {
        const s2 = s - 2 * br.ty, q2 = q - 2 * br.tx; // dekket 2 px over kaster skygge hit
        if (s2 >= br.a && s2 <= br.b && Math.abs(q2) <= br.hw + 1) p.d[k] = dkc(p.d[k], 0.55);
        continue;
      }
      const u = s - br.a;
      if (Math.abs(q) > br.hw - 0.5) p.d[k] = (u | 0) % 6 === 1 ? BRT.post : BRT.rail;
      else if (u % 3 < 1) p.d[k] = BRT.gap;
      else p.d[k] = tone(BRT.plank, hash2((u / 3) | 0, br.id, 3) * 0.75 + hash2(i, j, 4) * 0.25, i, j, 2);
    }
  }
}
function genGround(ch) {
  const p = new Pix(CS, CS), x0 = ch.cx * CS, y0 = ch.cy * CS, G = 4, N = CS / G + 1, NF = 7;
  const fl = new Float32Array(N * N * NF);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) fl.set(fields(x0 + i * G, y0 + j * G, ch.cabs), (j * N + i) * NF);
  const out = [0, 0, 0, 0, 0, 0, 0];
  // hellingen i hvert høydepunkt: sl mot sørøst, til skyggeleggingen av terrenget, og sg hvor bratt det er
  const hg = ch.hg, SN = CS / HG + 1, sl = new Float32Array(SN * SN), sg = new Float32Array(SN * SN);
  for (let j = 0; j < SN; j++) for (let i = 0; i < SN; i++) {
    const a = (j + 1) * HN + i + 1, hx = (hg[a + 1] - hg[a - 1]) / (2 * HG), hy = (hg[a + HN] - hg[a - HN]) / (2 * HG);
    sl[j * SN + i] = hx + hy; sg[j * SN + i] = hyp(hx, hy);
  }
  const bil = (t, a, u, v) => lerp(lerp(t[a], t[a + 1], u), lerp(t[a + SN], t[a + SN + 1], u), v);
  // høydekoter: en mørk linje der bakken krysser hver KOTE piksler høyde, og en mørkere og dobbelt så tykk tellekote for
  // hver TELL-te. up og up2 er kotenivået i de to radene over, ll og ll2 i de to pikslene til venstre
  const KOTE = 20, TELL = 5, cont = [], tell = [], up = new Int32Array(CS), up2 = new Int32Array(CS);
  for (let x = 0; x < CS; x++) { up[x] = chunkH(ch, x, -1) / KOTE; up2[x] = chunkH(ch, x, -2) / KOTE; }
  for (let y = 0; y < CS; y++) {
    const gy = y / G, j = gy | 0, v = gy - j;
    let ll = (chunkH(ch, -1, y) / KOTE) | 0, ll2 = (chunkH(ch, -2, y) / KOTE) | 0;
    for (let x = 0; x < CS; x++) {
      const hh = chunkH(ch, x, y), l = (hh / KOTE) | 0, tl = (l / TELL) | 0;
      if (tl !== ((ll / TELL) | 0) || tl !== ((up[x] / TELL) | 0) || tl !== ((ll2 / TELL) | 0) || tl !== ((up2[x] / TELL) | 0)) tell.push(y * CS + x);
      else if (l !== ll || l !== up[x]) cont.push(y * CS + x);
      ll2 = ll; up2[x] = up[x]; ll = up[x] = l;
      const gx = x / G, i = gx | 0, u = gx - i, a = (j * N + i) * NF, b = a + NF, c = a + N * NF, d = c + NF;
      for (let k = 0; k < NF; k++) out[k] = lerp(lerp(fl[a + k], fl[b + k], u), lerp(fl[c + k], fl[d + k], u), v);
      // skyggen i trinn med ditring imellom, så bakken beholder få, rene farger
      const si = x >> 5, sj = y >> 5, su = (x & 31) / HG, sv = (y & 31) / HG, sa = sj * SN + si;
      const q = Math.round((shadeK(bil(sl, sa, su, sv)) - 1) / 0.1 + dith(x, y) - 0.5);
      const col = groundColor(x0 + x, y0 + y, out, hh, bil(sg, sa, su, sv));
      p.d[y * CS + x] = q ? lightC(col, 1 + q * 0.1) : col;
    }
  }
  stamps(p, ch);
  paintBridges(p, ch);
  ch.gpix = p.d.slice(); // pikslene leses også av 3D-siktet, uten kotene
  for (const k of cont) p.d[k] = dkc(p.d[k], 0.8);
  for (const k of tell) p.d[k] = dkc(p.d[k], 0.6);
  ch.ground = p.canvas();
  // og en utgave i kvart oppløsning (snittet av 4 × 4 piksler) til bakken et stykke unna
  const gm = ch.gmid = new Uint32Array(64 * 64);
  for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) {
    let r = 0, g = 0, bl = 0;
    for (let v = 0; v < 4; v++) for (let u = 0; u < 4; u++) { const c = ch.gpix[(j * 4 + v) * CS + i * 4 + u]; r += c & 255; g += (c >>> 8) & 255; bl += (c >>> 16) & 255; }
    gm[j * 64 + i] = (0xff000000 | (bl >> 4) << 16 | (g >> 4) << 8 | r >> 4) >>> 0;
  }
}
function getChunk(cx, cy) {
  const key = cx + ',' + cy; let ch = chunks.get(key);
  if (!ch) { ch = genChunk(cx, cy); chunks.set(key, ch); }
  return ch;
}
// Behold biter rundt alle punktene (deg og de andre jegerne): trær og ting så langt du ser i siktet, den tegnede
// bakken bare i nærheten (langt unna tegnes bakken grovt, se farCol)
function evictChunks(pts) {
  for (const [k, ch] of chunks) {
    let d = 99;
    for (const p of pts) d = Math.min(d, Math.max(Math.abs(ch.cx - Math.floor(p.x / CS)), Math.abs(ch.cy - Math.floor(p.y / CS))));
    if (d > 9) chunks.delete(k); else if (d > 5) ch.ground = ch.gpix = ch.gmid = null;
  }
}

// ---------- hogde trær ----------
// Et felt tre blir en stubbe. Nøkkelen er treets faste posisjon, så biten blir lik når den lages på nytt
function toStump(o) { o.v = (hash2(o.x, o.y, 9) * SPR.stump.length) | 0; o.k = 'stump'; o.r = SPR.stump[o.v].r; o.a = 1; }
function cutTree(x, y) {
  G.cut.add(x + ',' + y);
  const ch = chunks.get(Math.floor(x / CS) + ',' + Math.floor(y / CS)), o = ch && ch.objs.find(o => o.x === x && o.y === y && CHOP[o.k]);
  if (o) { toStump(o); if (typeof glCut === 'function') glCut(x, y); }
}

// Kollisjon mot stammer, stein, hus og bakveggen i gapahuker
const COL = { x: 0, y: 0 };
// skyver punktet ut av rektangelet langs korteste vei
function outOfRect(x, y, x0, y0, x1, y1) {
  if (x > x0 && x < x1 && y > y0 && y < y1) { const dl = x - x0, dr = x1 - x, dt = y - y0, db = y1 - y, m = Math.min(dl, dr, dt, db); if (m === dl) x = x0; else if (m === dr) x = x1; else if (m === dt) y = y0; else y = y1; }
  COL.x = x; COL.y = y;
}
function collide(x, y, r) {
  const cx0 = Math.floor((x - 40) / CS), cx1 = Math.floor((x + 40) / CS), cy0 = Math.floor((y - 24) / CS), cy1 = Math.floor((y + 24) / CS);
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) for (const o of getChunk(cx, cy).col) {
    if (o.rect) { outOfRect(x, y, o.x + o.rect[0] - r, o.y + o.rect[1] - r, o.x + o.rect[2] + r, o.y + o.rect[3] + r); x = COL.x; y = COL.y; }
    // dreid rektangel (hus og skrå gjerder): [halv lengde, halv bredde, cos, sin]
    else if (o.obb) {
      const [hl, hd, c, s] = o.obb, dx = x - o.x, dy = y - o.y;
      outOfRect(dx * c + dy * s, dy * c - dx * s, -hl - r, -hd - r, hl + r, hd + r);
      x = o.x + COL.x * c - COL.y * s; y = o.y + COL.x * s + COL.y * c;
    }
    else {
      const dx = x - o.x, dy = y - o.y, rr = o.r + r, d2 = dx * dx + dy * dy;
      if (d2 < rr * rr && d2 > 1e-4) { const d = Math.sqrt(d2); x = o.x + dx / d * rr; y = o.y + dy / d * rr; }
    }
  }
  for (const h of G.huts) { outOfRect(x, y, h.x - 16 - r, h.y - 14 - r, h.x + 16 + r, h.y - 1 + r); x = COL.x; y = COL.y; }
  COL.x = x; COL.y = y; return COL;
}
// Stammer som står i skuddlinja
function trunkBlock(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy; if (l2 < 1) return null;
  let best = null, bt = 2;
  const cx0 = Math.floor((Math.min(x0, x1) - 8) / CS), cx1 = Math.floor((Math.max(x0, x1) + 8) / CS), cy0 = Math.floor((Math.min(y0, y1) - 8) / CS), cy1 = Math.floor((Math.max(y0, y1) + 8) / CS);
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) for (const o of getChunk(cx, cy).col) {
    if (o.rect || o.obb || !SPR[o.k][o.v].tall) continue;
    if (hyp(o.x - x0, o.y - y0) < 14 || hyp(o.x - x1, o.y - y1) < 5) continue;
    const t = clamp(((o.x - x0) * dx + (o.y - y0) * dy) / l2, 0, 1);
    if (hyp(x0 + dx * t - o.x, y0 + dy * t - o.y) < 2.5 && t < bt) { bt = t; best = o; }
  }
  return best;
}
