// ===== Tegning: lavoppløst piksel-buffer som skaleres opp =====
let cv, m, buf, b, shL, sh, W = 0, H = 0, DPR = 1, ZB = 3;
const CAM = { x: 0, y: 0, z: 1, w: 400, h: 300, ox: 0, oy: 0, S: 3, dx: 0, dy: 0 };
const WISPS = [];
const LIGHT = [[0, '#3c4878'], [4.5, '#3c4878'], [5.6, '#a088a8'], [6.6, '#f0b8a0'], [8, '#fff0dc'], [10, '#ffffff'], [16.5, '#ffffff'], [18, '#ffd8a0'], [19.3, '#e09078'], [20.5, '#6a6090'], [21.5, '#3c4878'], [24, '#3c4878']];
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function lightAt(h) {
  for (let i = 0; i < LIGHT.length - 1; i++) if (h >= LIGHT[i][0] && h <= LIGHT[i + 1][0]) {
    const t = (h - LIGHT[i][0]) / (LIGHT[i + 1][0] - LIGHT[i][0]), a = hexRgb(LIGHT[i][1]), c = hexRgb(LIGHT[i + 1][1]);
    return `rgb(${lerp(a[0], c[0], t) | 0},${lerp(a[1], c[1], t) | 0},${lerp(a[2], c[2], t) | 0})`;
  }
  return '#fff';
}
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(320, Math.round(innerWidth * DPR)); H = Math.max(240, Math.round(innerHeight * DPR));
  cv.width = W; cv.height = H;
  ZB = Math.max(2, Math.round(H / 350));
  buf.width = shL.width = Math.ceil(W / ZB) + 6; buf.height = shL.height = Math.ceil(H / ZB) + 6;
  b.imageSmoothingEnabled = false; sh.imageSmoothingEnabled = false;
}
function toScreen(wx, wy) { return [(wx - CAM.ox) * CAM.S + CAM.dx, (wy - CAM.oy) * CAM.S + CAM.dy]; }
function toWorld(sx, sy) { return [(sx - CAM.dx) / CAM.S + CAM.ox, (sy - CAM.dy) / CAM.S + CAM.oy]; }

