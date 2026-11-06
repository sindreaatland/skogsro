// ===== Sprites: all grafikk tegnes prosedyrisk som pikselkunst ved oppstart =====
const SPR = {};   // statiske ting i skogen, SPR[type][variant]
const ANI = {};   // dyr, ANI[art][kjønn][positur][bilde]
const HUN = {};   // jeger, HUN[retning][sikter][bilde]
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
];
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

// ---------- Jaktbua (hytte med torvtak) ----------
function genCabin() {
  const w = 86, h = 76, p = new Pix(w, h), bx = 7, bw = 64, wy0 = 38, wy1 = 67;
  const lg = T('#38281e', '#4c3628', '#5f4632', '#7a5c40'), st = T('#3e4246', '#5a6062', '#7e8482', '#a2a69e');
  // pipe
  for (let y = 3; y <= 16; y++) for (let x = 55; x <= 61; x++) p.set(x, y, st[(hash2(x >> 1, (y + (x >> 1)) >> 1, 5) * 3 + (x < 57 ? 1 : 0)) | 0]);
  p.rect(54, 2, 9, 1, st[0]); p.rect(54, 3, 9, 1, st[3]);
  // tømmervegg
  for (let y = wy0; y <= wy1; y++) for (let x = bx; x < bx + bw; x++) {
    const rr = (y - wy0) % 4; let c = rr === 0 ? lg[3] : rr === 3 ? lg[0] : rr === 1 ? lg[2] : lg[1];
    if (rr !== 3 && hash2(x >> 2, y >> 2, 9) < 0.08) c = lg[1];
    p.set(x, y, c);
  }
  for (let y = wy0; y <= wy1 - 2; y += 4) { p.rect(bx - 2, y, 3, 3, C('#8e6e4a')); p.set(bx - 1, y + 1, C('#5a4030')); p.rect(bx + bw - 1, y, 3, 3, C('#8e6e4a')); p.set(bx + bw, y + 1, C('#5a4030')); }
  // torvtak
  const ry0 = 12, ry1 = 40, gr = T('#38562e', '#4a6c36', '#60863e', '#7a9e48', '#96b256');
  for (let y = ry0; y <= ry1; y++) {
    const f = (y - ry0) / (ry1 - ry0), xl = Math.round(lerp(12, 1, f)), xr = Math.round(lerp(w - 13, w - 2, f));
    for (let x = xl; x <= xr; x++) p.set(x, y, tone(gr, 0.78 - f * 0.5 + (hash2(x >> 1, y >> 1, 31) - 0.5) * 0.36, x, y, 2));
  }
  for (let x = 12; x <= w - 13; x++) { if (hash2(x, 1, 33) < 0.6) p.set(x, ry0 - 1, gr[3]); if (hash2(x, 2, 33) < 0.25) p.set(x, ry0 - 2, gr[4]); }
  const fl = T('#f2eee0', '#f0d050', '#d07a9c');
  for (let i = 0; i < 9; i++) p.set(8 + ((hash2(i, 3, 35) * 68) | 0), 15 + ((hash2(i, 4, 35) * 22) | 0), fl[i % 3]);
  for (let x = 0; x < w; x++) { p.set(x, ry1 + 1, C('#e6e0cc')); p.set(x, ry1 + 2, C('#2c1e16')); if (x >= bx && x < bx + bw) { p.set(x, ry1 + 3, C('#261a14')); p.set(x, ry1 + 4, dkc(p.get(x, ry1 + 4), 0.7)); } }
  // skilt på takkanten
  p.rect(17, 33, 19, 9, C('#2c1e16')); p.rect(18, 34, 17, 7, C('#e2d2a8'));
  const gl = { B: ['110', '101', '110', '101', '110'], U: ['101', '101', '101', '101', '111'], A: ['010', '101', '111', '101', '101'] };
  'BUA'.split('').forEach((ch, i) => gl[ch].forEach((row, j) => row.split('').forEach((b, k) => { if (b === '1') p.set(21 + i * 4 + k, 35 + j, C('#2c1e16')); })));
  // dør
  p.rect(20, 46, 13, 22, C('#261a14')); p.rect(21, 47, 11, 21, C('#5c3c28'));
  for (let y = 47; y <= 67; y++) { p.set(24, y, C('#48301f')); p.set(28, y, C('#48301f')); p.set(21, y, C('#6e4a32')); }
  p.set(30, 58, C('#e6b63c')); p.set(30, 59, C('#a07a20'));
  // vindu
  p.rect(41, 46, 19, 14, C('#d6c69c')); p.rect(42, 47, 17, 12, C('#f0bc50')); p.rect(42, 47, 17, 3, C('#f8dc88'));
  p.rect(50, 47, 1, 12, C('#d6c69c')); p.rect(42, 52, 17, 1, C('#d6c69c'));
  p.rect(41, 60, 19, 2, C('#48301f')); for (let i = 0; i < 6; i++) p.set(43 + i * 3, 59, i & 1 ? C('#e8302a') : C('#f2eee0'));
  // lykt
  p.rect(15, 49, 3, 5, C('#261a14')); p.set(16, 50, C('#ffe08a')); p.set(16, 51, C('#ffc850')); p.set(16, 52, C('#ffe08a'));
  // trapp
  p.rect(19, 68, 15, 1, C('#8e6e4a')); p.rect(18, 69, 17, 1, C('#5f4632'));
  // vedstabel
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = 72 + i * 3 + (j & 1), y = 57 + j * 3; if (x > 82) continue; p.rect(x, y, 3, 3, C('#7a5c40')); p.rect(x, y, 2, 2, C('#c8a474')); p.set(x, y, C('#dcc090')); }
  // gevir over vinduet
  p.line(36, 49, 34, 45, C('#d2c39c'), 1); p.line(37, 49, 39, 45, C('#d2c39c'), 1); p.set(33, 46, C('#d2c39c')); p.set(40, 46, C('#d2c39c')); p.set(36, 50, C('#8a7a5c')); p.set(37, 50, C('#8a7a5c'));
  p.outlineAuto(0.45);
  return reg('cabin', p, 39, 68, { rect: [-33, -15, 34, 1], tallC: 1 });
}

