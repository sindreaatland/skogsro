// ===== Verden: evig skog generert bit for bit fra støyfunksjoner =====
const SEED = 4711, CS = 256, CABCELL = 1600;
const chunks = new Map();
const _cab = {};

// Jaktbuer ligger spredt i et grovt rutenett; den første står der du starter
function cabinOf(kx, ky) {
  if (kx === 0 && ky === 0) return { x: 0, y: -20 };
  return { x: Math.round((kx + 0.2 + 0.6 * hash2(kx, ky, 901)) * CABCELL), y: Math.round((ky + 0.2 + 0.6 * hash2(kx, ky, 902)) * CABCELL) };
}
function cabinsNear(x, y) {
  const kx = Math.floor(x / CABCELL), ky = Math.floor(y / CABCELL), key = kx + ',' + ky;
  let l = _cab[key];
  if (!l) { l = []; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) l.push(cabinOf(kx + i, ky + j)); _cab[key] = l; }
  return l;
}
function nearestCabin(x, y) {
  let b = null, bd = 1e9;
  for (const c of cabinsNear(x, y)) { const d = hyp(c.x - x, c.y - y); if (d < bd) { bd = d; b = c; } }
  return { x: b.x, y: b.y, d: bd };
}

// Elver og stier følger nullkonturen til hvert sitt støyfelt
const riverN = (x, y) => fbm(x / 560, y / 560, SEED + 37, 2) - 0.5;
const trailN = (x, y) => fbm(x / 310 + 40, y / 310 + 40, SEED + 53, 2) - 0.5;
// Felt som styrer landskapet: [skogtetthet, bartre-andel, vann, sti, lyng, grov variasjon]
function fields(x, y, cabs) {
  let F = clamp((fbm(x / 330, y / 330, SEED + 11, 3) - 0.5) * 2.4 + 0.5, 0, 1);
  const Cn = clamp((fbm(x / 470, y / 470, SEED + 23, 2) - 0.5) * 2.8 + 0.5, 0, 1);
  const r = Math.abs(riverN(x, y)), pd = vnoise(x / 820 + 5.2, y / 820 - 3.1, SEED + 41);
  let Wv = r / (0.010 + Math.max(0, pd - 0.6) * 0.18);
  let Tr = Math.abs(trailN(x, y)) / 0.011;
  const He = vnoise(x / 110, y / 110, SEED + 61), Va = vnoise(x / 37, y / 37, SEED + 5);
  for (const c of cabs) {
    const d = hyp(x - c.x, (y - c.y) * 1.3);
    if (d < 160) { const k = smooth(50, 160, d); F *= k; Wv += (1 - k) * 5; if (d < 70) Tr = Math.min(Tr, d / 42); }
  }
  return [F, Cn, Wv, Tr, He, Va];
}
// Vanndybde (vann under 1, djupt under 0,55); på en bro er det tørt
function waterAt(x, y) { const w = fields(x, y, cabinsNear(x, y))[2]; return w < 1.6 && bridgeAt(x, y) ? 9 : w; }
function isWater(x, y) { return waterAt(x, y) < 1; }

