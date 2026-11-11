// ===== Sprites: all grafikk tegnes prosedyrisk som pikselkunst ved oppstart =====
const SPR = {};   // statiske ting i skogen, SPR[type][variant]
const ANI = {};   // dyr, ANI[art][kjønn][positur][bilde]
const HUN = {};   // jeger, HUN[retning][0][0]: stående, til ikoner
const FX = {};    // effekter
let ICON = {};    // butikk-ikoner

function mkSpr(p, ax, ay, opt) {
  const s = Object.assign({ c: p.canvas(), w: p.w, h: p.h, ax, ay, pix: p, _s: null }, opt || {});
  Object.defineProperty(s, 'sil', { get() { return this._s || (this._s = this.pix.sil(0xff1c1a0b).canvas()); } });
  return s;
}
function reg(kind, p, ax, ay, opt) { const s = mkSpr(p, ax, ay, opt); (SPR[kind] = SPR[kind] || []).push(s); return s; }

// Skyggelagt løvklase, lys fra øvre venstre
function leafBlob(p, cx, cy, rx, ry, tn, bias, seed, rag) {
  rag = rag || 0.28;
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy;
    if (d > 1 - hash2(x, y, seed) * rag) continue;
    const v = 0.5 - dx * 0.28 - dy * 0.5 + bias + (hash2(x >> 1, y >> 1, seed + 3) - 0.5) * 0.2;
    p.set(x, y, tone(tn, v, x, y, 2));
  }
}

// ---------- Trær ----------
function genSpruce(seed) {
  const r = rng(seed), H = 62 + ((r() * 36) | 0), W = 12 + ((r() * 7) | 0);
  const w = W * 2 + 8, h = H + 6, p = new Pix(w, h), cx = w >> 1, by = h - 3;
  const tn = T('#152c2c', '#1d4038', '#295642', '#39704e', '#548c5c');
  const bk = T('#2a1e1a', '#46322a', '#644a36');
  const th = 6 + ((r() * 4) | 0);
  for (let y = by - th - 5; y <= by; y++) { p.set(cx - 2, y, bk[1]); p.set(cx - 1, y, bk[2]); p.set(cx, y, bk[1]); p.set(cx + 1, y, bk[0]); }
  p.set(cx - 3, by, bk[1]); p.set(cx + 2, by, bk[0]);
  const top = by - H, fol0 = by - th, nT = Math.max(5, Math.round((fol0 - top) / 7.5)), step = (fol0 - top - 2) / (nT + 1.2);
  for (let t = 0; t < nT; t++) {
    const yb = fol0 - t * step, fr = 1 - t / nT, hw = 2.5 + (W - 2.5) * Math.pow(fr, 0.85), th2 = step * 2.2 + 2, ya = yb - th2, off = (r() - 0.5) * 1.6;
    for (let y = Math.floor(ya); y <= yb + 4; y++) {
      const f = clamp((y - ya) / th2, 0, 1), half = hw * Math.pow(f, 0.7);
      for (let x = Math.floor(cx + off - half - 1); x <= cx + off + half + 1; x++) {
        const nx = (x - cx - off) / hw;
        if (Math.abs(nx) * hw > half + (hash2(x, y, seed + 5) < 0.35 ? 0.7 : 0)) continue;
        const ymax = yb + nx * nx * 3 - ((hash2(x, t, seed) * 3) | 0);
        if (y > ymax) continue;
        const ff = clamp((f - 0.5) / 0.5, 0, 1);
        let v = 0.1 + ff * 0.56 - nx * 0.22 + (hash2(x >> 1, y >> 1, seed + 9) - 0.5) * 0.2;
        if (t === nT - 1) v += 0.28 * (1 - ff);
        if (y > ymax - 1.2) v += 0.14;
        p.set(x, y, tone(tn, v, x, y, 2));
      }
    }
  }
  p.set(cx, top - 1, tn[2]); p.set(cx, top, tn[3]);
  p.outlineAuto(0.5);
  return reg('spruce', p, cx, by, { r: 3, sway: 1, tall: 1 });
}

function genPine(seed) {
  const r = rng(seed), H = 70 + ((r() * 28) | 0), w = 66, h = H + 8, p = new Pix(w, h), cx = w >> 1, by = h - 3;
  const tn = T('#1b382b', '#294f35', '#3b6b3d', '#558847', '#78a457');
  const lo = T('#362924', '#564136', '#705648'), hi = T('#683a25', '#9c5933', '#c68049');
  const lean = (r() - 0.5) * 9, top = by - H + 13, tx = f => cx + lean * f * f;
  for (let y = by; y >= top; y--) {
    const f = (by - y) / (by - top), x = Math.round(tx(f)), wd = f < 0.08 ? 5 : f < 0.5 ? 4 : f < 0.8 ? 3 : 2;
    const bk = f < 0.42 + (hash2(y, 3, seed) - 0.5) * 0.12 ? lo : hi;
    for (let i = 0; i < wd; i++) {
      let c = i === 0 ? bk[1] : i === wd - 1 ? bk[0] : (i === 1 ? bk[2] : bk[1]);
      if (hash2(x + i, y, seed) < 0.12) c = bk[0];
      p.set(x - (wd >> 1) + i, y, c);
    }
  }
  const ccx = tx(1), ccy = top + 6, n = 6 + ((r() * 4) | 0), bl = [];
  for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()); bl.push({ x: ccx + Math.cos(a) * d * 14, y: ccy + Math.sin(a) * d * 9 - 2, rx: 7 + r() * 5, ry: 4.4 + r() * 2.4 }); }
  bl.push({ x: ccx, y: ccy - 3, rx: 10, ry: 6 });
  if (r() < 0.75) { const s = r() < 0.5 ? -1 : 1, f = 0.52 + r() * 0.16, y0 = by - (by - top) * f, x0 = tx(f); p.line(x0, y0, x0 + s * 9, y0 - 5, hi[0], 1); bl.push({ x: x0 + s * 11, y: y0 - 7, rx: 6 + r() * 2, ry: 3.4 + r() }); }
  bl.sort((a, b) => b.y - a.y);
  for (const b of bl) p.line(tx(0.92), top + 8, b.x, b.y + 1, hi[0], 1);
  bl.forEach((b, i) => leafBlob(p, b.x, b.y, b.rx, b.ry, tn, (i / bl.length - 0.5) * 0.32, seed + i * 7));
  p.outlineAuto(0.5);
  return reg('pine', p, cx, by, { r: 3, sway: 1, tall: 1 });
}

const BIRCH_TONES = [
  ['#8c5a1c', '#c08a24', '#e2b03a', '#f3d262', '#faeaa0'],
  ['#8c5a1c', '#c08a24', '#e2b03a', '#f3d262', '#faeaa0'],
  ['#7a3a1c', '#b45a24', '#dc8430', '#f0aa48', '#f8d080'],
  ['#5a6624', '#84962e', '#b2bc42', '#d6d866', '#ecec9c'],
  ['#2f5a2a', '#4a7a34', '#6a9a40', '#8cb850', '#b4d470'],
  ['#54401e', '#7a5e28', '#9c7e34', '#b89a48', '#ccb46c'],
];
// Hvilke toner bjørka har etter klimaet (se genChunk): [skogen rundt landsbyen, mot fjellet, i lavlandet]
const BIRCH_ZONE = [[0, 1, 2, 3], [5, 5, 5, 0], [4, 4, 3, 3, 0]];
function genBirch(seed, tones) {
  const r = rng(seed), H = 56 + ((r() * 28) | 0), w = 60, h = H + 8, p = new Pix(w, h), cx = w >> 1, by = h - 3;
  const tn = T(...tones), tk = T('#a29e90', '#d8d4c4', '#f2efe2'), mark = C('#2c2824');
  const lean = (r() - 0.5) * 8, top = by - H + 12, tx = f => cx + lean * f + Math.sin(f * 3 + seed) * 1.2;
  for (let y = by; y >= top; y--) {
    const f = (by - y) / (by - top), x = Math.round(tx(f)), wd = f < 0.12 ? 4 : f < 0.6 ? 3 : 2;
    for (let i = 0; i < wd; i++) p.set(x - (wd >> 1) + i, y, i === wd - 1 ? tk[0] : i === 0 ? tk[2] : tk[1]);
    if (hash2(y, 1, seed) < 0.3) { const mx = x - (wd >> 1) + ((hash2(y, 2, seed) * wd) | 0); p.set(mx, y, mark); if (hash2(y, 4, seed) < 0.5) p.set(mx + 1, y, mark); }
  }
  p.set(Math.round(tx(0)) - 2, by, mark); p.set(Math.round(tx(0)) + 2, by, mark);
  const ccx = tx(1), ccy = top + 4, n = 9 + ((r() * 5) | 0), bl = [];
  for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()); bl.push({ x: ccx + Math.cos(a) * d * 12, y: ccy + Math.sin(a) * d * 14 + 2, rx: 5 + r() * 4, ry: 4 + r() * 2.5 }); }
  bl.sort((a, b) => b.y - a.y);
  for (const b of bl) p.line(tx(0.8), by - (by - top) * 0.8, b.x, b.y, tk[0], 1);
  bl.forEach((b, i) => leafBlob(p, b.x, b.y, b.rx, b.ry, tn, (i / bl.length - 0.5) * 0.3, seed + i * 7, 0.45));
  for (let i = 0; i < 26; i++) { const a = r() * TAU, d = 0.85 + r() * 0.45, x = ccx + Math.cos(a) * d * 15, y = ccy + Math.sin(a) * d * 17 + 2; if (!p.get(Math.round(x), Math.round(y))) p.set(x, y, tn[1 + ((r() * 3) | 0)]); }
  p.outlineAuto(0.55, true);
  return reg('birch', p, cx, by, { r: 3, sway: 1, tall: 1 });
}

function genRowan(seed) {
  const r = rng(seed), H = 24 + ((r() * 12) | 0), p = new Pix(36, H + 8), cx = 18, by = H + 5;
  const tn = T('#5e2420', '#96382a', '#c8542c', '#e88a3c', '#f4b054'), bk = T('#2e2420', '#4a3a30');
  const lean = (r() - 0.5) * 5;
  for (let y = by; y >= by - H * 0.6; y--) { const f = (by - y) / (H * 0.6); p.set(cx + lean * f, y, bk[1]); if (f < 0.4) p.set(cx + lean * f + 1, y, bk[0]); }
  const ccx = cx + lean, ccy = by - H * 0.68, n = 4 + ((r() * 3) | 0), bl = [];
  for (let i = 0; i < n; i++) bl.push({ x: ccx + (r() - 0.5) * 14, y: ccy + (r() - 0.5) * 10, rx: 4.5 + r() * 3, ry: 3.5 + r() * 2 });
  bl.sort((a, b) => b.y - a.y);
  bl.forEach(b => p.line(ccx, by - H * 0.55, b.x, b.y, bk[1], 1));
  bl.forEach((b, i) => leafBlob(p, b.x, b.y, b.rx, b.ry, tn, (i / n - 0.5) * 0.3, seed + i * 3, 0.42));
  for (let i = 0; i < 5; i++) { const b = bl[(r() * bl.length) | 0], x = Math.round(b.x + (r() - 0.5) * b.rx), y = Math.round(b.y + b.ry * 0.5); p.set(x, y, C('#e8302a')); p.set(x + 1, y, C('#e8302a')); p.set(x, y + 1, C('#b01c1c')); }
  p.outlineAuto(0.5, true);
  return reg('rowan', p, cx, by, { r: 2, sway: 1 });
}

function genSnag(seed) {
  const r = rng(seed), H = 34 + ((r() * 20) | 0), p = new Pix(26, H + 7), cx = 13, by = H + 4;
  const tn = T('#3a3632', '#5c5850', '#807a6e', '#a09a8c');
  for (let y = by; y >= by - H; y--) { const f = (by - y) / H, wd = f < 0.1 ? 4 : f < 0.7 ? 3 : 2; for (let i = 0; i < wd; i++) p.set(cx - (wd >> 1) + i, y, tn[i === 0 ? 3 : i === wd - 1 ? 0 : (hash2(i, y, seed) < 0.2 ? 1 : 2)]); }
  p.set(cx - 1, by - H - 1, tn[2]);
  for (let i = 0; i < 3; i++) { const y0 = by - H * (0.4 + r() * 0.5), s = r() < 0.5 ? -1 : 1, len = 3 + r() * 5; p.line(cx + s, y0, cx + s * (1 + len), y0 - len * 0.6, tn[1], 1); }
  p.outlineAuto(0.5);
  return reg('snag', p, cx, by, { r: 3 });
}

// ---------- Busker, stein og småting ----------
function genJuniper(seed) {
  const r = rng(seed), H = 14 + ((r() * 11) | 0), p = new Pix(18, H + 6), cx = 9, by = H + 3;
  const tn = T('#1c3436', '#284a48', '#36625a', '#4e8270', '#6a9c84');
  for (let y = by - H; y <= by; y++) {
    const f = (y - (by - H)) / H, half = 1 + 4 * Math.sin(Math.PI * (0.1 + 0.75 * f));
    for (let x = Math.floor(cx - half - 1); x <= cx + half + 1; x++) {
      const nx = (x - cx) / half; if (Math.abs(nx) > 1 - hash2(x, y, seed) * 0.35) continue;
      p.set(x, y, tone(tn, 0.52 - nx * 0.4 - (f - 0.5) * 0.3 + (hash2(x >> 1, y >> 1, seed + 2) - 0.5) * 0.25, x, y, 2));
    }
  }
  for (let i = 0; i < 3; i++) { const x = cx + (((r() - 0.5) * 6) | 0), y = by - 2 - ((r() * (H - 6)) | 0); if (p.get(x, y)) p.set(x, y, C('#3c4c84')); }
  p.outlineAuto(0.5);
  return reg('juniper', p, cx, by, { r: 2 });
}
function genFern(seed, tones) {
  const r = rng(seed), p = new Pix(26, 17), cx = 13, by = 14, tn = T(...tones), n = 6 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.12 + 0.76 * (i + r() * 0.6) / n), len = 7 + r() * 4;
    for (let t = 0; t <= 1.001; t += 1 / len) {
      const x = cx + Math.cos(a) * len * t, y = by - Math.sin(a) * len * t * 0.85 + t * t * 3.2, ti = Math.min(tn.length - 1, (t * tn.length) | 0);
      p.set(x, y, tn[ti]);
      if (t > 0.2) p.set(x, y + ((((t * len) | 0) & 1) ? -1 : 1), tn[Math.max(0, ti - 1)]);
    }
  }
  p.clipBelow(by);
  p.outlineAuto(0.5, true);
  return reg('fern', p, cx, by, {});
}
function genShrub(kind, seed, tones, berry) {
  const r = rng(seed), p = new Pix(28, 17), cx = 14, by = 14, tn = T(...tones), n = 3 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) leafBlob(p, cx + (r() - 0.5) * 12, by - 3 - r() * 3, 4 + r() * 3.5, 2.6 + r() * 1.8, tn, (i / n - 0.5) * 0.3, seed + i * 5, 0.4);
  p.clipBelow(by);
  if (berry) for (let i = 0; i < 6; i++) { const x = cx + (((r() - 0.5) * 14) | 0), y = by - 2 - ((r() * 5) | 0); if (p.get(x, y)) p.set(x, y, C(berry)); }
  p.outlineAuto(0.5, true);
  return reg(kind, p, cx, by, {});
}
function genGrassT(seed) {
  const r = rng(seed), p = new Pix(16, 16), cx = 8, by = 13, tn = T('#5c6c30', '#8c9a40', '#bcb858', '#dcd078'), n = 6 + ((r() * 4) | 0);
  for (let i = 0; i < n; i++) { const bx = cx + (r() - 0.5) * 7, len = 5 + r() * 6, lean = (r() - 0.5) * 5; for (let t = 0; t <= 1; t += 1 / len) p.set(bx + lean * t * t, by - len * t, tn[Math.min(3, (t * 4) | 0)]); }
  return reg('grassT', p, cx, by, { nosh: 1 });
}
function genReed(seed) {
  const r = rng(seed), p = new Pix(14, 23), cx = 7, by = 20, g1 = T('#3c5a34', '#58783e', '#7a9648'), n = 4 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const bx = cx + (r() - 0.5) * 9, len = 9 + r() * 8, lean = (r() - 0.5) * 4;
    for (let t = 0; t <= 1; t += 1 / len) p.set(bx + lean * t * t, by - len * t, g1[Math.min(2, (t * 3) | 0)]);
    if (r() < 0.6) { const tx = bx + lean, ty = by - len; p.set(tx, ty, C('#5a3a24')); p.set(tx, ty + 1, C('#7a5030')); p.set(tx, ty + 2, C('#5a3a24')); }
  }
  return reg('reed', p, cx, by, { nosh: 1 });
}
function genRock(seed, rx, ry) {
  const r = rng(seed), w = rx * 2 + 6, h = ry * 2 + 5, p = new Pix(w, h), cx = w / 2, by = h - 3, cy = by - ry * 0.8;
  const tn = T('#34383c', '#50565a', '#727876', '#979c94', '#b4b8ac'), ms = T('#4e6a30', '#6a8a3a', '#8aa648');
  const fac = []; for (let i = 0; i < 7; i++) fac.push(0.82 + r() * 0.3);
  for (let y = 0; y <= by; y++) for (let x = 0; x < w; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, an = Math.atan2(dy, dx), k = fac[((an + Math.PI) / TAU * 7) | 0] || 1;
    if (Math.pow(Math.abs(dx), 2.3) + Math.pow(Math.abs(dy), 2.3) > k) continue;
    const v = 0.5 - dx * 0.28 - dy * 0.5 + (k - 0.95) * 0.6 + (hash2(x >> 1, y >> 1, seed) - 0.5) * 0.12;
    let c = tone(tn, v, x, y, 2.5);
    if (dy < -0.3 + (hash2(x >> 2, y >> 1, seed + 2) - 0.5) * 0.5 && hash2(x >> 1, y, seed + 4) < 0.75) c = tone(ms, v, x, y, 2);
    p.set(x, y, c);
  }
  p.outlineAuto(0.5);
  return reg('rock', p, Math.round(cx), by, { r: Math.max(2, rx - 2) });
}
function genStump(seed) {
  const p = new Pix(14, 14), bk = T('#34261e', '#4e3a2c', '#66503a'), top = T('#a8845a', '#c8a474', '#dcc090'), r = rng(seed);
  for (let y = 5; y <= 11; y++) for (let x = 3; x <= 10; x++) p.set(x, y, x < 5 ? bk[2] : x > 8 ? bk[0] : bk[1]);
  p.set(2, 11, bk[1]); p.set(11, 11, bk[0]);
  p.ell(6.5, 4.6, 3.9, 1.9, (x, y, dx, dy) => tone(top, 0.6 - dx * 0.3 - dy * 0.2, x, y, 2));
  p.set(6, 4, top[0]); p.set(7, 5, top[0]);
  if (r() < 0.7) { p.set(3, 7, C('#6a8a3a')); p.set(4, 8, C('#6a8a3a')); p.set(3, 8, C('#4e6a30')); }
  p.outlineAuto(0.5);
  return reg('stump', p, 7, 12, { r: 3 });
}
function genLog(seed) {
  const r = rng(seed), L = 22 + ((r() * 10) | 0), p = new Pix(L + 9, 15);
  const bk = T('#34261e', '#4e3a2c', '#66503a', '#7c6448'), ms = T('#4e6a30', '#6a8a3a', '#8aa648');
  for (let x = 4; x < 4 + L; x++) for (let y = 5; y <= 11; y++) {
    const dy = (y - 8) / 3.5; let c = tone(bk, 0.55 - dy * 0.5 + (hash2(x >> 2, y, seed) - 0.5) * 0.2, x, y, 2);
    if (y <= 6 && hash2(x >> 1, y, seed + 1) < 0.55) c = ms[(hash2(x, y, seed + 2) * 3) | 0];
    p.set(x, y, c);
  }
  p.ell(4 + L, 8, 2, 3.4, C('#c8a474')); p.set(4 + L, 8, C('#a8845a'));
  const sx = 8 + ((r() * 8) | 0); p.line(sx, 5, sx + 1, 2, bk[1], 1);
  if (r() < 0.6) { const mx = 6 + ((r() * (L - 6)) | 0); p.set(mx, 4, C('#d8402c')); p.set(mx + 1, 4, C('#d8402c')); p.set(mx, 3, C('#f0ece0')); }
  p.outlineAuto(0.5);
  return reg('log', p, (L + 9) >> 1, 12, {});
}

