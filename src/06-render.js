// ===== Tegning: lavoppløst piksel-buffer som skaleres opp =====
let cv, m, buf, b, W = 0, H = 0, DPR = 1, ZB = 3, ZM = 3;
// zs: zoom etter farten og utsynet (aldri under ZMIN); vx, vy: farten kameraet ser foran seg etter; px, py: der jegeren sto sist;
// bob: hvor mye bildet duver med stegene; idle: 1 når du har stått i ro en stund
const CAM = { x: 0, y: 0, z: 1, w: 400, h: 300, ox: 0, oy: 0, S: 3, dx: 0, dy: 0, zs: 1, vx: 0, vy: 0, px: 0, py: 0, bob: 0, idle: 0 };
const ZMIN = 0.78;
// Lufta: vindkastene (gx, gy) og skyskyggene (cx, cy) driver med vinden
const AIR = { gx: 0, gy: 0, cx: 0, cy: 0 };
// Vindkast som ruller gjennom skogen: trærne står nesten stille mellom kastene (0.35) og bøyer seg i dem (opp mot 1.9)
const gust = (x, y) => 0.35 + 1.55 * smooth(0.42, 0.8, vnoise((x - AIR.gx) / 230, (y - AIR.gy) / 230, 97));
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
  // kartet er zoomet litt lenger ut enn 3D-siktet: rundt 450 px av verden i høyden mot 350
  ZM = Math.max(2, Math.round(H / 450));
  buf.width = Math.ceil(W / ZM / ZMIN) + 6; buf.height = Math.ceil(H / ZM / ZMIN) + 6;
  b.imageSmoothingEnabled = false;
}
// Tåke og dis over døgnet: tett om morgenen, litt om kvelden
const mist = h => 0.6 * smooth(3, 5.5, h) * (1 - smooth(7.5, 10.5, h)) + 0.1 + 0.3 * smooth(18.5, 21, h) * (1 - smooth(23, 24, h));
// Kartet og siktet tegnes i 3D (10-gl.js); her styres kameraet, og merker, tåke og tekst legges oppå
function render(dt) {
  GL.frame++; GL.dt = dt;
  // 0 kart, 1 bak jegeren i 3D, 2 fra øynene hans. Bytter vi bilde, løses det forrige opp i rutemønster over det nye,
  // bortsett fra inn i siktet bakfra, der kameraet selv glir inn i hodet hans
  const v3 = !G.started ? 0 : P.aim ? 2 : aimThird() ? 1 : 0;
  if (v3 !== AIM.v3) { if (!G.paused && !(AIM.v3 === 1 && v3 === 2)) snapStart(); AIM.v3 = v3; }
  // vindkastene og skyskyggene driver med vinden
  AIR.gx += G.wind.x * (30 + 60 * G.wind.s) * dt; AIR.gy += G.wind.y * (30 + 60 * G.wind.s) * dt;
  AIR.cx += G.wind.x * (5 + 12 * G.wind.s) * dt; AIR.cy += G.wind.y * (5 + 12 * G.wind.s) * dt;
  if (v3) { render3D(dt); snapDraw(dt); return; }
  // kamera
  const re = smooth(0, 1, AIM.raise);
  let tx, ty, bx = 0, by = 0;
  if (!G.started) { tx = P.x + Math.sin(G.t * 0.05) * 70; ty = P.y - 30 + Math.cos(G.t * 0.04) * 30; }
  else {
    // kameraet ser litt foran deg dit du går, og lenger jo fortere det går (ikke etter et sprang, som ut av bua)
    const jx = P.x - CAM.px, jy = P.y - CAM.py, ok = dt > 0 && hyp(jx, jy) < 30, kv = Math.min(1, dt * 2.5);
    CAM.vx = lerp(CAM.vx, ok ? jx / dt : 0, kv); CAM.vy = lerp(CAM.vy, ok ? jy / dt : 0, kv);
    const sp = hyp(CAM.vx, CAM.vy), lead = Math.min(0.4, 48 / Math.max(sp, 1)) * (1 - re);
    tx = P.x + CAM.vx * lead; ty = P.y - 10 + CAM.vy * lead;
    // det zoomer litt ut når du springer eller rir, og litt inn når du sniker
    // og fra en topp ser du lenger: jo høyere du står over landet rundt, jo mer zoomer det ut
    let hs = 0; for (let i = 0; i < 8; i++) hs += heightAt(P.x + Math.cos(i * TAU / 8) * 160, P.y + Math.sin(i * TAU / 8) * 160);
    const top = smooth(10, 45, heightAt(P.x, P.y) - hs / 8);
    CAM.zs = lerp(CAM.zs, (HORSE.on ? 1 - 0.1 * smooth(30, 110, Math.abs(HORSE.v)) : P.run ? 0.94 : P.sneak && P.moving ? 1.05 : 1) * (1 - 0.12 * top), Math.min(1, dt * 1.2));
    // bildet duver med stegene (mest når du springer), og driver sakte som et åndedrag når du står i ro
    CAM.bob = lerp(CAM.bob, re > 0 || !P.moving ? 0 : HORSE.on ? 0.8 * smooth(30, 110, Math.abs(HORSE.v)) : P.run ? 0.7 : P.sneak ? 0.15 : 0.35, Math.min(1, dt * 6));
    CAM.idle = clamp(CAM.idle + (P.moving || re > 0 ? -dt * 2 : dt * 0.5), 0, 1);
    const ph = HORSE.on ? HORSE.odo / HORSE_STRIDE * Math.PI : P.walkT * 7.5 * Math.PI / 2, id = smooth(0, 1, CAM.idle);
    bx = Math.sin(ph) * CAM.bob * 0.4 + Math.sin(G.t * 0.31) * 1.4 * id; by = -Math.abs(Math.sin(ph)) * CAM.bob + Math.sin(G.t * 0.23 + 1) * 0.9 * id;
  }
  CAM.px = P.x; CAM.py = P.y;
  // når børsa tas opp, går kameraet inn mot jegeren
  let tz = CAM.zs;
  if (re > 0) { ty -= 7 * re; tz = CAM.zs * (1 + 1.2 * re); }
  CAM.z = re > 0 ? tz : lerp(CAM.z, tz, Math.min(1, dt * 9));
  if (Math.abs(CAM.z - tz) < 0.01) CAM.z = tz;
  const fk = re > 0 ? Math.min(1, dt * 14) : Math.min(1, dt * 5);
  CAM.x = lerp(CAM.x, tx, fk); CAM.y = lerp(CAM.y, ty, fk);
  // S: skjermpiksler per piksel i verden; (cx, cy, hc): punktet på bakken midt i bildet; w, h: bakken bildet dekker
  const S = CAM.S = ZM * CAM.z;
  CAM.w = W / S; CAM.h = H / S / GL_SIN;
  CAM.cx = CAM.x + bx; CAM.cy = CAM.y + by; CAM.hc = heightAt(CAM.x, CAM.y);
  [MOUSE.wx, MOUSE.wy] = toWorld(MOUSE.x, MOUSE.y);
  glMap(dt);
  mapMarks(dt);
  drawOverlay(); snapDraw(dt);
  // forhåndsgenerer bakke rundt synsfeltet
  const t0 = performance.now(), c0 = Math.floor((CAM.cx - CAM.w / 2) / CS) - 1, c1 = Math.floor((CAM.cx + CAM.w / 2) / CS) + 1, r0 = Math.floor((CAM.cy - CAM.h / 2 - 120) / CS) - 1, r1 = Math.floor((CAM.cy + CAM.h / 2 + 260) / CS) + 1;
  outer: for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) { const ch = getChunk(cx, cy); if (!ch.gpix) { genGround(ch); if (performance.now() - t0 > 4) break outer; } }
  if ((G.t | 0) % 5 === 0) evictChunks(anchors());
}
// Det som ligger flatt oppå kartbildet: ringer under felte dyr og rundt hunden, merkene over dyr og hund, og tåkedottene
function mapMarks(dt) {
  const S = CAM.S;
  // ring av lyse prikker med mørk kant som går rundt, på bakken (eller hz over den)
  const ring = (wx, wy, hz, r, n, col = '#fff4d6') => {
    const [X, Y] = toScreen(wx, wy, heightAt(wx, wy) + hz), q = Math.max(2, Math.round(S * 1.2));
    m.globalAlpha = 0.75 + 0.25 * Math.sin(G.t * 3);
    for (let i = 0; i < n; i++) {
      const t = i / n * TAU + G.t * 0.6, x = Math.round(X + Math.cos(t) * r * S), y = Math.round(Y + Math.sin(t) * r * GL_SIN * S);
      m.fillStyle = '#1a1410'; m.fillRect(x, y + q / 2, q, q); m.fillStyle = col; m.fillRect(x, y, q, q);
    }
    m.globalAlpha = 1;
  };
  const icon = (img, wx, wy, hz) => { const [X, Y] = toScreen(wx, wy, heightAt(wx, wy) + hz), z = Math.max(1, Math.round(S)); m.drawImage(img, Math.round(X - img.width * z / 2), Math.round(Y - img.height * z), img.width * z, img.height * z); };
  m.imageSmoothingEnabled = false;
  // tåke: dotter som driver med vinden
  const fogA = mist(G.hour) * lerp(0.35, 1, G.dayl);
  if (!WISPS.length) for (let i = 0; i < 16; i++) WISPS.push({ x: CAM.x + rnd(-400, 400), y: CAM.y + rnd(-250, 250), k: i & 3, s: rnd(0.6, 1.2) });
  for (const w of WISPS) {
    w.x += (G.wind.x * (4 + 10 * G.wind.s) + 2) * w.s * dt; w.y += G.wind.y * 3 * w.s * dt;
    const hw = CAM.w / 2 + 170, hh = CAM.h / 2 + 60;
    if (w.x < CAM.x - hw) w.x += hw * 2; if (w.x > CAM.x + hw) w.x -= hw * 2;
    if (w.y < CAM.y - hh) w.y += hh * 2; if (w.y > CAM.y + hh) w.y -= hh * 2;
    const [X, Y] = toScreen(w.x, w.y, CAM.hc + 12), im = FX.wisp[w.k];
    m.globalAlpha = fogA * 0.55; m.drawImage(im, Math.round(X - im.width * S / 2), Math.round(Y - im.height * S / 2), im.width * S, im.height * S);
  }
  m.globalAlpha = 1;
  // skyskygger som glir over skogen med vinden, og solstråler mellom trærne; i tåka er de borte
  if (G.dayl > 0.2) {
    const tile = (img, n, ax, ay) => {
      const x0 = Math.floor((CAM.cx - CAM.w / 2 - ax) / n) * n + ax, y0 = Math.floor((CAM.cy - CAM.h / 2 - ay) / n) * n + ay;
      for (let y = y0; y < CAM.cy + CAM.h / 2; y += n) for (let x = x0; x < CAM.cx + CAM.w / 2; x += n) m.drawImage(img, Math.round(W / 2 + (x - CAM.cx) * S), Math.round(H / 2 + (y - CAM.cy) * GL_SIN * S), Math.ceil(n * S), Math.ceil(n * GL_SIN * S));
    };
    m.globalAlpha = 0.2 * G.dayl * (1 - mist(G.hour)); tile(FX.cloud, 512, AIR.cx % 512, AIR.cy % 512);
    m.globalCompositeOperation = 'screen'; m.globalAlpha = 0.07 * G.dayl * (1 - mist(G.hour) * 0.5); tile(FX.rays, 256, -G.t * 2 % 256, 0);
    m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
  }
  const px = Math.max(1, Math.round(S));
  // krusninger rundt jegeren når han vasser
  if (G.started && P.wet && !HORSE.on) { const [X, Y] = toScreen(P.x, P.y), k = (G.t * 4) | 0; m.fillStyle = '#a4ccc6'; m.fillRect(Math.round(X) - (4 - (k & 1)) * px, Math.round(Y) - px, 2 * px, px); m.fillRect(Math.round(X) + (2 - (k & 1)) * px, Math.round(Y) - px, 2 * px, px); }
  for (const a of G.animals) {
    const A = SPEC[a.sp];
    // over et råttent dyr surrer det fluer
    if (rotten(a)) { const [X, Y] = toScreen(a.x, a.y, heightAt(a.x, a.y) + 6); m.fillStyle = '#141210'; for (let i = 0; i < 4; i++) { const t = G.t * (2.2 + i * 0.7) + i * 1.9; m.fillRect(Math.round(X) + Math.round(Math.cos(t) * (5 + i)) * px, Math.round(Y) + Math.round(Math.sin(t * 1.3) * 3) * px, px, px); } }
    // felte dyr du kan hente har en ring rundt seg og et merke over; et råttent dyr har bare ringen
    if (a.state === 'dead') { if (!canTake(a, NET.id)) continue; ring(a.x, a.y, 1, A.L / 2 + 7, 22, '#fff'); if (!rotten(a)) icon(FX.ex, a.x, a.y, 12 + (Math.sin(G.t * 3) > 0 ? 1 : 0)); }
    else if (a.state === 'alert' && !P.aim) icon(FX.q, a.x, a.y, A.leg + A.Hh + 10 + (a.z || 0));
  }
  // hvit sirkel rundt hunden din når den er ute, og en oransje nål som hopper over den når den står for vilt
  if (G.started && D.st !== 'heel') ring(D.x, D.y, 3, 12, 20);
  const dogs = G.started ? [D] : [];
  for (const r of NET.peers.values()) if (r.started && !r.in && r.dog) dogs.push(r.dog);
  for (const d of dogs) if (d.st === 'mark') icon(FX.mark, d.x, d.y, 20 + Math.abs(Math.sin(G.t * 5)) * 3);
}

