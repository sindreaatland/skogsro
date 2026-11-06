'use strict';
// ===== Kjerne: matte, støy og et lite pikselbuffer-verktøy =====
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const hyp = Math.hypot;
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const rnd = (a, b) => a + Math.random() * (b - a);
const $ = id => document.getElementById(id);

function hash2(x, y, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1, 1442695041);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s, o) {
  let f = 0, amp = 0.5, tot = 0;
  for (let i = 0; i < o; i++) { f += amp * vnoise(x, y, s + i * 31); tot += amp; x = x * 2.03 + 17.3; y = y * 2.03 - 9.1; amp *= 0.5; }
  return f / tot;
}
function gauss() { return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.87; }

// Ordnet dithering (Bayer 4x4) gir rene pikselkunst-overganger
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;

// Farger lagres som 32-bit ABGR (rett inn i ImageData)
const _cc = {};
function C(hex) {
  let v = _cc[hex];
  if (v === undefined) { const n = parseInt(hex.slice(1), 16); v = (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >>> 16)) >>> 0; _cc[hex] = v; }
  return v;
}
const T = (...a) => a.map(C);
function dkc(c, f) {
  const r = Math.min(255, (c & 255) * f * 0.92) | 0, gg = (((c >>> 8) & 255) * f) | 0, b = Math.min(255, ((c >>> 16) & 255) * f * 1.1) | 0;
  return (0xff000000 | (b << 16) | (gg << 8) | r) >>> 0;
}
// Velg tone fra mørk -> lys med dithering i overgangene
function tone(tn, v, x, y, sharp) {
  v = clamp(v, 0, 0.999) * (tn.length - 1);
  const b = Math.floor(v);
  const f = clamp((v - b - 0.5) * (sharp || 2.2) + 0.5, 0, 1);
  return tn[f > dith(x, y) ? b + 1 : b];
}

class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.d[y * this.w + x] : 0; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  ell(cx, cy, rx, ry, c) {
    const fn = typeof c === 'function';
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) { const col = fn ? c(x, y, dx, dy) : c; if (col) this.set(x, y, col); }
    }
  }
  line(x0, y0, x1, y1, c, t) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); t = t || 1;
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, o = (t - 1) >> 1;
    let e = dx - dy;
    for (let n = 0; n < 400; n++) {
      for (let i = 0; i < t; i++) this.set(x0 - o + i, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 > -dy) { e -= dy; x0 += sx; }
      if (e2 < dx) { e += dx; y0 += sy; }
    }
  }
  clipBelow(yMax) { for (let y = yMax + 1; y < this.h; y++) for (let x = 0; x < this.w; x++) this.d[y * this.w + x] = 0; }
  // Omriss i en mørkere variant av nabofargen (mykere enn svart strek)
  outlineAuto(f, skipLone) {
    f = f || 0.5;
    const w = this.w, h = this.h, d = this.d, n = new Uint32Array(d);
    const solid = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return 0;
      const v = d[y * w + x]; if (!v) return 0;
      if (!skipLone) return v;
      let k = 0;
      if (x > 0 && d[y * w + x - 1]) k++; if (x < w - 1 && d[y * w + x + 1]) k++;
      if (y > 0 && d[(y - 1) * w + x]) k++; if (y < h - 1 && d[(y + 1) * w + x]) k++;
      return k >= 2 ? v : 0;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (d[i]) continue;
      const s = solid(x, y + 1) || solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1);
      if (s) n[i] = dkc(s, f);
    }
    this.d = n; return this;
  }
  sil(col) { const p = new Pix(this.w, this.h); for (let i = 0; i < this.d.length; i++) if (this.d[i]) p.d[i] = col; return p; }
  bbox() {
    let x0 = this.w, y0 = this.h, x1 = 0, y1 = 0;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[y * this.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
  }
  canvas() {
    const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    const g = c.getContext('2d'), im = g.createImageData(this.w, this.h);
    new Uint32Array(im.data.buffer).set(this.d); g.putImageData(im, 0, 0);
    return c;
  }
}