// ---------- Landemerker: varde, bautastein og jakttårn ----------
const STONE = () => T('#34383c', '#50565a', '#727876', '#979c94', '#b4b8ac');
function genCairn() {
  const p = new Pix(20, 25), tn = STONE();
  [[10, 20, 7, 3], [9, 16, 5.6, 2.6], [11, 12.4, 4.6, 2.4], [10, 9, 3.4, 2], [10.4, 6, 2.5, 1.7], [10, 3.4, 1.5, 1.3]].forEach(([cx, cy, rx, ry], i) =>
    p.ell(cx, cy, rx, ry, (x, y, dx, dy) => dy > 0.5 ? tn[0] : tone(tn, 0.6 - dx * 0.3 - dy * 0.4 + (hash2(x >> 1, y, 40 + i) - 0.5) * 0.2, x, y, 2.5)));
  p.outlineAuto(0.5);
  return reg('cairn', p, 10, 23, { r: 6 });
}
function genBauta() {
  const p = new Pix(14, 33), tn = STONE(), ms = T('#4e6a30', '#6a8a3a', '#8aa648');
  for (let y = 2; y <= 30; y++) {
    const f = (y - 2) / 28, hw = lerp(1.6, 3.6, Math.pow(f, 0.7)), cx = 7 + Math.sin(f * 2) * 0.8;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
      let c = tone(tn, 0.62 - (x - cx) / hw * 0.38 + (hash2(x, y >> 1, 51) - 0.5) * 0.22, x, y, 2.5);
      if (f > 0.8 && hash2(x, y, 52) < (f - 0.75) * 2.4) c = ms[(hash2(x, y, 53) * 3) | 0];
      p.set(x, y, c);
    }
  }
  p.outlineAuto(0.5);
  return reg('bauta', p, 7, 31, { r: 4 });
}
// Skigard rundt åkeren og hagene i landsbyen: variant 0 går øst–vest, variant 1 nord–sør (sett ovenfra på kartet)
function genFence() {
  const wd = T('#3a3632', '#57514a', '#766e62', '#989080', '#b4ac98');
  let p = new Pix(16, 13);
  for (let k = -2; k <= 3; k++) { p.line(k * 5 - 2, 11, k * 5 + 8, 4, wd[2], 1); p.line(k * 5 - 2, 10, k * 5 + 8, 3, wd[3], 1); }
  for (const x of [3, 11]) { p.line(x, 12, x, 1, wd[1], 1); p.line(x + 1, 12, x + 1, 1, wd[4], 1); }
  p.outlineAuto(0.5);
  reg('fence', p, 8, 12, {});
  p = new Pix(5, 28);
  for (let y = 2; y <= 27; y++) for (let x = 1; x <= 3; x++) p.set(x, y, y % 4 === 0 ? wd[1] : wd[5 - x]);
  for (const y of [1, 9, 17]) { p.rect(1, y, 3, 2, wd[4]); p.rect(1, y + 2, 3, 1, wd[0]); }
  p.outlineAuto(0.5);
  reg('fence', p, 2, 19, {});
  // variant 2 og 3 går på skrå (12 px bort og 12 px ned): 2 ned mot høyre, 3 ned mot venstre
  for (const mir of [0, 1]) {
    p = new Pix(15, 27);
    const X = x => mir ? 14 - x : x;
    for (let k = -1; k <= 3; k++) { p.line(X(k * 4 - 2), 12 + k * 4 + 1, X(k * 4 + 5), 12 + k * 4 - 6, wd[2], 1); p.line(X(k * 4 - 1), 12 + k * 4 + 1, X(k * 4 + 6), 12 + k * 4 - 6, wd[3], 1); }
    for (const [x, y] of [[1, 13], [7, 19], [13, 25]]) { p.line(X(x), y, X(x), y - 11, wd[1], 1); p.set(X(x), y - 11, wd[4]); }
    p.outlineAuto(0.5);
    reg('fence', p, 7, 19, {});
  }
}
// Palisaden rundt landsbyen: tette, spisse stokker bundet sammen med to tverrstokker. Variantene som skigarden:
// 0 øst–vest, 1 nord–sør, 2 på skrå ned mot høyre og 3 ned mot venstre
const PALW = () => T('#2a2018', '#44342a', '#5a4836', '#74604a', '#8e785c');
function genPalisade() {
  const wd = PALW(), cut = C('#b89e76'), band = C('#241a14');
  // en stokk 4 px bred med foten i (x, yb) og spissen h over
  const stake = (p, x, yb, h, X = q => q) => {
    for (let y = yb - h + 1; y <= yb; y++) for (let i = 0; i < 4; i++) p.set(X(x + i), y, y - (yb - h) === 9 || y - (yb - h) === 19 ? band : wd[[4, 3, 2, 1][i] - (hash2(x, y >> 2, 71) < 0.2 ? 1 : 0)]);
    p.set(X(x), yb - h + 1, 0); p.set(X(x + 3), yb - h + 1, 0); p.set(X(x + 1), yb - h + 1, cut); p.set(X(x + 2), yb - h + 1, wd[3]); p.set(X(x), yb - h + 2, cut);
  };
  let p = new Pix(16, 30);
  for (let i = 0; i < 4; i++) stake(p, i * 4, 28, 25 + (i & 1));
  p.outlineAuto(0.5); reg('pal', p, 8, 28, { tallC: 1 });
  p = new Pix(6, 46);
  for (let i = 0; i < 4; i++) stake(p, 1, 32 + i * 4, 25 + (i & 1));
  p.outlineAuto(0.5); reg('pal', p, 3, 37, {});
  for (const mir of [0, 1]) {
    p = new Pix(15, 42);
    for (let i = 0; i < 4; i++) stake(p, 1 + i * 3, 30 + i * 3, 25 + (i & 1), q => mir ? 14 - q : q);
    p.outlineAuto(0.5); reg('pal', p, 7, 35, {});
  }
}
// Portene i palisaden (GATES): kraftige stolper med jernbånd og fakler, bjelke med spontak over, og portblad som står
// åpne innover. Der veien går nord–sør ses porten forfra (ett bilde); der den går øst–vest ses den fra siden, som en
// stolpe i nord med portbladet og en i sør med bjelken mellom dem (det søndre bladet ville dekket åpningen)
function genGates() {
  const wd = PALW(), ir = C('#24211e'), fl = [C('#ffe08a'), C('#f08a2c')];
  const post = (p, x, y0, y1, X = q => q) => {
    for (let y = y0; y <= y1; y++) for (let i = 0; i < 7; i++) p.set(X(x + i), y, (y - y0) % 14 === 9 ? ir : wd[i < 2 ? 4 : i < 5 ? 3 : i < 6 ? 2 : 1]);
    // fakkel
    p.rect(X(x + 3), y0 + 14, 1, 4, ir); p.set(X(x + 3), y0 + 13, fl[1]); p.set(X(x + 3), y0 + 12, fl[0]); p.set(X(x + 3), y0 + 11, fl[1]);
  };
  // portblad sett forfra (w bredt) med jernbånd
  const leaf = (p, x, y0, y1, w, X = q => q) => { for (let y = y0; y <= y1; y++) for (let i = 0; i < w; i++) p.set(X(x + i), y, y === y0 + 4 || y === y1 - 4 ? ir : i % 4 === 3 ? wd[1] : wd[2 + (hash2(i >> 2, 3, 73) * 2 | 0)]); };
  for (const g of GATES) {
    if (!g.vert) {
      const W = g.w + 14, p = new Pix(W, 50), yb = 47;
      leaf(p, 8, 22, yb, 4); leaf(p, W - 12, 22, yb, 4);
      post(p, 1, 12, yb); post(p, W - 8, 12, yb);
      for (let y = 10; y <= 16; y++) for (let x = 0; x < W; x++) p.set(x, y, y === 10 ? wd[4] : y === 16 ? wd[0] : x % 9 === 4 ? wd[1] : wd[3 - (y > 13 ? 1 : 0)]);
      for (let y = 3; y <= 9; y++) for (let x = 9 - y - 2; x < W - (9 - y - 2); x++) p.set(x, y, y === 9 ? wd[0] : (x + y * 2) % 4 === 0 ? wd[0] : wd[y < 5 ? 2 : 1]);
      p.outlineAuto(0.45);
      reg('gate', p, W >> 1, yb, { tallC: 1, glow: [[-(g.w >> 1) - 3, -34, 0.22], [(g.w >> 1) + 3, -34, 0.22]] });
    } else {
      // g.in: 1 når landsbyen ligger mot øst (portbladene står da mot høyre), ellers −1
      const X = q => g.in > 0 ? q : 23 - q, ax = X(4), L = g.w + 4;
      let p = new Pix(24, 50);
      leaf(p, 8, 22, 47, 14, X); post(p, 1, 12, 47, X);
      p.outlineAuto(0.45); reg('gate', p, ax, 47, { glow: [[0, -34, 0.22]] });
      p = new Pix(24, 50 + L);
      post(p, 1, 12 + L, 47 + L, X);
      for (let y = 8; y <= 15 + L; y++) for (let i = 0; i < 9; i++) p.set(X(i), y, i === 0 || i === 8 ? wd[0] : y % 7 === 3 ? wd[1] : wd[i < 4 ? 4 : 3]);
      p.outlineAuto(0.45); reg('gate', p, ax, 47 + L, { glow: [[0, -34, 0.22]] });
    }
  }
}
function genTower() {
  const p = new Pix(36, 63), wd = T('#38281e', '#4c3628', '#5f4632', '#7a5c40', '#8e6e4a'), rf = T('#3e4246', '#5a6062', '#7e8482');
  // bein med kryssavstivere, og stigen opp i midten
  p.line(8, 52, 26, 38, wd[0], 1); p.line(27, 52, 9, 38, wd[0], 1); p.line(10, 36, 24, 26, wd[0], 1); p.line(25, 36, 11, 26, wd[0], 1);
  p.line(7, 60, 12, 24, wd[1], 2); p.line(28, 60, 23, 24, wd[2], 2);
  p.line(16, 60, 16, 24, wd[3], 1); p.line(20, 60, 20, 24, wd[3], 1); for (let y = 57; y > 24; y -= 4) p.rect(17, y, 3, 1, wd[4]);
  // golv, plankevegger med skyteluke, og tak
  p.rect(7, 22, 22, 2, wd[3]); p.rect(7, 24, 22, 1, wd[0]);
  for (let y = 10; y <= 21; y++) for (let x = 9; x <= 26; x++) p.set(x, y, (x - 9) % 4 === 3 ? wd[0] : wd[1 + ((hash2(x >> 2, y >> 1, 61) * 2) | 0)]);
  p.rect(11, 13, 14, 4, C('#141210')); p.rect(11, 17, 14, 1, wd[4]);
  for (let y = 5; y <= 9; y++) { const k = 9 - y; p.rect(6 + k, y, 24 - 2 * k, 1, y === 9 ? wd[0] : rf[Math.min(2, k >> 1)]); }
  p.outlineAuto(0.45);
  return reg('tower', p, 18, 61, { r: 7, tallC: 1 });
}
// Folkene som står ved husene (se genHunter): fargene til landhandleren, børsemakeren, viltmottakeren, grunneieren,
// verten på utpostene og smeden. NPC_V gir hvem som hører til hvilket slags sted; koiene er ubetjente
const NPC_PAL = [
  { hat: '#6a4a32', hatD: '#4a3222', hatL: '#84603c', band: '#4a3222', jac: '#b8a888', jacD: '#8a7c62', jacL: '#d0c4a4', pant: '#3c3a44', pantD: '#2a2832', packD: '#8a7c62', beard: '#8a8a84' },
  { hat: '#2c2c30', hatD: '#1c1c20', hatL: '#44444a', band: '#1c1c20', jac: '#4a4e58', jacD: '#34363e', jacL: '#62666e', packD: '#6a4a32', beard: '#3a2a20' },
  { hat: '#e0dcd0', hatD: '#b4b0a4', hatL: '#f4f0e6', band: '#b4b0a4', jac: '#e0dcd0', jacD: '#b4b0a4', jacL: '#f4f0e6', packD: '#b4b0a4', beard: '#e4b48c' },
  { hat: '#4a4a40', hatD: '#32322c', hatL: '#62625a', band: '#2c2c2c', jac: '#8c3a2c', jacD: '#642820', jacL: '#aa5040', pant: '#3a3e30', pantD: '#2a2e22', packD: '#642820', beard: '#c8c0b0' },
  { hat: '#7a2c24', hatD: '#561e18', hatL: '#983c32', band: '#561e18', jac: '#3f5a6c', jacD: '#2c4252', jacL: '#567488', packD: '#2c4252', beard: '#6b4a30' },
  // smeden: svart lue og brunt skinnforkle
  { hat: '#2a2826', hatD: '#1a1816', hatL: '#3e3c38', band: '#1a1816', jac: '#7a5234', jacD: '#563822', jacL: '#96683f', pant: '#34322e', pantD: '#242220', packD: '#563822', beard: '#2c2420' },
];
const NPC_V = { store: 0, gun: 1, game: 2, farm: 3, post: 4, smith: 5, stable: 3, pub: 4 };

// Folk som går rundt i landsbyen (se VILL i 05-game.js): bakeren, smedgutten, bonden, kona ved
// brønnen, presten, to som møtes på torget, vedhoggeren, en som rusler gata og en ved nordgrinda, og de to som står i bodene
const SKIN = '#e4b48c';
const VIL_PAL = [
  { civ: 1, cap: 1, hat: '#f0ece2', hatD: '#d0ccc0', hatL: '#ffffff', band: '#f0ece2', jac: '#e6e0d2', jacD: '#bcb6a6', jacL: '#f6f2e8', pant: '#8a8274', pantD: '#6c6658', apron: '#f8f4ea', beard: '#8a5a34' },
  { civ: 1, cap: 1, hat: '#5a4634', hatD: '#40301f', hatL: '#72593f', band: '#5a4634', jac: '#6e6a64', jacD: '#4e4a46', jacL: '#8a867e', pant: '#3a3632', pantD: '#2a2724', apron: '#5c3c24', beard: SKIN, hair: '#5a3a22' },
  { civ: 1, hat: '#d8b860', hatD: '#a88a3c', hatL: '#ecd488', band: '#7a5a2c', jac: '#4a6a8c', jacD: '#344e6a', jacL: '#628aac', pant: '#5c4a36', pantD: '#443626', beard: '#b0a898' },
  { civ: 1, cap: 1, hat: '#b03a2e', hatD: '#842a20', hatL: '#cc5244', band: '#b03a2e', jac: '#3e5a84', jacD: '#2c4264', jacL: '#56749e', dress: '#3e5a84', apron: '#e8e2d2', beard: SKIN, hair: '#7a4a28' },
  { civ: 1, hat: '#1e1c1c', hatD: '#121010', hatL: '#34302e', band: '#1e1c1c', jac: '#242224', jacD: '#161416', jacL: '#3a383a', pant: '#1e1c1e', pantD: '#141214', dress: '#242224', beard: '#c8c4bc' },
  { civ: 1, cap: 1, hat: '#ece6d6', hatD: '#c4beae', hatL: '#fbf8f0', band: '#ece6d6', jac: '#4e7a4a', jacD: '#385a36', jacL: '#689660', dress: '#4e7a4a', beard: SKIN, hair: '#c8a050' },
  { civ: 1, cap: 1, hat: '#6a6a66', hatD: '#4a4a48', hatL: '#868682', band: '#4a4a48', jac: '#7a5a3c', jacD: '#5a402a', jacL: '#96724c', pant: '#44423e', pantD: '#302e2c', beard: '#4a3424' },
  { civ: 1, cap: 1, hat: '#a03428', hatD: '#74241c', hatL: '#bc4a3c', band: '#a03428', jac: '#8c8880', jacD: '#66625c', jacL: '#a8a49a', pant: '#4c3f32', pantD: '#382e26', beard: '#7a4a28' },
  { civ: 1, hat: '#4a5a44', hatD: '#34422f', hatL: '#62745a', band: '#2c2c2c', jac: '#8a6e44', jacD: '#66502f', jacL: '#a6885a', pant: '#3c3a44', pantD: '#2a2832', beard: '#2c2420' },
  { civ: 1, cap: 1, hat: '#34404c', hatD: '#242e38', hatL: '#4a5866', band: '#34404c', jac: '#5a3a34', jacD: '#402824', jacL: '#744e46', pant: '#34322e', pantD: '#242220', beard: '#8a8a84' },
  { civ: 1, cap: 1, hat: '#d8a83c', hatD: '#a87e28', hatL: '#ecc460', band: '#d8a83c', jac: '#8c3a34', jacD: '#642824', jacL: '#aa5048', dress: '#8c3a34', apron: '#e8e2d2', beard: SKIN, hair: '#3a2a20' },
  { civ: 1, cap: 1, hat: '#3a4e6a', hatD: '#28384e', hatL: '#506886', band: '#3a4e6a', jac: '#c8c0a8', jacD: '#9c947e', jacL: '#e0d8c0', pant: '#3a3e4a', pantD: '#282c36', apron: '#6a7c84', beard: '#a04a22' },
];