// Skjermpunktet for (wx, wy) h piksler over bakken
const markAt = (wx, wy, h) => toScreen(wx, wy, heightAt(wx, wy) + h);
// Tegner pil (og ev. ikon) ved skjermkanten mot et punkt h piksler over bakken utenfor skjermen; false hvis punktet er synlig
function edgeMark(wx, wy, h, label, icon) {
  const [sx, sy] = markAt(wx, wy, h), mg = 90 * DPR;
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
  m.font = `${size}px "Jersey 25", monospace`; m.textAlign = align || 'center'; m.textBaseline = 'middle';
  m.fillStyle = 'rgba(10,14,12,0.85)'; m.fillText(t, x + DPR * 1.5, y + DPR * 1.5); m.fillStyle = col; m.fillText(t, x, y);
}
function drawOverlay() {
  const u = Math.max(2, Math.round(2 * DPR));
  // sikter og kikkert tegnes i pikselbufferen (09-aim3d.js); her bare avstandsmåleren
  if (G.started && P.aim) aimHud();
  // pil mot nærmeste bu, egne felte dyr og de andre jegerne når de er utenfor skjermen, ellers navn over hodet;
  // ikke mens børsa tas opp eller senkes
  if (G.started && !P.aim && !AIM.raise) {
    // nærmeste hus (koie, utpost eller landsbyen), og landsbyen i tillegg når det er et annet sted som er nærmest
    // (ikke når hesten står i landsbyen: da peker hestemerket samme vei)
    const c = nearestCabin(P.x, P.y), far = !inVillage(c.c) && (!lv('horse') || HORSE.on || hyp(HORSE.x - PLACES[0].x, HORSE.y - PLACES[0].y) > 400), dist = (x, y) => ' ' + Math.round(hyp(x - P.x, y - P.y) * M_PER_PX) + ' m';
    edgeMark(c.x, c.y, 30, (c.c.kind === 'koie' ? 'Koie' : c.c.name) + dist(c.x, c.y), FX.house);
    if (far) edgeMark(PLACES[0].x, PLACES[0].y, 30, 'Landsbyen' + dist(PLACES[0].x, PLACES[0].y), FX.house);
    // området oppdraget gjelder (landemerket midt i det), til dyret er felt
    const q = G.quest;
    if (q && q.kind === 'cull' && !q.got) { const g = questArea(q); edgeMark(g.mk.x, g.mk.y, 30, 'Oppdrag: ' + g.name + dist(g.mk.x, g.mk.y), FX.deer); }
    if (lv('horse') && !HORSE.on) edgeMark(HORSE.x, HORSE.y, 8, 'Hesten ' + Math.round(hyp(HORSE.x - P.x, HORSE.y - P.y) * M_PER_PX) + ' m', FX.horse);
    if (D.st !== 'heel') {
      const t = (D.st === 'mark' ? 'Hunden står ' : 'Hunden ') + Math.round(hyp(D.x - P.x, D.y - P.y) * M_PER_PX) + ' m';
      if (!edgeMark(D.x, D.y, 6, t, FX.dog) && D.st === 'mark') { const [sx, sy] = markAt(D.x, D.y, 32); pxText('Hunden står', sx, sy, Math.round(13 * DPR), '#ffb050'); }
    }
    for (const a of G.animals) if (a.state === 'dead' && (!a.by || a.by === NET.id)) edgeMark(a.x, a.y, 6, SPEC[a.sp].name + ' ' + Math.round(hyp(a.x - P.x, a.y - P.y) * M_PER_PX) + ' m', FX.deer);
    for (const r of NET.peers.values()) {
      if (!r.started || r.in) continue;
      if (!edgeMark(r.x, r.y, 12, r.name + ' ' + Math.round(hyp(r.x - P.x, r.y - P.y) * M_PER_PX) + ' m')) { const [sx, sy] = markAt(r.x, r.y, 32); pxText(r.name, sx, sy, Math.round(12 * DPR), '#ece4cf'); }
    }
  }
  // navnet på området du nettopp gikk inn i, stort øverst i bildet noen sekunder
  const rt = G.t - (P.regAt ?? -9);
  if (G.started && !P.aim && !G.panel && rt < 4.5 && P.reg) { m.globalAlpha = clamp(Math.min(rt / 0.4, 4.5 - rt), 0, 1); pxText(P.reg.name, W / 2, H * 0.2, Math.round(40 * DPR), '#ece4cf'); m.globalAlpha = 1; }
  // eget pikselkors som musepeker
  if (G.started && !P.aim && !AIM.raise && !G.paused) {
    const x = Math.round(MOUSE.x), y = Math.round(MOUSE.y), k = u;
    const arms = (o, c) => { m.fillStyle = c; m.fillRect(x - k * 4 + o, y - k / 2 + o, k * 3, k); m.fillRect(x + k + o, y - k / 2 + o, k * 3, k); m.fillRect(x - k / 2 + o, y - k * 4 + o, k, k * 3); m.fillRect(x - k / 2 + o, y + k + o, k, k * 3); };
    arms(k / 2, 'rgba(10,14,12,0.7)'); arms(0, '#ece4cf');
  }
}
