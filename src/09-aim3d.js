// ===== Siktet i 3D: skogen sett fra jegerens øyne når du sikter =====
// Bakken projiseres rad for rad fra de samme bakkebitene som kartet bruker (gulvcasting), og trær,
// stein, busker, dyr og andre jegere er de vanlige spritene skalert etter avstand og tegnet bakerst
// først. Kula følger trådkorset: det første faste du ser der, er det den treffer.
const AIM = { yaw: 0, pitch: 0, ry: 0, rp: 0, camYaw: 0, f: 300, eye: 15, cx: 0, cy: 0, sx: 0, sy: 0, hy: 0, t: 0, kick: 0, range: null, pick: null, list: [], im: null, px: null };
const EYE = 15, NEAR = 14, FAR = 900, SWAY_K = 0.005, PITCH_MAX = 0.35;
const FOG_HEX = '#a9b6a2', FOG = C(FOG_HEX), SKY_HEX = '#c6d4d2', GROUND0 = C('#3d5334'), CSB = Math.log2(CS);
// Gress, bregner, siv og lyng stopper ikke kula; alt annet du ser, gjør det
const SOFT = { fern: 1, grassT: 1, reed: 1, heather: 1 };
const HITN = { rock: 'en stein', stump: 'en stubbe', log: 'en stokk', juniper: 'en einer', shrub: 'en busk', cabin: 'bua' };
const CHIP = { rock: '#b4b8ac', juniper: '#4e8270', shrub: '#6a8a3a' };

// Brennvidde i bufferpiksler; synsfeltet blir smalere jo bedre kikkert, og hagla ser vidt uten forstørrelse
const aimFocal = () => Math.ceil(H / ZB) / 2 / Math.tan((hagle() ? HST.fov : ST.fov[lv('scope')]) * Math.PI / 360);
// Med hagla kan du se høyt opp etter fugl i lufta
const pitchMax = () => hagle() ? 0.8 : PITCH_MAX;
// Jegeren kneler når han sikter; ute på djupt vann er øynene nærmere vannflata
const aimEye = () => P.deep ? EYE - 5 : EYE;
const fogSil = s => s._fog || (s._fog = s.pix.sil(FOG).canvas());

// Høyreklikk: se dit musa pekte på kartet, og rett på dyret hvis du pekte på et
function aimStart(tx, ty) {
  let best = null, bd = 1e9, h = 6;
  for (const a of G.animals) {
    if (a.state === 'dead') continue;
    const A = SPEC[a.sp], d = hyp(a.x - tx, a.y - (a.z || 0) - A.leg - A.Hh / 2 - ty);
    if (d < A.L / 2 + 8 && d < bd) { bd = d; best = a; }
  }
  if (best) { tx = best.x; ty = best.y; h = SPEC[best.sp].leg + SPEC[best.sp].Hh / 2 + (best.z || 0); }
  const d = hyp(tx - P.x, ty - P.y);
  AIM.yaw = AIM.camYaw = d > 8 ? Math.atan2(ty - P.y, tx - P.x) : P.face === 'side' ? (P.flip ? Math.PI : 0) : P.face === 'up' ? -Math.PI / 2 : Math.PI / 2;
  AIM.pitch = clamp(Math.atan((h - aimEye()) / Math.max(d, 30)), -pitchMax(), pitchMax());
  AIM.ry = AIM.yaw; AIM.rp = AIM.pitch;
  AIM.f = aimFocal(); AIM.t = 0; AIM.kick = 0; AIM.list.length = 0; AIM.pick = null; AIM.range = null;
}
// Musa flytter bildet like mange skjermpiksler som den beveger seg, uansett forstørrelse
function aimLook(dx, dy) {
  const k = 0.9 / (ZB * AIM.f);
  AIM.yaw += dx * k; AIM.pitch = clamp(AIM.pitch - dy * k, -pitchMax(), pitchMax());
}