// ---------- Hus ----------
// Hvert slags hus har sitt eget utseende (HOUSE_STYLE): vegg (wall: laft, stående panel, gråstein eller bindingsverk, i
// fargen wc), tak (torv, tegl, skifer eller halm), grunnflate (L × D, mønet går langs L) og hvor døra står: midt på
// langveggen, eller i gavlen (end). På kartet tegnes husene på skrå ovenfra, dreid slik de står (genHouseTop og
// genChurchTop, se houseV); i 3D ses de rett forfra (genHouse og genChurch, der sign, gable, dx, win og side brukes).
// CABIN_V gir stilen for hvert slags hus (se PLACES og HOUSES)
const WALLC = {
  log: ['#38281e', '#4c3628', '#5f4632', '#7a5c40'], tar: ['#221915', '#32251e', '#43342a', '#58463a'],
  ochre: ['#8a6a2c', '#ac8838', '#c6a248', '#dcbc62'], red: ['#5a1e16', '#7a2a1e', '#963828', '#b04c38'],
  yellow: ['#a8843a', '#caa64a', '#e0c060', '#f0d880'], white: ['#9c988c', '#c4c0b4', '#dcd8cc', '#f0ece2'],
  blue: ['#3a4e5c', '#4e6676', '#648090', '#80a0ae'], stone: ['#3e4246', '#5a6062', '#7e8482', '#a2a69e'],
  plaster: ['#b09c78', '#cdb890', '#e0cea6', '#eedfba'],
};
const ROOFC = {
  turf: ['#38562e', '#4a6c36', '#60863e', '#7a9e48', '#96b256'], tile: ['#6a281c', '#8a3824', '#a8482e', '#c05e3a', '#d67a4a'],
  slate: ['#2a3036', '#3a424a', '#4e5860', '#667076', '#828a8e'], thatch: ['#6e5424', '#927230', '#b08e40', '#c8aa56', '#dcc474'],
};
const HOUSE_STYLE = [
  { id: 'store', sign: 'BUA', wall: 'panel', wc: 'ochre', roof: 'tile', awn: 1, side: 'crates', flowers: 1, L: 52 },
  { id: 'gun', sign: 'VÅPEN', wall: 'log', wc: 'tar', roof: 'slate', antler: 1, side: 'wood' },
  { id: 'game', sign: 'VILT', wall: 'panel', wc: 'red', roof: 'slate', side: 'rack' },
  { id: 'farm', sign: 'GARD', wall: 'log', wc: 'log', roof: 'thatch', side: 'wood', flowers: 1, L: 54, D: 34 },
  { id: 'koie', sign: 'KOIE', wall: 'log', wc: 'log', roof: 'turf', side: 'wood', antler: 1, flowers: 1, L: 44, D: 30 },
  { id: 'smith', sign: 'SMIE', wall: 'stone', wc: 'stone', roof: 'slate', forge: 1, side: 'barrel', D: 34 },
  { id: 'post', sign: 'BUA', wall: 'log', wc: 'log', roof: 'turf', side: 'wood', antler: 1, flowers: 1 },
  { id: 'stable', sign: 'STALL', wall: 'panel', wc: 'red', roof: 'turf', side: 'barrel', L: 54 },
  { id: 'pub', sign: 'PUB', wall: 'frame', wc: 'plaster', roof: 'tile', side: 'barrel', flowers: 1, L: 44, D: 30 },
  { id: 'bakery', sign: 'BAKER', wall: 'frame', wc: 'plaster', roof: 'thatch', gable: 1, bread: 1 },
  { id: 'home0', wall: 'panel', wc: 'red', roof: 'slate', gable: 1, end: 1, L: 44, D: 30, dx: 33, win: [[13, 47, 13, 12], [52, 47, 13, 12]], flowers: 1 },
  { id: 'home1', wall: 'panel', wc: 'yellow', roof: 'tile', dx: 46, win: [[13, 46, 19, 14]], flowers: 1, door: '#3e5a44' },
  { id: 'home2', wall: 'panel', wc: 'white', roof: 'tile', gable: 1, end: 1, L: 44, D: 30, dx: 33, win: [[13, 47, 13, 12], [52, 47, 13, 12]], door: '#3a5670' },
  { id: 'home3', wall: 'panel', wc: 'blue', roof: 'turf', side: 'wood', flowers: 1, L: 44 },
  { id: 'home4', wall: 'frame', wc: 'plaster', roof: 'thatch', gable: 1, end: 1, L: 42, D: 30, dx: 33, win: [[13, 47, 13, 12], [52, 47, 13, 12]] },
  { id: 'home5', wall: 'stone', wc: 'stone', roof: 'thatch', side: 'wood', L: 46, door: '#6a452c' },
];
const CABIN_V = { church: HOUSE_STYLE.length };
HOUSE_STYLE.forEach((s, i) => CABIN_V[s.id] = i);
const GLYPH = { A: '010101111101101', B: '110101110101110', D: '110101101101110', E: '111100110100111', G: '011100101101011', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101',
  N: '110101101101101', O: '111101101101111', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', 'Å': '010010101111101' };
const mod = (a, n) => ((a % n) + n) % n;
// Fargen på veggen i (u, v) piksler fra hjørnet oppe til venstre: laft, stående panel, gråstein eller bindingsverk
function wallPix(kind, wc, u, v) {
  if (kind === 'log') { const rr = mod(v, 4); return rr !== 3 && hash2(u >> 2, v >> 2, 9) < 0.08 ? wc[1] : wc[[3, 2, 1, 0][rr]]; }
  if (kind === 'panel') return mod(u, 4) === 3 ? wc[0] : wc[1 + ((hash2(u >> 2, 3, 12) * 2.6) | 0)];
  if (kind === 'stone') { const row = Math.floor(v / 4), uu = u + (row & 1) * 3; return mod(v, 4) === 3 || mod(uu, 6) === 5 ? wc[0] : wc[1 + ((hash2(Math.floor(uu / 6), row, 14) * 3) | 0)]; }
  // bindingsverk: lys puss mellom mørke stolper og bjelker
  if (mod(u, 21) < 2 || v === 0 || v === 1 || v === -13 || v === -12) return C('#4c3628');
  return wc[1 + ((hash2(u >> 1, v >> 1, 16) * 2.4) | 0)];
}
// Taket i (x, y), f fra mønet (0) til raftet (1): torv, halm, tegl eller skifer
function roofPix(kind, rc, x, y, f) {
  if (kind === 'thatch') return mod(y, 7) === 6 && hash2(x >> 1, y, 38) < 0.8 ? rc[1] : tone(rc, 0.8 - f * 0.4 + (hash2(x, y >> 2, 37) - 0.5) * 0.45, x, y, 2);
  if (kind === 'turf') return tone(rc, 0.78 - f * 0.5 + (hash2(x >> 1, y >> 1, 31) - 0.5) * 0.36, x, y, 2);
  const row = Math.floor(y / 3), k = kind === 'tile' ? 4 : 6;
  if (mod(y, 3) === 2 || mod(x + row * (k >> 1), k) === 0) return rc[f > 0.6 ? 0 : 1];
  return tone(rc, 0.85 - f * 0.45 + (hash2(Math.floor((x + row * (k >> 1)) / k), row, 33) - 0.5) * 0.3, x, y, 3);
}
// Vindu med lys i, sprosser og vinduskarm; hot er gløden fra essa i smia
function drawWindow(p, x, y, w, h, hot) {
  p.rect(x, y, w, h, C('#d6c69c')); p.rect(x + 1, y + 1, w - 2, h - 2, C(hot ? '#e8742c' : '#f0bc50')); p.rect(x + 1, y + 1, w - 2, 3, C(hot ? '#f8b050' : '#f8dc88'));
  p.rect(x + (w >> 1), y + 1, 1, h - 2, C('#d6c69c')); p.rect(x + 1, y + (h >> 1), w - 2, 1, C('#d6c69c'));
  p.rect(x, y + h, w, 2, C('#48301f'));
}
function genHouse(st) {
  const w = 86, h = 76, p = new Pix(w, h), bx = 7, bw = 64, wy0 = 38, wy1 = 67, mx = 39, dx = st.dx || 20;
  const wc = T(...WALLC[st.wc]), rc = T(...ROOFC[st.roof]), stn = T(...WALLC.stone), trim = C(st.wc === 'white' ? '#7e8e98' : '#f0ece2');
  const wins = st.win || [[41, 46, 19, 14]], glow = [[dx - 4 - mx, 51 - 68, 0.2]];
  // pipe; smia har en bred pipe med glør i toppen
  const cx0 = st.gable ? 54 : st.forge ? 50 : 55, cx1 = st.gable ? 59 : 61, cy0 = st.gable ? 12 : 3;
  for (let y = cy0; y <= cy0 + 14; y++) for (let x = cx0; x <= cx1; x++) p.set(x, y, stn[(hash2(x >> 1, (y + (x >> 1)) >> 1, 5) * 3 + (x < cx0 + 2 ? 1 : 0)) | 0]);
  p.rect(cx0 - 1, cy0 - 1, cx1 - cx0 + 3, 1, stn[0]); p.rect(cx0 - 1, cy0, cx1 - cx0 + 3, 1, stn[3]);
  if (st.forge) p.rect(cx0 + 1, cy0 - 1, cx1 - cx0 - 1, 1, C('#e8742c'));
  // vegg, med grunnmur under panel og bindingsverk
  for (let y = wy0; y <= wy1; y++) for (let x = bx; x < bx + bw; x++) p.set(x, y, wallPix(st.wall, wc, x - bx, y - wy0));
  if (st.wall === 'panel' || st.wall === 'frame') for (let x = bx; x < bx + bw; x++) { p.set(x, wy1 - 1, stn[2 - (hash2(x >> 2, 1, 18) * 2 | 0)]); p.set(x, wy1, stn[0]); }
  if (st.gable) {
    // gavlen mot oss: veggen går opp i en spiss, og taket ses som vindskier langs kanten
    const ay = 7, sl = 37 / (wy0 + 5 - ay);
    for (let y = ay; y <= wy0 + 5; y++) {
      const hw = (y - ay) * sl;
      for (let x = Math.floor(mx - hw); x <= Math.ceil(mx + hw); x++) {
        const d = hw - Math.abs(x - mx + 0.5);
        if (d < 4.5) p.set(x, y, d < 1 ? rc[0] : d > 3.4 ? rc[1] : rc[x < mx ? 4 : 3]);
        else if (y < wy0) p.set(x, y, wallPix(st.wall, wc, x - bx, y - wy0));
      }
    }
    // loftsvindu
    p.rect(mx - 5, 21, 10, 9, C('#d6c69c')); p.rect(mx - 4, 22, 8, 7, C('#f0bc50')); p.rect(mx - 4, 22, 8, 2, C('#f8dc88')); p.rect(mx - 1, 22, 1, 7, C('#d6c69c'));
  } else {
    // langveggen mot oss, med hjørner og takflata over
    if (st.wall === 'log') for (let y = wy0; y <= wy1 - 2; y += 4) { p.rect(bx - 2, y, 3, 3, wc[3]); p.set(bx - 1, y + 1, wc[0]); p.rect(bx + bw - 1, y, 3, 3, wc[3]); p.set(bx + bw, y + 1, wc[0]); }
    const ry0 = 12, ry1 = 40;
    for (let y = ry0; y <= ry1; y++) {
      const f = (y - ry0) / (ry1 - ry0), xl = Math.round(lerp(12, 1, f)), xr = Math.round(lerp(w - 13, w - 2, f));
      for (let x = xl; x <= xr; x++) p.set(x, y, roofPix(st.roof, rc, x, y, f));
    }
    if (st.roof === 'turf') {
      for (let x = 12; x <= w - 13; x++) { if (hash2(x, 1, 33) < 0.6) p.set(x, ry0 - 1, rc[3]); if (hash2(x, 2, 33) < 0.25) p.set(x, ry0 - 2, rc[4]); }
      const fl = T('#f2eee0', '#f0d050', '#d07a9c');
      for (let i = 0; i < 9; i++) p.set(8 + ((hash2(i, 3, 35) * 68) | 0), 15 + ((hash2(i, 4, 35) * 22) | 0), fl[i % 3]);
    } else p.rect(12, ry0 - 1, w - 24, 1, rc[4]);
    for (let x = 0; x < w; x++) { p.set(x, ry1 + 1, C('#e6e0cc')); p.set(x, ry1 + 2, C('#2c1e16')); if (x >= bx && x < bx + bw) { p.set(x, ry1 + 3, C('#261a14')); p.set(x, ry1 + 4, dkc(p.get(x, ry1 + 4), 0.7)); } }
  }
  // hvite hjørnekasser på panelhus
  if (st.wall === 'panel') { p.rect(bx, wy0 + (st.gable ? 0 : 5), 2, wy1 - wy0 - (st.gable ? 1 : 6), trim); p.rect(bx + bw - 2, wy0 + (st.gable ? 0 : 5), 2, wy1 - wy0 - (st.gable ? 1 : 6), trim); }
  // skilt: på takkanten, eller over døra når gavlen vender fram
  if (st.sign) {
    const sw = st.sign.length * 4 + 5, sx = st.gable ? Math.max(bx + 2, dx + 6 - (sw >> 1)) : 18, sy = st.gable ? 37 : 34;
    p.rect(sx - 1, sy - 1, sw + 2, 9, C('#2c1e16')); p.rect(sx, sy, sw, 7, C('#e2d2a8'));
    [...st.sign].forEach((ch, i) => [...GLYPH[ch]].forEach((b, k) => { if (b === '1') p.set(sx + 3 + i * 4 + k % 3, sy + 1 + (k / 3 | 0), C('#2c1e16')); }));
  }
  // dør med lykt og trapp
  const dc = C(st.door || '#5c3c28');
  p.rect(dx, 46, 13, 22, C('#261a14')); p.rect(dx + 1, 47, 11, 21, dc);
  for (let y = 47; y <= 67; y++) { p.set(dx + 4, y, dkc(dc, 0.78)); p.set(dx + 8, y, dkc(dc, 0.78)); p.set(dx + 1, y, dkc(dc, 1.2)); }
  p.set(dx + 10, 58, C('#e6b63c')); p.set(dx + 10, 59, C('#a07a20'));
  p.rect(dx - 5, 49, 3, 5, C('#261a14')); p.set(dx - 4, 50, C('#ffe08a')); p.set(dx - 4, 51, C('#ffc850')); p.set(dx - 4, 52, C('#ffe08a'));
  p.rect(dx - 1, 68, 15, 1, stn[3]); p.rect(dx - 2, 69, 17, 1, stn[1]);
  // vinduer, med blomsterkasse, brød i karmen hos bakeren og markise på bua
  for (const [x, y, ww, hh] of wins) {
    drawWindow(p, x, y, ww, hh, st.forge);
    if (st.flowers) for (let i = 0; i * 3 < ww - 3; i++) p.set(x + 2 + i * 3, y + hh - 1, i & 1 ? C('#e8302a') : C('#f2eee0'));
    if (st.bread) for (let i = 0; i < 3; i++) { p.rect(x + 2 + i * 6, y + hh - 3, 4, 2, C('#b87a3c')); p.rect(x + 2 + i * 6, y + hh - 3, 3, 1, C('#dca85c')); }
    if (st.awn) for (let j = 0; j < 4; j++) for (let i = -1 - (j >> 1); i <= ww + (j >> 1); i++) if (j < 3 || !(i & 1)) p.set(x + i, y - 3 + j, mod(i, 6) < 3 ? C('#b03a2e') : C('#f0ece2'));
    glow.push([x + (ww >> 1) - mx, y + (hh >> 1) - 68, st.forge ? 0.42 : 0.32]);
  }
  // gevir mellom døra og vinduet
  if (st.antler) { p.line(36, 49, 34, 45, C('#d2c39c'), 1); p.line(37, 49, 39, 45, C('#d2c39c'), 1); p.set(33, 46, C('#d2c39c')); p.set(40, 46, C('#d2c39c')); p.set(36, 50, C('#8a7a5c')); p.set(37, 50, C('#8a7a5c')); }
  // ved veggen til høyre: vedstabel, kasser og tønne, stativ med fugl til henging, eller vanntønna til smeden
  if (st.side === 'wood') for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = 72 + i * 3 + (j & 1), y = 57 + j * 3; if (x > 82) continue; p.rect(x, y, 3, 3, C('#7a5c40')); p.rect(x, y, 2, 2, C('#c8a474')); p.set(x, y, C('#dcc090')); }
  if (st.side === 'crates') { p.rect(72, 60, 8, 8, C('#8e6e4a')); p.rect(72, 60, 8, 1, C('#b08c5e')); p.line(72, 61, 79, 67, C('#5f4632'), 1); p.rect(75, 54, 7, 6, C('#7a5c40')); p.rect(75, 54, 7, 1, C('#a07e52')); p.rect(76, 52, 2, 2, C('#c8402c')); p.rect(79, 52, 2, 2, C('#7aa048')); }
  if (st.side === 'barrel') { p.rect(73, 58, 8, 10, C('#6a4c34')); p.rect(73, 58, 1, 10, C('#8a684a')); p.rect(73, 60, 8, 1, C('#3e4246')); p.rect(73, 65, 8, 1, C('#3e4246')); p.rect(74, 57, 6, 1, C('#376c76')); }
  if (st.side === 'rack') {
    p.rect(72, 50, 1, 18, C('#5f4632')); p.rect(82, 50, 1, 18, C('#5f4632')); p.rect(71, 50, 13, 1, C('#7a5c40'));
    [[74, '#3a3d42', '#d8402c'], [77, '#8a6038', '#3e2a18'], [80, '#94806a', '#e8e2d4']].forEach(([x, c, c2]) => { p.set(x, 51, C('#2c1e16')); p.rect(x - 1, 52, 2, 5, C(c)); p.set(x, 57, C(c2)); p.set(x - 1, 58, C(c)); });
  }
  p.outlineAuto(0.45);
  return mkSpr(p, mx, 68, {});
}
// Hvit trekirke med tårn og spir midt på gavlen, klokke i tårnet og buede vinduer
function genChurch() {
  const w = 100, h = 134, p = new Pix(w, h), mx = 50, by = 125;
  const wc = T(...WALLC.white), rc = T(...ROOFC.slate), stn = T(...WALLC.stone), fr = C('#7e8e98');
  const wall = (x, y) => y >= by - 2 ? stn[y === by ? 0 : 2 - (hash2(x >> 2, 2, 18) * 2 | 0)] : wallPix('panel', wc, x, y);
  // skipet: gavl med skifertak
  const ay = 48, wy0 = 86, sl = 42 / (wy0 + 4 - ay);
  for (let y = ay; y <= by; y++) {
    const hw = y <= wy0 + 4 ? (y - ay) * sl : 0;
    for (let x = 10; x < 90; x++) {
      const d = hw - Math.abs(x - mx + 0.5);
      if (y <= wy0 + 4 && d >= 0 && d < 5) p.set(x, y, d < 1 ? rc[0] : d > 3.8 ? rc[1] : rc[x < mx ? 4 : 3]);
      else if (x >= 12 && x < 88 && (y >= wy0 ? true : d >= 5)) p.set(x, y, wall(x, y));
    }
  }
  p.rect(12, wy0, 2, by - wy0 - 2, fr); p.rect(86, wy0, 2, by - wy0 - 2, fr);
  // buede vinduer med farget glass
  const glow = [];
  for (const x of [19, 73]) {
    p.rect(x, 98, 8, 16, fr); p.rect(x + 1, 96, 6, 2, fr); p.rect(x + 2, 95, 4, 1, fr);
    for (let y = 97; y <= 112; y++) for (let i = 1; i <= 6; i++) if (y > 98 || i > 1 && i < 6) p.set(x + i, y, C(['#f0bc50', '#f8dc88', '#5a8ab0', '#c8503c'][(hash2(x + i, y >> 1, 41) * 4.6) | 0] || '#f0bc50'));
    p.rect(x + 4, 97, 1, 16, fr); p.rect(x + 1, 104, 6, 1, fr); p.rect(x, 114, 8, 1, C('#48301f'));
    glow.push([x + 4 - mx, 105 - by - 1, 0.3]);
  }
  // tårnet foran skipet, med lydluker og klokke
  const tx0 = 38, tx1 = 61, ty0 = 34;
  for (let y = ty0; y <= by; y++) for (let x = tx0; x <= tx1; x++) p.set(x, y, wall(x, y));
  p.rect(tx0, ty0, 1, by - ty0 - 2, fr); p.rect(tx1, ty0, 1, by - ty0 - 2, fr); p.rect(tx0, 58, tx1 - tx0 + 1, 2, fr); p.rect(tx0, 82, tx1 - tx0 + 1, 1, fr);
  for (const x of [43, 53]) { p.rect(x, 41, 4, 12, C('#2c2824')); p.rect(x + 1, 40, 2, 1, C('#2c2824')); for (let y = 43; y < 53; y += 3) p.rect(x, y, 4, 1, C('#6a6458')); }
  p.ell(49.5, 70.5, 5.5, 5.5, C('#2c2824')); p.ell(49.5, 70.5, 4.5, 4.5, C('#f4f0e6')); p.line(49, 71, 49, 67, C('#2c2824'), 1); p.line(49, 71, 52, 72, C('#2c2824'), 1);
  // spir med kors
  for (let y = 9; y < ty0; y++) {
    const f = (y - 9) / (ty0 - 9), hw = lerp(1, 15, f);
    for (let x = Math.round(mx - hw); x < Math.round(mx + hw); x++) p.set(x, y, mod(y, 3) === 0 ? rc[1] : rc[x < mx - hw * 0.25 ? 4 : x < mx + hw * 0.3 ? 3 : 2]);
  }
  p.rect(mx - 16, ty0 - 1, 32, 2, rc[0]);
  p.rect(mx - 1, 1, 2, 9, C('#e6b63c')); p.rect(mx - 3, 3, 6, 2, C('#e6b63c')); p.set(mx, 1, C('#a07a20')); p.rect(mx - 3, 4, 6, 1, C('#a07a20'));
  // buet dobbeltdør og trapp
  p.rect(43, 104, 14, by - 103, C('#261a14')); p.rect(45, 102, 10, 2, C('#261a14')); p.rect(47, 101, 6, 1, C('#261a14'));
  for (let y = 103; y <= by; y++) for (let x = 44; x <= 55; x++) if (y > 104 || x > 45 && x < 54) p.set(x, y, x === 49 || x === 50 ? C('#3a2618') : (x & 3) === 0 ? C('#48301f') : C('#6a452c'));
  p.set(48, 114, C('#e6b63c')); p.set(51, 114, C('#e6b63c'));
  p.rect(41, by + 1, 18, 1, stn[3]); p.rect(40, by + 2, 20, 1, stn[1]);
  p.outlineAuto(0.45);
  return mkSpr(p, mx, by + 1, {});
}

// ---------- Hus på skrå ovenfra ----------
// Et hus bygges av flater i sitt eget rutenett (u langs mønet, v på tvers, z opp), dreies rot om midten og tegnes
// sett på skrå ovenfra: bakken som på kartet, og høyden rett opp i bildet. Hvert punkt på flatene settes inn i bildet,
// og det høyeste punktet i hver piksel vinner. Lyset kommer fra nordvest, og huset kaster en fast skygge mot sørøst
const SHADOW = (0x58000000 | (C('#0b1a1c') & 0xffffff)) >>> 0;
class Model {
  // R: største avstand fra midten til et hjørne, H: største høyde
  constructor(R, H, rot) {
    this.c = Math.cos(rot); this.s = Math.sin(rot);
    this.w = 2 * R + 8 + (H >> 1); this.h = 2 * R + H + 8 + (H >> 2); this.ax = R + 4; this.ay = R + H + 4;
    this.p = new Pix(this.w, this.h); this.zb = new Float32Array(this.w * this.h).fill(-1); this.sh = new Uint8Array(this.w * this.h); this.glow = [];
  }
  scr(u, v, z) { return [Math.round(this.ax + u * this.c - v * this.s), Math.round(this.ay + u * this.s + v * this.c - z)]; }
  put(u, v, z, col) {
    const x = this.ax + u * this.c - v * this.s, y = this.ay + u * this.s + v * this.c, X = Math.round(x), Y = Math.round(y - z), w = this.w;
    if (X >= 0 && X < w && Y >= 0 && Y < this.h && z >= this.zb[Y * w + X]) { this.zb[Y * w + X] = z; this.p.d[Y * w + X] = col; }
    const SX = Math.round(x + z * 0.45), SY = Math.round(y + z * 0.22);
    if (SX >= 0 && SX < w && SY >= 0 && SY < this.h) this.sh[SY * w + SX] = 1;
  }
  // lys på en flate som vender (lu, lv) i husets rutenett: [lysstyrke, hvor mye den vender mot oss]
  lit(lu, lv) { const nx = lu * this.c - lv * this.s, ny = lu * this.s + lv * this.c; return [1 - 0.13 * (nx + ny), ny]; }
  // vegg fra (u0, v0) til (u1, v1), med urviseren sett ovenfra; zt er høyden (tall eller funksjon av avstanden q langs
  // veggen) og tex(q, z) fargen. Vegger som vender bort fra oss tegnes ikke; gir true hvis veggen synes
  wall(u0, v0, u1, v1, zt, tex, z0 = 0) {
    const du = u1 - u0, dv = v1 - v0, len = hyp(du, dv), [k, ny] = this.lit(dv / len, -du / len);
    if (ny < 0.05) return false;
    for (let q = 0; q <= len; q += 0.5) { const zm = typeof zt === 'function' ? zt(q) : zt; for (let z = z0; z <= zm; z += 0.5) this.put(u0 + du * q / len, v0 + dv * q / len, z, shadeC(tex(q, z), k)); }
    return true;
  }
  // kasse med fire vegger og flatt lokk
  box(u0, u1, v0, v1, z0, z1, tex, top) {
    this.wall(u0, v0, u1, v0, z1, tex, z0); this.wall(u1, v0, u1, v1, z1, tex, z0); this.wall(u1, v1, u0, v1, z1, tex, z0); this.wall(u0, v1, u0, v0, z1, tex, z0);
    for (let u = u0; u <= u1; u += 0.5) for (let v = v0; v <= v1; v += 0.5) this.put(u, v, z1, top);
  }
  // saltak med mønet langs u fra u0 til u1: hd er halve bredden på huset, ov utstikket, z0 raftet og hr høyden opp til mønet
  roof(u0, u1, hd, ov, z0, hr, kind, rc) {
    for (const sd of [-1, 1]) {
      const k = this.lit(0, sd * 0.75)[0] + 0.06, W = hd + ov;
      for (let u = u0; u <= u1; u += 0.5) for (let t = 0; t <= W; t += 0.4) {
        const f = t / W, col = f < 0.07 ? rc[4] : f > 0.93 ? rc[0] : u < u0 + 1 || u > u1 - 1 ? rc[1] : roofPix(kind, rc, Math.floor(u) + 200, Math.floor(t * 1.25), f);
        this.put(u, sd * t, z0 + hr * (1 - t / hd), shadeC(col, k));
      }
    }
  }
  // spir: pyramide med kvadratisk fot (halv side hb) fra z0 og hh opp
  spire(uc, vc, hb, z0, hh, rc) {
    for (const [lu, lv] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const [k, ny] = this.lit(lu, lv); if (ny < -0.3) continue;
      for (let z = 0; z <= hh; z += 0.4) { const hw = hb * (1 - z / hh); for (let t = -hw; t <= hw; t += 0.4) this.put(uc + lu * hw - lv * t, vc + lv * hw + lu * t, z0 + z, shadeC(Math.floor(z * 1.2) % 4 === 0 ? rc[1] : rc[3], k)); }
    }
  }
  // lys i et vindu eller en lykt, til gløden om natta
  lamp(u, v, z, a) { const [X, Y] = this.scr(u, v, z); this.glow.push([X - this.ax, Y - this.ay, a]); }
  // omriss og skygge på bakken, og så inn blant husene (SPR.cabin)
  finish(opt) {
    const p = this.p.outlineAuto(0.45);
    for (let i = 0; i < p.d.length; i++) if (!p.d[i] && this.sh[i]) p.d[i] = SHADOW;
    return reg('cabin', p, this.ax, this.ay, Object.assign({ tallC: 1, nosh: 1, glow: this.glow }, opt));
  }
}
const HOUSE_HW = 17, HOUSE_HR = 11;
// Hvor døra står på et hus dreid rot: [x, y] et steg utenfor døra og [x, y] retningen ut, regnet fra midten av huset
function houseDoor(kind, rot) {
  const st = HOUSE_STYLE[CABIN_V[kind]], c = Math.cos(rot), s = Math.sin(rot);
  const [u, v, nu, nv] = kind === 'church' ? [41, 0, 1, 0] : st.end ? [(st.L || 48) / 2 + 5, 0, 1, 0] : [12.5 - (st.L || 48) / 2, (st.D || 32) / 2 + 5, 0, 1];
  return { door: [u * c - v * s, u * s + v * c], out: [nu * c - nv * s, nu * s + nv * c] };
}
// Veggene, taket, pipa og lysene til et hus av stilen st, bygd i m (Model her, eller GLModel i 10-gl.js)
function houseDef(m, st) {
  const L = st.L || 48, D = st.D || 32, hl = L / 2, hd = D / 2, Hw = HOUSE_HW, Hr = HOUSE_HR, ov = 2.5;
  const wc = T(...WALLC[st.wc]), rc = T(...ROOFC[st.roof]), stn = T(...WALLC.stone), trim = C(st.wc === 'white' ? '#7e8e98' : '#f0ece2'), dc = C(st.door || '#5c3c28'), fr = C('#d6c69c');
  const base = st.wall === 'panel' || st.wall === 'frame';
  // dør, vinduer og lykt på hver vegg: [slag, fra, til] langs veggen (u på langveggene S og N, v i gavlene E og W)
  const F = st.end ? { E: [['door', -4.5, 4.5], ['lamp', -8, -6.5]], S: [['win', 7 - hl, 17 - hl], ['win', hl - 19, hl - 9]], N: [['win', 7 - hl, 17 - hl], ['win', hl - 19, hl - 9]], W: [['win', -5, 5]] }
    : { S: [['door', 8 - hl, 17 - hl], ['lamp', 4.5 - hl, 6 - hl], ['win', hl - 23, hl - 10]], E: [['win', -5, 5]], W: [['win', -5, 5]], N: [['win', -6, 6]] };
  const tex = (name, len, a0, dir, gab) => (q, z) => {
    const a = a0 + dir * q;
    for (const f of F[name]) if (a >= f[1] && a <= f[2]) {
      if (f[0] === 'door' && z <= 14) return a < f[1] + 1 || a > f[2] - 1 || z > 13 ? C('#261a14') : a > f[2] - 3 && z > 6 && z < 8 ? C('#e6b63c') : Math.floor(a - f[1]) % 3 === 0 ? dkc(dc, 0.78) : dc;
      if (f[0] === 'lamp' && z >= 9 && z <= 12) return z > 11.4 ? C('#261a14') : C('#ffd060');
      if (f[0] === 'win' && z >= 6 && z <= 13.5) return a < f[1] + 1 || a > f[2] - 1 || z < 7 || z > 12.5 || Math.abs(a - (f[1] + f[2]) / 2) < 0.5 ? fr : C(st.forge ? (z > 10.5 ? '#f8b050' : '#e8742c') : z > 10.5 ? '#f8dc88' : '#f0bc50');
    }
    if (base && z < 2) return stn[z < 1 ? 0 : 2];
    if (st.wall === 'panel' && (q < 1.5 || q > len - 1.5)) return trim;
    const col = wallPix(st.wall, wc, Math.floor(q), Hw - 1 - Math.floor(z));
    return !gab && z > Hw - 2.5 ? dkc(col, 0.72) : col;
  };
  const gz = q => Hw + Hr * (1 - Math.abs(hd - q) / hd);
  const vis = {
    S: m.wall(hl, hd, -hl, hd, Hw, tex('S', L, hl, -1)), W: m.wall(-hl, hd, -hl, -hd, gz, tex('W', D, hd, -1, 1)),
    N: m.wall(-hl, -hd, hl, -hd, Hw, tex('N', L, -hl, 1)), E: m.wall(hl, -hd, hl, hd, gz, tex('E', D, -hd, 1, 1)),
  };
  m.roof(-hl - ov, hl + ov, hd, ov, Hw, Hr, st.roof, rc);
  // pipe i mønet; smia har en bred pipe med glør i toppen
  const cu = hl * 0.45, cw = st.forge ? 4 : 2.5;
  m.box(cu - cw, cu + cw, -2.5, 2.5, Hw + Hr - 4, Hw + Hr + 5, (q, z) => stn[1 + ((hash2(Math.floor(q / 2), Math.floor(z / 2), 5) * 2.4) | 0)], st.forge ? C('#e8742c') : stn[0]);
  // lys i vinduene og lykta på veggene som vender mot oss
  const at = (name, a) => name === 'S' ? [a, hd] : name === 'N' ? [a, -hd] : name === 'E' ? [hl, a] : [-hl, a];
  for (const name in F) if (vis[name]) for (const f of F[name]) if (f[0] !== 'door') m.lamp(...at(name, (f[1] + f[2]) / 2), 10, f[0] === 'lamp' ? 0.1 : st.forge ? 0.26 : 0.16);
  return { F, at };
}
function genHouseTop(st, rot) {
  const L = st.L || 48, D = st.D || 32, hl = L / 2, hd = D / 2, Hw = HOUSE_HW, Hr = HOUSE_HR, ov = 2.5;
  const m = new Model(Math.ceil(hyp(hl + ov, hd + ov)) + 1, Hw + Hr + 8, rot), { F, at } = houseDef(m, st);
  // skiltet henger over døra, vendt rett mot oss så det kan leses
  if (st.sign) {
    const df = F[st.end ? 'E' : 'S'][0], [X, Y] = m.scr(...at(st.end ? 'E' : 'S', (df[1] + df[2]) / 2), Hw + 1), sw = st.sign.length * 4 + 5, sx = clamp(X - (sw >> 1), 1, m.w - sw - 2), p = m.p;
    p.rect(sx - 1, Y - 8, sw + 2, 9, C('#2c1e16')); p.rect(sx, Y - 7, sw, 7, C('#e2d2a8'));
    [...st.sign].forEach((ch, i) => [...GLYPH[ch]].forEach((b, k) => { if (b === '1') p.set(sx + 3 + i * 4 + k % 3, Y - 6 + (k / 3 | 0), C('#2c1e16')); }));
  }
  return m.finish({ obb: [hl, hd, Math.cos(rot), Math.sin(rot)], s3: HOUSE_3D[st.id] || (HOUSE_3D[st.id] = genHouse(st)) });
}
// Kirka: skip med skifertak, og tårn med spir og kors i enden der døra er
function churchDef(m) {
  const wc = T(...WALLC.white), rc = T(...ROOFC.slate), stn = T(...WALLC.stone), fr = C('#7e8e98'), hd = 14, Hw = 20, Hr = 13, u0 = -37, u1 = 22;
  const glass = (a, z) => C(['#f0bc50', '#f8dc88', '#5a8ab0', '#c8503c', '#f0bc50'][(hash2(Math.floor(a), Math.floor(z / 2), 41) * 5) | 0]);
  const nave = (a0, dir, gab) => (q, z) => {
    const a = a0 + dir * q;
    if (!gab) for (const wu of [-28, -14, 0, 14]) if (Math.abs(a - wu) <= 3 && z >= 6 && z <= 16) return Math.abs(a - wu) > 2 || z < 7 || z > 15 ? fr : glass(a, z);
    if (gab && hyp(a, z - 22) < 3.5) return hyp(a, z - 22) > 2.5 ? fr : glass(a, z);
    if (z < 2.5) return stn[z < 1 ? 0 : 2];
    const col = wallPix('panel', wc, Math.floor(q), 40 - Math.floor(z));
    return !gab && z > Hw - 2.5 ? dkc(col, 0.72) : col;
  };
  const vS = m.wall(u1, hd, u0, hd, Hw, nave(u1, -1)), vN = m.wall(u0, -hd, u1, -hd, Hw, nave(u0, 1));
  m.wall(u0, hd, u0, -hd, q => Hw + Hr * (1 - Math.abs(hd - q) / hd), nave(hd, -1, 1));
  m.wall(u1, -hd, u1, hd, q => Hw + Hr * (1 - Math.abs(hd - q) / hd), nave(-hd, 1, 1));
  m.roof(u0 - 2.5, u1 + 1, hd, 2.5, Hw, Hr, 'slate', rc);
  for (const wu of [-28, -14, 0, 14]) { if (vS) m.lamp(wu, hd, 11, 0.1); if (vN) m.lamp(wu, -hd, 11, 0.1); }
  // tårnet: dør, klokke og lydluker
  const tw = (q, z) => {
    const a = Math.abs(q - 7);
    if (z <= 15 && a <= 4.5) return a > 3.5 || z > 14 ? C('#261a14') : a < 0.6 ? C('#3a2618') : C('#6a452c');
    if (hyp(a, z - 26) < 3.6) return hyp(a, z - 26) > 2.6 ? C('#2c2824') : a < 0.6 && z > 26 || z > 25.4 && z < 26.4 && q > 7 ? C('#2c2824') : C('#f4f0e6');
    if (z >= 33 && z <= 41 && a <= 3.5) return Math.floor(z) % 3 === 0 ? C('#6a6458') : C('#2c2824');
    if (z < 2.5) return stn[z < 1 ? 0 : 2];
    if (q < 1 || q > 13 || z > 42.5 || Math.abs(z - 20) < 1) return fr;
    return wallPix('panel', wc, Math.floor(q) + 1, 50 - Math.floor(z));
  };
  m.box(22, 36, -7, 7, 0, 44, tw, rc[1]);
  m.spire(29, 0, 8.5, 44, 18, T('#3a5a50', '#4a7264', '#5e8c7a', '#78a692'));
}
function genChurchTop(rot) {
  const m = new Model(45, 74, rot); churchDef(m);
  const [X, Y] = m.scr(29, 0, 62);
  m.p.rect(X - 1, Y - 8, 2, 9, C('#e6b63c')); m.p.rect(X - 3, Y - 6, 6, 2, C('#e6b63c')); m.p.rect(X - 3, Y - 5, 6, 1, C('#a07a20'));
  return m.finish({ obb: [37.5, 15, Math.cos(rot), Math.sin(rot)], s3: HOUSE_3D.church || (HOUSE_3D.church = genChurch()) });
}
// Bildet (i SPR.cabin) av et slags hus dreid rot radianer; tegnes første gang det trengs. HOUSE_3D er husene rett forfra
const HOUSE_V = {}, HOUSE_3D = {};
function houseV(kind, rot = 0) {
  const key = kind + ':' + rot;
  if (HOUSE_V[key] == null) { HOUSE_V[key] = (SPR.cabin || []).length; if (kind === 'church') genChurchTop(rot); else genHouseTop(HOUSE_STYLE[CABIN_V[kind]], rot); }
  return HOUSE_V[key];
}