// ---------- Dyr ----------
const AW = 84, AH = 76, AOX = 40, AOY = 64;
const SPEC = {
  radyr: { name: 'Rådyr', sexn: { m: 'bukk', f: 'geit' }, seed: 11, L: 16, Hh: 7, leg: 9, lw: 2, ll: 1, legIn: 2, sw: 2, hock: 1, rumpR: 4, chestR: 3.6, neckL: 6.5, neckA: 62, neckW: 1.9, hl: 4.4, hh: 3.6, sl: 2.6, sh: 2.2, sdy: 0.5, hd: 14, ear: 3, ant: { m: 'roe' },
    col: { dk: '#74452a', body: '#a0633a', lt: '#bd8250', belly: '#d4b088', rump: '#f0e8d4', legLo: '#7c4c2e', legFar: '#5c3824', nose: '#1e1614' },
    kg: { m: [20, 32], f: [17, 27] }, hp: 35, value: 260, walk: 13, run: 104, sight: 150, smell: 215, hear: 1, nerv: 1.2, grp: [1, 2] },
  rev: { name: 'Rev', sexn: { m: 'hannrev', f: 'tispe' }, seed: 23, L: 13, Hh: 5, leg: 5, lw: 2, ll: 1, legIn: 2, sw: 1.6, hock: 0.6, rumpR: 3, chestR: 3, neckL: 3.4, neckA: 40, neckW: 1.9, hl: 4.2, hh: 3.6, sl: 3, sh: 1.6, sdy: 0.8, hd: 8, ear: 3, headT: 'fox', tail: 9,
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
};
const SPECIES = Object.keys(SPEC);
for (const k of SPECIES) SPEC[k].id = k;

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

function genAnimal(sp, sex, pose, f) {
  const A = SPEC[sp], c = A.col, p = new Pix(AW, AH), ox = AOX, oy = AOY, L = A.L, Hh = A.Hh, leg = A.leg, seed = A.seed;
  const tn = T(c.dk, c.body, c.lt), belly = c.belly ? C(c.belly) : 0;
  const legU = C(c.legU || c.body), legLo = C(c.legLo || c.dk), legF = C(c.legFar || c.dk), hoof = C('#1c1614');
  const ntn = c.neck ? T(c.neckDk, c.neck, c.neckLt) : tn;
  const stn = c.snout ? T(c.dk, c.snout, c.snout) : tn;
  const antT = A.ant && A.ant[sex], antC = C('#d6c8a2'), antD = C('#8e7e60');
  const dead = pose === 'dead';
  let off = [0, 0, 0, 0], lift = [0, 0, 0, 0], bob = 0, nA = A.neckA, earA = 112, tailDroop = 3;
  if (pose === 'walk') { const s = [1, 0, -1, 0][f] * A.sw; off = [s, -s, -s, s]; if (f === 1) lift = [1, 0, 0, 1]; if (f === 3) lift = [0, 1, 1, 0]; nA -= 6; }
  else if (pose === 'run') {
    const k = A.sw * 1.7;
    off = [[1, 0.6, -1, -0.7], [0.3, 0.9, -0.2, -0.8], [-0.9, -0.5, 0.9, 0.6], [-0.2, -0.7, 0.3, 0.9]][f].map(v => v * k);
    lift = [[0, 0, 0, 0], [1, 0, 2, 1], [1, 2, 0, 0], [2, 1, 1, 0]][f]; bob = [-1, 0, 0, -1][f]; nA -= 16; earA = 150; tailDroop = 0;
  } else if (pose === 'alert') { nA = Math.min(86, nA + 18); earA = 96; }
  let by, Sx, Sy, hx, hy, hang, antRot = 0, nearLegs = null;
  const tailFn = (ty, droop) => {
    if (A.headT === 'fox') {
      for (let i = 0; i <= 12; i++) { const t = i / 12, x = ox - L / 2 + 1 - A.tail * t, y = ty + droop * t * t, rr = 1 + Math.sin(t * Math.PI) * 1.5; shEll(p, x, y, rr, rr, t > 0.72 ? T('#cfc6b6', '#efe6d6', '#ffffff') : tn, 0, seed + 8); }
    } else if (A.headT === 'boar') { p.line(ox - L / 2, ty - 2, ox - L / 2 - 2, ty + 1, C(c.dk), 1); p.set(ox - L / 2 - 2, ty + 2, C(c.dk)); }
  };
  if (dead) {
    by = oy - Hh * 0.42;
    const lc = [[ox + L / 2 - A.legIn, 1], [ox + L / 2 - A.legIn - 3, 0], [ox - L / 2 + A.legIn + 2, 1], [ox - L / 2 + A.legIn - 1, 0]];
    for (const [lx, near] of lc) { const ex = lx + leg * 0.42, ey = by + 2 + leg * 0.5; p.line(lx, by + 1, ex, ey, near ? legLo : legF, A.ll); p.set(ex, ey, hoof); }
    tailFn(by + 1, 1);
    shEll(p, ox, by, L / 2, Hh * 0.42, tn, belly, seed); shEll(p, ox - L / 2 + A.rumpR * 0.8, by, A.rumpR, Hh * 0.42, tn, belly, seed + 1); shEll(p, ox + L / 2 - A.chestR * 0.8, by, A.chestR, Hh * 0.45, tn, belly, seed + 2);
    if (c.rump) p.ell(ox - L / 2 + 0.5, by, 1.6, Hh * 0.28, C(c.rump));
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
    Sx = ox + L / 2 - A.chestR * 0.7; Sy = by - Hh * 0.2;
    if (pose === 'graze') { const drop = (oy - A.hh / 2 - 1) - Sy; hx = Sx + Math.max(A.neckL * 0.9, drop * 0.72); hy = oy - A.hh / 2 - 1 + (f ? -1 : 0); hang = 1.0; antRot = 0.6; }
    else { const a = nA * Math.PI / 180; hx = Sx + Math.cos(a) * A.neckL; hy = Sy - Math.sin(a) * A.neckL; hang = A.hd * Math.PI / 180; }
    nearLegs = () => { drawLeg(fx, off[0], lift[0], 0, 0); drawLeg(bx, off[2], lift[2], 0, 1); };
  }
  // hals
  const steps = Math.max(1, Math.ceil(hyp(hx - Sx, hy - Sy)));
  for (let i = 0; i <= steps; i++) { const t = i / steps, rr = lerp(A.neckW, A.neckW * 0.74, t); shEll(p, lerp(Sx, hx, t), lerp(Sy, hy, t), rr, rr, ntn, 0, seed + 4); }
  if (A.headT === 'elg' && !dead) { const mx = lerp(Sx, hx, 0.62), my = lerp(Sy, hy, 0.62) + A.neckW; p.line(mx, my, mx, my + 3, C(c.dk), 1); p.set(mx + 1, my, C(c.dk)); p.set(mx + 1, my + 1, C(c.dk)); }
  if (A.headT === 'fox' && !dead) p.ell(Sx + 1, Sy + 2.2, 1.8, 2.2, C(c.belly));
  // fjerne gevir bak hodet
  const abx = hx - 0.6, aby = hy - A.hh / 2 + 0.4;
  if (antT) drawAntler(p, abx + 1.6, aby - 0.4, antT, antRot, antD, 1);
  // ører
  const ea = earA * Math.PI / 180, ex0 = hx - A.hl / 2 + 1.2, ey0 = hy - A.hh / 2 + 0.6;
  if (A.headT === 'bear') { p.ell(hx - 1.6, hy - A.hh / 2 + 0.2, 1.3, 1.3, tn[0]); }
  // hode + snute
  shEll(p, hx, hy, A.hl / 2, A.hh / 2, tn, 0, seed + 5);
  const sd = A.hl / 2 + A.sl / 2 - 0.9, sx = hx + Math.cos(hang) * sd, sy = hy + Math.sin(hang) * sd + A.sdy * Math.cos(hang);
  shEll(p, sx, sy, A.sl / 2 + 0.3, A.sh / 2, stn, 0, seed + 6);
  const nx = sx + Math.cos(hang) * (A.sl / 2 - 0.2), ny = sy + Math.sin(hang) * (A.sl / 2 - 0.2);
  p.set(nx, ny, C(c.nose));
  if (A.headT === 'boar') { p.set(nx, ny - 1, C(c.nose)); p.set(nx - 1.5, ny + 1.4, C('#f2eee0')); }
  if (A.headT === 'bear') p.set(nx, ny + 0.2, C(c.nose));
  if (A.headT === 'fox') p.set(sx - 0.5, sy + 1, C(c.belly));
  if (!dead) p.set(hx + (hang > 0.6 ? -0.6 : 0.8), hy - (hang > 0.6 ? 0.2 : 0.8), C('#141010'));
  if (A.headT === 'bear') p.ell(hx - 0.4, hy - A.hh / 2 + 0.3, 1.2, 1.2, tn[1]);
  else if (A.headT === 'fox') { const tx = ex0 + Math.cos(ea) * 3.4, ty = ey0 - Math.sin(ea) * 3.4; p.line(ex0 + 1, ey0, tx + 0.6, ty, tn[1], 1); p.line(ex0, ey0, tx, ty, C('#2a201c'), 1); }
  else { p.line(ex0, ey0, ex0 + Math.cos(ea) * A.ear, ey0 - Math.sin(ea) * A.ear, tn[2], 1); p.set(ex0 + Math.cos(ea) * A.ear * 0.5 - 1, ey0 - Math.sin(ea) * A.ear * 0.5, tn[0]); }
  if (nearLegs) nearLegs();
  if (antT) drawAntler(p, abx, aby, antT, antRot, antC, 1);
  p.outlineAuto(0.42);
  return mkSpr(p, AOX, AOY, { hc: { x: hx + Math.cos(hang) * A.sl * 0.3 - ox, y: hy - oy, r: Math.max(A.hl, A.hh) / 2 + 1.3 }, nk: [Sx - ox, Sy - oy, hx - ox, hy - oy], bob });
}

// ---------- Jeger ----------
const HW = 24, HH = 30, HOX = 12, HOY = 27;
function genHunter(dir, i, aim) {
  const p = new Pix(HW, HH);
  const hat = C('#3f5c3a'), hatD = C('#2c4430'), hatL = C('#56784a'), band = C('#ee7c2a'), skin = C('#e4b48c'), skinD = C('#c48e68'), beard = C('#6b4a30'),
    jac = C('#586c3e'), jacD = C('#3f502e'), jacL = C('#718648'), pant = C('#4c3f32'), pantD = C('#382e26'), boot = C('#231c18'),
    pack = C('#80583a'), packD = C('#5c3e28'), packL = C('#a07448'), gun = C('#201a18'), wood = C('#8c5830');
  const w = i > 0, ph = i - 1, b = w && (ph & 1) ? -1 : 0;
  if (dir === 'side') {
    const s = w ? [2, 0, -2, 0][ph] : 0, lf = w && ph === 1 ? 1 : 0, lf2 = w && ph === 3 ? 1 : 0;
    p.line(11, 20, 11 - s, 26 - lf2, pantD, 2); p.rect(11 - s, 26 - lf2, 3, 1, boot);
    p.line(12, 20, 12 + s, 26 - lf, pant, 2); p.rect(12 + s, 26 - lf, 3, 1, boot);
    p.rect(9, 12 + b, 6, 8, jac); p.rect(9, 19 + b, 6, 1, jacD); p.rect(9, 12 + b, 1, 8, jacD); p.rect(14, 12 + b, 1, 6, jacL);
    p.rect(6, 13 + b, 3, 6, pack); p.rect(6, 13 + b, 3, 1, packL); p.rect(6, 18 + b, 3, 1, packD); p.set(6, 15 + b, packD);
    if (!aim) { p.line(9, 6 + b, 6, 19 + b, gun, 1); p.set(6, 18 + b, wood); p.set(6, 19 + b, wood); p.set(7, 17 + b, wood); }
    p.rect(10, 7 + b, 4, 4, skin); p.rect(10, 7 + b, 1, 3, beard); p.set(13, 8 + b, C('#1a1412')); p.rect(11, 10 + b, 3, 1, beard); p.set(13, 9 + b, beard); p.rect(10, 11 + b, 4, 1, skinD);
    p.rect(9, 6 + b, 7, 1, hatD); p.rect(10, 5 + b, 4, 1, band); p.rect(10, 3 + b, 4, 2, hat); p.rect(10, 3 + b, 3, 1, hatL);
    if (aim) { p.rect(13, 13 + b, 4, 2, jacD); p.set(17, 13 + b, skin); p.set(17, 14 + b, skin); }
    else { const ao = w ? -s / 2 : 0; p.line(12, 13 + b, 12 + ao, 17 + b, jacD, 2); p.rect(Math.round(12 + ao), 18 + b, 2, 1, skin); }
  } else {
    const l1 = w && ph === 0 ? 1 : 0, l2 = w && ph === 2 ? 1 : 0;
    p.rect(9, 20, 2, 6 - l1, pant); p.rect(9, 26 - l1, 2, 1, boot); p.rect(13, 20, 2, 6 - l2, pantD); p.rect(13, 26 - l2, 2, 1, boot);
    p.rect(8, 12 + b, 8, 8, jac); p.rect(8, 19 + b, 8, 1, jacD); p.rect(8, 12 + b, 1, 7, jacL);
    const a1 = w ? [1, 0, -1, 0][ph] : 0;
    if (dir === 'down') {
      p.rect(10, 12 + b, 4, 1, jacD); p.rect(9, 13 + b, 1, 4, packD); p.rect(14, 13 + b, 1, 4, packD);
      if (aim) { p.rect(6, 13 + b, 2, 3, jacD); p.rect(16, 13 + b, 2, 3, jacD); p.rect(8, 15 + b, 8, 2, jacD); p.rect(11, 16 + b, 2, 1, skin); }
      else { p.rect(6, 13 + b, 2, 5 + a1, jacD); p.rect(6, 18 + b + a1, 2, 1, skin); p.rect(16, 13 + b, 2, 5 - a1, jacD); p.rect(16, 18 + b - a1, 2, 1, skin); }
      p.rect(9, 7 + b, 6, 4, skin); p.set(10, 8 + b, C('#1a1412')); p.set(13, 8 + b, C('#1a1412')); p.rect(9, 10 + b, 6, 1, beard); p.set(9, 9 + b, beard); p.set(14, 9 + b, beard); p.rect(10, 11 + b, 4, 1, beard);
    } else {
      p.rect(6, 13 + b, 2, 5 + a1, jacD); p.rect(16, 13 + b, 2, 5 - a1, jacD);
      p.rect(9, 12 + b, 6, 7, pack); p.rect(9, 12 + b, 6, 1, packL); p.rect(9, 18 + b, 6, 1, packD); p.rect(14, 13 + b, 1, 5, packD); p.set(11, 15 + b, packD); p.set(12, 15 + b, packD);
      if (!aim) { p.line(8, 9 + b, 15, 19 + b, gun, 1); p.set(15, 19 + b, wood); p.set(14, 18 + b, wood); }
      p.rect(9, 7 + b, 6, 3, beard); p.rect(10, 10 + b, 4, 1, skinD);
    }
    p.rect(7, 6 + b, 10, 1, hatD); p.rect(9, 5 + b, 6, 1, band); p.rect(9, 3 + b, 6, 2, hat); p.rect(9, 3 + b, 5, 1, hatL);
  }
  p.outlineAuto(0.42);
  return mkSpr(p, HOX, HOY, {});
}

// ---------- Effekter og ikoner ----------
function genFx() {
  const glow = (size, col) => { const p = new Pix(size, size), c = size / 2; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const d = hyp(x + 0.5 - c, y + 0.5 - c) / c, a = Math.pow(clamp(1 - d, 0, 1), 1.6); if (a > dith(x, y) * 0.9) p.d[y * size + x] = col; } return p.canvas(); };
  FX.glow = glow(72, C('#ffbe5a')); FX.glowS = glow(9, C('#e8f08a'));
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
  const glyph = (rows, col) => { const p = new Pix(5, rows.length + 2); rows.forEach((r, j) => r.split('').forEach((b, i) => { if (b === '1') p.set(1 + i, 1 + j, col); })); p.outlineAuto(0.25); return p.canvas(); };
  FX.q = glyph(['111', '001', '011', '010', '000', '010'], C('#f2efe2'));
  FX.ex = glyph(['010', '010', '010', '010', '000', '010'], C('#ee7c2a'));
  { const p = new Pix(7, 10); p.rect(2, 4, 3, 5, C('#5a8a5a')); p.set(2, 4, C('#8ab88a')); p.rect(2, 6, 3, 2, C('#d8c040')); p.rect(3, 2, 1, 2, C('#5a8a5a')); p.rect(2, 1, 3, 1, C('#a87848')); p.outlineAuto(0.4); FX.bottle = mkSpr(p, 3, 8, {}); }
  { const p = new Pix(11, 10); for (let i = 0; i < 5; i++) p.rect(5 - i, 1 + i, 1 + i * 2, 1, C('#7a9e48')); p.rect(2, 6, 7, 3, C('#7a5c40')); p.rect(5, 7, 1, 2, C('#f0bc50')); p.outlineAuto(0.3); FX.house = p.canvas(); }
  { const p = new Pix(7, 7); p.set(3, 0, C('#f2efe2')); p.rect(2, 1, 3, 1, C('#f2efe2')); p.rect(1, 2, 5, 1, C('#f2efe2')); p.outlineAuto(0.25); FX.arrow = p.canvas(); }
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
  mk('boots', p => { p.rect(5, 2, 5, 10, wd[1]); p.rect(5, 2, 1, 10, wd[2]); p.rect(5, 10, 9, 4, wd[1]); p.rect(11, 10, 3, 1, wd[2]); p.rect(4, 14, 11, 2, C('#201814')); p.rect(5, 2, 5, 1, wd[0]); p.set(9, 5, br[2]); p.set(9, 7, br[2]); });
  return I;
}

function genAll() {
  for (let i = 0; i < 7; i++) genSpruce(100 + i * 13);
  for (let i = 0; i < 5; i++) genPine(200 + i * 17);
  for (let i = 0; i < 8; i++) genBirch(300 + i * 19, BIRCH_TONES[i % 4]);
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
  genCabin();
  for (const sp of SPECIES) {
    ANI[sp] = {};
    for (const sex of ['m', 'f']) {
      const o = ANI[sp][sex] = {};
      o.stand = [genAnimal(sp, sex, 'stand', 0)]; o.alert = [genAnimal(sp, sex, 'alert', 0)];
      o.graze = [0, 1].map(f => genAnimal(sp, sex, 'graze', f));
      o.walk = [0, 1, 2, 3].map(f => genAnimal(sp, sex, 'walk', f)); o.run = [0, 1, 2, 3].map(f => genAnimal(sp, sex, 'run', f));
      o.dead = [genAnimal(sp, sex, 'dead', 0)];
    }
  }
  for (const d of ['side', 'down', 'up']) HUN[d] = [0, 1].map(a => [0, 1, 2, 3, 4].map(i => genHunter(d, i, a)));
  genFx(); ICON = genIcons();
}