function drawSway(o, s, X, Y) {
  let sw = (Math.sin(G.t * 1.3 + o.ph) * 0.8 + G.wind.x * 0.6) * G.wind.s * 2.2;
  // kronen rister når øksa går inn i stammen
  if (o.hit) { const u = G.t - o.hit; if (u < 0.5) sw += o.hitD * Math.sin(u * 32) * (1 - u * 2) * 2.5; }
  if (Math.abs(sw) < 0.5) { b.drawImage(s.c, X - s.ax, Y - s.ay); return; }
  const bh = 6;
  for (let y0 = 0; y0 < s.h; y0 += bh) {
    const k = 1 - y0 / s.h, off = Math.round(sw * k * k), hh = Math.min(bh, s.h - y0);
    b.drawImage(s.c, 0, y0, s.w, hh, X - s.ax + off, Y - s.ay + y0, s.w, hh);
  }
}
// Hakket i stammen på siden mot jegeren blir dypere for hvert hogg; skjult under greiner tegnes det ikke
function drawNotch(s, X, Y, w) {
  const ry = s.ay - 6, d = Math.min(3, (w.hits + 1) >> 1);
  let x = s.ax; while (Math.abs(x - s.ax) < 5 && s.pix.get(x + w.side, ry)) x += w.side;
  if (Math.abs(x - s.ax) >= 5) return;
  const px = (i, dy, c) => { b.fillStyle = c; b.fillRect(X - s.ax + x - w.side * i, Y - s.ay + ry + dy, 1, 1); };
  for (let i = 0; i < d; i++) { px(i, 0, i === d - 1 ? '#2a1c12' : '#c8a474'); if (i < d - 1) { px(i, -1, '#e8d0a0'); px(i, 1, '#8a6a48'); } }
}
// Felt tre: dreies rundt hakket, glir ned på bakken og flates litt ut når det ligger
function drawFall(f, ox, oy) {
  const s = f.s, a = fallAng(f), e = Math.sin(a), cut = 6, hs = s.ay - cut;
  b.save();
  b.translate(Math.round(f.x - ox), Math.round(f.y - oy) - cut + Math.round((cut - 2) * e));
  b.scale(1, 1 - 0.45 * e); b.rotate(a * f.dir);
  b.drawImage(s.c, 0, 0, s.w, hs, -s.ax, -hs, s.w, hs);
  b.restore();
}
// Jeger; ute på djupt vann synker kroppen så bare overkroppen stikker opp
function drawHunter(s, X, Y, flip, deep) {
  const sk = deep ? 5 : 0, hh = deep ? s.ay - 8 : s.h;
  if (flip) { b.save(); b.translate(X, Y + sk); b.scale(-1, 1); b.drawImage(s.c, 0, 0, s.w, hh, -s.ax, -s.ay, s.w, hh); b.restore(); }
  else b.drawImage(s.c, 0, 0, s.w, hh, X - s.ax, Y + sk - s.ay, s.w, hh);
}
let genBudgetT = 0;
// Tåke og dis over døgnet: tett om morgenen, litt om kvelden
const mist = h => 0.6 * smooth(3, 5.5, h) * (1 - smooth(7.5, 10.5, h)) + 0.1 + 0.3 * smooth(18.5, 21, h) * (1 - smooth(23, 24, h));
function render(dt) {
  // bytter vi mellom kart og 3D, løses det forrige bildet opp i rutemønster over det nye
  const v3 = G.started && (P.aim || aimThird());
  if (v3 !== AIM.v3) { AIM.v3 = v3; if (!G.paused) snapStart(); }
  if (v3) { render3D(dt); snapDraw(dt); return; }
  // kamera
  let tx, ty, tz = 1;
  if (!G.started) { tx = P.x + Math.sin(G.t * 0.05) * 70; ty = P.y - 30 + Math.cos(G.t * 0.04) * 30; }
  else { tx = P.x; ty = P.y - 10; }
  // når børsa tas opp, går kameraet inn mot jegeren
  const re = smooth(0, 1, AIM.raise);
  if (re > 0) { ty -= 7 * re; tz = 1 + 1.2 * re; }
  CAM.z = re > 0 ? tz : lerp(CAM.z, tz, Math.min(1, dt * 9));
  if (Math.abs(CAM.z - tz) < 0.01) CAM.z = tz;
  const fk = re > 0 ? Math.min(1, dt * 14) : Math.min(1, dt * 5);
  CAM.x = lerp(CAM.x, tx, fk); CAM.y = lerp(CAM.y, ty, fk);
  const S = CAM.S = ZB * CAM.z, vw = W / S, vh = H / S;
  CAM.w = vw; CAM.h = vh;
  const ox = CAM.ox = Math.floor(CAM.x - vw / 2), oy = CAM.oy = Math.floor(CAM.y - vh / 2);
  CAM.dx = (ox - (CAM.x - vw / 2)) * S; CAM.dy = (oy - (CAM.y - vh / 2)) * S;
  const bw = Math.min(buf.width, Math.ceil(vw) + 2), bh = Math.min(buf.height, Math.ceil(vh) + 2);
  [MOUSE.wx, MOUSE.wy] = toWorld(MOUSE.x, MOUSE.y);

  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
  b.fillStyle = '#33462f'; b.fillRect(0, 0, bw, bh);
  // bakke
  const c0 = Math.floor(ox / CS), c1 = Math.floor((ox + bw) / CS), r0 = Math.floor(oy / CS), r1 = Math.floor((oy + bh) / CS);
  for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) { const ch = getChunk(cx, cy); if (!ch.ground) genGround(ch); b.drawImage(ch.ground, cx * CS - ox, cy * CS - oy); }
  // blod
  for (const d of G.blood) { const X = Math.round(d.x - ox), Y = Math.round(d.y - oy); if (X < 0 || Y < 0 || X >= bw || Y >= bh) continue; b.globalAlpha = clamp(1 - d.t / 240, 0.2, 1); b.fillStyle = d.t < 30 ? '#9a2a22' : '#6a221c'; b.fillRect(X, Y, 1, 1); }
  b.globalAlpha = 1;
  // samle det som skal tegnes
  const items = [];
  for (let cy = Math.floor((oy - 10) / CS); cy <= Math.floor((oy + bh + 130) / CS); cy++) for (let cx = Math.floor((ox - 50) / CS); cx <= Math.floor((ox + bw + 50) / CS); cx++) {
    for (const o of getChunk(cx, cy).objs) {
      const s = SPR[o.k][o.v];
      if (o.x - s.ax > ox + bw || o.x - s.ax + s.w < ox || o.y - s.ay > oy + bh || o.y - s.ay + s.h < oy) continue;
      items.push({ y: o.y, o, s });
    }
  }
  for (const a of G.animals) { const s = animalSprite(a); if (a.x + 50 < ox || a.x - 50 > ox + bw || a.y - 70 > oy + bh || a.y + 20 < oy) continue; items.push({ y: a.y - (a.state === 'dead' ? 2 : 0), a, s }); }
  // på vei inn i 3D griper jegeren reima; når børsa senkes, går løftebildene baklengs
  const rk = AIM.raise > 0 && !P.moving ? AIM.want ? 0 : Math.min(3, (AIM.raise * 4) | 0) : -1;
  const hs = P.work && P.work.tree ? HUN.chop[chopFrame(P.work)] : rk >= 0 ? HUN[P.face][2][rk] : HUN[P.face][P.aim ? 1 : 0][P.moving ? 1 + ((P.walkT * 7.5) | 0) % 4 : 0];
  items.push({ y: P.y, hunter: 1, s: hs });
  for (const r of NET.peers.values()) {
    if (!r.started || r.in || r.x + 20 < ox || r.x - 20 > ox + bw || r.y - 40 > oy + bh || r.y + 10 < oy) continue;
    items.push({ y: r.y, peer: r, s: HUN[r.face][r.aim ? 1 : 0][r.moving ? 1 + ((r.walkT * 7.5) | 0) % 4 : 0] });
  }
  // hunden din, og hundene til de andre jegerne
  const dogs = G.started ? [D] : [];
  for (const r of NET.peers.values()) if (r.started && !r.in && r.dog) dogs.push(r.dog);
  for (const d of dogs) if (d.x + 30 > ox && d.x - 30 < ox + bw && d.y - 40 < oy + bh && d.y + 10 > oy) items.push({ y: d.y, dog: d, s: dogSprite(d) });
  // ting som står stille på bakken: luktflasker, bål og gapahuker
  for (const so of G.scentObjs) items.push({ y: so.y, at: so, s: FX.bottle });
  for (const f of G.fires) items.push({ y: f.y, at: f, s: fireSpr(f) });
  for (const f of G.falls) if (Math.abs(f.x - ox - bw / 2) < bw / 2 + 110 && f.y > oy - 10 && f.y < oy + bh + 110) items.push({ y: f.y, fall: f, s: f.s });
  for (const h of G.huts) if (h.x + 24 > ox && h.x - 24 < ox + bw && h.y - 36 < oy + bh && h.y + 6 > oy) items.push({ y: h.y, at: h, s: FX.hut });
  items.sort((p, q) => p.y - q.y);
  // skygger (silhuetter skjøvet bort fra sola)
  const h = G.hour, sunT = clamp((h - 6) / 13, 0, 1), dayl = G.dayl;
  const sdx = dayl > 0.05 ? lerp(-1.0, 1.0, sunT) : 0.35, sls = dayl > 0.05 ? 0.3 + 0.4 * (1 - Math.sin(Math.PI * sunT)) : 0.4;
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.clearRect(0, 0, bw, bh);
  for (const it of items) {
    if (it.s.nosh || it.fall || it.o && (it.o.k === 'fern' || it.o.k === 'grassT' || it.o.k === 'reed') || it.hunter && P.deep) continue;
    // fugl i lufta kaster bare en liten flekk på bakken under seg
    if (it.a && it.a.z > 1) { sh.setTransform(1, 0, 0, 1, 0, 0); sh.fillStyle = '#0b1a1c'; sh.fillRect(Math.round(it.a.x - ox) - 3, Math.round(it.a.y - oy) - 1, 6, 2); continue; }
    const ent = it.o || it.a || it.peer || it.dog || it.at || P, flip = it.a || it.dog ? ent.face < 0 : it.hunter ? P.flip && P.face === 'side' : it.peer ? it.peer.flip && it.peer.face === 'side' : false;
    sh.setTransform(flip ? -1 : 1, 0, -sdx, -sls * 0.5, Math.round(ent.x - ox), Math.round(ent.y - oy) + 1);
    sh.drawImage(it.s.sil, -it.s.ax, -it.s.ay);
  }
  b.globalAlpha = 0.12 + 0.24 * dayl; b.drawImage(shL, 0, 0, bw, bh, 0, 0, bw, bh); b.globalAlpha = 1;
  // ring av lyse prikker (k × k piksler) med mørk kant som går rundt
  const ring = (X, Y, rx, ry, n, k = 1) => {
    b.globalAlpha = 0.75 + 0.25 * Math.sin(G.t * 3);
    for (let i = 0; i < n; i++) {
      const t = i / n * TAU + G.t * 0.6, x = Math.round(X + Math.cos(t) * rx), y = Math.round(Y + Math.sin(t) * ry);
      b.fillStyle = '#1a1410'; b.fillRect(x, y + 1, k, k); b.fillStyle = '#fff4d6'; b.fillRect(x, y, k, k);
    }
    b.globalAlpha = 1;
  };
  // på bakken under felte dyr du kan hente
  for (const it of items) {
    const a = it.a; if (!a || a.state !== 'dead' || !canTake(a, NET.id)) continue;
    const s = it.s, bb = s.bb || (s.bb = s.pix.bbox()), rx = bb[2] / 2 + 3;
    ring(a.x - ox + (bb[0] + bb[2] / 2 - s.ax) * (a.face < 0 ? -1 : 1), a.y - oy - s.ay + bb[1] + bb[3] - 2, rx, Math.max(3, rx * 0.35), 18);
  }
  // objekter, dyr, jeger
  const icons = [], reveal = [[P.x, P.y - 6]];
  for (const a of G.animals) if (hyp(a.x - P.x, a.y - P.y) < 340) reveal.push([a.x, a.state === 'dead' ? a.y - 3 : a.y - SPEC[a.sp].leg - (a.z || 0)]);
  for (const it of items) if (it.peer || it.dog) reveal.push([(it.peer || it.dog).x, (it.peer || it.dog).y - 6]);
  for (const it of items) {
    if (it.o) {
      const o = it.o, s = it.s, X = Math.round(o.x - ox), Y = Math.round(o.y - oy);
      let ta = 1;
      if (s.tall || s.tallC) for (const r of reveal) if (o.y > r[1] + 7 && o.y - s.ay * 0.92 < r[1] && Math.abs(o.x - r[0]) < s.w * 0.42) { ta = 0.42; break; }
      o.a = lerp(o.a, ta, Math.min(1, dt * 6)); b.globalAlpha = o.a;
      if (s.sway) drawSway(o, s, X, Y); else b.drawImage(s.c, X - s.ax, Y - s.ay);
      if (P.work && P.work.tree === o && P.work.hits && CHOP[o.k]) drawNotch(s, X, Y, P.work);
      b.globalAlpha = 1;
    } else if (it.a) {
      const a = it.a, s = it.s, X = Math.round(a.x - ox), Y = Math.round(a.y - (a.z || 0) - oy);
      if (a.face < 0) { b.save(); b.translate(X, Y); b.scale(-1, 1); b.drawImage(s.c, -s.ax, -s.ay); b.restore(); }
      else b.drawImage(s.c, X - s.ax, Y - s.ay);
      if (a.state === 'dead') icons.push([FX.ex, X - 2, Y - 18 - (Math.sin(G.t * 3) > 0 ? 1 : 0)]);
      else if (a.state === 'alert' && !P.aim) icons.push([FX.q, X - 2, Y - SPEC[a.sp].leg - SPEC[a.sp].Hh - 14]);
    } else if (it.hunter) {
      const s = it.s, X = Math.round(P.x - ox), Y = Math.round(P.y - oy), wl = P.deep ? Y - 3 : Y;
      drawHunter(s, X, Y, P.flip && P.face === 'side', P.deep);
      if (P.wet) { b.fillStyle = '#a4ccc6'; const k = (G.t * 4) | 0; b.fillRect(X - 4 + (k & 1), wl, 2, 1); b.fillRect(X + 2 - (k & 1), wl, 2, 1); }
    } else if (it.peer) {
      const r = it.peer, s = it.s, X = Math.round(r.x - ox), Y = Math.round(r.y - oy);
      drawHunter(s, X, Y, r.flip && r.face === 'side', r.wet && waterAt(r.x, r.y) < 0.55);
    } else if (it.dog) {
      const d = it.dog, s = it.s, X = Math.round(d.x - ox), Y = Math.round(d.y - oy);
      if (d.face < 0) { b.save(); b.translate(X, Y); b.scale(-1, 1); b.drawImage(s.c, -s.ax, -s.ay); b.restore(); }
      else b.drawImage(s.c, X - s.ax, Y - s.ay);
      // står hunden for vilt, hopper en oransje nål over den
      if (d.st === 'mark') icons.push([FX.mark, X - 5, Y - 34 - Math.round(Math.abs(Math.sin(G.t * 5)) * 3)]);
    } else if (it.fall) drawFall(it.fall, ox, oy);
    else if (it.at) b.drawImage(it.s.c, Math.round(it.at.x - ox) - it.s.ax, Math.round(it.at.y - oy) - it.s.ay);
  }
  // partikler
  for (const p of G.parts) {
    if (p.fly) continue;
    const X = Math.round(p.x - ox), Y = Math.round(p.y - p.z - oy);
    if (X < 0 || Y < 0 || X >= bw || Y >= bh) continue;
    b.globalAlpha = p.faint ? clamp(p.life, 0, 1) * 0.28 : p.smoke ? clamp(p.life, 0, 1) * 0.55 : 1;
    b.fillStyle = p.col; b.fillRect(X, Y, 1, 1);
  }
  b.globalAlpha = 1;
  // tåke
  const fogA = mist(h);
  if (!WISPS.length) for (let i = 0; i < 16; i++) WISPS.push({ x: CAM.x + rnd(-400, 400), y: CAM.y + rnd(-250, 250), k: i & 3, s: rnd(0.6, 1.2) });
  for (const w of WISPS) {
    w.x += (G.wind.x * (4 + 10 * G.wind.s) + 2) * w.s * dt; w.y += G.wind.y * 3 * w.s * dt;
    const hw = vw / 2 + 170, hh = vh / 2 + 60;
    if (w.x < CAM.x - hw) w.x += hw * 2; if (w.x > CAM.x + hw) w.x -= hw * 2;
    if (w.y < CAM.y - hh) w.y += hh * 2; if (w.y > CAM.y + hh) w.y -= hh * 2;
    b.globalAlpha = fogA * 0.55; b.drawImage(FX.wisp[w.k], Math.round(w.x - ox - 75), Math.round(w.y - oy - 17));
  }
  b.globalAlpha = 1;
  // lys og døgn
  b.globalCompositeOperation = 'multiply'; b.fillStyle = lightAt(h); b.fillRect(0, 0, bw, bh);
  b.globalCompositeOperation = 'lighter';
  const night = 1 - dayl;
  if (night > 0.05) {
    for (const c of cabinsNear(CAM.x, CAM.y)) { const X = Math.round(c.x - ox), Y = Math.round(c.y - oy); if (X < -100 || X > bw + 100 || Y < -100 || Y > bh + 100) continue; b.globalAlpha = 0.32 * night; b.drawImage(FX.glow, X + 11 - 36, Y - 16 - 36); b.globalAlpha = 0.2 * night; b.drawImage(FX.glow, X - 23 - 36, Y - 17 - 36); }
    b.globalAlpha = 0.22 * night; b.drawImage(FX.glow, Math.round(P.x - ox) - 36, Math.round(P.y - oy) - 44);
    for (const p of G.parts) if (p.fly) { const a = clamp(p.life, 0, 1) * (0.5 + 0.5 * Math.sin(G.t * 5 + p.x)); b.globalAlpha = a * night; b.drawImage(FX.glowS, Math.round(p.x - ox) - 4, Math.round(p.y - p.z - oy) - 4); b.fillStyle = '#f4ffb0'; b.fillRect(Math.round(p.x - ox), Math.round(p.y - p.z - oy), 1, 1); }
  }
  for (const p of G.parts) if (p.glow) { b.globalAlpha = clamp(p.life, 0, 1) * 0.35; b.fillStyle = p.col; b.fillRect(Math.round(p.x - ox), Math.round(p.y - p.z - oy), 1, 1); }
  // bålet lyser opp rundt seg og blafrer, mest om natta
  for (const f of G.fires) { b.globalAlpha = (0.1 + 0.3 * night) * (0.85 + 0.15 * Math.sin(G.t * 9 + f.id * 50)); b.drawImage(FX.glow, Math.round(f.x - ox) - 36, Math.round(f.y - oy) - 42); }
  // felte dyr du kan hente lyser svakt om natta, så de er lette å finne igjen i mørket
  if (night > 0.05) for (const a of G.animals) if (a.state === 'dead' && canTake(a, NET.id)) { b.globalAlpha = night * (0.2 + 0.08 * Math.sin(G.t * 3)); b.drawImage(FX.glow, Math.round(a.x - ox) - 36, Math.round(a.y - oy) - 39); }
  if (dayl > 0.2) {
    b.globalCompositeOperation = 'screen'; b.globalAlpha = 0.07 * dayl * (1 - fogA * 0.5);
    const sx = -(((ox + G.t * 2) % 256) + 256) % 256, sy = -((oy % 256) + 256) % 256;
    for (let y = sy; y < bh; y += 256) for (let x = sx; x < bw; x += 256) b.drawImage(FX.rays, x, y);
  }
  b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
  // flammene lyser selv, så om natta tegnes de på nytt over mørket
  if (night > 0.05) for (const f of G.fires) { const s = fireSpr(f); b.globalAlpha = night; b.drawImage(s.c, Math.round(f.x - ox) - s.ax, Math.round(f.y - oy) - s.ay); }
  b.globalAlpha = 1;
  // hvit sirkel rundt hunden din når den er ute, tegnet over skogen og lyset så den alltid synes
  if (G.started && D.st !== 'heel') ring(D.x - ox - 1, D.y - oy - 7, 14, 14, 20, 2);
  for (const ic of icons) b.drawImage(ic[0], ic[1], ic[2]);
  // opp på skjermen
  m.setTransform(1, 0, 0, 1, 0, 0); m.imageSmoothingEnabled = false;
  m.fillStyle = '#121a16'; m.fillRect(0, 0, W, H);
  m.drawImage(buf, 0, 0, bw, bh, CAM.dx, CAM.dy, bw * S, bh * S);
  drawOverlay(); snapDraw(dt);
  // forhåndsgenerer bakke rundt synsfeltet
  const t0 = performance.now();
  outer: for (let cy = r0 - 1; cy <= r1 + 1; cy++) for (let cx = c0 - 1; cx <= c1 + 1; cx++) { const ch = getChunk(cx, cy); if (!ch.ground) { genGround(ch); if (performance.now() - t0 > 4) break outer; } }
  if ((G.t | 0) % 5 === 0) evictChunks(anchors());
}