// ---------- Ting i landsbyen: brønn, markedsboder, lykter og småting ----------
function genWell() {
  const p = new Pix(28, 38), st = STONE(), wd = T('#38281e', '#5f4632', '#7a5c40', '#8e6e4a'), rc = T(...ROOFC.tile);
  for (let y = 26; y <= 35; y++) for (let x = 4; x <= 23; x++) {
    if (y === 35 && (x === 4 || x === 23)) continue;
    const row = (y - 26) / 3 | 0, uu = x + (row & 1) * 3;
    p.set(x, y, (y - 26) % 3 === 2 || uu % 5 === 0 ? st[0] : st[x > 19 ? 1 : 2 + ((hash2(uu / 5 | 0, row, 44) * 2) | 0)]);
  }
  p.ell(13.5, 26, 10, 3.6, st[4]); p.ell(13.5, 26, 7.6, 2.3, C('#1e3b48')); p.set(11, 26, C('#a4ccc6'));
  for (const x of [5, 21]) { p.rect(x, 9, 2, 17, wd[1]); p.rect(x, 9, 1, 17, wd[3]); }
  p.rect(6, 14, 16, 1, wd[0]); p.rect(13, 15, 1, 6, C('#c8b890')); p.rect(11, 21, 5, 4, wd[2]); p.rect(11, 22, 5, 1, st[1]); p.rect(11, 21, 5, 1, wd[3]);
  for (let y = 2; y <= 9; y++) { const hw = 2 + (y - 2) * 1.7; for (let x = Math.round(13.5 - hw); x < Math.round(13.5 + hw); x++) p.set(x, y, y === 9 ? rc[0] : mod(x + y, 4) === 0 ? rc[1] : rc[x < 12 ? 4 : 3]); }
  p.outlineAuto(0.45);
  return reg('well', p, 14, 35, { r: 9, tallC: 1 });
}
// Bod med stripet seil over et bord med varer: 0 brød, 1 fisk, 2 grønnsaker
function genStall(k) {
  const p = new Pix(38, 36), wd = T('#38281e', '#5f4632', '#7a5c40', '#a07e52');
  const aw = [['#b03a2e', '#f0ece2'], ['#3a5a84', '#f0ece2'], ['#4e7a4a', '#f0e0a0']][k].map(C);
  for (const x of [3, 33]) { p.rect(x, 10, 2, 22, wd[1]); p.rect(x, 10, 1, 22, wd[3]); }
  // bord med varer
  p.rect(3, 20, 32, 3, wd[3]); p.rect(3, 22, 32, 1, wd[1]); for (let x = 4; x < 34; x++) for (let y = 23; y <= 30; y++) p.set(x, y, x % 5 === 0 ? wd[0] : wd[y < 25 ? 1 : 2]);
  for (let i = 0; i < 7; i++) {
    const x = 5 + i * 4;
    if (k === 0) { p.rect(x, 18, 3, 2, C('#b87a3c')); p.rect(x, 18, 2, 1, C('#dca85c')); if (i & 1) p.rect(x, 16, 3, 2, C('#a86a30')); }
    else if (k === 1) { p.rect(x, 19, 3, 1, C(i & 1 ? '#8aa0ac' : '#b4c4cc')); p.set(x + 3, 19, C('#5a6e7a')); if (i % 3 === 0) p.rect(x, 18, 3, 1, C('#c8d4d8')); }
    else { const c = ['#c8402c', '#7aa048', '#e08a2c', '#d8c050'][i % 4]; p.rect(x, 18, 3, 2, C(c)); p.set(x, 18, dkc(C(c), 1.3)); p.set(x + 1, 17, C('#4e7a34')); }
  }
  // seil
  for (let y = 3; y <= 11; y++) { const g = y < 6 ? 6 - y : 0; for (let x = g; x < 38 - g; x++) if (y < 11 || !(x >> 1 & 1)) p.set(x, y, dkc(aw[mod(x, 8) < 4 ? 0 : 1], y > 8 ? 0.82 : 1)); }
  p.outlineAuto(0.45);
  return reg('stall', p, 19, 32, { rect: [-17, -8, 17, 1], tallC: 1 });
}
function genLamp() {
  const p = new Pix(9, 35), ir = T('#1c1a18', '#34302c', '#4e4842');
  p.rect(4, 9, 1, 23, ir[1]); p.rect(3, 31, 3, 2, ir[1]); p.rect(2, 32, 5, 1, ir[0]); p.rect(3, 16, 3, 1, ir[2]);
  p.rect(2, 3, 5, 6, ir[0]); p.rect(3, 4, 3, 4, C('#ffc850')); p.set(4, 5, C('#fff0b0')); p.set(4, 6, C('#ffe08a')); p.rect(1, 2, 7, 1, ir[1]); p.rect(3, 1, 3, 1, ir[1]);
  p.outlineAuto(0.45);
  return reg('lamp', p, 4, 33, { r: 1.5, glow: [[0, -27, 0.3]] });
}
// Småting: 0 tønne, 1 kasse, 2 sekker, 3 høysåte, 4 ambolt på stabbe, 5 vedstabel, 6 kjerre, 7 benk, 8 hesje, 9 hoggestabbe
function genVProps() {
  const wd = T('#38281e', '#5f4632', '#7a5c40', '#a07e52', '#c8a474'), ir = T('#1c1a18', '#34302c', '#4e4842', '#7a7a76'), hay = T('#8a6e2c', '#b89840', '#d8bc58', '#ecd880');
  let p = new Pix(10, 14); // tønne
  for (let y = 2; y <= 11; y++) for (let x = 1; x <= 8; x++) p.set(x, y, x === 1 ? wd[3] : x === 8 ? wd[0] : x % 2 ? wd[2] : wd[1]);
  p.rect(1, 4, 8, 1, ir[1]); p.rect(1, 9, 8, 1, ir[1]); p.rect(2, 1, 6, 1, wd[4]);
  p.outlineAuto(0.45); reg('vprop', p, 5, 12, { r: 4 });
  p = new Pix(12, 12); // kasse
  p.rect(1, 2, 10, 9, wd[2]); p.rect(1, 2, 10, 1, wd[4]); p.rect(1, 2, 1, 9, wd[3]); p.rect(10, 2, 1, 9, wd[0]); p.line(2, 3, 9, 10, wd[1], 1); p.rect(1, 10, 10, 1, wd[0]);
  p.outlineAuto(0.45); reg('vprop', p, 6, 11, { r: 4 });
  p = new Pix(16, 12); // sekker
  for (const [cx, cy, c] of [[4.5, 7, '#c8b890'], [10.5, 7.5, '#b4a47c'], [7.5, 4.5, '#d8ccaa']]) { p.ell(cx, cy, 3.6, 3, (x, y, dx, dy) => dy > 0.4 ? dkc(C(c), 0.75) : C(c)); p.set(cx, cy - 3, C('#7a5c40')); }
  p.outlineAuto(0.45); reg('vprop', p, 8, 10, { r: 5 });
  p = new Pix(18, 16); // høysåte
  p.ell(9, 9, 7.5, 6.5, (x, y, dx, dy) => y > 13 ? 0 : tone(hay, 0.6 - dx * 0.3 - dy * 0.4 + (hash2(x, y >> 1, 46) - 0.5) * 0.3, x, y, 2)); p.set(9, 1, wd[1]); p.set(9, 2, wd[1]);
  p.outlineAuto(0.45); reg('vprop', p, 9, 14, { r: 6 });
  p = new Pix(16, 14); // ambolt på stabbe
  p.rect(4, 7, 8, 6, wd[1]); p.rect(4, 7, 2, 6, wd[2]); p.rect(4, 6, 8, 1, wd[4]);
  p.rect(2, 1, 12, 2, ir[2]); p.rect(2, 1, 12, 1, ir[3]); p.rect(0, 2, 2, 1, ir[2]); p.rect(5, 3, 6, 2, ir[1]); p.rect(4, 5, 8, 1, ir[2]);
  p.outlineAuto(0.45); reg('vprop', p, 8, 13, { r: 4 });
  p = new Pix(24, 15); // vedstabel
  for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) { const x = 1 + i * 3 + (j & 1), y = 2 + j * 3; if (x > 20) continue; p.rect(x, y, 3, 3, wd[2]); p.rect(x, y, 2, 2, wd[4]); p.set(x, y, C('#dcc090')); }
  p.outlineAuto(0.45); reg('vprop', p, 12, 14, { rect: [-11, -4, 11, 1] });
  p = new Pix(28, 18); // kjerre
  p.rect(5, 5, 18, 6, wd[2]); p.rect(5, 5, 18, 1, wd[4]); for (let x = 8; x < 23; x += 4) p.rect(x, 6, 1, 5, wd[1]); p.rect(5, 10, 18, 1, wd[0]);
  p.line(23, 9, 27, 14, wd[3], 1); p.ell(9, 13, 3.4, 3.4, wd[0]); p.ell(9, 13, 1.6, 1.6, wd[3]); p.ell(19, 13, 3.4, 3.4, wd[0]); p.ell(19, 13, 1.6, 1.6, wd[3]);
  p.rect(8, 3, 4, 2, hay[2]); p.rect(13, 2, 5, 3, hay[1]); p.rect(14, 2, 3, 1, hay[3]);
  p.outlineAuto(0.45); reg('vprop', p, 14, 17, { rect: [-11, -4, 11, 1] });
  p = new Pix(22, 12); // benk
  p.rect(1, 2, 20, 2, wd[3]); p.rect(1, 2, 20, 1, wd[4]); p.rect(1, 6, 20, 2, wd[2]); p.rect(1, 6, 20, 1, wd[3]); for (const x of [2, 18]) { p.rect(x, 4, 2, 2, wd[1]); p.rect(x, 8, 2, 3, wd[0]); }
  p.outlineAuto(0.45); reg('vprop', p, 11, 11, { rect: [-10, -3, 10, 1] });
  p = new Pix(42, 20); // hesje: høy til tørk på staur og streng
  for (let x = 2; x < 42; x += 9) p.rect(x, 1, 1, 18, wd[1]);
  for (let y = 4; y <= 15; y++) for (let x = 1; x < 41; x++) if (hash2(x, y, 48) < 0.93 - Math.abs(y - 9) * 0.03) p.set(x, y, tone(hay, 0.75 - (y - 4) / 14 + (hash2(x >> 1, y, 49) - 0.5) * 0.4, x, y, 2));
  p.outlineAuto(0.45); reg('vprop', p, 21, 19, { rect: [-20, -2, 20, 1] });
  p = new Pix(12, 13); // hoggestabbe med kubber
  p.rect(2, 6, 8, 6, wd[1]); p.rect(2, 6, 2, 6, wd[2]); p.ell(5.5, 6, 4, 1.8, wd[4]); p.rect(4, 3, 3, 3, wd[3]); p.rect(4, 3, 2, 1, C('#dcc090'));
  p.outlineAuto(0.45); reg('vprop', p, 6, 12, { r: 4 });
}