function render3D(dt) {
  AIM.t += dt; AIM.kick = Math.max(0, AIM.kick - dt * 4);
  const bw = Math.ceil(W / ZB), bh = Math.ceil(H / ZB), f = AIM.f = aimFocal(), eye = AIM.eye = aimEye();
  // kamera: bare siktelinja fra musa, så bildet står helt stille når du ikke flytter den
  const yaw = AIM.camYaw = AIM.yaw, pitch = AIM.pitch;
  const vx = Math.cos(yaw), vy = Math.sin(yaw), rx = -vy, ry = vx;
  const cx = AIM.cx = (bw >> 1) + 0.5, cy = AIM.cy = (bh >> 1) + 0.5, hy = AIM.hy = cy + Math.tan(pitch) * f;
  const far = FAR * (1 - 0.45 * mist(G.hour)), fog = z => smooth(40, far, z);
  // pust, skjelving og rekyl flytter trådkorset over bildet i stedet, og aldri ut av kikkerten
  const [swx, swy] = aimSway();
  let ox = Math.tan(swx * SWAY_K) * f, oy = hy - Math.tan(pitch - swy * SWAY_K + AIM.kick * AIM.kick * 0.06) * f - cy;
  const om = 0.35 * Math.min(bw, bh), ol = hyp(ox, oy); if (ol > om) { ox *= om / ol; oy *= om / ol; }
  AIM.sx = cx + ox; AIM.sy = cy + oy;

  // bakke: hver rad under horisonten ligger på én avstand; dis legges på mot horisonten.
  // Langt unna dekker én pikselrad mange bakkepiksler i dybden, så raden blir snittet av flere delrader
  if (!AIM.im || AIM.im.width !== bw || AIM.im.height !== bh) { AIM.im = b.createImageData(bw, bh); AIM.px = new Uint32Array(AIM.im.data.buffer); AIM.acc = new Uint32Array(bw * 3); }
  const px = AIM.px, acc = AIM.acc, need = new Map(), M = CS - 1, fr = FOG & 255, fg = (FOG >>> 8) & 255, fb = (FOG >>> 16) & 255;
  px.fill(0);
  for (let y = Math.max(0, Math.floor(hy)); y < bh; y++) {
    const dy = y + 0.5 - hy; if (dy <= 0) continue;
    const z = eye * f / dy, fo = Math.round(fog(z) * 256), row = y * bw;
    if (fo >= 256) { px.fill(FOG, row, row + bw); continue; }
    const n = Math.min(16, Math.ceil(z / dy));
    acc.fill(0);
    for (let j = 0; j < n; j++) {
      const zj = eye * f / Math.max(0.05, dy - 0.5 + (j + 0.5) / n), st = zj / f, sx = rx * st, sy = ry * st;
      let wx = P.x + vx * zj + rx * (0.5 - cx) * st, wy = P.y + vy * zj + ry * (0.5 - cx) * st, lkx = NaN, lky = NaN, d = null;
      for (let i = 0, e = bw * 3; i < e; i += 3, wx += sx, wy += sy) {
        const ix = Math.floor(wx), iy = Math.floor(wy), kx = ix >> CSB, ky = iy >> CSB;
        if (kx !== lkx || ky !== lky) { lkx = kx; lky = ky; const key = kx + ',' + ky, ch = chunks.get(key); d = ch && ch.gpix; if (!d) need.set(key, [kx, ky, zj]); }
        const c = d ? d[(iy & M) << CSB | ix & M] : GROUND0;
        acc[i] += c & 255; acc[i + 1] += (c >>> 8) & 255; acc[i + 2] += (c >>> 16) & 255;
      }
    }
    for (let i = 0, p = row, e = row + bw; p < e; i += 3, p++) {
      const r = acc[i] / n | 0, g = acc[i + 1] / n | 0, bl = acc[i + 2] / n | 0;
      px[p] = 0xff000000 | (bl + ((fb - bl) * fo >> 8)) << 16 | (g + ((fg - g) * fo >> 8)) << 8 | (r + ((fr - r) * fo >> 8));
    }
  }
  b.putImageData(AIM.im, 0, 0);

  // alt som står i synsfeltet, som sprites skalert etter avstand
  const L = AIM.list; L.length = 0;
  const add = (wx, wy, s, flip, it) => {
    const dx = wx - P.x, dy = wy - P.y, z = dx * vx + dy * vy;
    if (z < NEAR || z > far) return;
    const k = f / z, X = Math.round(cx + (dx * rx + dy * ry) * k - (flip ? s.w - s.ax : s.ax) * k), Y = Math.round(hy + (eye - (it.hz || 0) - s.ay) * k);
    const Wd = Math.max(1, Math.round(s.w * k)), Hd = Math.max(1, Math.round(s.h * k));
    if (X > bw || X + Wd < 0 || Y > bh || Y + Hd < 0) return;
    Object.assign(it, { z, k, X, Y, W: Wd, H: Hd, s, flip, fo: fog(z) });
    if (it.sw && Math.abs(it.sw * k) < 0.5) it.sw = 0;
    if (it.fo < 0.99) L.push(it);
  };
  const ex = (cx + 8) / f * far, xs = [P.x, P.x + vx * far + rx * ex, P.x + vx * far - rx * ex], ys = [P.y, P.y + vy * far + ry * ex, P.y + vy * far - ry * ex];
  // bare trærne rører seg, og bare når det blåser mer enn flau vind
  const wl = (G.wind.x * rx + G.wind.y * ry) * 0.6, wa = Math.max(0, G.wind.s - 0.25) * 2.9;
  for (let ky = Math.floor((Math.min(...ys) - 40) / CS); ky <= Math.floor((Math.max(...ys) + 40) / CS); ky++)
    for (let kx = Math.floor((Math.min(...xs) - 40) / CS); kx <= Math.floor((Math.max(...xs) + 40) / CS); kx++)
      for (const o of getChunk(kx, ky).objs) {
        const s = SPR[o.k][o.v];
        add(o.x, o.y, s, false, { o, solid: !SOFT[o.k], sw: s.sway ? (Math.sin(G.t * 1.3 + o.ph) * 0.8 + wl) * wa : 0 });
      }
  // dyra vises i profil og snus etter hvilken vei de går sett herfra; fugl i lufta tegnes i sin høyde
  for (const a of G.animals) add(a.x, a.y, animalSprite(a), Math.cos(a.head) * rx + Math.sin(a.head) * ry < 0, { a, solid: a.state !== 'dead', hz: a.z || 0 });
  for (const r of NET.peers.values()) {
    if (!r.started || r.in) continue;
    const fx = r.face === 'side' ? (r.flip ? -1 : 1) : 0, fy = r.face === 'down' ? 1 : r.face === 'up' ? -1 : 0;
    const tw = fx * vx + fy * vy, lt = fx * rx + fy * ry, dir = Math.abs(lt) > Math.abs(tw) ? 'side' : tw < 0 ? 'down' : 'up';
    add(r.x, r.y, HUN[dir][r.aim ? 1 : 0][r.moving ? 1 + ((r.walkT * 7.5) | 0) % 4 : 0], dir === 'side' && lt < 0, { peer: r });
  }
  for (const so of G.scentObjs) add(so.x, so.y, FX.bottle, false, {});
  // bare det skuddet virvler opp; fallende løv, ildfluer og lukt driver ikke forbi i siktet
  for (const p of G.parts) {
    if (p.fly || p.faint || p.glow || p.leaf !== undefined) continue;
    const dx = p.x - P.x, dy = p.y - P.y, z = dx * vx + dy * vy;
    if (z < NEAR || z > far) continue;
    const k = f / z; L.push({ p, z, k, X: cx + (dx * rx + dy * ry) * k, Y: hy + (eye - p.z) * k, fo: fog(z) });
  }
  L.sort((p, q) => q.z - p.z);
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
  for (const it of L) {
    if (it.p) {
      const p = it.p, sz = Math.max(1, Math.round(it.k));
      b.globalAlpha = (p.faint ? clamp(p.life, 0, 1) * 0.28 : p.smoke ? clamp(p.life, 0, 1) * 0.55 : 1) * (1 - it.fo);
      b.fillStyle = p.col; b.fillRect(Math.round(it.X - sz / 2), Math.round(it.Y - sz / 2), sz, sz); b.globalAlpha = 1;
      continue;
    }
    if (it.flip) b.setTransform(-1, 0, 0, 1, it.X + it.W, it.Y); else b.setTransform(1, 0, 0, 1, it.X, it.Y);
    drawBill(it.s.c, it);
    if (it.fo > 0.01) { b.globalAlpha = it.fo; drawBill(fogSil(it.s), it); b.globalAlpha = 1; }
  }
  b.setTransform(1, 0, 0, 1, 0, 0);
  // himmel bak alt, så døgnlys og munningsglimt
  b.globalCompositeOperation = 'destination-over';
  const g = b.createLinearGradient(0, hy - f * 0.5, 0, hy); g.addColorStop(0, SKY_HEX); g.addColorStop(1, FOG_HEX);
  b.fillStyle = g; b.fillRect(0, 0, bw, bh);
  b.globalCompositeOperation = 'multiply'; b.fillStyle = lightAt(G.hour); b.fillRect(0, 0, bw, bh);
  if (AIM.kick > 0.7) { b.globalCompositeOperation = 'lighter'; b.globalAlpha = (AIM.kick - 0.7) * 0.8; b.fillStyle = '#ffd890'; b.fillRect(0, 0, bw, bh); b.globalAlpha = 1; }
  b.globalCompositeOperation = 'source-over';

  m.setTransform(1, 0, 0, 1, 0, 0); m.imageSmoothingEnabled = false;
  m.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * ZB, bh * ZB);
  // avstandsmåleren leser det som ligger i trådkorset, ellers bakken
  const pk = AIM.pick = aimPick(AIM.sx, AIM.sy), zg = AIM.sy > hy ? eye * f / (AIM.sy - hy) : Infinity;
  AIM.range = pk ? pk.it.z : zg < far ? zg : null;
  drawOverlay();
  if (AIM.t < 0.2) { m.globalAlpha = 1 - AIM.t / 0.2; m.fillStyle = '#070a08'; m.fillRect(0, 0, W, H); m.globalAlpha = 1; }
  // tegn bakken for biter vi ser ut over men ikke har tegnet ennå, nærmeste først
  const t0 = performance.now();
  for (const [kx, ky] of [...need.values()].sort((p, q) => p[2] - q[2])) { genGround(getChunk(kx, ky)); if (performance.now() - t0 > 6) break; }
}
// Sprite skalert inn i ruta it.W × it.H; trær som svaier tegnes i striper som i 2D, én bufferpiksel om gangen
function drawBill(img, it) {
  const s = it.s;
  if (!it.sw) { b.drawImage(img, 0, 0, it.W, it.H); return; }
  for (let y0 = 0; y0 < s.h; y0 += 6) {
    const q = 1 - y0 / s.h, off = Math.round(it.sw * q * q * it.k), ya = Math.round(y0 * it.k), yb = Math.round(Math.min(s.h, y0 + 6) * it.k);
    if (yb > ya) b.drawImage(img, 0, y0, s.w, Math.min(6, s.h - y0), off, ya, it.W, yb - ya);
  }
}
// Første faste ting under et punkt i bufferen, nærmest først: { it, lx, ly } med pikselen i spriten
function aimPick(px, py) {
  const L = AIM.list;
  for (let i = L.length - 1; i >= 0; i--) {
    const it = L[i]; if (!it.solid) continue;
    const s = it.s, ly = Math.floor((py - it.Y) * s.h / it.H);
    if (ly < 0 || ly >= s.h) continue;
    let u = px - it.X;
    if (it.sw) { const q = 1 - (ly - ly % 6) / s.h; u -= Math.round(it.sw * q * q * it.k); }
    let lx = Math.floor(u * s.w / it.W);
    if (lx < 0 || lx >= s.w) continue;
    if (it.flip) lx = s.w - 1 - lx;
    if (s.pix.get(lx, ly)) return { it, lx, ly };
  }
  return null;
}
// Punktet i verden der strålen gjennom (px, py) når dybden z: [x, y, høyde over bakken]
function aimPoint(px, py, z) {
  const st = z / AIM.f, vx = Math.cos(AIM.camYaw), vy = Math.sin(AIM.camYaw), lat = (px - AIM.cx) * st;
  return [P.x + vx * z - vy * lat, P.y + vy * z + vx * lat, AIM.eye - (py - AIM.hy) * st];
}
// Skudd i 3D: spredningen er en vinkel rundt trådkorset, og kula treffer det første faste den møter
function aimShot() {
  const sd = ST.spread[lv('barrel')] / 100, gx = gauss() * sd, gy = gauss() * sd * 0.8;
  const px = AIM.sx + gx * AIM.f, py = AIM.sy - gy * AIM.f, pk = aimPick(px, py);
  const r = { ang: AIM.camYaw + Math.atan((px - AIM.cx) / AIM.f), a: null, zone: null, block: null };
  AIM.kick = 1;
  if (pk && pk.it.a) {
    const a = pk.it.a, [x, y, h] = aimPoint(px, py, pk.it.z);
    Object.assign(r, { a, zone: hitZone(a, pk.it.s, pk.lx, pk.ly), d: hyp(a.x - P.x, a.y - P.y), hx: x, hy: y - h });
    burst(x, y, h, '#a8302a', 4, 8);
  } else if (pk) {
    const k = pk.it.o.k, [x, y, h] = aimPoint(px, py, pk.it.z);
    r.block = k; burst(x, y, h, CHIP[k] || '#c8a474', 6, 20);
    msg('Kula traff ' + (HITN[k] || 'et tre') + '.', 'warn');
  } else if (py > AIM.hy) {
    const z = AIM.eye * AIM.f / (py - AIM.hy);
    if (z < FAR * 1.5) { const [x, y] = aimPoint(px, py, z); burst(x, y, 0, isWater(x, y) ? '#a4ccc6' : '#8a7a5c', 5, 14); }
  }
  return r;
}
function burst(x, y, z, col, n, sp) { for (let i = 0; i < n; i++) G.parts.push({ x, y, z, vx: rnd(-sp, sp), vy: rnd(-sp, sp) * 0.4, vz: rnd(4, 14), life: rnd(0.3, 0.6), col, grav: 1 }); }
// Haglskudd i 3D: hvert hagl får sin egen retning i svermen rundt perla og treffer det første faste det møter
function aimShotgun() {
  const sp = HST.spread[lv('choke')], by = new Map();
  let chips = 0, puffs = 0;
  AIM.kick = 1;
  for (let i = 0; i < HST.pellets[lv('shell')]; i++) {
    const px = AIM.sx + gauss() * sp * AIM.f, py = AIM.sy + gauss() * sp * AIM.f, pk = aimPick(px, py);
    if (pk && pk.it.a) {
      const a = pk.it.a, [x, y, h] = aimPoint(px, py, pk.it.z);
      pelletHit(by, a, hyp(a.x - P.x, a.y - P.y), x, y - h);
      burst(x, y, h, SPEC[a.sp].bird ? '#e4dccc' : '#a8302a', 2, 10);
    } else if (pk) { const [x, y, h] = aimPoint(px, py, pk.it.z); if (chips++ < 6) burst(x, y, h, CHIP[pk.it.o.k] || '#c8a474', 2, 14); }
    else if (py > AIM.hy && puffs++ < 8) {
      const z = AIM.eye * AIM.f / (py - AIM.hy);
      if (z < FAR) { const [x, y] = aimPoint(px, py, z); burst(x, y, 0, isWater(x, y) ? '#a4ccc6' : '#8a7a5c', 2, 10); }
    }
  }
  return { ang: AIM.camYaw + Math.atan((AIM.sx - AIM.cx) / AIM.f), hits: [...by.values()].filter(e => e.dmg > 0) };
}