// Tegner pil (og ev. ikon) ved skjermkanten mot et punkt utenfor skjermen; false hvis punktet er synlig
function edgeMark(wx, wy, label, icon) {
  const [sx, sy] = toScreen(wx, wy), mg = 90 * DPR;
  if (sx >= 0 && sy >= 0 && sx <= W && sy <= H) return false;
  const ang = Math.atan2(sy - H / 2, sx - W / 2), kx = (W / 2 - mg) / Math.abs(Math.cos(ang) || 1e-6), ky = (H / 2 - mg) / Math.abs(Math.sin(ang) || 1e-6), k = Math.min(kx, ky);
  const px = W / 2 + Math.cos(ang) * k, py = H / 2 + Math.sin(ang) * k, z = 3 * DPR;
  m.globalAlpha = 0.85;
  if (icon) m.drawImage(icon, px - 5.5 * z, py - 5 * z, 11 * z, 10 * z);
  m.save(); m.translate(px + Math.cos(ang) * 11 * z, py + Math.sin(ang) * 11 * z); m.rotate(ang + Math.PI / 2); m.drawImage(FX.arrow, -3.5 * z, -3.5 * z, 7 * z, 7 * z); m.restore();
  pxText(label, px, py + 10 * z, Math.round(12 * DPR), '#ece4cf'); m.globalAlpha = 1;
  return true;
}
function pxText(t, x, y, size, col, align) {
  m.font = `${size}px "Pixelify Sans", "Silkscreen", monospace`; m.textAlign = align || 'center'; m.textBaseline = 'middle';
  m.fillStyle = 'rgba(10,14,12,0.85)'; m.fillText(t, x + DPR * 1.5, y + DPR * 1.5); m.fillStyle = col; m.fillText(t, x, y);
}
function drawOverlay() {
  const u = Math.max(2, Math.round(2 * DPR));
  // sikter og kikkert tegnes i pikselbufferen (09-aim3d.js); her bare avstandsmåleren
  if (G.started && P.aim) aimHud();
  // pil mot nærmeste bu, egne felte dyr og de andre jegerne når de er utenfor skjermen, ellers navn over hodet;
  // ikke mens børsa tas opp eller senkes
  if (G.started && !P.aim && !AIM.raise) {
    const c = nearestCabin(P.x, P.y);
    edgeMark(c.x, c.y - 30, 'Bua ' + Math.round(c.d * M_PER_PX) + ' m', FX.house);
    if (D.st !== 'heel') {
      const t = (D.st === 'mark' ? 'Hunden står ' : 'Hunden ') + Math.round(hyp(D.x - P.x, D.y - P.y) * M_PER_PX) + ' m';
      if (!edgeMark(D.x, D.y - 6, t, FX.dog) && D.st === 'mark') { const [sx, sy] = toScreen(D.x, D.y - 44); pxText('Hunden står', sx, sy, Math.round(13 * DPR), '#ffb050'); }
    }
    for (const a of G.animals) if (a.state === 'dead' && (!a.by || a.by === NET.id)) edgeMark(a.x, a.y - 6, SPEC[a.sp].name + ' ' + Math.round(hyp(a.x - P.x, a.y - P.y) * M_PER_PX) + ' m', FX.deer);
    for (const r of NET.peers.values()) {
      if (!r.started || r.in) continue;
      if (!edgeMark(r.x, r.y - 12, r.name + ' ' + Math.round(hyp(r.x - P.x, r.y - P.y) * M_PER_PX) + ' m')) { const [sx, sy] = toScreen(r.x, r.y - 32); pxText(r.name, sx, sy, Math.round(12 * DPR), '#ece4cf'); }
    }
  }
  // eget pikselkors som musepeker
  if (G.started && !P.aim && !AIM.raise && !G.paused) {
    const x = Math.round(MOUSE.x), y = Math.round(MOUSE.y), k = u;
    const arms = (o, c) => { m.fillStyle = c; m.fillRect(x - k * 4 + o, y - k / 2 + o, k * 3, k); m.fillRect(x + k + o, y - k / 2 + o, k * 3, k); m.fillRect(x - k / 2 + o, y - k * 4 + o, k, k * 3); m.fillRect(x - k / 2 + o, y + k + o, k, k * 3); };
    arms(k / 2, 'rgba(10,14,12,0.7)'); arms(0, '#ece4cf');
  }
}