// ---------- Dyr ----------
const AW = 84, AH = 76, AOX = 40, AOY = 64;
const SPEC = {
  radyr: { name: 'Rådyr', sexn: { m: 'bukk', f: 'geit' }, seed: 11, L: 16, Hh: 7, leg: 9, lw: 2, ll: 1, legIn: 2, sw: 2, hock: 1, rumpR: 4, chestR: 3.6, neckL: 6.5, neckA: 62, neckW: 1.9, hl: 4.4, hh: 3.6, sl: 2.6, sh: 2.2, sdy: 0.5, hd: 14, ear: 3, ant: { m: 'roe' },
    col: { dk: '#74452a', body: '#a0633a', lt: '#bd8250', belly: '#d4b088', rump: '#f0e8d4', legLo: '#7c4c2e', legFar: '#5c3824', nose: '#1e1614' },
    kg: { m: [20, 32], f: [17, 27] }, hp: 35, value: 260, walk: 13, run: 104, sight: 150, smell: 215, hear: 1, nerv: 1.2, grp: [1, 2] },
  rev: { name: 'Rev', sexn: { m: 'hannrev', f: 'tispe' }, seed: 23, small: 1, L: 13, Hh: 5, leg: 5, lw: 2, ll: 1, legIn: 2, sw: 1.6, hock: 0.6, rumpR: 3, chestR: 3, neckL: 3.4, neckA: 40, neckW: 1.9, hl: 4.2, hh: 3.6, sl: 3, sh: 1.6, sdy: 0.8, hd: 8, ear: 3, headT: 'fox', tail: 9,
    col: { dk: '#a04a22', body: '#d0682c', lt: '#ea8c3e', belly: '#efe6d6', legU: '#b4561f', legLo: '#2a201c', legFar: '#3a2218', nose: '#1a1412' },
    kg: { m: [6, 10], f: [5, 8] }, hp: 20, value: 140, walk: 16, run: 96, sight: 150, smell: 200, hear: 1.15, nerv: 1.3, grp: [1, 1] },
  hjort: { name: 'Hjort', sexn: { m: 'bukk', f: 'kolle' }, seed: 37, L: 25, Hh: 10, leg: 13, lw: 2, ll: 1, legIn: 3, sw: 2.6, hock: 1.4, rumpR: 5.5, chestR: 5.2, neckL: 9, neckA: 58, neckW: 2.9, hl: 6, hh: 4.6, sl: 4, sh: 2.8, sdy: 0.7, hd: 16, ear: 3, ant: { m: 'red' }, tail: 2,
    col: { dk: '#683c28', body: '#955838', lt: '#b47648', belly: '#c4a078', rump: '#e2d2ac', neck: '#7a4a32', neckDk: '#523020', neckLt: '#8c5a3c', legLo: '#5e3a28', legFar: '#472c20', nose: '#1e1614' },
    kg: { m: [110, 190], f: [70, 110] }, hp: 85, value: 780, walk: 15, run: 106, sight: 170, smell: 255, hear: 1, nerv: 1.1, grp: [1, 3] },
  rein: { name: 'Rein', sexn: { m: 'bukk', f: 'simle' }, seed: 41, L: 22, Hh: 9, leg: 11, lw: 2, ll: 2, legIn: 3, sw: 2.3, hock: 1.2, rumpR: 5, chestR: 5, neckL: 7, neckA: 44, neckW: 2.9, hl: 5.6, hh: 4.4, sl: 3.6, sh: 3, sdy: 0.7, hd: 18, ear: 2, ant: { m: 'rein', f: 'reinS' }, tail: 2,
    col: { dk: '#56504a', body: '#7c7268', lt: '#9c9284', belly: '#c8c0b0', rump: '#f0ece0', neck: '#e4ded0', neckDk: '#b8b0a0', neckLt: '#f4f0e6', legLo: '#5e564e', legFar: '#48423c', nose: '#2a2420', tailC: '#f0ece0' },
    kg: { m: [80, 150], f: [60, 100] }, hp: 70, value: 520, walk: 15, run: 96, sight: 160, smell: 220, hear: 1, nerv: 1, grp: [3, 5] },
  villsvin: { name: 'Villsvin', sexn: { m: 'råne', f: 'purke' }, seed: 53, L: 20, Hh: 11, leg: 6, lw: 3, ll: 2, legIn: 3, sw: 1.8, hock: 0.5, rumpR: 5.4, chestR: 6, neckL: 6, neckA: -14, neckW: 4, hl: 7, hh: 6, sl: 6, sh: 2.8, sdy: 0.6, hd: 14, ear: 2, headT: 'boar', tail: 3,
    col: { dk: '#332a24', body: '#51443a', lt: '#70604f', legLo: '#2a2420', legFar: '#211c1a', nose: '#a08678', snout: '#665850' },
    kg: { m: [80, 160], f: [60, 110] }, hp: 90, value: 600, walk: 14, run: 86, sight: 100, smell: 280, hear: 1, nerv: 0.9, grp: [1, 3] },
  elg: { name: 'Elg', sexn: { m: 'okse', f: 'ku' }, seed: 67, L: 30, Hh: 13, leg: 18, lw: 3, ll: 2, legIn: 4, sw: 3, hock: 1.6, rumpR: 6.4, chestR: 7, hump: 3, neckL: 8, neckA: 30, neckW: 3.8, hl: 7.4, hh: 5.6, sl: 6, sh: 4.6, sdy: 1.6, hd: 30, ear: 3, ant: { m: 'palm' }, headT: 'elg',
    col: { dk: '#261c18', body: '#3c2c24', lt: '#56423a', legU: '#4a3a32', legLo: '#a4968a', legFar: '#6e645c', nose: '#6a564c', snout: '#4a3a32' },
    kg: { m: [320, 560], f: [270, 400] }, hp: 140, value: 1500, walk: 13, run: 90, sight: 140, smell: 270, hear: 1, nerv: 0.8, grp: [1, 1] },
  bjorn: { name: 'Bjørn', sexn: { m: 'hannbjørn', f: 'binne' }, seed: 79, L: 25, Hh: 13, leg: 8, lw: 4, ll: 4, legIn: 4, sw: 2.2, hock: 0.4, rumpR: 7, chestR: 7, hump: 2.4, neckL: 5, neckA: 10, neckW: 4.6, hl: 7, hh: 6.6, sl: 3.6, sh: 3, sdy: 1.2, hd: 16, ear: 1, headT: 'bear', paw: 1,
    col: { dk: '#472e1e', body: '#684630', lt: '#86603e', legLo: '#583a26', legFar: '#3a2618', nose: '#1a1412', snout: '#b08c62' },
    kg: { m: [160, 320], f: [100, 200] }, hp: 160, value: 2600, walk: 12, run: 84, sight: 120, smell: 300, hear: 0.9, nerv: 0.6, grp: [1, 1] },
  gaupe: { name: 'Gaupe', sexn: { m: 'hann', f: 'hunn' }, seed: 91, L: 15, Hh: 7, leg: 7, lw: 2, ll: 1, legIn: 2, sw: 2, hock: 1, rumpR: 3.8, chestR: 3.6, neckL: 3, neckA: 40, neckW: 2.4, hl: 5, hh: 4.6, sl: 1.8, sh: 2, sdy: 0.6, hd: 10, ear: 3, headT: 'lynx', spots: '#6a4a30',
    col: { dk: '#7a5a3a', body: '#a8845a', lt: '#c8a676', belly: '#e8dcc4', legLo: '#8a6a48', legFar: '#5a4430', nose: '#2a1e18' },
    kg: { m: [18, 28], f: [14, 21] }, hp: 32, value: 2200, walk: 12, run: 100, sight: 180, smell: 190, hear: 1.25, nerv: 1.2, grp: [1, 1] },
  ulv: { name: 'Ulv', sexn: { m: 'hannulv', f: 'tispe' }, seed: 109, L: 20, Hh: 8, leg: 9, lw: 2, ll: 1, legIn: 2, sw: 2.2, hock: 1, rumpR: 4.2, chestR: 4.6, neckL: 4.4, neckA: 34, neckW: 3, hl: 5, hh: 4.2, sl: 3.6, sh: 2, sdy: 0.8, hd: 10, ear: 3, headT: 'wolf', tail: 9,
    col: { dk: '#5a5450', body: '#8a827a', lt: '#b0a89c', belly: '#d8d2c6', legU: '#7a726a', legLo: '#a09888', legFar: '#5a5450', nose: '#1a1614' },
    kg: { m: [38, 60], f: [30, 45] }, hp: 55, value: 3200, walk: 17, run: 108, sight: 170, smell: 300, hear: 1.2, nerv: 1, grp: [1, 3] },
  hare: { name: 'Hare', sexn: { m: 'hann', f: 'hunn' }, seed: 97, small: 1, L: 9, Hh: 6, leg: 3, lw: 1, ll: 1, legIn: 1, sw: 1.6, hock: 1.4, rumpR: 3.6, chestR: 2.4, neckL: 2, neckA: 50, neckW: 1.6, hl: 3.4, hh: 2.8, sl: 1.6, sh: 1.6, sdy: 0.3, hd: 12, ear: 6, headT: 'hare', tail: 2,
    col: { dk: '#6a5a46', body: '#94806a', lt: '#b4a28a', belly: '#e8e2d4', legLo: '#a08c74', legFar: '#6a5a46', nose: '#3a2a22', tailC: '#f4f0e8' },
    kg: { m: [3, 5], f: [3, 5] }, hp: 9, value: 110, walk: 10, run: 118, sight: 120, smell: 160, hear: 1.4, nerv: 1.4, grp: [1, 1] },
  grevling: { name: 'Grevling', sexn: { m: 'hann', f: 'hunn' }, seed: 103, small: 1, L: 14, Hh: 6, leg: 3, lw: 2, ll: 2, legIn: 2, sw: 1.2, hock: 0.3, rumpR: 4, chestR: 3.6, neckL: 2.4, neckA: 0, neckW: 2.6, hl: 4.4, hh: 3.2, sl: 2.6, sh: 1.6, sdy: 0.8, hd: 22, ear: 1, headT: 'badger', tail: 2,
    col: { dk: '#4a4a48', body: '#7a7874', lt: '#a4a29c', legU: '#24221f', legLo: '#1e1c1a', legFar: '#141210', nose: '#141210', tailC: '#8a8884' },
    kg: { m: [10, 16], f: [8, 13] }, hp: 22, value: 130, walk: 9, run: 60, sight: 70, smell: 250, hear: 1, nerv: 0.8, grp: [1, 1] },
  // skogsfugl: egne mål per kjønn (sz) og egen tegning (genBird); flyr opp når de skremmes
  storfugl: { name: 'Storfugl', sexn: { m: 'tiur', f: 'røy' }, seed: 113, bird: 1, small: 1, L: 14, Hh: 8, leg: 3,
    sz: { m: { L: 14, Hh: 8, leg: 3, hr: 2.4, bk: 2, tl: 6, tail: 'fan' }, f: { L: 10, Hh: 6, leg: 2.5, hr: 1.8, bk: 1.5, tl: 4, tail: 'short' } },
    col: { m: { body: ['#24262a', '#3a3d42', '#585c62'], wing: ['#3e2e20', '#5e4630', '#7e6040'], belly: '#2c4a44', tail: '#1a1a1e', beak: '#e8e2c8', leg: '#5a5048', comb: '#d8402c', spot: '#e8e8e0' },
      f: { body: ['#5a3e24', '#8a6038', '#b08a58'], wing: ['#5a3e24', '#7a5634', '#9a7448'], belly: '#c08a4a', bar: '#3e2a18', tail: '#6a4a2c', beak: '#3a3430', leg: '#6a5a4a' } },
    kg: { m: [3.6, 5.2], f: [1.7, 2.4] }, hp: 12, value: 420, walk: 7, run: 30, fly: 135, sight: 150, smell: 60, hear: 1.2, nerv: 1.2, grp: [1, 2] },
  orrfugl: { name: 'Orrfugl', sexn: { m: 'orrhane', f: 'orrhøne' }, seed: 127, bird: 1, small: 1, L: 10, Hh: 6, leg: 2,
    sz: { m: { L: 10, Hh: 6, leg: 2, hr: 1.8, bk: 1, tl: 5, tail: 'lyre' }, f: { L: 9, Hh: 5.4, leg: 2, hr: 1.7, bk: 1, tl: 3, tail: 'short' } },
    col: { m: { body: ['#14161e', '#22283a', '#3a4664'], wing: ['#2a2a30', '#40404a', '#5a5a66'], tail: '#14161e', beak: '#1e1c1c', leg: '#4a4a4a', comb: '#d8402c', spot: '#ecece4', under: '#f2f0ea' },
      f: { body: ['#54402a', '#7e6446', '#a68a64'], wing: ['#54402a', '#6e5638', '#8e7452'], belly: '#9a7a54', bar: '#3a2a1a', tail: '#5a4430', beak: '#2a2420', leg: '#6a5a4a' } },
    kg: { m: [1.1, 1.5], f: [0.8, 1.1] }, hp: 7, value: 260, walk: 7, run: 30, fly: 150, sight: 130, smell: 50, hear: 1.1, nerv: 1.2, grp: [2, 4] },
  rype: { name: 'Rype', sexn: { m: 'stegg', f: 'høne' }, seed: 131, bird: 1, small: 1, L: 8, Hh: 5, leg: 2,
    sz: { m: { L: 8, Hh: 5, leg: 2, hr: 1.6, bk: 1, tl: 2, tail: 'short' }, f: { L: 7.5, Hh: 4.8, leg: 2, hr: 1.5, bk: 1, tl: 2, tail: 'short' } },
    col: { m: { body: ['#6a3e22', '#94603a', '#b8885a'], wing: ['#c8c4b8', '#ece8dc', '#ffffff'], belly: '#f0ece2', tail: '#2a2420', beak: '#2a2420', leg: '#e8e4d8', comb: '#d8402c' },
      f: { body: ['#6a4426', '#94683e', '#b88e5e'], wing: ['#c8c4b8', '#ece8dc', '#ffffff'], belly: '#f0ece2', bar: '#4a2e1a', tail: '#2a2420', beak: '#2a2420', leg: '#e8e4d8' } },
    kg: { m: [0.55, 0.75], f: [0.5, 0.68] }, hp: 4, value: 160, walk: 6, run: 26, fly: 155, sight: 80, smell: 40, hear: 0.9, nerv: 1.3, grp: [3, 6] },
};
const SPECIES = Object.keys(SPEC);
for (const k of SPECIES) SPEC[k].id = k;
// Jakthunden tegnes med samme oppskrift som dyra, men brun med hvitt bryst og oransje vest, så den ikke forveksles med vilt
const DOG = { name: 'Hund', seed: 141, L: 12, Hh: 5, leg: 5, lw: 2, ll: 1, legIn: 2, sw: 1.6, hock: 0.7, rumpR: 2.7, chestR: 2.9, neckL: 3.2, neckA: 44, neckW: 1.8, hl: 3.8, hh: 3.2, sl: 2.6, sh: 1.6, sdy: 0.6, hd: 10, ear: 3, headT: 'dog', vest: 1,
  col: { dk: '#4a3020', body: '#6e4a30', lt: '#8e6640', belly: '#ece4d4', legLo: '#ddd4c2', legFar: '#3e281a', nose: '#1a1412' } };
const DOGSPR = {};

const ANT = {
  roe: [[[0, 0], [-0.5, 2.5], [-1, 5]], [[-0.6, 3], [1.2, 4.6]], [[-0.9, 4], [-2.4, 5.6]]],
  red: [[[0, 0], [-2, 3], [-3.6, 7], [-3.2, 10.5], [-1.6, 13]], [[-0.6, 1], [2.6, 2.6]], [[-2.7, 5], [0.6, 7]], [[-3.5, 8.6], [-0.6, 10.6]], [[-1.6, 13], [0.6, 14.6]], [[-2.2, 12.4], [-3.8, 15]]],
  rein: [[[0, 0], [-3, 3], [-5, 7], [-5.2, 11], [-3.4, 14], [-0.4, 15.6]], [[-3.4, 14], [-5, 16.4]], [[-0.4, 15.6], [0.8, 17.4]], [[-0.5, 0.8], [3, 2.2], [4.6, 1.4]], [[-2.2, 2.6], [1.4, 5]]],
  palmB: [[[0, 0], [-2, 1.6], [-4.4, 2.8]], [[-1, 1], [1.6, 3], [2.6, 4.8]], [[0.4, 2], [2.8, 2.8]]],
};
function drawAntler(p, bx, by, type, rot, col, sc) {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const tf = (x, y) => [bx + (x * cs + y * sn) * sc, by - (y * cs - x * sn) * sc];
  const lines = type === 'palm' ? ANT.palmB : type === 'reinS' ? ANT.rein : ANT[type];
  if (type === 'reinS') sc *= 0.6;
  for (const pl of lines) for (let i = 0; i < pl.length - 1; i++) { const a = tf(pl[i][0], pl[i][1]), b = tf(pl[i + 1][0], pl[i + 1][1]); p.line(a[0], a[1], b[0], b[1], col, 1); }
  if (type === 'palm') {
    for (let u = -13; u <= -3; u += 0.5) for (let v = 1.5; v <= 9; v += 0.5) {
      const mid = 5.2 - (u + 7.5) * 0.28, e = Math.pow((u + 7.5) / 4.8, 2) + Math.pow((v - mid) / 2.3, 2);
      if (e <= 1) { const q = tf(u, v); p.set(q[0], q[1], col); }
    }
    for (let u = -12; u <= -4; u += 2) { const q = tf(u, 5.2 - (u + 7.5) * 0.28 + 3.2); p.set(q[0], q[1], col); const q2 = tf(u, 5.2 - (u + 7.5) * 0.28 + 2.4); p.set(q2[0], q2[1], col); }
  }
}
function shEll(p, cx, cy, rx, ry, tn, belly, seed) {
  p.ell(cx, cy, rx, ry, (x, y, dx, dy) => {
    if (belly && dy > 0.42 && Math.abs(dx) < 0.85) return belly;
    return tone(tn, 0.55 - dy * 0.52 - dx * 0.06 + (hash2(x >> 1, y >> 1, seed) - 0.5) * 0.1, x, y, 3);
  });
}