// ---------- bruer der stiene krysser bekker og elver ----------
// Krysningspunktet finnes med Newton-iterasjon på de to støyfeltene, så alle biter (og alle
// jegere på nettet) finner nøyaktig samme punkt. Biten punktet ligger i eier brua.
const _br = new Map(), BR_HW = 5, BR_MAX = 64;
function crossing(x, y) {
  for (let i = 0; i < 24; i++) {
    const a = trailN(x, y), c = riverN(x, y);
    const ax = trailN(x + 0.5, y) - trailN(x - 0.5, y), ay = trailN(x, y + 0.5) - trailN(x, y - 0.5);
    const cx = riverN(x + 0.5, y) - riverN(x - 0.5, y), cy = riverN(x, y + 0.5) - riverN(x, y - 0.5);
    const det = ax * cy - ay * cx; if (Math.abs(det) < 1e-12) return null;
    let dx = (a * cy - ay * c) / det, dy = (ax * c - cx * a) / det;
    const l = hyp(dx, dy); if (l > 6) { dx *= 6 / l; dy *= 6 / l; } // dempede steg: støyen er ikke lineær langt unna
    x -= dx; y -= dy;
    if (dx * dx + dy * dy < 1e-8) return [x, y];
  }
  return null;
}
function makeBridge(x, y) {
  const cabs = cabinsNear(x, y), wv = (px, py) => fields(px, py, cabs)[2];
  if (wv(x, y) >= 1) return null;
  const gx = trailN(x + 0.5, y) - trailN(x - 0.5, y), gy = trailN(x, y + 0.5) - trailN(x, y - 0.5), gl = hyp(gx, gy);
  const tx = -gy / gl, ty = gx / gl;
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
function bridgesOf(cx, cy) {
  const key = cx + ',' + cy; let L = _br.get(key);
  if (L) return L;
  L = []; const seen = [], x0 = cx * CS, y0 = cy * CS;
  for (let y = y0 - 12; y < y0 + CS + 12; y += 8) for (let x = x0 - 12; x < x0 + CS + 12; x += 8) {
    if (Math.abs(trailN(x, y)) > 0.04 || Math.abs(riverN(x, y)) > 0.04) continue;
    const c = crossing(x, y);
    if (!c || c[0] < x0 || c[0] >= x0 + CS || c[1] < y0 || c[1] >= y0 + CS || seen.some(p => hyp(p[0] - c[0], p[1] - c[1]) < 3)) continue;
    seen.push(c); const br = makeBridge(c[0], c[1]); if (br) L.push(br);
  }
  _br.set(key, L); return L;
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
};
function groundColor(x, y, f) {
  const F = f[0], Cn = f[1], Wv = f[2], Tr = f[3], He = f[4], n3 = f[5];
  const n = hash2(x, y, 7), n2 = vnoise(x / 11, y / 11, 3);
  if (Wv < 1) { if (n > 0.9945) return GT.spark; return tone(GT.water, 0.1 + Wv * 0.85 + (n2 - 0.5) * 0.3, x, y, 2); }
  if (Wv < 1.4 + (n2 - 0.5) * 0.4) { if (n > 0.965) return GT.peb; return tone(GT.shore, n2 * 0.7 + n * 0.2, x, y, 2); }
  if (Tr < 1 + (n2 - 0.5) * 0.6) { if (n > 0.978) return GT.peb; return tone(GT.dirt, n2 * 0.6 + n3 * 0.3 + n * 0.1, x, y, 2.5); }
  const v = n2 * 0.5 + n3 * 0.42 + n * 0.08, Fj = F + (n2 - 0.5) * 0.12;
  if (Fj > 0.56) {
    if (Cn + (n3 - 0.5) * 0.2 > 0.5) {
      if (He > 0.7 && n2 > 0.45) return tone(GT.moss, v, x, y, 2);
      if (n > 0.94) return GT.ndl;
      return tone(GT.needle, v, x, y, 2.5);
    }
    if (n < 0.06 + 0.15 * (1 - Cn)) return GT.leaf[((n * 997) | 0) % 4];
    return tone(GT.mixed, v * 0.85, x, y, 2.5);
  }
  if (Fj < 0.3) {
    if (He > 0.64 && n2 > 0.4) return tone(GT.heath, v + (n - 0.5) * 0.5, x, y, 2);
    return tone(GT.meadow, v, x, y, 2.5);
  }
  if (n < 0.025 + 0.07 * (1 - Cn)) return GT.leaf[((n * 997) | 0) % 4];
  return tone(GT.mixed, v, x, y, 2.5);
}

function stamps(p, ch) {
  const r = rng((hash2(ch.cx, ch.cy, 77) * 4294967296) >>> 0);
  const gl = T('#7b964c', '#93a858', '#aebc62'), gd = T('#2f4a30', '#3d5c36', '#52703c');
  const fl = T('#f2eee0', '#f0d050', '#b88ad0', '#e88aa0');
  for (let i = 0; i < 640; i++) {
    const x = (r() * CS) | 0, y = (r() * CS) | 0, h = r();
    if (x < 3 || y < 4 || x > CS - 4 || y > CS - 3) continue;
    const f = fields(ch.cx * CS + x, ch.cy * CS + y, ch.cabs), F = f[0], Cn = f[1], Wv = f[2], Tr = f[3];
    if (Wv < 0.7) { if (h < 0.14) { p.rect(x, y, 3, 2, C('#4e7a44')); p.set(x + 1, y, C('#6a9a50')); if (h < 0.04) p.set(x + 2, y - 1, C('#f2eee0')); } continue; }
    if (Wv < 1.5 || Tr < 1.2) { if (h < 0.25) { p.set(x, y, C('#9da19a')); p.set(x + 1, y, C('#787d7c')); p.set(x, y + 1, C('#50565a')); p.set(x + 1, y + 1, C('#50565a')); } continue; }
    const tuft = (cs) => { const c1 = cs[(r() * cs.length) | 0], c2 = cs[(r() * cs.length) | 0]; if (r() < 0.5) { p.set(x - 1, y - 1, c1); p.set(x, y, c1); p.set(x + 1, y - 1, c2); } else { p.set(x, y, c1); p.set(x, y - 1, c1); p.set(x - 1, y - 2, c2); p.set(x + 1, y - 2, c2); } };
    const pebble = () => { p.set(x, y, C('#979c94')); p.set(x + 1, y, C('#727876')); p.set(x, y + 1, C('#50565a')); };
    const twig = () => { const c = C('#5a4636'); p.set(x, y, c); p.set(x + 1, y, c); p.set(x + 2, y - 1, c); if (h * 77 % 1 < 0.5) p.set(x + 3, y - 1, c); };
    if (F < 0.3) {
      if (h < 0.5) tuft(gl);
      else if (h < 0.7) { const c = fl[(r() * 4) | 0]; p.set(x, y, C('#4a6a34')); if (r() < 0.25) { p.set(x, y - 2, c); p.set(x - 1, y - 1, c); p.set(x + 1, y - 1, c); p.set(x, y - 1, C('#f0d050')); } else p.set(x, y - 1, c); }
      else if (h < 0.76) pebble();
    } else if (F > 0.56 && Cn > 0.5) {
      if (h < 0.24) tuft(gd);
      else if (h < 0.32) { p.set(x, y, C('#f2eee0')); p.set(x - 1, y - 1, C('#d8402c')); p.set(x, y - 1, C('#f2eee0')); p.set(x + 1, y - 1, C('#d8402c')); p.set(x, y - 2, C('#d8402c')); }
      else if (h < 0.45) twig();
      else if (h < 0.5) pebble();
      else if (h < 0.57) { p.set(x, y, C('#6a4a30')); p.set(x, y - 1, C('#84603c')); }
    } else {
      if (h < 0.36) tuft(F > 0.45 ? gd : gl);
      else if (h < 0.6) { const c = GT.leaf[(r() * 4) | 0]; p.set(x, y, c); if (r() < 0.5) p.set(x + 1, y, c); }
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
  const nearCab = (x, y, d) => { for (const c of ch.cabs) if (hyp(x - c.x, y - c.y + 12) < d) return true; return false; };
  // trær
  const TC = 34;
  for (let gy = Math.floor(y0 / TC) - 1; gy * TC < y0 + CS; gy++) for (let gx = Math.floor(x0 / TC) - 1; gx * TC < x0 + CS; gx++) {
    const x = Math.round((gx + 0.12 + 0.76 * hash2(gx, gy, 101)) * TC), y = Math.round((gy + 0.12 + 0.76 * hash2(gx, gy, 102)) * TC);
    if (!inC(x, y)) continue;
    const f = fields(x, y, ch.cabs), F = f[0], Wv = f[2], Tr = f[3];
    if (Wv < 1.8 || Tr < 1.7 || nearCab(x, y, 62)) continue;
    if (hash2(gx, gy, 103) > smooth(0.2, 0.8, F) * 0.74 + 0.02) continue;
    const t = hash2(gx, gy, 104), cn = f[1] + (hash2(gx, gy, 107) - 0.5) * 0.18;
    let k;
    if (cn > 0.6) k = t < 0.76 ? 'spruce' : t < 0.9 ? 'pine' : t < 0.975 ? 'birch' : 'snag';
    else if (cn > 0.36) k = t < 0.26 ? 'spruce' : t < 0.62 ? 'pine' : t < 0.92 ? 'birch' : t < 0.98 ? 'rowan' : 'snag';
    else k = t < 0.7 ? 'birch' : t < 0.82 ? 'rowan' : t < 0.93 ? 'pine' : 'spruce';
    const o = { k, x, y, v: (hash2(gx, gy, 105) * SPR[k].length) | 0, ph: hash2(gx, gy, 106) * TAU, a: 1, r: SPR[k][0].r || 0 };
    if (G.cut.has(x + ',' + y)) toStump(o);
    ch.objs.push(o); ch.col.push(o);
  }
  // undervegetasjon
  const UC = 22;
  for (let gy = Math.floor(y0 / UC) - 1; gy * UC < y0 + CS; gy++) for (let gx = Math.floor(x0 / UC) - 1; gx * UC < x0 + CS; gx++) {
    const x = Math.round((gx + 0.1 + 0.8 * hash2(gx, gy, 201)) * UC), y = Math.round((gy + 0.1 + 0.8 * hash2(gx, gy, 202)) * UC);
    if (!inC(x, y)) continue;
    const f = fields(x, y, ch.cabs), F = f[0], Cn = f[1], Wv = f[2], Tr = f[3], He = f[4], h = hash2(gx, gy, 203);
    let k = null;
    if (Wv < 1) continue;
    if (Wv < 2) { if (h < 0.55 && !inBridge(ch.br, x, y, 3)) k = 'reed'; }
    else if (Tr < 1.4 || nearCab(x, y, 58)) continue;
    else if (F > 0.5 && Cn > 0.55) k = h < 0.15 ? 'fern' : h < 0.2 ? 'rock' : h < 0.22 ? 'stump' : h < 0.235 ? 'log' : h < 0.28 ? 'shrub' : h < 0.29 ? 'juniper' : null;
    else if (F > 0.45) k = h < 0.12 ? 'shrub' : h < 0.2 ? 'fern' : h < 0.24 ? 'rock' : h < 0.32 ? 'grassT' : h < 0.335 ? 'log' : h < 0.35 ? 'stump' : null;
    else if (F > 0.25) k = h < 0.07 ? 'juniper' : h < 0.15 ? 'shrub' : h < 0.23 ? (He > 0.55 ? 'heather' : 'grassT') : h < 0.28 ? 'rock' : h < 0.4 ? 'grassT' : null;
    else k = h < 0.3 ? 'grassT' : h < 0.42 ? (He > 0.6 ? 'heather' : 'grassT') : h < 0.45 ? 'rock' : h < 0.47 ? 'juniper' : null;
    if (!k) continue;
    const v = (hash2(gx, gy, 205) * SPR[k].length) | 0, s = SPR[k][v], o = { k, x, y, v, ph: 0, a: 1, r: s.r || 0 };
    ch.objs.push(o); if (o.r) ch.col.push(o);
  }
  for (const c of ch.cabs) if (inC(c.x, c.y)) { const o = { k: 'cabin', x: c.x, y: c.y, v: 0, ph: 0, a: 1, r: 0, rect: SPR.cabin[0].rect }; ch.objs.push(o); ch.col.push(o); }
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
  const p = new Pix(CS, CS), x0 = ch.cx * CS, y0 = ch.cy * CS, G = 4, N = CS / G + 1, NF = 6;
  const fl = new Float32Array(N * N * NF);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) fl.set(fields(x0 + i * G, y0 + j * G, ch.cabs), (j * N + i) * NF);
  const out = [0, 0, 0, 0, 0, 0];
  for (let y = 0; y < CS; y++) {
    const gy = y / G, j = gy | 0, v = gy - j;
    for (let x = 0; x < CS; x++) {
      const gx = x / G, i = gx | 0, u = gx - i, a = (j * N + i) * NF, b = a + NF, c = a + N * NF, d = c + NF;
      for (let k = 0; k < NF; k++) out[k] = lerp(lerp(fl[a + k], fl[b + k], u), lerp(fl[c + k], fl[d + k], u), v);
      p.d[y * CS + x] = groundColor(x0 + x, y0 + y, out);
    }
  }
  stamps(p, ch);
  paintBridges(p, ch);
  ch.ground = p.canvas(); ch.gpix = p.d; // pikslene leses også av 3D-siktet
}
function getChunk(cx, cy) {
  const key = cx + ',' + cy; let ch = chunks.get(key);
  if (!ch) { ch = genChunk(cx, cy); chunks.set(key, ch); }
  return ch;
}
// Behold biter rundt alle punktene (deg og de andre jegerne)
function evictChunks(pts) {
  for (const [k, ch] of chunks) if (!pts.some(p => Math.abs(ch.cx - Math.floor(p.x / CS)) <= 5 && Math.abs(ch.cy - Math.floor(p.y / CS)) <= 5)) chunks.delete(k);
}

// ---------- hogde trær ----------
// Et felt tre blir en stubbe. Nøkkelen er treets faste posisjon, så biten blir lik når den lages på nytt
function toStump(o) { o.v = (hash2(o.x, o.y, 9) * SPR.stump.length) | 0; o.k = 'stump'; o.r = SPR.stump[o.v].r; o.a = 1; }
function cutTree(x, y) {
  G.cut.add(x + ',' + y);
  const ch = chunks.get(Math.floor(x / CS) + ',' + Math.floor(y / CS)), o = ch && ch.objs.find(o => o.x === x && o.y === y && CHOP[o.k]);
  if (o) toStump(o);
}

// Kollisjon mot stammer, stein, hytte og bakveggen i gapahuker
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
    if (o.rect || !SPR[o.k][o.v].tall) continue;
    if (hyp(o.x - x0, o.y - y0) < 14 || hyp(o.x - x1, o.y - y1) < 5) continue;
    const t = clamp(((o.x - x0) * dx + (o.y - y0) * dy) / l2, 0, 1);
    if (hyp(x0 + dx * t - o.x, y0 + dy * t - o.y) < 2.5 && t < bt) { bt = t; best = o; }
  }
  return best;
}