function genAnimal(sp, sex, pose, f, spec) {
  const A = spec || SPEC[sp], c = A.col, p = new Pix(AW, AH), ox = AOX, oy = AOY, L = A.L, Hh = A.Hh, leg = A.leg, seed = A.seed;
  const tn = T(c.dk, c.body, c.lt), belly = c.belly ? C(c.belly) : 0;
  const legU = C(c.legU || c.body), legLo = C(c.legLo || c.dk), legF = C(c.legFar || c.dk), hoof = C('#1c1614');
  const ntn = c.neck ? T(c.neckDk, c.neck, c.neckLt) : tn;
  const stn = c.snout ? T(c.dk, c.snout, c.snout) : tn;
  const antT = A.ant && A.ant[sex], antC = C('#d6c8a2'), antD = C('#8e7e60');
  const dead = pose === 'dead', canid = A.headT === 'fox' || A.headT === 'wolf' || A.headT === 'dog', dark = C('#1a1412');
  const htn = A.headT === 'badger' ? T('#b8b6b0', '#e4e2dc', '#f4f2ec') : tn;
  let off = [0, 0, 0, 0], lift = [0, 0, 0, 0], bob = 0, nA = A.neckA, earA = 112, tailDroop = 3;
  if (pose === 'walk') { const s = [1, 0, -1, 0][f] * A.sw; off = [s, -s, -s, s]; if (f === 1) lift = [1, 0, 0, 1]; if (f === 3) lift = [0, 1, 1, 0]; nA -= 6; }
  else if (pose === 'run') {
    const k = A.sw * 1.7;
    off = [[1, 0.6, -1, -0.7], [0.3, 0.9, -0.2, -0.8], [-0.9, -0.5, 0.9, 0.6], [-0.2, -0.7, 0.3, 0.9]][f].map(v => v * k);
    lift = [[0, 0, 0, 0], [1, 0, 2, 1], [1, 2, 0, 0], [2, 1, 1, 0]][f]; bob = [-1, 0, 0, -1][f]; nA -= 16; earA = 150; tailDroop = 0;
  } else if (pose === 'alert') { nA = Math.min(86, nA + 18); earA = 96; }
  let by, Sx, Sy, hx, hy, hang, antRot = 0, nearLegs = null;
  const tailFn = (ty, droop) => {
    if (A.headT === 'dog') {
      // hunden bærer halen bakover; når den står for vilt (alert), peker halen rett til værs med lys tupp
      const up = pose === 'alert', x0 = ox - L / 2 + 1, tip = T('#c8c0b0', '#ece4d4', '#ffffff');
      for (let i = 0; i <= 10; i++) {
        const t = i / 10, x = up ? x0 - 0.5 + 1.2 * t * t : x0 - 5 * t, y = up ? ty - 1 - 7 * t : ty - 1 - (droop ? 3 * t - 1.2 * t * t : 1 * t);
        const rr = (up ? 1.1 : 0.8) + 0.4 * Math.sin(t * Math.PI);
        shEll(p, x, y, rr, rr, up && t > 0.7 ? tip : tn, 0, seed + 8);
      }
    } else if (canid) {
      const tip = A.headT === 'fox' ? T('#cfc6b6', '#efe6d6', '#ffffff') : T('#2a2622', '#3a3430', '#4c4640');
      for (let i = 0; i <= 12; i++) { const t = i / 12, x = ox - L / 2 + 1 - A.tail * t, y = ty + droop * t * t, rr = 1 + Math.sin(t * Math.PI) * 1.5; shEll(p, x, y, rr, rr, t > 0.72 ? tip : tn, 0, seed + 8); }
    } else if (A.headT === 'lynx') {
      // kort stump med svart tupp
      for (let i = 0; i < 4; i++) { const x = ox - L / 2 + 0.5 - i, y = ty - 0.5 + i * droop * 0.12, col = i < 2 ? tn[1] : dark; p.set(x, y, col); p.set(x, y + 1, col); }
    } else if (A.headT === 'boar') { p.line(ox - L / 2, ty - 2, ox - L / 2 - 2, ty + 1, C(c.dk), 1); p.set(ox - L / 2 - 2, ty + 2, C(c.dk)); }
  };
  // flekker i pelsen (gaupe), lagt på kroppen før hals og hode
  const spots = () => {
    if (!A.spots) return;
    const sc = C(A.spots);
    for (let y = Math.floor(by - Hh / 2); y <= by + Hh / 2; y++) for (let x = Math.floor(ox - L / 2); x <= ox + L / 2; x++) { const v = p.get(x, y); if (v && v !== belly && hash2(x, y, seed + 9) < 0.16) p.set(x, y, sc); }
  };
  if (dead) {
    by = oy - Hh * 0.42;
    const lc = [[ox + L / 2 - A.legIn, 1], [ox + L / 2 - A.legIn - 3, 0], [ox - L / 2 + A.legIn + 2, 1], [ox - L / 2 + A.legIn - 1, 0]];
    for (const [lx, near] of lc) { const ex = lx + leg * 0.42, ey = by + 2 + leg * 0.5; p.line(lx, by + 1, ex, ey, near ? legLo : legF, A.ll); p.set(ex, ey, hoof); }
    tailFn(by + 1, 1);
    shEll(p, ox, by, L / 2, Hh * 0.42, tn, belly, seed); shEll(p, ox - L / 2 + A.rumpR * 0.8, by, A.rumpR, Hh * 0.42, tn, belly, seed + 1); shEll(p, ox + L / 2 - A.chestR * 0.8, by, A.chestR, Hh * 0.45, tn, belly, seed + 2);
    if (c.rump) p.ell(ox - L / 2 + 0.5, by, 1.6, Hh * 0.28, C(c.rump));
    spots();
    Sx = ox + L / 2 - A.chestR * 0.6; Sy = by + 0.5; hx = Sx + A.neckL * 0.95; hy = oy - A.hh / 2; hang = 0.15; antRot = 0.25;
  } else {
    by = oy - leg - Hh / 2 + bob;
    const fx = ox + L / 2 - A.legIn, bx = ox - L / 2 + A.legIn, lt = by + Hh / 2 - 2;
    const drawLeg = (hx_, o, li, far, back) => {
      const fy = oy - li, kx = hx_ + o * 0.4 - (back ? A.hock : 0), ky = lt + (fy - lt) * 0.52, fxx = hx_ + o;
      p.line(hx_, lt, kx, ky, far ? legF : legU, A.lw); p.line(kx, ky, fxx, fy, far ? legF : legLo, A.ll);
      const o2 = (A.ll - 1) >> 1;
      for (let i = 0; i < A.ll; i++) p.set(Math.round(fxx) - o2 + i, fy, hoof);
      if (A.paw) p.set(Math.round(fxx) - o2 + A.ll, fy, far ? legF : legLo);
    };
    drawLeg(fx + 1, off[1], lift[1], 1, 0); drawLeg(bx + 1, off[3], lift[3], 1, 1);
    tailFn(by - 0.5, tailDroop);
    shEll(p, ox, by, L / 2, Hh / 2, tn, belly, seed);
    shEll(p, ox - L / 2 + A.rumpR * 0.8, by - 0.4, A.rumpR, Hh / 2 + 0.3, tn, belly, seed + 1);
    shEll(p, ox + L / 2 - A.chestR * 0.8, by + 0.3, A.chestR, Hh / 2 + 0.6, tn, belly, seed + 2);
    if (A.hump) shEll(p, ox + L / 2 - A.chestR - 0.5, by - Hh / 2 + 1.5 - A.hump * 0.4, A.chestR + 1, A.hump + 1.6, tn, 0, seed + 3);
    if (c.rump) p.ell(ox - L / 2 + 0.6, by - 0.6, 1.7, Hh * 0.32, C(c.rump));
    if (A.tail === 2) { p.set(ox - L / 2 - 0.4, by - 1.5, C(c.tailC || c.dk)); p.set(ox - L / 2 - 0.4, by - 0.5, C(c.tailC || c.dk)); }
    if (A.headT === 'boar') for (let x = ox - L / 2 + 3; x <= ox + L / 2 + 1; x++) { const dx = (x - ox) / (L / 2 + 1), ty = by - Hh / 2 * Math.sqrt(Math.max(0, 1 - dx * dx)) - (x > ox ? 0.6 : 0); p.set(x, ty - (x & 1), C(c.dk)); p.set(x, ty + 1 - (x & 1), C(c.dk)); }
    spots();
    // signalvest over ryggen og sidene på hunden
    if (A.vest) for (let y = Math.floor(by - Hh / 2 - 1); y <= by + 1; y++) for (let x = Math.round(ox - 2); x <= ox + 2; x++) if (p.get(x, y)) p.set(x, y, C(y < by - Hh / 2 + 1 ? '#ffb050' : y > by ? '#c45a1c' : '#ee7c2a'));
    Sx = ox + L / 2 - A.chestR * 0.7; Sy = by - Hh * 0.2;
    if (pose === 'graze') { const drop = (oy - A.hh / 2 - 1) - Sy; hx = Sx + Math.max(A.neckL * 0.9, drop * 0.72); hy = oy - A.hh / 2 - 1 + (f ? -1 : 0); hang = 1.0; antRot = 0.6; }
    else { const a = nA * Math.PI / 180; hx = Sx + Math.cos(a) * A.neckL; hy = Sy - Math.sin(a) * A.neckL; hang = A.hd * Math.PI / 180; }
    nearLegs = () => { drawLeg(fx, off[0], lift[0], 0, 0); drawLeg(bx, off[2], lift[2], 0, 1); };
  }
  // hals
  const steps = Math.max(1, Math.ceil(hyp(hx - Sx, hy - Sy)));
  for (let i = 0; i <= steps; i++) { const t = i / steps, rr = lerp(A.neckW, A.neckW * 0.74, t); shEll(p, lerp(Sx, hx, t), lerp(Sy, hy, t), rr, rr, ntn, 0, seed + 4); }
  if (A.headT === 'elg' && !dead) { const mx = lerp(Sx, hx, 0.62), my = lerp(Sy, hy, 0.62) + A.neckW; p.line(mx, my, mx, my + 3, C(c.dk), 1); p.set(mx + 1, my, C(c.dk)); p.set(mx + 1, my + 1, C(c.dk)); }
  if (canid && !dead) p.ell(Sx + 1, Sy + 2.2, 1.8, 2.2, C(c.belly));
  // fjerne gevir bak hodet
  const abx = hx - 0.6, aby = hy - A.hh / 2 + 0.4;
  if (antT) drawAntler(p, abx + 1.6, aby - 0.4, antT, antRot, antD, 1);
  // ører
  const ea = earA * Math.PI / 180, ex0 = hx - A.hl / 2 + 1.2, ey0 = hy - A.hh / 2 + 0.6;
  if (A.headT === 'bear') { p.ell(hx - 1.6, hy - A.hh / 2 + 0.2, 1.3, 1.3, tn[0]); }
  // hode + snute
  shEll(p, hx, hy, A.hl / 2, A.hh / 2, htn, 0, seed + 5);
  const sd = A.hl / 2 + A.sl / 2 - 0.9, sx = hx + Math.cos(hang) * sd, sy = hy + Math.sin(hang) * sd + A.sdy * Math.cos(hang);
  shEll(p, sx, sy, A.sl / 2 + 0.3, A.sh / 2, A.headT === 'badger' ? htn : stn, 0, seed + 6);
  const nx = sx + Math.cos(hang) * (A.sl / 2 - 0.2), ny = sy + Math.sin(hang) * (A.sl / 2 - 0.2);
  p.set(nx, ny, C(c.nose));
  if (A.headT === 'boar') { p.set(nx, ny - 1, C(c.nose)); p.set(nx - 1.5, ny + 1.4, C('#f2eee0')); }
  if (A.headT === 'bear') p.set(nx, ny + 0.2, C(c.nose));
  if (canid) p.set(sx - 0.5, sy + 1, C(c.belly));
  // grevlingen: svart stripe fra snuten gjennom øyet og bak til øret
  if (A.headT === 'badger') { p.line(nx - 1, ny - 1, hx - A.hl / 2 + 0.6, hy - 0.6, dark, 1); p.line(nx - 1.6, ny, hx - 0.4, hy + 0.4, dark, 1); }
  if (!dead) p.set(hx + (hang > 0.6 ? -0.6 : 0.8), hy - (hang > 0.6 ? 0.2 : 0.8), C('#141010'));
  if (A.headT === 'bear') p.ell(hx - 0.4, hy - A.hh / 2 + 0.3, 1.2, 1.2, tn[1]);
  else if (canid) { const tx = ex0 + Math.cos(ea) * 3.4, ty = ey0 - Math.sin(ea) * 3.4; p.line(ex0 + 1, ey0, tx + 0.6, ty, tn[1], 1); p.line(ex0, ey0, tx, ty, C('#2a201c'), 1); }
  else {
    const tip = (a, l) => [ex0 + Math.cos(a) * l, ey0 - Math.sin(a) * l];
    // haren har to lange ører med svarte tupper, gaupa svarte dusker
    if (A.headT === 'hare') { const [tx, ty] = tip(ea + 0.2, A.ear - 0.5); p.line(ex0 - 1, ey0, tx - 1, ty, tn[1], 1); p.set(tx - 1, ty, dark); }
    const [tx, ty] = tip(ea, A.ear);
    p.line(ex0, ey0, tx, ty, tn[2], 1); p.set(ex0 + Math.cos(ea) * A.ear * 0.5 - 1, ey0 - Math.sin(ea) * A.ear * 0.5, tn[0]);
    if (A.headT === 'hare') p.set(tx, ty, dark);
    if (A.headT === 'lynx') p.set(tx, ty, dark);
  }
  if (nearLegs) nearLegs();
  if (antT) drawAntler(p, abx, aby, antT, antRot, antC, 1);
  p.outlineAuto(0.42);
  return mkSpr(p, AOX, AOY, { hc: { x: hx + Math.cos(hang) * A.sl * 0.3 - ox, y: hy - oy, r: Math.max(A.hl, A.hh) / 2 + 1.3 }, nk: [Sx - ox, Sy - oy, hx - ox, hy - oy], bob });
}
// ---------- Fugler (i profil, mot høyre) ----------
const BW = 44, BH = 40, BOX = 22, BOY = 32;
function genBird(sp, sex, pose, f) {
  const A = SPEC[sp], z = A.sz[sex], c = A.col[sex], p = new Pix(BW, BH), ox = BOX, oy = BOY, seed = A.seed + (sex === 'm' ? 0 : 5);
  const L = z.L, Hh = z.Hh, tn = T(...c.body), wt = T(...c.wing), bar = c.bar ? C(c.bar) : 0, belly = c.belly ? C(c.belly) : 0;
  const tailC = C(c.tail), legC = C(c.leg), fly = pose === 'fly', dead = pose === 'dead';
  // fjærdrakt: skyggelagt, med tverrstriper på hønene
  const fill = (cx, cy, rx, ry, tns, under) => p.ell(cx, cy, rx, ry, (x, y, dx, dy) => {
    if (under && dy > 0.3 && dx > -0.4) return under;
    if (bar && (y + ((x >> 1) & 1)) % 2 === 0 && hash2(x, y, seed) < 0.6) return bar;
    return tone(tns, 0.6 - dy * 0.5 - dx * 0.05 + (hash2(x >> 1, y >> 1, seed) - 0.5) * 0.14, x, y, 3);
  });
  const tri = (ax, ay, bx, by_, cx, cy, col) => {
    const d = (bx - ax) * (cy - ay) - (cx - ax) * (by_ - ay); if (!d) return;
    for (let y = Math.floor(Math.min(ay, by_, cy)); y <= Math.ceil(Math.max(ay, by_, cy)); y++) for (let x = Math.floor(Math.min(ax, bx, cx)); x <= Math.ceil(Math.max(ax, bx, cx)); x++) {
      const u = ((bx - x) * (cy - y) - (cx - x) * (by_ - y)) / d, v = ((cx - x) * (ay - y) - (ax - x) * (cy - y)) / d;
      if (u >= -0.05 && v >= -0.05 && u + v <= 1.05) p.set(x, y, typeof col === 'function' ? col(x, y) : col);
    }
  };
  const by = dead ? oy - Hh * 0.4 : oy - z.leg - Hh / 2 + (pose === 'walk' && f & 1 ? -0.5 : 0);
  const step = pose === 'walk' ? [1, 0, -1, 0][f] : 0;
  const leg = (dx, col) => { const x = ox + 0.5 + dx; p.line(x, by + Hh / 2 - 1, x, oy, col, 1); p.set(x + 1, oy, col); };
  // halen bak kroppen
  const tx0 = ox - L / 2 + 1, tdy = fly ? 0.15 : 0.55;
  if (z.tail === 'fan') for (const k of [-1, 0, 1]) p.line(tx0, by, tx0 - z.tl, by + z.tl * tdy + k * (fly ? 2 : 1.3), tailC, 2);
  else if (z.tail === 'lyre') {
    p.line(tx0, by, tx0 - z.tl, by + z.tl * tdy * 0.6, tailC, 2);
    p.set(tx0 - z.tl - 1, by + z.tl * tdy * 0.6 - 1, tailC); p.set(tx0 - z.tl - 1.6, by + z.tl * tdy * 0.6 - 2, tailC);
  } else p.line(tx0, by, tx0 - z.tl, by + z.tl * tdy, tailC, 2);
  if (!fly && !dead) leg(-step - 1, dkc(legC, 0.7));
  // vinger i flukt: fjern vinge bak kroppen, nær vinge foran
  const wa = [-1.15, -0.4, 0.6, -0.4][f] || 0, wl = L * 0.85, rx0 = ox + L * 0.05, ry0 = by - Hh * 0.2;
  const wing = (dx, col) => { const tx = rx0 - wl * 0.3 + dx, ty = ry0 + Math.sin(wa) * wl; tri(rx0 + 2.5 + dx, ry0, rx0 - 3 + dx, ry0, tx, ty, col); tri(rx0 - 3 + dx, ry0, tx, ty, tx - 1.5, ty + (wa < 0 ? 1.5 : -1.5), col); };
  if (fly) wing(-1.5, (x, y) => dkc(tone(wt, 0.4, x, y, 3), 0.75));
  // kropp
  fill(ox, by, L / 2, dead ? Hh * 0.4 : Hh / 2, tn, belly);
  if (c.under && !dead) p.ell(ox - L / 2 + 1.5, by + Hh * 0.25, 1.6, 1.2, C(c.under));
  // sammenfoldet vinge langs siden
  if (!fly) {
    fill(ox - L * 0.08, by - Hh * 0.05, L * 0.34, Hh * 0.3, wt);
    if (A.id === 'orrfugl' && sex === 'm') p.line(ox - L * 0.28, by + Hh * 0.2, ox + L * 0.1, by + Hh * 0.2, C(c.spot), 1);
    else if (c.spot) p.set(ox + L * 0.22, by - Hh * 0.18, C(c.spot));
  }
  // hals og hode
  let hx, hy;
  if (dead) { hx = ox + L / 2 + z.hr; hy = oy - z.hr; }
  else if (fly) { hx = ox + L / 2 + z.hr * 0.6; hy = by - Hh * 0.2; }
  else if (pose === 'graze') { hx = ox + L / 2 + z.hr * 0.6; hy = oy - z.hr - (f ? 1.2 : 0); }
  else if (pose === 'alert') { hx = ox + L / 2 - z.hr * 0.2; hy = by - Hh / 2 - z.hr * 1.7; }
  else { hx = ox + L / 2 - z.hr * 0.4 + [0, 0.5, 1, 0.5][f] * (pose === 'walk' ? 1 : 0); hy = by - Hh / 2 - z.hr * 0.5; }
  const nx0 = ox + L * 0.3, ny0 = by - Hh * 0.12, ns = Math.max(1, Math.ceil(hyp(hx - nx0, hy - ny0)));
  for (let i = 0; i <= ns; i++) { const t = i / ns, r = lerp(Hh * 0.3, z.hr * 0.85, t); fill(lerp(nx0, hx, t), lerp(ny0, hy, t), r, r, tn, 0); }
  fill(hx, hy, z.hr, z.hr, tn, 0);
  const down = pose === 'graze' || dead;
  p.line(hx + z.hr - 0.2, hy + 0.3, hx + z.hr - 0.2 + (down ? 0.4 : 1) * z.bk, hy + 0.3 + (down ? 1 : 0.4) * z.bk, C(c.beak), 1);
  if (!dead) p.set(hx + 0.3, hy - 0.4, C('#141010'));
  if (c.comb && !dead) { p.set(hx, hy - 1.2, C(c.comb)); p.set(hx + 1, hy - 1.2, C(c.comb)); }
  if (A.id === 'storfugl' && sex === 'm') { p.set(hx + 0.6, hy + z.hr + 0.4, C('#141416')); p.set(hx + 1.2, hy + z.hr + 0.6, C('#141416')); }
  if (fly) wing(0, (x, y) => tone(wt, 0.75 - (y - ry0) * 0.03, x, y, 3));
  if (!fly && !dead) leg(step, legC);
  p.outlineAuto(0.42);
  return mkSpr(p, BOX, BOY, { hc: { x: hx - ox, y: hy - oy, r: z.hr + 0.9 }, legY: by - oy + Hh / 2 });
}

// ---------- Jeger ----------
// Bilde i: 0 står, 1–4 går. Med r (0–3) tar jegeren børsa opp: 0 griper reima, 1 holder børsa på skrå foran
// brystet, 2 går ned på kne, 3 kneler med kolben i skulderen og løpet rettet fram. ots: sett over høyre skulder i 3D,
// der løpet peker inn mot midten av bildet i stedet for rett opp som på kartet
const HW = 24, HH = 30, HOX = 12, HOY = 27;
// ax (0–3, bare fra siden): hogger med øks. 0 svinger øksa opp bak hodet, 1 på vei ned foran, 2 hogget i stammen, 3 dras løs igjen
// pal bytter ut farger (hatt, jakke, bukse, skjegg og reimene til sekken): slik blir jegeren forfra til folkene i landsbyen.
// Med pal.civ går han uten sekk og børse, pal.cap gir lue eller skaut uten brem, og pal.dress og pal.apron kjole og forkle
function genHunter(dir, i, r = -1, ots = false, ax = -1, pal = {}) {
  const p = new Pix(HW, HH), K = (k, c) => C(pal[k] || c);
  const hat = K('hat', '#3f5c3a'), hatD = K('hatD', '#2c4430'), hatL = K('hatL', '#56784a'), band = K('band', '#ee7c2a'), skin = C('#e4b48c'), skinD = C('#c48e68'), beard = K('beard', '#6b4a30'), hair = C(pal.hair || pal.beard || '#6b4a30'), civ = pal.civ, dress = pal.dress && C(pal.dress), apron = pal.apron && C(pal.apron),
    jac = K('jac', '#586c3e'), jacD = K('jacD', '#3f502e'), jacL = K('jacL', '#718648'), pant = K('pant', '#4c3f32'), pantD = K('pantD', '#382e26'), boot = C('#231c18'),
    pack = C('#80583a'), packD = K('packD', '#5c3e28'), packL = C('#a07448'), gun = C('#201a18'), wood = C('#8c5830'), steel = C('#4a4440'),
    axS = C('#8a8780'), axE = C('#eef0e8');
  // armer, skaft og økseblad i hvert av de fire hoggebildene
  const axe = k => {
    if (k === 0) { p.line(11, 13, 8, 3, jacD, 2); p.rect(7, 1, 2, 2, skin); p.line(6, 2, 2, 7, wood, 1); p.rect(0, 7, 3, 3, axS); p.rect(0, 9, 3, 1, steel); p.rect(0, 10, 2, 1, axE); }
    else if (k === 2) { p.line(12, 14, 15, 17, jacD, 2); p.rect(16, 17, 2, 2, skin); p.line(18, 18, 21, 18, wood, 1); p.rect(21, 16, 2, 5, axS); p.rect(21, 16, 2, 1, steel); p.rect(23, 17, 1, 3, axE); }
    else { p.line(12, 13, 15, 9, jacD, 2); p.rect(16, 7, 2, 2, skin); p.line(18, 7, 20, 4, wood, 1); p.rect(19, 1, 3, 3, axS); p.rect(19, 1, 3, 1, steel); p.rect(22, 2, 1, 3, axE); }
  };
  // på kne sitter overkroppen tre piksler lavere; med øksa lener jegeren seg bakover i svingen og fram i hogget
  const w = i > 0, ph = i - 1, kn = r >= 2 ? 3 : 0, b = (w && (ph & 1) ? -1 : 0) + kn, slung = r < 1 && !civ, hx = ax === 0 ? -1 : ax === 2 ? 1 : 0;
  if (dir === 'side') {
    if (kn) {
      // bakre kne i bakken med leggen flat bakover, fremre fot plantet foran
      p.rect(10, 23, 2, 3, pantD); p.rect(5, 26, 7, 1, pantD); p.rect(3, 25, 2, 2, boot);
      p.rect(12, 22, 4, 2, pant); p.rect(15, 22, 2, 4, pant); p.rect(15, 26, 3, 1, boot);
    } else {
      const s = w ? [2, 0, -2, 0][ph] : ax >= 0 ? 2 : 0, lf = w && ph === 1 ? 1 : 0, lf2 = w && ph === 3 ? 1 : 0;
      p.line(11, 20, 11 - s, 26 - lf2, pantD, 2); p.rect(11 - s, 26 - lf2, 3, 1, boot);
      p.line(12, 20, 12 + s, 26 - lf, pant, 2); p.rect(12 + s, 26 - lf, 3, 1, boot);
      if (dress) { p.rect(9, 20, 6, 5, dress); p.rect(9, 24, 6, 1, dkc(dress, 0.75)); }
    }
    p.rect(9, 12 + b, 6, 8, jac); p.rect(9, 19 + b, 6, 1, jacD); p.rect(9, 12 + b, 1, 8, jacD); p.rect(14, 12 + b, 1, 6, jacL);
    if (!civ) { p.rect(6, 13 + b, 3, 6, pack); p.rect(6, 13 + b, 3, 1, packL); p.rect(6, 18 + b, 3, 1, packD); p.set(6, 15 + b, packD); }
    if (apron) p.rect(13, 14 + b, 2, 7, apron);
    if (slung) { p.line(9, 6 + b, 6, 19 + b, gun, 1); p.set(6, 18 + b, wood); p.set(6, 19 + b, wood); p.set(7, 17 + b, wood); }
    // armene som løfter øksa bak hodet skjules av hodet
    if (ax === 0) axe(0);
    p.rect(10 + hx, 7 + b, 4, 4, skin); p.rect(10 + hx, 7 + b, 1, 3, hair); p.set(13 + hx, 8 + b, C('#1a1412')); p.rect(11 + hx, 10 + b, 3, 1, beard); p.set(13 + hx, 9 + b, beard); p.rect(10 + hx, 11 + b, 4, 1, skinD);
    p.rect(9 + hx + (pal.cap ? 1 : 0), 6 + b, pal.cap ? 5 : 7, 1, hatD); p.rect(10 + hx, 5 + b, 4, 1, band); p.rect(10 + hx, 3 + b, 4, 2, hat); p.rect(10 + hx, 3 + b, 3, 1, hatL);
    if (ax > 0) axe(ax);
    else if (r === 0) { p.rect(11, 12 + b, 2, 2, jacD); p.rect(9, 11 + b, 2, 2, skin); }
    else if (r === 1 || r === 2) {
      // [kolbe x, y, munning x, y, kolbens øvre ende x, y, hånd på grepet x, y, hånd foran x, y]
      const L = r === 1 ? [10, 19, 17, 8, 11, 17, 12, 16, 14, 13] : [9, 17, 19, 10, 11, 16, 12, 15, 15, 13];
      p.line(L[0], L[1] + b, L[2], L[3] + b, gun, 1); p.line(L[0], L[1] + b, L[4], L[5] + b, wood, 1);
      p.line(12, 13 + b, L[6], L[7] - 1 + b, jacD, 2); p.line(13, 14 + b, L[8] - 1, L[9] + 1 + b, jacD, 1);
      p.set(L[6], L[7] + b, skin); p.set(L[8], L[9] + b, skin);
    } else if (r === 3) {
      p.rect(9, 12 + b, 4, 2, wood); p.rect(13, 12 + b, 9, 1, gun); p.set(21, 11 + b, gun); p.set(21, 12 + b, steel);
      p.rect(13, 13 + b, 4, 2, jacD); p.rect(17, 13 + b, 1, 2, skin); p.set(12, 14 + b, skin);
    } else if (ax < 0) { const ao = w ? -[2, 0, -2, 0][ph] / 2 : 0; p.line(12, 13 + b, 12 + ao, 17 + b, jacD, 2); p.rect(Math.round(12 + ao), 18 + b, 2, 1, skin); }
  } else {
    if (kn) { p.rect(8, 22, 3, 4, pant); p.rect(8, 26, 3, 1, boot); p.rect(13, 23, 3, 3, pantD); p.rect(13, 26, 3, 1, pantD); }
    else {
      const l1 = w && ph === 0 ? 1 : 0, l2 = w && ph === 2 ? 1 : 0;
      p.rect(9, 20, 2, 6 - l1, pant); p.rect(9, 26 - l1, 2, 1, boot); p.rect(13, 20, 2, 6 - l2, pantD); p.rect(13, 26 - l2, 2, 1, boot);
      if (dress) { p.rect(8, 20, 8, 5, dress); p.rect(8, 24, 8, 1, dkc(dress, 0.75)); }
    }
    p.rect(8, 12 + b, 8, 8, jac); p.rect(8, 19 + b, 8, 1, jacD); p.rect(8, 12 + b, 1, 7, jacL);
    const a1 = w ? [1, 0, -1, 0][ph] : 0;
    if (dir === 'down') {
      p.rect(10, 12 + b, 4, 1, jacD); if (!civ) { p.rect(9, 13 + b, 1, 4, packD); p.rect(14, 13 + b, 1, 4, packD); }
      if (apron) p.rect(10, 14 + b, 4, dress ? 9 : 6, apron);
      if (r === 0) { p.rect(6, 13 + b, 2, 5, jacD); p.rect(6, 18 + b, 2, 1, skin); p.rect(16, 11 + b, 2, 3, jacD); p.rect(15, 10 + b, 2, 1, skin); }
      else if (r === 1 || r === 2) { p.line(6, 20 + b, 17, 10 + b, gun, 1); p.line(6, 20 + b, 8, 18 + b, wood, 2); p.rect(6, 13 + b, 2, 4, jacD); p.rect(8, 17 + b, 2, 1, skin); p.rect(16, 13 + b, 2, 2, jacD); p.set(14, 13 + b, skin); p.set(15, 12 + b, skin); }
      // løpet rett mot deg: munningen som en mørk prikk foran brystet
      else if (r === 3) { p.rect(6, 13 + b, 2, 3, jacD); p.rect(16, 13 + b, 2, 3, jacD); p.rect(8, 15 + b, 8, 2, jacD); p.rect(11, 12 + b, 2, 3, gun); p.set(11, 12 + b, steel); p.rect(11, 16 + b, 2, 1, skin); }
      else { p.rect(6, 13 + b, 2, 5 + a1, jacD); p.rect(6, 18 + b + a1, 2, 1, skin); p.rect(16, 13 + b, 2, 5 - a1, jacD); p.rect(16, 18 + b - a1, 2, 1, skin); }
      p.rect(9, 7 + b, 6, 4, skin); p.set(10, 8 + b, C('#1a1412')); p.set(13, 8 + b, C('#1a1412')); p.rect(9, 10 + b, 6, 1, beard); p.set(9, 9 + b, beard); p.set(14, 9 + b, beard); p.rect(10, 11 + b, 4, 1, beard);
    } else {
      // bakfra: børsa foran jegeren skjules av kroppen, bare løpet stikker fram ved høyre skulder
      if (r === 0) { p.rect(6, 13 + b, 2, 5, jacD); p.rect(16, 11 + b, 2, 3, jacD); p.set(16, 10 + b, skin); }
      else if (r === 1 || r === 2) { p.line(15, 12 + b, 18, 7 + b, gun, 1); p.rect(6, 13 + b, 2, 4, jacD); p.rect(16, 13 + b, 2, 4, jacD); }
      else if (r === 3) { if (ots) p.line(15, 12 + b, 23, 9 + b, steel, 1); else p.line(16, 11 + b, 16, 2 + b, steel, 1); p.rect(4, 13 + b, 4, 2, jacD); p.rect(16, 12 + b, 4, 2, jacD); }
      else { p.rect(6, 13 + b, 2, 5 + a1, jacD); p.rect(16, 13 + b, 2, 5 - a1, jacD); }
      if (!civ) { p.rect(9, 12 + b, 6, 7, pack); p.rect(9, 12 + b, 6, 1, packL); p.rect(9, 18 + b, 6, 1, packD); p.rect(14, 13 + b, 1, 5, packD); p.set(11, 15 + b, packD); p.set(12, 15 + b, packD); }
      if (slung) { p.line(8, 9 + b, 15, 19 + b, gun, 1); p.set(15, 19 + b, wood); p.set(14, 18 + b, wood); }
      p.rect(9, 7 + b, 6, 3, hair); p.rect(10, 10 + b, 4, 1, skinD);
    }
    p.rect(pal.cap ? 9 : 7, 6 + b, pal.cap ? 6 : 10, 1, hatD); p.rect(9, 5 + b, 6, 1, band); p.rect(9, 3 + b, 6, 2, hat); p.rect(9, 3 + b, 5, 1, hatL);
  }
  p.outlineAuto(0.42);
  // fartsstripe etter øksebladet i buen over hodet (uten omriss)
  if (ax === 1) for (const [x, y] of [[1, 5], [2, 3], [4, 1], [6, 0], [9, 0], [12, 0], [15, 0], [17, 0]]) p.set(x, y, C('#d8dcd2'));
  return mkSpr(p, HOX, HOY, {});
}

// ---------- Effekter og ikoner ----------
function genFx() {
  FX.wisp = [];
  for (let k = 0; k < 4; k++) {
    const w = 150, h = 34, p = new Pix(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2), e = clamp(1 - dx * dx - dy * dy, 0, 1), d = e * e * (0.2 + 0.9 * vnoise(x / 22 + k * 9, y / 7, 77 + k)); if (d * 0.8 > dith(x, y) + 0.06) p.d[y * w + x] = C('#e4ecee'); }
    FX.wisp.push(p.canvas());
  }
  { // lysstråler, fliser sømløst
    const p = new Pix(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const q = (x + y * 0.5) * TAU / 128, I = Math.sin(q) * 0.55 + Math.sin(q * 2 + 1.3) * 0.3 + Math.sin(q * 4 + 0.7) * 0.18 - 0.3; if (I * 1.1 > dith(x, y)) p.d[y * 256 + x] = C('#fff2cc'); }
    FX.rays = p.canvas();
  }
  { // skyskygger, fliser sømløst: støy på et gitter som går rundt
    const N = 512, p = new Pix(N, N), col = C('#16242c');
    const pn = (x, y, n, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), x1 = (xi + 1) % n, y1 = (yi + 1) % n, a = hash2(xi, yi, s), b = hash2(x1, yi, s), c = hash2(xi, y1, s), d = hash2(x1, y1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = 0.6 * pn(x / 128, y / 128, 4, 71) + 0.28 * pn(x / 64, y / 64, 8, 72) + 0.12 * pn(x / 32, y / 32, 16, 73); if (smooth(0.5, 0.62, v) * 0.95 > dith(x, y)) p.d[y * N + x] = col; }
    FX.cloud = p.canvas();
  }
  const glyph = (rows, col) => { const p = new Pix(5, rows.length + 2); rows.forEach((r, j) => r.split('').forEach((b, i) => { if (b === '1') p.set(1 + i, 1 + j, col); })); p.outlineAuto(0.25); return p.canvas(); };
  FX.q = glyph(['111', '001', '011', '010', '000', '010'], C('#f2efe2'));
  FX.ex = glyph(['010', '010', '010', '010', '000', '010'], C('#ee7c2a'));
  { const p = new Pix(7, 10); p.rect(2, 4, 3, 5, C('#5a8a5a')); p.set(2, 4, C('#8ab88a')); p.rect(2, 6, 3, 2, C('#d8c040')); p.rect(3, 2, 1, 2, C('#5a8a5a')); p.rect(2, 1, 3, 1, C('#a87848')); p.outlineAuto(0.4); FX.bottle = mkSpr(p, 3, 8, {}); }
  { const p = new Pix(11, 10); for (let i = 0; i < 5; i++) p.rect(5 - i, 1 + i, 1 + i * 2, 1, C('#7a9e48')); p.rect(2, 6, 7, 3, C('#7a5c40')); p.rect(5, 7, 1, 2, C('#f0bc50')); p.outlineAuto(0.3); FX.house = p.canvas(); }
  // hjortehode med gevir: markør for felte dyr
  { const p = new Pix(11, 10), cl = { a: C('#e2d4ae'), h: C('#9a6438'), e: C('#2a1c14') };
    ['', '.a.a...a.a.', '.aaa...aaa.', '..aa...aa..', '..hhhhhhh..', '...heheh...', '...hhhhh...', '....hhh....', '....eee....'].forEach((r, j) => r.split('').forEach((b, i) => { if (cl[b]) p.set(i, j, cl[b]); }));
    p.outlineAuto(0.3); FX.deer = p.canvas(); }
  // hundehode med oransje halsbånd: markør for hunden ved skjermkanten
  { const p = new Pix(11, 10), cl = { d: C('#4a3020'), b: C('#8e6640'), w: C('#ece4d4'), e: C('#1a1412'), o: C('#ee7c2a') };
    ['...d.......', '...dd......', '..bbbd.....', '.bbbbbb....', '.bbebbbbbb.', '.bbbbbbbbbe', '.bbbbwwww..', '.bbbbw.....', '.ooooo.....', '.bbbbb.....'].forEach((r, j) => r.split('').forEach((b, i) => { if (cl[b]) p.set(i, j, cl[b]); }));
    p.outlineAuto(0.3); FX.dog = p.canvas(); }
  // nål med utropstegn over hunden når den står for vilt
  { const p = new Pix(11, 12), cl = { o: C('#ee7c2a'), h: C('#ffb050'), w: C('#fff4d6') };
    ['..hhhhh..', '.hhowooo.', 'ohoowoooo', 'oooowoooo', 'oooowoooo', 'ooooooooo', '.ooowooo.', '..ooooo..', '...ooo...', '....o....'].forEach((r, j) => r.split('').forEach((b, i) => { if (cl[b]) p.set(1 + i, 1 + j, cl[b]); }));
    p.outlineAuto(0.3); FX.mark = p.canvas(); }
  // hestehode med mørk man: markør for hesten ved skjermkanten
  { const p = new Pix(11, 10), cl = { m: C('#2a2018'), b: C('#cca870'), d: C('#b08a56'), e: C('#1a1412'), k: C('#6a5a48') };
    ['....m.b....', '...mmbb....', '...mbbbb...', '..mmbbebb..', '..mbbbbbbb.', '..mbbbddbkk', '.mmbbd..kk.', '.mbbbd.....', '.bbbbd.....', '.bbbbd.....'].forEach((r, j) => r.split('').forEach((b, i) => { if (cl[b]) p.set(i, j, cl[b]); }));
    p.outlineAuto(0.3); FX.horse = p.canvas(); }
  { const p = new Pix(7, 7); p.set(3, 0, C('#f2efe2')); p.rect(2, 1, 3, 1, C('#f2efe2')); p.rect(1, 2, 5, 1, C('#f2efe2')); p.outlineAuto(0.25); FX.arrow = p.canvas(); }
  // gapahuk: stokker reist mot hverandre som et telt (omvendt V) og krysset i mønet, åpen front med granbar på golvet
  { const p = new Pix(43, 35), by = 33, cx = 21, half = 16, rise = 16, D = 12, LW = 4, s = rise / half, top = by - rise;
    const bk = T('#231a14', '#3a2c20', '#56432f', '#76603f', '#988060'), gr = T('#182c24', '#22402f', '#2e5238', '#3e6440'), ms = T('#4e6a30', '#6a8a3a');
    const edge = x => by - (half - Math.abs(x - cx)) * s;   // underkanten av de to framste stokkene
    // åpningen: mørkt inn under mønet, granbar på golvet og framsida av de framste stokkene langs kanten
    for (let y = top; y <= by; y++) for (let x = cx - half; x <= cx + half; x++) {
      const e = y - edge(x); if (e <= 0) continue;
      p.set(x, y, e < 1.8 ? bk[1] : y > by - 4 ? tone(gr, 0.3 + (y - by + 4) * 0.14 + (hash2(x, y, 5) - 0.5) * 0.5, x, y, 2)
        : (y - top) / rise + (hash2(x, y, 4) - 0.5) * 0.2 > 0.6 ? C('#1e1712') : C('#120e0a'));
    }
    p.rect(cx - 4, by - 3, 8, 2, C('#b8a488')); p.rect(cx - 4, by - 3, 8, 1, C('#d8c8a8'));
    // takflatene: tre stokker på hver side bakover; ext tegner endene som stikker forbi hverandre i mønet
    const roof = (side, ext) => {
      for (let x = 0; x < p.w; x++) {
        const u = half + side * (cx - x); if (u < 0 || u > half + 4 || (u > half) !== ext) continue;
        for (let y = 0; y <= by; y++) {
          const d = by - u * s - y; if (d < 0 || d >= D) continue;
          const k = Math.floor(d / LW), t = d / LW - k;
          if (ext && u > half + 2 + ((hash2(k, side, 21) * 3) | 0)) continue;
          const v = 0.28 + t * 0.5 + (side < 0 ? 0.14 : -0.16) + (hash2(u >> 1, k, 13 + side) - 0.5) * 0.22 + (hash2(k, side, 17) - 0.5) * 0.16;
          p.set(x, y, k > 0 && t < 0.3 ? bk[0] : hash2(u, k, 31 + side) < 0.05 ? bk[1]
            : u < 2.5 && hash2(x, y, 41) < 0.4 ? ms[(hash2(x, y, 43) * 2) | 0] : tone(bk, v, x, y, 2));
        }
      }
    };
    roof(1, false); roof(-1, false); roof(1, true); roof(-1, true);
    // kappede ender der stokkene står mot bakken, og noen steiner
    for (let k = 0; k < D / LW; k++) for (const bx of [cx - half - 1, cx + half + 1]) { p.set(bx, by - k * LW - 1, C('#b89a6c')); p.set(bx, by - k * LW - 2, C('#d4b88a')); }
    for (const [x, y] of [[cx - half - 4, by - 1], [cx + half + 3, by - 4]]) { p.rect(x, y, 2, 2, C('#6e7472')); p.set(x, y, C('#979c94')); }
    p.outlineAuto(0.45);
    FX.hut = mkSpr(p, cx, by, {}); }
  FX.bird = [['101', '010'], ['000', '111']].map(r => { const p = new Pix(3, 2); r.forEach((row, j) => row.split('').forEach((b, i) => { if (b === '1') p.set(i, j, C('#1c2224')); })); return p.canvas(); });
}
function genIcons() {
  const I = {}, mk = (id, fn) => { const p = new Pix(18, 18); fn(p); p.outlineAuto(0.4); I[id] = p.canvas(); };
  const st = T('#2a2e30', '#4a5054', '#7a8286', '#b0b8b8'), wd = T('#5a3820', '#8a5a30', '#b07a44'), br = T('#9a7424', '#d0a038', '#f0cc60');
  mk('scope', p => { p.rect(3, 7, 12, 4, st[1]); p.rect(3, 7, 12, 1, st[2]); p.rect(2, 6, 3, 6, st[0]); p.rect(13, 5, 3, 8, st[0]); p.rect(14, 6, 1, 6, C('#7ab0c8')); p.rect(7, 5, 3, 2, st[0]); p.rect(6, 11, 2, 2, st[0]); p.rect(10, 11, 2, 2, st[0]); });
  mk('barrel', p => { for (let i = 0; i < 13; i++) { p.set(2 + i, 13 - i * 0.6, st[1]); p.set(2 + i, 14 - i * 0.6, st[0]); p.set(2 + i, 12 - i * 0.6, st[2]); } p.set(15, 5, st[3]); });
  mk('caliber', p => { p.rect(6, 8, 5, 7, br[1]); p.rect(6, 8, 1, 7, br[2]); p.rect(10, 8, 1, 7, br[0]); p.rect(6, 15, 5, 1, br[0]); p.rect(6, 5, 5, 3, C('#b8683a')); p.rect(7, 3, 3, 2, C('#b8683a')); p.set(8, 2, C('#d08850')); p.set(7, 4, C('#d08850')); });
  mk('stock', p => { for (let x = 2; x <= 14; x++) { const t = (x - 2) / 12, y0 = Math.round(6 + t * 1.5), y1 = Math.round(13 - t * 4); for (let y = y0; y <= y1; y++) p.set(x, y, y === y0 ? wd[2] : y === y1 ? wd[0] : wd[1]); } p.rect(14, 7, 2, 3, st[1]); });
  mk('mag', p => { for (let y = 4; y <= 14; y++) { const o = Math.round((y - 4) * 0.25); p.rect(6 + o, y, 6, 1, st[1]); p.set(6 + o, y, st[2]); p.set(11 + o, y, st[0]); } p.rect(6, 3, 6, 1, br[1]); p.rect(7, 2, 4, 1, br[2]); });
  mk('bolt', p => { p.rect(2, 7, 11, 3, st[2]); p.rect(2, 7, 11, 1, st[3]); p.rect(2, 9, 11, 1, st[1]); p.rect(11, 9, 2, 4, st[1]); p.ell(12.5, 14, 1.6, 1.6, st[0]); p.rect(13, 7, 2, 3, st[0]); });
  mk('supp', p => { p.rect(3, 6, 12, 6, st[0]); p.rect(3, 6, 12, 1, st[1]); for (let x = 5; x < 15; x += 3) p.rect(x, 7, 1, 4, st[1]); p.rect(1, 8, 2, 2, st[2]); p.set(15, 8, C('#101214')); p.set(15, 9, C('#101214')); });
  mk('call', p => { for (let i = 0; i < 11; i++) { const x = 3 + i, y = Math.round(12 - i * 0.5); p.set(x, y, wd[1]); p.set(x, y - 1, wd[2]); p.set(x, y + 1, wd[0]); } p.set(6, 10, C('#201810')); p.set(9, 8, C('#201810')); p.rect(14, 5, 2, 3, C('#201810')); p.line(3, 13, 2, 16, C('#b8402c'), 1); p.line(2, 16, 5, 16, C('#b8402c'), 1); });
  const bottle = p => { p.rect(6, 7, 6, 8, C('#5a8a5a')); p.rect(6, 7, 1, 8, C('#8ab88a')); p.rect(11, 7, 1, 8, C('#3a6240')); p.rect(7, 10, 4, 4, C('#d8c040')); p.rect(8, 4, 2, 3, C('#5a8a5a')); p.rect(7, 2, 4, 2, C('#a87848')); };
  mk('scent', p => { bottle(p); p.set(14, 5, C('#d8c040')); p.set(15, 3, C('#d8c040')); p.set(13, 2, C('#d8c040')); });
  mk('flask', bottle);
  mk('camo', p => { const g = T('#34482c', '#506a38', '#728a48'); p.rect(5, 4, 8, 11, g[1]); p.rect(2, 5, 3, 8, g[1]); p.rect(13, 5, 3, 8, g[1]); p.rect(7, 3, 4, 2, g[0]); p.rect(8, 5, 2, 10, g[0]); for (const [x, y] of [[6, 7], [11, 9], [6, 12], [3, 8], [14, 7], [11, 13]]) { p.set(x, y, g[2]); p.set(x + 1, y + 1, g[0]); } });
  mk('deo', p => { p.rect(6, 6, 6, 9, C('#5c6e7a')); p.rect(6, 6, 1, 9, C('#8c9ea8')); p.rect(11, 6, 1, 9, C('#3c4a54')); p.rect(7, 4, 4, 2, st[1]); p.rect(8, 2, 3, 2, st[2]); p.set(12, 2, C('#cfe0e8')); p.set(14, 1, C('#cfe0e8')); p.set(14, 3, C('#cfe0e8')); p.rect(7, 9, 4, 3, C('#d8c040')); });
  mk('hagle', p => { for (let i = 0; i < 11; i++) { const x = 6 + i, y = Math.round(11 - i * 0.6); p.set(x, y, st[1]); p.set(x, y - 1, st[2]); } p.rect(4, 10, 3, 2, st[0]); p.line(7, 12, 10, 10, wd[2], 1); p.rect(1, 11, 4, 2, wd[1]); p.rect(1, 13, 2, 1, wd[0]); p.set(1, 11, wd[2]); p.set(5, 12, st[0]); });
  // buen med strengen rett og lemmene i en bue, og en bunt piler med jaktspiss og rød og hvit fjær
  mk('bow', p => {
    for (let y = 1; y <= 15; y++) { const x = 4 + Math.round(7 * Math.sin(Math.PI * (y - 1) / 14)); p.set(x, y, wd[1]); p.set(x + 1, y, wd[0]); if (y > 5 && y < 11) p.set(x - 1, y, wd[2]); }
    p.line(4, 1, 4, 15, C('#e8e2d0'), 1); p.rect(10, 7, 2, 3, C('#3a2a1c')); p.set(4, 1, wd[0]); p.set(4, 15, wd[0]);
  });
  mk('arrows', p => {
    for (const o of [0, 3, 6]) {
      p.line(2 + o, 14, 10 + o, 3, C('#2c2a26'), 1); p.set(11 + o, 2, st[3]); p.set(10 + o, 2, st[2]); p.set(11 + o, 3, st[2]);
      p.set(2 + o, 13, C('#c43a2c')); p.set(3 + o, 14, C('#c43a2c')); p.set(1 + o, 14, C('#e8e2d0')); p.set(2 + o, 15, C('#e8e2d0'));
    }
  });
  mk('choke', p => { p.rect(3, 7, 12, 4, st[1]); p.rect(3, 7, 12, 1, st[2]); p.rect(3, 10, 12, 1, st[0]); for (let x = 4; x < 9; x += 2) { p.set(x, 8, st[0]); p.set(x, 9, st[0]); } p.rect(12, 6, 3, 6, st[0]); p.rect(13, 7, 1, 4, st[2]); });
  mk('shell', p => { p.rect(6, 3, 6, 10, C('#b8302a')); p.rect(6, 3, 1, 10, C('#d85040')); p.rect(11, 3, 1, 10, C('#8a2020')); p.rect(7, 3, 4, 1, C('#8a2020')); p.rect(5, 13, 8, 3, br[1]); p.rect(5, 13, 1, 3, br[2]); p.rect(12, 13, 1, 3, br[0]); });
  mk('axe', p => { for (let i = 0; i < 12; i++) { p.set(4 + i * 0.6, 16 - i, wd[1]); p.set(5 + i * 0.6, 16 - i, wd[2]); } p.rect(9, 3, 5, 4, st[1]); p.rect(9, 3, 5, 1, st[2]); p.rect(13, 1, 3, 8, st[2]); p.rect(15, 1, 1, 8, st[3]); p.set(9, 7, st[0]); });
  mk('match', p => { p.rect(3, 9, 12, 7, C('#d8b048')); p.rect(3, 9, 12, 1, C('#f0d070')); p.rect(5, 11, 8, 3, C('#3a5a8a')); p.rect(3, 15, 12, 1, C('#a07a28')); for (let i = 0; i < 3; i++) { p.line(5 + i * 3, 8, 6 + i * 3, 3, C('#e8d0a0'), 1); p.rect(6 + i * 3, 1, 1, 2, C('#d03a2a')); } });
  mk('fire', p => { p.line(2, 15, 14, 12, wd[1], 2); p.line(2, 12, 14, 15, wd[2], 2); p.ell(8.5, 8.5, 3.8, 5.2, C('#d8502a')); p.ell(8.5, 9.6, 2.6, 3.8, C('#f4a034')); p.ell(8.5, 10.8, 1.3, 2.2, C('#fff0a0')); p.set(7, 2, C('#d8502a')); p.set(10, 3, C('#f4a034')); });
  mk('treat', p => { const c = T('#9a7a50', '#d2bc90', '#f2e6c8'); p.line(5, 12, 12, 5, c[1], 3); for (const [x, y] of [[3, 12], [5, 14], [12, 3], [14, 5]]) p.ell(x, y, 1.8, 1.8, c[1]); p.line(5, 11, 11, 5, c[2], 1); p.line(6, 13, 13, 6, c[0], 1); });
  // til inventaret: mynt, vedkubber sett fra enden, kjøttlår og rifle med kikkert
  mk('coin', p => { p.ell(8.5, 10.5, 6, 5.5, br[0]); p.ell(8.5, 9, 6, 5.5, br[1]); p.ell(8.5, 9, 4, 3.6, br[2]); p.ell(8.5, 9, 3, 2.6, br[1]); p.rect(8, 7, 1, 4, br[0]); p.set(5, 6, C('#fff4c0')); p.set(6, 5, C('#fff4c0')); });
  mk('wood', p => { for (const [x, y] of [[5, 12.5], [12, 12.5], [8.5, 6]]) { p.ell(x, y, 3.6, 3.6, wd[0]); p.ell(x, y, 2.7, 2.7, C('#d8b880')); p.ell(x, y, 1.1, 1.1, C('#b08850')); } });
  mk('meat', p => { p.line(8, 8, 14, 14, C('#efe6d4'), 2); p.ell(15.5, 13.5, 1.7, 1.7, C('#efe6d4')); p.ell(13.5, 15.5, 1.7, 1.7, C('#efe6d4')); p.ell(6.5, 6.5, 5, 4.4, C('#a8382f')); p.ell(5.6, 5.6, 3.2, 2.5, C('#d0584c')); p.ell(4.6, 4.8, 1.3, 0.9, C('#f0a090')); });
  mk('rifle', p => {
    for (let i = 0; i < 12; i++) { const x = 5 + i, y = Math.round(12 - i * 0.6); p.set(x, y, st[1]); p.set(x, y - 1, st[2]); }
    p.rect(1, 12, 5, 2, wd[1]); p.rect(1, 14, 3, 1, wd[0]); p.set(1, 12, wd[2]); p.line(6, 13, 9, 11, wd[2], 1);
    for (let i = 0; i < 6; i++) { const x = 7 + i, y = Math.round(8 - i * 0.6); p.set(x, y, st[0]); p.set(x, y - 1, st[1]); }
    p.set(8, 9, st[0]); p.set(11, 7, st[0]); p.set(13, 3, C('#7ab0c8'));
  });
  // til hjulet: brettet kart med skog, vann og en rød sti
  mk('map', p => {
    const pa = T('#bfae80', '#dccb9c', '#f0e4bc');
    for (let i = 0; i < 3; i++) p.rect(2 + i * 5, 3 + (i & 1), 5, 11, pa[[1, 0, 2][i]]);
    p.rect(3, 5, 3, 3, C('#5a8a4a')); p.rect(13, 6, 2, 3, C('#5a8a4a')); p.rect(8, 10, 3, 2, C('#6aa0b0'));
    for (const [x, y] of [[4, 11], [5, 10], [7, 9], [9, 8], [11, 7], [12, 6]]) p.set(x, y, C('#c03a2a'));
    p.set(13, 4, C('#c03a2a')); p.set(14, 5, C('#c03a2a')); p.set(14, 4, C('#c03a2a')); p.set(13, 5, C('#c03a2a'));
  });
  // ryggsekk i grønn lerret med lokk, to remmer med spenner og en lomme foran
  mk('pack', p => {
    const g = T('#3a4628', '#5c6c38', '#86964e');
    p.rect(7, 1, 4, 1, wd[0]); p.set(7, 2, wd[0]); p.set(10, 2, wd[0]);
    p.rect(4, 4, 10, 12, g[1]); p.rect(4, 4, 1, 12, g[2]); p.rect(13, 4, 1, 12, g[0]); p.rect(4, 15, 10, 1, g[0]);
    p.rect(5, 3, 8, 1, g[0]); p.rect(4, 4, 10, 4, g[0]); p.rect(5, 4, 8, 1, g[2]);
    p.rect(5, 10, 8, 4, g[0]); p.rect(5, 10, 8, 1, g[2]);
    for (const x of [6, 11]) { p.rect(x, 6, 1, 5, wd[1]); p.set(x, 8, br[2]); }
  });
  // klærne på kroppen i inventaret: jakthatten jegeren går med (grønn med oransje bånd) og hansker
  mk('hat', p => { const g = T('#24361f', '#3a5232', '#5a7448'); p.ell(9, 13, 8, 2.4, g[0]); p.ell(9, 12.4, 7.4, 1.8, g[1]); p.rect(5, 5, 8, 7, g[1]); p.rect(5, 5, 1, 7, g[2]); p.rect(12, 5, 1, 7, g[0]); p.rect(6, 4, 6, 1, g[2]); p.rect(5, 9, 8, 2, C('#e07a2a')); p.rect(5, 9, 8, 1, C('#f4a040')); });
  const glove = (p, g, cuff) => { p.rect(5, 7, 7, 6, g[1]); p.rect(5, 7, 1, 6, g[2]); for (let i = 0; i < 4; i++) { p.rect(5 + i * 2, i === 0 || i === 3 ? 3 : 2, 1, 5, g[1]); p.set(5 + i * 2, i === 0 || i === 3 ? 3 : 2, g[2]); } p.rect(12, 8, 2, 1, g[1]); p.rect(13, 6, 2, 3, g[1]); p.rect(4, 13, 9, 3, cuff[0]); p.rect(4, 13, 9, 1, cuff[2]); };
  mk('glove', p => { const g = T('#5a3a22', '#8a5a34', '#b07a48'); glove(p, g, g); });
  mk('boots', p => { p.rect(5, 2, 5, 10, wd[1]); p.rect(5, 2, 1, 10, wd[2]); p.rect(5, 10, 9, 4, wd[1]); p.rect(11, 10, 3, 1, wd[2]); p.rect(4, 14, 11, 2, C('#201814')); p.rect(5, 2, 5, 1, wd[0]); p.set(9, 5, br[2]); p.set(9, 7, br[2]); });
  // flere klær til bua: hatter, jakker (samme fasong i ulike stoffer), hansker og sko
  mk('beanie', p => { const g = T('#7a2a22', '#a83c2e', '#cc5a44'); p.ell(9, 11, 6, 6.5, g[1]); p.rect(0, 15, 18, 3, 0); p.rect(3, 11, 13, 4, g[0]); for (let x = 4; x < 16; x += 2) p.rect(x, 11, 1, 4, g[1]); p.set(6, 8, g[2]); p.set(7, 7, g[2]); p.set(8, 6, g[2]); p.ell(9, 3.5, 2.2, 2.2, C('#efe6d4')); });
  mk('headnet', p => { const g = T('#34482c', '#506a38', '#728a48'); p.ell(9, 7, 6, 4.5, g[1]); p.rect(0, 9, 18, 9, 0); p.rect(3, 7, 13, 2, g[0]); p.set(6, 4, g[2]); p.set(7, 3, g[2]);
    for (let y = 9; y <= 15; y++) for (let x = 3; x <= 15; x++) if ((x + y) % 2 === 0 || y === 15) p.set(x, y, (x + y) % 4 ? g[1] : g[0]); });
  mk('furhat', p => { const g = T('#4a3020', '#6e4a30', '#946a46'), f = T('#8a6a48', '#b08c64', '#d0b088');
    p.ell(9, 7, 5.5, 4.5, g[1]); p.rect(5, 11, 8, 2, 0); p.set(7, 4, g[2]); p.set(8, 3, g[2]);
    p.rect(2, 8, 14, 3, f[1]); p.rect(2, 8, 14, 1, f[2]); p.rect(2, 10, 3, 6, f[1]); p.rect(13, 10, 3, 6, f[1]); p.rect(2, 15, 3, 1, f[0]); p.rect(13, 15, 3, 1, f[0]);
    for (const [x, y] of [[4, 9], [7, 10], [10, 9], [13, 10], [3, 12], [14, 13], [3, 14], [15, 11]]) p.set(x, y, f[0]); });
  const jk = (p, g) => { p.rect(5, 4, 8, 11, g[1]); p.rect(2, 5, 3, 8, g[1]); p.rect(13, 5, 3, 8, g[1]); p.rect(2, 5, 1, 8, g[2]); p.rect(15, 5, 1, 8, g[0]); p.rect(7, 3, 4, 2, g[0]); };
  mk('jacket', p => { const g = T('#2e4a2a', '#4a6e3a', '#6a8e4e'); jk(p, g); p.rect(8, 5, 2, 10, g[0]); p.rect(5, 10, 2, 2, g[0]); p.rect(11, 10, 2, 2, g[0]); p.rect(5, 4, 1, 11, g[2]); });
  mk('wool', p => { const g = T('#4a4038', '#6e6254', '#928474'), w = C('#e8e0d0'); jk(p, g); p.rect(8, 5, 2, 3, g[0]); p.rect(5, 14, 8, 1, g[0]);
    for (let x = 2; x <= 15; x++) { p.set(x, 8, x % 2 ? w : g[0]); p.set(x, 9, x % 2 ? g[0] : w); } });
  mk('shelljk', p => { const g = T('#3a4430', '#566246', '#76845c'); jk(p, g); p.rect(6, 1, 6, 3, g[1]); p.rect(6, 1, 6, 1, g[2]); p.rect(7, 2, 4, 2, g[0]);
    p.rect(9, 4, 1, 11, C('#c8ccc0')); p.set(9, 6, C('#c03a2a')); p.rect(5, 8, 3, 1, g[0]); p.rect(11, 8, 3, 1, g[0]); });
  mk('leafy', p => { const g = T('#3a4a24', '#5a6e30', '#7e9040'), b = C('#8a6a30'); jk(p, g);
    for (const [x, y, c] of [[1, 6, g[2]], [1, 10, g[1]], [16, 7, g[2]], [16, 11, g[1]], [4, 15, g[1]], [8, 15, g[2]], [12, 15, g[1]], [6, 2, g[2]], [11, 2, g[1]], [6, 7, g[2]], [10, 6, b], [7, 11, g[0]], [11, 9, g[2]], [9, 13, b], [3, 9, g[0]], [14, 6, b]]) p.set(x, y, c); });
  mk('shootglove', p => { glove(p, T('#1e2420', '#343c36', '#505a52'), T('#34482c', '#506a38', '#728a48')); p.rect(7, 2, 1, 2, C('#c48e68')); });
  mk('mitten', p => { const g = T('#7a2a22', '#a83c2e', '#cc5a44'), w = C('#e8e0d0'); p.ell(8.5, 7, 4, 5, g[1]); p.ell(13, 9, 1.6, 2.4, g[1]); p.rect(5, 7, 8, 6, g[1]); p.set(6, 4, g[2]); p.set(6, 5, g[2]);
    for (const [x, y] of [[7, 6], [10, 6], [8.5, 8], [7, 10], [10, 10]]) p.set(x, y, w); p.rect(4, 13, 9, 3, w); p.rect(5, 14, 7, 1, C('#c8c0b0')); });
  mk('rubber', p => { const g = T('#1e3a24', '#2e5634', '#467a4a'); p.rect(5, 1, 6, 11, g[1]); p.rect(5, 1, 1, 11, g[2]); p.rect(10, 1, 1, 10, g[0]); p.rect(5, 1, 6, 1, g[0]); p.rect(5, 11, 10, 4, g[1]); p.rect(11, 11, 3, 1, g[2]); p.set(14, 12, g[0]); p.rect(4, 15, 11, 2, C('#1a1a18')); });
  mk('sneaker', p => { const b = T('#24406a', '#3a6ab0', '#6a98d8'), w = C('#eeeeea');
    p.rect(3, 8, 9, 6, b[1]); p.ell(12.5, 11.5, 3, 2.5, b[1]); p.rect(3, 8, 9, 1, b[2]); p.rect(3, 8, 4, 2, C('#1c2a44'));
    for (const x of [8, 10]) { p.set(x, 9, w); p.set(x + 1, 10, w); } p.rect(4, 12, 9, 1, b[2]); p.rect(2, 14, 14, 2, w); p.rect(2, 15, 14, 1, C('#c8c8c0')); });
  mk('leather', p => { const l = T('#3a2418', '#5a3a24', '#7a5236'), s = T('#9a9080', '#c8c0b0', '#e8e0d0');
    p.rect(5, 4, 6, 8, l[1]); p.rect(5, 4, 1, 8, l[2]); p.rect(10, 4, 1, 8, l[0]); p.rect(5, 11, 10, 4, l[1]); p.rect(11, 11, 3, 1, l[2]); p.rect(4, 15, 11, 2, C('#201814'));
    for (const [x, y] of [[7, 6], [8, 7], [7, 8], [8, 9], [7, 10]]) p.set(x, y, br[2]);
    p.rect(4, 1, 8, 3, s[1]); p.rect(4, 1, 8, 1, s[2]); for (const x of [5, 7, 9, 11]) p.rect(x, 2, 1, 2, s[0]); });
  // stallen: fjording fra siden, sal med stigbøyle og den ekstra ryggsekken til hesten
  mk('horse', p => {
    const c = T('#8a6a40', '#b08a56', '#cca870', '#e0c490'), d = C('#2a2018');
    p.rect(3, 8, 10, 5, c[2]); p.rect(3, 8, 10, 1, c[3]); p.rect(3, 12, 10, 1, c[1]); p.rect(11, 4, 3, 5, c[2]); p.rect(12, 2, 4, 3, c[2]); p.rect(15, 4, 2, 2, c[1]);
    p.set(12, 1, c[2]); p.set(14, 3, d); p.rect(10, 3, 1, 5, d); p.set(11, 2, d); p.rect(2, 8, 1, 6, d);
    for (const x of [4, 6, 10, 12]) { p.rect(x, 13, 1, 3, c[1]); p.set(x, 16, d); }
  });
  mk('saddle', p => {
    const l = T('#3e2616', '#5c3a22', '#7c5232', '#9a6c44'), s = C('#a8aca6');
    p.rect(3, 6, 12, 3, l[2]); p.rect(3, 4, 2, 2, l[2]); p.rect(13, 3, 2, 3, l[2]); p.rect(4, 6, 10, 1, l[3]);
    p.rect(5, 9, 8, 5, l[1]); p.rect(5, 9, 1, 5, l[2]); p.rect(6, 13, 6, 1, l[0]);
    p.rect(9, 13, 1, 2, l[0]); p.rect(8, 15, 3, 1, s); p.set(8, 16, s); p.set(10, 16, s); p.rect(8, 17, 3, 1, s);
  });
  mk('hbag', p => {
    const g = T('#5c3e28', '#80583a', '#a07448', '#b88c5c'), l = C('#3e2616');
    p.rect(4, 4, 10, 12, g[1]); p.rect(4, 4, 10, 2, g[2]); p.rect(4, 4, 1, 12, g[2]); p.rect(13, 5, 1, 11, g[0]); p.rect(5, 2, 8, 2, g[2]); p.rect(5, 2, 8, 1, g[3]);
    p.rect(6, 10, 6, 4, g[0]); p.rect(6, 10, 6, 1, g[2]); p.rect(8, 5, 2, 4, l); p.set(8, 8, br[2]); p.set(9, 8, br[2]);
  });
  // hundesekk: to sidevesker i oransje med refleks, festet sammen over ryggen, med håndtak på toppen og reim under buken
  mk('dogpack', p => {
    const g = T('#8a3418', '#c45a1c', '#ee7c2a'), bk = C('#2a2a28');
    p.rect(8, 2, 2, 2, bk); p.rect(5, 4, 8, 3, g[1]); p.rect(5, 4, 8, 1, g[2]);
    for (const x of [2, 11]) { p.rect(x, 6, 5, 9, g[1]); p.rect(x, 6, 5, 2, g[0]); p.rect(x, 6, 5, 1, g[2]); p.rect(x, 12, 5, 1, C('#e8e8d8')); p.set(x + 2, 9, br[2]); }
    p.rect(2, 6, 1, 9, g[2]); p.rect(15, 6, 1, 9, g[0]); p.rect(7, 13, 4, 1, bk);
  });
  // jaktbukse i samme grønne stoff som jakka, med belte, lårlommer og et gap mellom beina
  mk('pants', p => {
    const g = T('#2e4a2a', '#4a6e3a', '#6a8e4e');
    p.rect(4, 2, 10, 7, g[1]); p.rect(4, 9, 4, 7, g[1]); p.rect(10, 9, 4, 7, g[1]);
    p.rect(4, 2, 1, 14, g[2]); p.rect(10, 9, 1, 7, g[2]); p.rect(13, 2, 1, 14, g[0]); p.rect(7, 9, 1, 7, g[0]);
    p.rect(4, 2, 10, 2, wd[1]); p.rect(4, 2, 10, 1, wd[2]); p.rect(8, 2, 2, 2, br[1]); p.set(8, 2, br[2]); p.rect(9, 4, 1, 4, g[0]);
    for (const x of [4, 11]) { p.rect(x, 10, 3, 3, g[0]); p.rect(x, 10, 3, 1, g[2]); }
    p.rect(4, 15, 4, 1, g[0]); p.rect(10, 15, 4, 1, g[0]);
  });
  // Jaktknivene, ett ikon per trinn i bua, på skrå med skaftet nede til venstre og spissen oppe til høyre. u går langs
  // kniven (0 til 16) og v på tvers, negativ mot ryggen og positiv mot eggen; at(u, v) gir fargen der, eller 0
  const knife = (id, at) => mk(id, p => { for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) { const c = at((x - y + 15) / 2, x + y - 17); if (c) p.set(x, y, c); } });
  // skaft fra a til b, så bredt som hw(t) til hver side (t går fra 0 til 1), lyst mot ryggen og mørkt mot eggen
  const hilt = (u, v, a, b, hw, P) => { if (u < a || u >= b) return 0; const w = Math.floor(hw((u - a) / (b - a)) + 1e-6); return Math.abs(v) > w ? 0 : v === -w ? P[2] : v === w ? P[0] : P[1]; };
  // blad fra a til spissen b: ryggen ligger sp(t) og eggen eg(t) ut fra midten. Mørk rygg, flate, slipt fas og blank egg
  const blade = (u, v, a, b, sp, eg, P) => {
    if (u < a || u > b) return 0;
    const t = (u - a) / (b - a), lo = Math.ceil(-sp(t) - 1e-6), hi = Math.floor(eg(t) + 1e-6);
    return v < lo || v > hi ? 0 : v === hi && hi > lo ? P[3] : v === lo ? P[0] : v === hi - 1 ? P[2] : P[1];
  };
  const steel = T('#3a4044', '#646c70', '#9aa2a6', '#d8e0e0'), dull = T('#3a4044', '#5c6468', '#848c90', '#aab2b4');
  // 0 enkel speiderkniv: kort, butt blad og skaft i rød plast
  knife('knife0', (u, v) => hilt(u, v, 1, 6.5, t => t < 0.08 ? 0 : 1, T('#7a1e18', '#b83228', '#e0584a'))
    || blade(u, v, 6.5, 11.5, t => t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3, t => t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4 * 1.5, dull));
  // 1 tollekniv: tønneformet bjørkeskaft, messingholk og slankt blad i mørkt karbonstål med rett rygg
  knife('knife1', (u, v) => hilt(u, v, 0.5, 7, t => 1 + Math.sin(Math.PI * t), T('#a07a48', '#d4b07a', '#f0d8a8'))
    || hilt(u, v, 7, 7.6, () => 1, br)
    || blade(u, v, 7.6, 14, () => 1, t => t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45 * 2, T('#24282a', '#40474b', '#6e777b', '#d0d8d8')));
  // 2 jaktkniv med parerplate: skinnskaft i ringer med messingknott, parerplate og et bredt blad med blodrenne
  knife('knife2', (u, v) => hilt(u, v, 0, 1, () => 1, br)
    || (u >= 1 && u < 6.5 && Math.abs(v) <= 1 ? (Math.floor(u * 2) % 3 === 0 ? C('#2a1a10') : hilt(u, v, 1, 6.5, () => 1, T('#4a2e1c', '#7a5236', '#9a6e48'))) : 0)
    || hilt(u, v, 6.5, 7.5, () => 3, br)
    || (u > 8 && u < 11.5 && v === 0 ? steel[0] : blade(u, v, 7.5, 15, t => t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25, t => t < 0.55 ? 2 : 2 - (t - 0.55) / 0.45 * 2, steel)));
  // 3 flåkniv: svart gummiskaft med oransje innlegg, stålbolster og et kort blad med stor buk og spissen bøyd opp
  knife('knife3', (u, v) => (u >= 1.5 && u < 5.5 && v === 0 ? C('#ee7c2a') : hilt(u, v, 0.5, 6.5, t => t < 0.08 ? 1 : 1.5, T('#141414', '#2a2c2a', '#4a4e4a')))
    || hilt(u, v, 6.5, 7.2, () => 1.5, steel)
    || blade(u, v, 7.2, 14.5, t => 1 + 1.5 * t * t, t => 1 + 3 * Math.sin(Math.PI * t) - 4 * t * t, steel));
  // 4 samekniv: skaft av hvitt reinhorn med inngraverte brune prikker og to messingringer, og et langt, rett blad
  const horn = T('#a89878', '#e4dcc4', '#fbf6ea');
  knife('knife4', (u, v) => {
    const hc = hilt(u, v, 0, 6.8, t => t < 0.05 ? 1 : 1.5, horn);
    if (hc) return u >= 1 && u < 1.5 || u >= 5.8 && u < 6.3 ? br[1] : hc !== horn[0] && u >= 1.5 && u < 5.8 && (Math.floor(u * 2) + v + 8) % 4 === 0 ? C('#7a4a26') : hc;
    return blade(u, v, 6.8, 15.5, t => t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12 * 1.5, t => t < 0.65 ? 2 : 2 - (t - 0.65) / 0.35 * 3, steel);
  });
  // 5 damaskuskniv: skaft i flammebjørk med sølvknott, svarte og messing mellomlegg, gullbolster og et bredt
  // blad i bølgete damaskusmønster med blank egg
  const dam = T('#2e3236', '#5a6064', '#a8b0b4', '#f0f6f6');
  knife('knife5', (u, v) => hilt(u, v, 0, 0.8, () => 1, steel)
    || hilt(u, v, 0.8, 1.3, () => 1.5, T('#0e0e0e', '#1e1e1e', '#3a3a3a'))
    || (u >= 1.3 && u < 6 && Math.abs(v) <= 1.5 + 1e-6 ? (Math.sin(u * 3 + v * 1.4) > 0.55 ? C('#5a2e10') : hilt(u, v, 1.3, 6, () => 1.5, T('#7a4416', '#b8702c', '#e0a050'))) : 0)
    || hilt(u, v, 6, 6.5, () => 1.5, T('#0e0e0e', '#1e1e1e', '#3a3a3a'))
    || hilt(u, v, 6.5, 7.3, () => 2, br)
    || ((c => c === dam[1] || c === dam[2] ? ((Math.floor(u * 2 + v * 0.7 + Math.sin(u * 1.4) * 1.6) % 3 + 3) % 3 ? C('#626a70') : C('#c8d0d4')) : c)(blade(u, v, 7.3, 15.8, t => t < 0.78 ? 1 : 1 - (t - 0.78) / 0.22 * 2, t => t < 0.5 ? 3 : 3 - (t - 0.5) / 0.5 * 4, dam))));
  return I;
}

function genAll() {
  for (let i = 0; i < 7; i++) genSpruce(100 + i * 13);
  for (let i = 0; i < 5; i++) genPine(200 + i * 17);
  for (let i = 0; i < BIRCH_TONES.length * 2; i++) genBirch(300 + i * 19, BIRCH_TONES[i % BIRCH_TONES.length]);
  for (let i = 0; i < 3; i++) genRowan(400 + i * 7);
  for (let i = 0; i < 2; i++) genSnag(450 + i * 7);
  for (let i = 0; i < 3; i++) genJuniper(500 + i * 11);
  genFern(600, ['#4a5a26', '#748832', '#a4b044', '#c8cc66']); genFern(611, ['#6a5220', '#a08430', '#c8a840', '#e0c860']); genFern(622, ['#6a4220', '#a06428', '#c88c38', '#dcae58']);
  genShrub('shrub', 700, ['#4a2826', '#7c3a2a', '#aa522e', '#cc7a38'], '#3c4c84'); genShrub('shrub', 711, ['#4a2826', '#7c3a2a', '#aa522e', '#cc7a38']);
  genShrub('shrub', 722, ['#2c4a30', '#3e663a', '#588444', '#76a052'], '#3c4c84'); genShrub('shrub', 733, ['#5a4a22', '#8a742e', '#b49a40', '#d4bc5c']);
  genShrub('heather', 800, ['#46304a', '#6e4670', '#9a6490', '#c88cb0']); genShrub('heather', 811, ['#46304a', '#6e4670', '#9a6490', '#c88cb0']);
  for (let i = 0; i < 3; i++) genGrassT(900 + i * 5);
  for (let i = 0; i < 2; i++) genReed(950 + i * 5);
  [[4, 3], [5, 4], [7, 5], [9, 6], [12, 8]].forEach((s, i) => genRock(1000 + i * 9, s[0], s[1]));
  genStump(1100); genStump(1107); genLog(1200); genLog(1213);
  genCairn(); genBauta(); genTower(); genFence(); genPalisade(); genGates();
  genWell(); for (let k = 0; k < 3; k++) genStall(k); genLamp(); genVProps();
  [...NPC_PAL, ...VIL_PAL].forEach(pal => (SPR.npc = SPR.npc || []).push(Object.assign(genHunter('down', 0, -1, false, -1, pal), { r: 3 })));
  for (const sp of SPECIES) {
    ANI[sp] = {};
    for (const sex of ['m', 'f']) {
      const o = ANI[sp][sex] = {}, gen = SPEC[sp].bird ? genBird : genAnimal;
      o.stand = [gen(sp, sex, 'stand', 0)]; o.alert = [gen(sp, sex, 'alert', 0)];
      o.graze = [0, 1].map(f => gen(sp, sex, 'graze', f));
      o.walk = [0, 1, 2, 3].map(f => gen(sp, sex, 'walk', f));
      o.run = SPEC[sp].bird ? o.walk : [0, 1, 2, 3].map(f => gen(sp, sex, 'run', f));
      if (SPEC[sp].bird) o.fly = [0, 1, 2, 3].map(f => gen(sp, sex, 'fly', f));
      o.dead = [gen(sp, sex, 'dead', 0)];
    }
  }
  // hunden og jegeren tegnes i 3D (11-figs.js); pikselbildene brukes bare som ikoner
  DOGSPR.stand = [genAnimal(null, 'm', 'stand', 0, DOG)];
  for (const d of ['side', 'down', 'up']) HUN[d] = [[genHunter(d, 0)]];
  genFx(); ICON = genIcons();
}
