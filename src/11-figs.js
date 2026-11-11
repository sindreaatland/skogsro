// ===== 3D-figurer: jegere og folk, dyr, fugl, hund og hest, bål, gapahuk og trær som faller =====
// Figurene er satt sammen av avrundede former (se G3 i 10-gl.js) med ledd i hofter, knær, skuldre og albuer, hals og hode.
// Modellen vender mot +x (samme vinkel som retningene i spillet), +z er høyre side. Målene til dyra er de samme som
// pikselbildene er tegnet etter (SPEC i 02-sprites.js), så treffpunktene i siktet stemmer med det du ser.
function glFigInit() { GL.figs = { hunter: null, dog: null, horse: null, notch: null, animals: new Map(), peers: new Map(), vill: new Map(), fires: new Map(), huts: new Map(), scents: new Map(), falls: new Map() }; }
const figAng = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const figFace = (face, flip) => face === 'side' ? (flip ? Math.PI : 0) : face === 'up' ? -Math.PI / 2 : Math.PI / 2;
// Ledd: en gruppe i (x, y, z) med overdelen og en gruppe til (kn) i enden med underdelen
function figLimb(x, y, z, len, up, lo) { const kn = glGroup(0, -len, 0, glMesh(lo)), hp = glGroup(x, y, z, glMesh(up), kn); hp.kn = kn; return hp; }

// ---------- jeger og folk ----------
// pal bytter ut farger og plagg som i genHunter: civ uten sekk og børse, cap lue eller skaut, dress kjole, apron forkle
function figHuman(pal = {}) {
  const { sph, cyl, cylX, box } = G3, K = (k, c) => pal[k] || c, skin = '#e4b48c';
  const hat = K('hat', '#3f5c3a'), hatD = K('hatD', '#2c4430'), band = K('band', '#ee7c2a'), beard = K('beard', '#6b4a30'), hair = pal.hair || (beard === skin ? '#6b4a30' : beard),
    jac = K('jac', '#586c3e'), jacD = K('jacD', '#3f502e'), pant = K('pant', '#4c3f32'), pantD = K('pantD', '#382e26'), boot = '#231c18';
  const leg = z => figLimb(0, 0, z, 4.8, [cyl(1.5, 1.25, 4.9, pant, 0, -4.8), sph(1.5, 1.5, 1.5, pant)], [cyl(1.2, 1, 4, pantD, 0, -4), sph(2, 0.95, 1.3, boot, 0.6, -4.1)]);
  const arm = z => figLimb(0, 7.6, z, 3.7, [cyl(1.2, 1.05, 3.8, jacD, 0, -3.7), sph(1.35, 1.35, 1.35, jac)], [cyl(1.05, 0.9, 3.3, jacD, 0, -3.2), sph(0.95, 0.95, 0.95, skin, 0, -3.6)]);
  const torso = [sph(2.3, 4.3, 3.7, jac, 0, 4.5, 0, 2), sph(2.2, 2, 3.3, pal.dress || pant, 0, 0.4, 0)];
  if (pal.apron) torso.push(sph(0.9, 3.2, 2.5, pal.apron, 1.75, pal.dress ? 2.2 : 3, 0));
  if (!pal.civ) torso.push(sph(1.9, 3.3, 3, '#80583a', -3, 4.8, 0), sph(1.2, 1.4, 2.4, K('packD', '#5c3e28'), -4.2, 3.6, 0));
  const head = [sph(2.25, 2.45, 2.2, skin, 0.1, 2.3, 0, 2), sph(0.5, 0.5, 0.45, '#c48e68', 2.3, 2.1, 0), sph(2.15, 2.05, 2.3, hair, -0.55, 2.7, 0)];
  if (beard !== skin) head.push(sph(1.3, 1.5, 1.9, beard, 1.25, 1.1, 0));
  if (pal.cap) head.push(sph(2.5, 1.8, 2.5, hat, -0.1, 3.9, 0), sph(2.55, 0.5, 2.55, hatD, -0.1, 3.3, 0));
  else head.push(cyl(4.3, 4.3, 0.5, hatD, 0, 3.7, 0, 10), cyl(2.5, 2.85, 2.4, hat, 0, 4.2, 0, 9), cyl(2.95, 2.95, 0.7, band, 0, 4.2, 0, 9));
  const f = { j: {}, yaw: Math.PI / 2, legL: leg(-1.7), legR: leg(1.7), armL: arm(-4.3), armR: arm(4.3) };
  // børsa henger på ryggen til den tas opp; øksa (eller hammeren) sitter i høyre hånd og vises bare når den brukes
  if (!pal.civ) f.gun = glGroup(0, 0, 0, glMesh([cylX(0.4, 0.33, 12, '#201a18', 0, 0, 0, 5), box(6, 1.7, 0.9, '#8c5830', -2.8, -0.55, 0), cylX(0.5, 0.5, 3.2, '#201a18', 0.5, 0.95, 0, 5)]));
  f.axe = glMesh([cyl(0.35, 0.35, 8.5, '#8c5830', 0, -11.5, 0, 5), box(2.6, 2, 0.7, '#8a8780', 1.3, -10.6, 0)]); f.axe.visible = false; f.armR.kn.add(f.axe);
  f.body = glGroup(0, 0, 0, glMesh(torso), glGroup(0, 9.1, 0, glMesh(head)), f.armL, f.armR, f.gun);
  f.pelvis = glGroup(0, 9.6, 0, f.body, f.legL, f.legR, pal.dress ? glMesh([cyl(2.5, 4.3, 9.2, pal.dress, 0, -9.2, 0, 9)]) : null);
  f.root = glGroup(0, 0, 0, f.pelvis);
  return f;
}
const FIG_J = ['hl', 'hr', 'kl', 'kr', 'sl', 'sr', 'el', 'er', 'lean', 'drop', 'bob', 'splay', 'gx', 'gy', 'gr'];
// Setter leddene mot stillingen T: hofter (hl, hr), knær (kl, kr), skuldre (sl, sr), albuer (el, er), lean framover,
// drop hvor langt hoftene er nede, splay beina ut til siden, og børsa i hendene (gun, med gx, gy og vinkelen gr)
function figPose(f, T, dt) {
  const j = f.j, k = dt > 0 ? Math.min(1, dt * 14) : 1;
  for (const n of FIG_J) j[n] = j[n] === undefined ? (T[n] || 0) : lerp(j[n], T[n] || 0, k);
  f.legL.rotation.z = j.hl; f.legR.rotation.z = j.hr; f.legL.kn.rotation.z = j.kl; f.legR.kn.rotation.z = j.kr;
  f.legL.rotation.x = j.splay; f.legR.rotation.x = -j.splay;
  f.armL.rotation.z = j.sl; f.armR.rotation.z = j.sr; f.armL.kn.rotation.z = j.el; f.armR.kn.rotation.z = j.er;
  f.body.rotation.z = j.lean; f.pelvis.position.y = 9.6 - j.drop + j.bob;
  if (f.gun) { if (T.gun) { f.gun.position.set(j.gx, j.gy, 1.4); f.gun.rotation.set(0, 0, j.gr); } else { f.gun.position.set(-3.3, 5.6, 1.7); f.gun.rotation.set(0.3, 0, 1.85); } }
  f.axe.visible = !!T.axe;
}
// Gange: beina svinger mot hverandre og kneet bøyes når foten føres fram, armene går motsatt vei
function figGait(T, ph, A, run) {
  const a = Math.sin(ph) * A, c = Math.cos(ph);
  T.hl = a; T.hr = -a; T.kl = -Math.max(0, c) * A * 1.5; T.kr = -Math.max(0, -c) * A * 1.5; T.sl = -a * 0.75; T.sr = a * 0.75;
  T.el = T.er = run ? 0.9 : 0.25; T.lean = run ? -0.2 : -0.05; T.bob = Math.abs(c) * (run ? 0.9 : 0.4) - 0.2;
  return T;
}
// Børsa tas opp (k fra 0 til 1): griper reima, børsa foran brystet, ned på kne, kolben i skulderen
function figAim(T, k) {
  const kn = smooth(0.45, 0.8, k), gu = smooth(0.08, 0.45, k), sh = smooth(0.7, 1, k);
  T.drop = 3.9 * kn; T.hl = 1.45 * kn; T.kl = -1.45 * kn; T.hr = -0.15 * kn; T.kr = -1.55 * kn;
  T.sl = 1.2 * gu + 0.15 * sh; T.el = 0.3 * gu; T.sr = 0.45 * gu; T.er = 1.6 * gu; T.lean = -0.1 * sh;
  if (gu > 0.25) { T.gun = 1; T.gx = 2.4; T.gy = lerp(5.4, 7.3, sh); T.gr = lerp(0.85, 0, sh); }
  return T;
}
// Hogger (bildet fr som i chopFrame): øksa opp bak hodet, på vei ned, i stammen, og løs igjen
function figChop(T, fr) {
  T.sl = T.sr = [2.7, 1.5, 0.7, 1][fr]; T.el = T.er = [0.7, 0.4, 0.15, 0.3][fr]; T.lean = [0.12, -0.1, -0.32, -0.2][fr]; T.hl = 0.3; T.hr = -0.3; T.axe = 1;
  return T;
}
const FIG_RIDE = { hl: 1.15, hr: 1.15, kl: -1.2, kr: -1.2, splay: 0.45, sl: 0.75, sr: 0.75, el: 0.5, er: 0.5 };
// En som går rundt: e har x, y, moving, walkT, run, sneak, face og flip. Snur seg etter veien han går, ellers etter face
function figWalker(f, e, dt, T, yaw, sink) {
  const dx = e.x - (f.px ?? e.x), dy = e.y - (f.py ?? e.y);
  f.px = e.x; f.py = e.y;
  if (yaw == null) yaw = e.moving && hyp(dx, dy) > 0.02 && hyp(dx, dy) < 30 ? Math.atan2(dy, dx) : e.moving || f.keep ? f.yaw : figFace(e.face, e.flip);
  f.yaw += figAng(yaw, f.yaw) * (dt > 0 ? Math.min(1, dt * 12) : 1);
  if (!T) T = e.moving ? figGait({}, e.walkT * 7.5 * Math.PI / 2, e.run ? 0.95 : e.sneak ? 0.35 : 0.6, e.run) : {};
  if (e.sneak && !T.gun && !T.axe) { T.lean = (T.lean || 0) - 0.25; T.drop = (T.drop || 0) + 1.2; }
  figPose(f, T, dt);
  f.root.position.set(e.x, heightAt(e.x, e.y) - (sink || 0), e.y); f.root.rotation.y = -f.yaw;
}

// ---------- firbeinte dyr ----------
const FIG_ANT = {
  roe: s => [[[0, 0, 0], [-0.5, 4.5, s * 1.2]], [[-0.3, 2.6, s * 0.7], [1.3, 4.2, s * 1.5]], [[-0.4, 3.4, s * 0.9], [-1.6, 5.4, s * 1.6]]],
  red: s => [[[0, 0, 0], [-2, 5, s * 3]], [[-2, 5, s * 3], [-3.5, 9.5, s * 4.5]], [[-0.4, 1, s * 0.6], [2.6, 2.6, s * 1.6]], [[-2, 5, s * 3], [1, 8, s * 4]], [[-3.5, 9.5, s * 4.5], [-2, 12.5, s * 6]], [[-3.5, 9.5, s * 4.5], [-5.6, 11.6, s * 3.6]]],
  rein: s => [[[0, 0, 0], [-3, 6, s * 3]], [[-3, 6, s * 3], [-2, 11, s * 5]], [[-2, 11, s * 5], [1.6, 13, s * 5.6]], [[-0.3, 0.8, s * 0.4], [3.6, 1.6, s * 1.1]], [[-3, 6, s * 3], [-5.6, 8, s * 4]]],
  palm: s => [[[0, 0, 0], [-0.5, 2, s * 3.6]], [[-0.5, 2, s * 3.6], [1.6, 5.6, s * 8.4]], [[-0.5, 2, s * 3.6], [-1.4, 6, s * 9.4]], [[-0.5, 2, s * 3.6], [-3.4, 5, s * 7.4]], [[-0.5, 2, s * 3.6], [2.8, 3.4, s * 5.4]]],
};
FIG_ANT.reinS = s => FIG_ANT.rein(s).slice(0, 3).map(seg => seg.map(p => p.map(v => v * 0.55)));
// S er artens mål (SPEC, DOG eller FIG_HORSE)
function figQuad(S, sex) {
  const { sph, cyl, cylX, stick } = G3, c = S.col, L = S.L, Hh = S.Hh, yc = S.leg + Hh / 2, heavy = S.headT === 'bear' || S.headT === 'boar';
  const wz = Hh * (heavy ? 0.5 : S.horse ? 0.46 : 0.42), xf = L / 2 - S.chestR, xr = -L / 2 + S.rumpR, T = S.tail || 0;
  const body = [sph(S.rumpR * 1.08, Hh * 0.49, wz * 0.96, c.body, xr, yc, 0, 2), sph(L * 0.36, Hh * 0.465, wz * 0.92, c.body, 0, yc - Hh * 0.02, 0, 2), sph(S.chestR * 1.08, Hh * 0.51, wz, c.body, xf, yc, 0, 2),
    sph(L * 0.44, Hh * 0.2, wz * 0.62, c.dk, 0, yc + Hh * 0.33, 0)];
  if (c.belly) body.push(sph(L * 0.34, Hh * 0.24, wz * 0.8, c.belly, 0, yc - Hh * 0.3, 0));
  if (c.rump) body.push(sph(S.rumpR * 0.5, Hh * 0.33, wz * 0.75, c.rump, -L / 2 + S.rumpR * 0.35, yc + Hh * 0.05, 0));
  if (S.hump) body.push(sph(S.chestR * 0.9, S.hump + Hh * 0.2, wz * 0.8, c.dk, xf - 1, yc + Hh * 0.36, 0));
  if (S.vest) body.push(sph(2.3, Hh * 0.56, wz * 1.13, '#ee7c2a', xf - 0.6, yc, 0, 2));
  if (S.spots) for (let i = 0; i < 7; i++) body.push(sph(0.7, 0.6, 0.5, S.spots, (hash2(i, 1, S.seed) - 0.5) * L * 0.7, yc + (hash2(i, 2, S.seed) - 0.3) * Hh * 0.5, (i & 1 ? 1 : -1) * wz * 0.93));
  // hale: busket (rev og ulv), lang og hengende (hest) eller en liten dusk
  if (S.horse) body.push(sph(1.4, 6, 1.4, '#2a2018', -L / 2 - 1, yc - 3, 0));
  else if (T >= 8) body.push(G3.turn(sph(T * 0.52, 1.5, 1.5, c.body, -T * 0.5), 0, 0, 0.5, -L / 2 + 0.8, yc + Hh * 0.12, 0), G3.turn(sph(1.4, 1.2, 1.2, c.belly || c.lt, -T + 0.8), 0, 0, 0.5, -L / 2 + 0.8, yc + Hh * 0.12, 0));
  else if (T) body.push(sph(Math.max(1, T * 0.5), Math.max(0.8, T * 0.45), 0.9, c.tailC || c.rump || c.body, -L / 2 - T * 0.2, yc + Hh * 0.22, 0));
  // hals og hode
  const hd = [sph(S.hl * 0.5, S.hh * 0.5, S.hh * 0.44, c.neck ? c.body : c.body, S.hl * 0.15, 0.2, 0, 2), cylX(S.sh * 0.54, S.sh * 0.38, S.sl + S.hl * 0.3, c.snout || c.body, S.hl * 0.32, -(S.sdy || 0) * 0.6, 0),
    sph(S.sh * 0.34, S.sh * 0.3, S.sh * 0.34, c.nose, S.hl * 0.62 + S.sl, -(S.sdy || 0) * 0.6, 0)];
  for (const s of [-1, 1]) {
    hd.push(G3.turn(sph(0.5, Math.max(0.7, S.ear * 0.55), 0.8, c.dk), s * 0.45, 0, 0.25, -S.hl * 0.12, S.hh * 0.38 + S.ear * 0.4, s * S.hh * 0.36), sph(0.36, 0.36, 0.3, '#1a1412', S.hl * 0.36, S.hh * 0.14, s * S.hh * 0.41));
    const ant = S.ant && S.ant[sex] && FIG_ANT[S.ant[sex]];
    if (ant) for (const [a, b2] of ant(s)) hd.push(stick([a[0] - S.hl * 0.05, a[1] + S.hh * 0.42, a[2] + s * S.hh * 0.25], [b2[0] - S.hl * 0.05, b2[1] + S.hh * 0.42, b2[2] + s * S.hh * 0.25], S.ant[sex] === 'palm' ? 1.1 : 0.5, '#d8ccb0'));
    if (S.ant && S.ant[sex] === 'palm') hd.push(G3.turn(sph(3.4, 0.5, 2.8, '#cfc2a4'), -s * 0.45, 0, 0, -0.6, S.hh * 0.42 + 4.4, s * (S.hh * 0.25 + 7)));
  }
  if (S.headT === 'badger') hd.push(sph(S.hl * 0.6, 0.6, 0.7, '#f0ece0', S.hl * 0.3, S.hh * 0.4, 0), sph(S.hl * 0.4, 1, 0.5, '#f0ece0', S.hl * 0.4, -0.3, S.hh * 0.42), sph(S.hl * 0.4, 1, 0.5, '#f0ece0', S.hl * 0.4, -0.3, -S.hh * 0.42));
  if (S.headT === 'lynx') hd.push(sph(1, 1.7, S.hh * 0.6, c.lt, 0.2, -0.9, 0));
  const nk = [sph(S.neckW * 1.3, S.neckW * 1.3, Math.min(wz, S.neckW * 1.3), c.neck || c.body), cylX(S.neckW * 1.2, S.neckW * 0.92, S.neckL + 1, c.neck || c.body, -1, 0, 0)];
  if (S.horse) nk.push(sph(S.neckL * 0.55, 1, 0.8, '#2a2018', S.neckL * 0.5, S.neckW * 0.95, 0));
  const f = { S, yc, wz, side: 1, hd: undefined };
  f.head = glGroup(S.neckL, 0, 0, glMesh(hd)); f.neck = glGroup(xf + S.chestR * 0.45, yc + Hh * 0.18, 0, glMesh(nk), f.head);
  // bein: lår eller bog øverst, legg og klov (eller labb) under kneet
  const hipY = S.leg + Hh * 0.2, up = hipY * 0.52, lo = hipY * 0.48, lu = c.legU || c.body;
  f.legs = [];
  for (const [x, hind] of [[xf * 0.95 + 0.3, 0], [xr * 0.9 - 0.2, 1]]) for (const s of [-1, 1])
    f.legs.push(figLimb(x, hipY, s * wz * 0.52, up, [sph(S.lw * 0.9 * (hind ? 1.25 : 1), up * 0.6, S.lw * 0.75, lu, 0, -up * 0.35, 0), cyl(S.lw * 0.62, S.lw * 0.46, up, lu, 0, -up, 0)],
      [cyl(Math.max(0.55, S.ll * 0.5), Math.max(0.5, S.ll * 0.42), lo, c.legLo, 0, -lo, 0), S.paw ? sph(S.ll * 0.7, 0.9, S.ll * 0.62, c.dk, 0.5, -lo + 0.6, 0) : cyl(S.ll * 0.5 + 0.1, S.ll * 0.55 + 0.2, 1, '#1e1814', 0, -lo, 0)]));
  f.tilt = glGroup(0, 0, 0, glMesh(body), f.neck, ...f.legs); f.root = glGroup(0, 0, 0, f.tilt);
  // hvor langt ned halsen må for å nå gresset
  f.grazeA = Math.asin(clamp(-(yc + Hh * 0.18 - 1.5) / (S.neckL + S.hl * 0.6 + S.sl), -0.98, 0));
  return f;
}
const FIG_HORSE = { horse: 1, seed: 7, L: 27, Hh: 10, leg: 13, lw: 2.6, ll: 1.4, rumpR: 5.6, chestR: 5.4, neckL: 9.5, neckA: 48, neckW: 3.1, hl: 6.4, hh: 4.4, sl: 4.6, sh: 3.2, sdy: 0.6, ear: 2.4,
  col: { dk: '#8a6a40', body: '#b08a56', lt: '#cca870', legLo: '#3c3026', nose: '#4e4234', snout: '#84725c' } };
// st: gait (0 står, 1 går, 2 springer), ph steget, neck ('graze', 'alert', 'run'), dead, point (hunden står for vilt), slope
function figQuadPose(f, st, dt) {
  const S = f.S, k = dt > 0 ? Math.min(1, dt * 6) : 1, run = st.gait === 2, mv = st.gait > 0;
  let na = S.neckA * Math.PI / 180, hx = 0;
  if (st.dead) na = 0.15;
  else if (st.neck === 'graze') { na = f.grazeA + Math.sin(G.t * 2.3 + (st.id || 0) * 7) * 0.06; hx = -0.35; }
  else if (st.neck === 'alert') na = Math.min(1.35, na + 0.3);
  else if (st.neck === 'run') na *= 0.75;
  f.na = f.na === undefined ? na : lerp(f.na, na, k); f.hx = lerp(f.hx || 0, hx, k);
  f.neck.rotation.z = f.na; f.head.rotation.z = -f.na * 0.82 - 0.12 + f.hx;
  // i gange går beina diagonalt i takt, i sprang går framme og bak hver for seg
  const off = run ? [0, 0.6, Math.PI, Math.PI + 0.6] : [0, Math.PI, Math.PI, 0], A = run ? 0.85 : 0.42, B = run ? 1.1 : 0.7;
  f.legs.forEach((lg, i) => {
    let a = 0, b2 = 0;
    if (st.dead) { a = i < 2 ? 0.5 - i * 0.25 : -0.4 + (i - 2) * 0.25; b2 = -0.3; }
    else if (mv) { a = Math.sin(st.ph + off[i]) * A; b2 = -Math.max(0, Math.cos(st.ph + off[i])) * B; }
    else if (st.point && i === 0) { a = 0.5; b2 = -1.3; }
    lg.rotation.z = lerp(lg.rotation.z, a, mv ? 1 : k); lg.kn.rotation.z = lerp(lg.kn.rotation.z, b2, mv ? 1 : k);
  });
  // et felt dyr ligger på siden
  f.tilt.rotation.x = st.dead ? lerp(f.tilt.rotation.x, Math.PI / 2 * f.side, dt > 0 ? Math.min(1, dt * 5) : 1) : 0;
  f.tilt.position.y = st.dead ? f.wz * 0.85 * Math.abs(Math.sin(f.tilt.rotation.x)) : run ? Math.abs(Math.sin(st.ph)) * 1.5 : 0;
  f.tilt.rotation.z = st.dead ? 0 : lerp(f.tilt.rotation.z, (st.slope || 0) + (run ? Math.sin(st.ph) * 0.07 : 0), k);
}
// Hellingen i bakken langs retningen hd, som vinkel
const figSlope = (x, y, hd, L) => inVill(x, y) ? 0 : clamp(Math.atan((heightAt(x + Math.cos(hd) * L / 2, y + Math.sin(hd) * L / 2) - heightAt(x - Math.cos(hd) * L / 2, y - Math.sin(hd) * L / 2)) / L), -0.6, 0.6);

// ---------- skogsfugl ----------
function figBird(S, sex) {
  const { sph, cyl, cylX } = G3, z = S.sz[sex], c = S.col[sex], yb = z.leg + z.Hh * 0.5, f = { S, bird: 1, wz: z.Hh * 0.36, side: 1 };
  const body = [sph(z.L * 0.42, z.Hh * 0.42, z.Hh * 0.36, c.body[1], 0, yb, 0, 2), sph(z.L * 0.3, z.Hh * 0.3, z.Hh * 0.3, c.belly || c.body[0], z.L * 0.08, yb - z.Hh * 0.12, 0),
    sph(z.hr * 0.9, z.Hh * 0.3, z.hr * 0.85, c.body[1], z.L * 0.3, yb + z.Hh * 0.28, 0), sph(z.hr, z.hr, z.hr * 0.9, c.body[2], z.L * 0.34, yb + z.Hh * 0.5, 0), cylX(0.45, 0.12, z.bk + 0.7, c.beak, z.L * 0.34 + z.hr * 0.7, yb + z.Hh * 0.48, 0, 4)];
  if (c.comb) body.push(sph(0.6, 0.4, z.hr * 0.7, c.comb, z.L * 0.34 + 0.2, yb + z.Hh * 0.5 + z.hr * 0.8, 0));
  if (c.under) body.push(sph(1.1, 0.8, 1.1, c.under, -z.L * 0.4, yb - 0.6, 0));
  body.push(z.tail === 'fan' ? G3.turn(sph(0.9, z.tl * 0.55, z.tl * 0.62, c.tail), 0, 0, 0.5, -z.L * 0.42, yb + z.tl * 0.3, 0) : sph(z.tl * 0.55, 0.6, z.tail === 'lyre' ? 2 : 1.3, c.tail, -z.L * 0.4 - z.tl * 0.35, yb + 0.5, 0));
  f.legsM = glMesh([cyl(0.3, 0.3, z.leg + 0.5, c.leg, 0.5, 0, -1, 4), cyl(0.3, 0.3, z.leg + 0.5, c.leg, 0.5, 0, 1, 4)]);
  f.folded = glMesh([-1, 1].map(s => sph(z.L * 0.33, z.Hh * 0.28, 0.7, c.wing[1], -z.L * 0.05, yb + z.Hh * 0.05, s * z.Hh * 0.33)));
  const wing = s => glGroup(0, yb + z.Hh * 0.15, s * z.Hh * 0.25, glMesh([sph(z.L * 0.32, 0.45, z.L * 0.55, c.wing[1], 0, 0, s * z.L * 0.55), sph(z.L * 0.24, 0.4, z.L * 0.3, c.wing[0], -z.L * 0.08, 0, s * z.L * 0.95)]));
  f.wingL = wing(-1); f.wingR = wing(1);
  f.tilt = glGroup(0, 0, 0, glMesh(body), f.legsM, f.folded, f.wingL, f.wingR); f.root = glGroup(0, 0, 0, f.tilt);
  return f;
}
function figBirdPose(f, a, dt) {
  const dead = a.state === 'dead', fly = !dead && a.state === 'flee' && a.z > 0.5, ph = a.anim / 4 * TAU, w = Math.sin(ph * 2) * 0.9;
  f.folded.visible = !fly; f.wingL.visible = f.wingR.visible = fly; f.legsM.visible = !fly && !dead;
  f.wingL.rotation.x = w; f.wingR.rotation.x = -w;
  f.tilt.rotation.x = dead ? Math.PI / 2 * f.side : 0; f.tilt.position.y = dead ? f.wz : 0;
  f.tilt.rotation.z = dead || fly ? 0 : hyp(a.vx, a.vy) > 1 ? Math.sin(ph) * 0.12 : 0;
}

// ---------- bål, gapahuk, luktflaske og trær som faller ----------
function figFire() {
  const { sph, box } = G3, parts = [], f = { flames: [] };
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; parts.push(sph(1.8, 1.4, 1.8, i & 1 ? '#727876' : '#50565a', Math.cos(a) * 5.5, 0.7, Math.sin(a) * 5.5, 0)); }
  for (let i = 0; i < 3; i++) parts.push(G3.turn(box(1.4, 1.4, 8, '#46322a'), 0, i * TAU / 6, 0, 0, 1.2, 0));
  f.root = glGroup(0, 0, 0, glMesh(parts, true));
  // flammene lyser selv
  for (const [r, h, c] of [[2.6, 6, '#ff7a22'], [1.8, 8.5, '#ffb030'], [1, 10.5, '#ffe890']]) { const me = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({ color: c, fog: false })); me.position.y = 1.5; f.flames.push(me); f.root.add(me); }
  return f;
}
// to takflater av stokker som møtes i mønet, åpen mot sør med liggeunderlaget inni (se collide for bakveggen i nord)
function figHut() {
  const { box, cyl } = G3, parts = [box(22, 10, 1, '#120e0a', 0, 5, -13.6), box(8, 1.5, 10, '#b8a488', 0, 0.8, -6.5)];
  for (const s of [-1, 1]) [0.14, 0.42, 0.7, 0.96].forEach((t, i) => parts.push(G3.turn(cyl(2.6, 2.6, 13.5, (i + (s > 0)) & 1 ? '#4a3828' : '#5c4632', 0, 0, 0, 6), Math.PI / 2, 0, 0, s * 16 * (1 - t), 14 * t, -14.5)));
  return { root: glGroup(0, 0, 0, glMesh(parts, true)) };
}
function figBottle() { return { root: glGroup(0, 0, 0, glMesh([G3.cyl(0.9, 1.1, 3, '#9ac0a8'), G3.cyl(0.45, 0.45, 1.3, '#8a6a40', 0, 3)])) }; }
// Treet som velter: de samme delene som da det sto, dreid rundt rota
function figFall(fl) {
  const root = glGroup(fl.x, heightAt(fl.x, fl.y), fl.y);
  if (fl.k && SPR[fl.k]) glStatic({ k: fl.k, v: fl.v, x: fl.x, y: fl.y }, (k, rot, sx, sy, sz, colr) => {
    const g = glGeo(k), me = new THREE.Mesh(g.geo, colr ? glMat({ vertexColors: true, color: colr }) : g.mat);
    me.rotation.y = rot; me.scale.set(sx, sy, sz); me.castShadow = true; root.add(me);
  });
  return { root, shared: 1 };
}
function figFree(f) { f.root.traverse(o => { if (o.geometry && !f.shared) o.geometry.dispose(); }); }
// Holder figurene i GL.figs[name] i takt med listen items: nye lages, de som er borte fjernes
function figPool(name, items, keyOf, make, upd) {
  const M = GL.figs[name];
  for (const f of M.values()) f.seen = false;
  for (const it of items) {
    const k = keyOf(it);
    let f = M.get(k);
    if (!f) { f = make(it); M.set(k, f); GL.scene.add(f.root); }
    f.seen = true; upd(f, it);
  }
  for (const [k, f] of M) if (!f.seen) { GL.scene.remove(f.root); figFree(f); M.delete(k); }
}

// ---------- alt som rører seg, én gang per bilde ----------
function figHorseUpd(f, x, y, hd, kit, v, ph, dt) {
  const S = f.S;
  if (!f.saddle) {
    f.saddle = glMesh([G3.sph(4.2, 1.5, f.wz + 0.7, '#5c3a22', 0.5, f.yc + S.Hh * 0.47, 0), G3.sph(1, S.Hh * 0.52, f.wz + 0.5, '#3e2616', 1.5, f.yc, 0)]);
    f.bags = glMesh([G3.sph(2.6, 2.7, f.wz + 1.8, '#566038', -5.5, f.yc + S.Hh * 0.22, 0)]); f.tilt.add(f.saddle, f.bags);
  }
  f.saddle.visible = !!(kit & 2); f.bags.visible = !!(kit & 4);
  if (kit & 1) { if (!f.rider) { f.rider = figHuman(); f.rider.root.position.set(0.5, f.yc + S.Hh * 0.5 - 8.6, 0); f.tilt.add(f.rider.root); } f.rider.root.visible = true; figPose(f.rider, FIG_RIDE, dt); }
  else if (f.rider) f.rider.root.visible = false;
  const a = Math.abs(v);
  f.root.position.set(x, heightAt(x, y), y); f.root.rotation.y = -hd;
  figQuadPose(f, { gait: a > 80 ? 2 : a > 8 ? 1 : 0, ph, neck: a > 80 ? 'run' : null, slope: figSlope(x, y, hd, S.L) }, dt);
}
function figDogUpd(f, d, dt) {
  const S = f.S, hd = d.hd || 0, gait = d.spd > 60 ? 2 : d.spd > 3 ? 1 : 0;
  f.hd = f.hd === undefined ? hd : f.hd + figAng(hd, f.hd) * Math.min(1, dt * 10);
  f.root.position.set(d.x, heightAt(d.x, d.y) - (d.swim ? S.leg * 0.8 : 0), d.y); f.root.rotation.y = -f.hd;
  figQuadPose(f, { gait, ph: (d.anim || 0) / 4 * TAU, neck: d.st === 'mark' ? 'alert' : gait === 2 ? 'run' : null, point: d.st === 'mark', slope: figSlope(d.x, d.y, f.hd, S.L) }, dt);
}
function figAnimalUpd(f, a, dt) {
  const dead = a.state === 'dead', run = a.state === 'flee';
  const hd = a.head || 0;
  f.hd = f.hd === undefined ? hd : dead ? f.hd : f.hd + figAng(hd, f.hd) * Math.min(1, dt * 8);
  f.root.position.set(a.x, heightAt(a.x, a.y) + (a.z || 0), a.y); f.root.rotation.y = -f.hd;
  if (f.bird) return figBirdPose(f, a, dt);
  const walk = !run && !dead && a.state !== 'alert' && a.state !== 'graze' && a.state !== 'stand' && hyp(a.vx, a.vy) > 1;
  figQuadPose(f, { dead, gait: run ? 2 : walk ? 1 : 0, ph: a.anim / 4 * TAU, neck: a.state === 'graze' ? 'graze' : a.state === 'alert' ? 'alert' : run ? 'run' : null, id: a.id, slope: dead ? 0 : figSlope(a.x, a.y, f.hd, f.S.L) }, dt);
}
function figSync(dt, map, view) {
  const F = GL.figs, near = (x, y) => hyp(x - P.x, y - P.y) < 2400;
  // jegeren: på kartet alltid, i siktet bare sett bakfra mens han tar børsa opp
  const hu = F.hunter || (F.hunter = (() => { const f = figHuman(); f.keep = 1; GL.scene.add(f.root); return f; })());
  const tree = P.work && P.work.tree, raising = P.aim || AIM.want || AIM.raise > 0;
  hu.root.visible = !HORSE.on && (map || !!(view && view.third && view.fade < 0.75));
  if (P.aim) { hu.px = P.x; hu.py = P.y; }
  const k = P.aim ? 1 : !map ? Math.max(0.22, AIM.tp) : AIM.raise > 0 && !P.moving ? (AIM.want ? 0.22 : AIM.raise) : 0;
  figWalker(hu, P, dt, tree ? figChop({}, chopFrame(P.work)) : k > 0 ? figAim({}, k) : null, tree ? Math.atan2(tree.y - P.y, tree.x - P.x) : raising && G.started ? AIM.yaw : null, P.deep ? 9 : P.wet ? 2.5 : 0);
  // hakket i stammen på siden mot jegeren blir dypere for hvert hogg
  const nt = F.notch || (F.notch = (() => { const me = glMesh([G3.box(1.4, 2.6, 3.4, '#e8d0a0'), G3.box(0.7, 1.1, 3.5, '#2a1c12')], true); GL.scene.add(me); return me; })());
  nt.visible = !!(tree && P.work.hits && CHOP[tree.k]);
  if (nt.visible) { const d = Math.min(3, (P.work.hits + 1) >> 1); nt.scale.x = d; nt.position.set(tree.x + P.work.side * (2.6 - d * 0.5), heightAt(tree.x, tree.y) + 6, tree.y + 0.4); }
  // de andre jegerne, med hund og hest
  const peers = [...NET.peers.values()].filter(r => r.started && near(r.x, r.y));
  figPool('peers', peers, r => r, () => { const f = figHuman(); f.dog = figQuad(DOG, 'm'); f.horse = figQuad(FIG_HORSE, 'm'); f.root0 = f.root; f.root = glGroup(0, 0, 0, f.root0, f.dog.root, f.horse.root); return f; }, (f, r) => {
    const rd = r.av && r.av.on, r0 = f.root; f.root = f.root0;
    f.root0.visible = !r.in && !rd;
    if (f.root0.visible) figWalker(f, r, dt, r.aim ? figAim({}, 1) : null, null, r.wet && waterAt(r.x, r.y) < 0.55 ? 9 : 0);
    f.root = r0;
    f.dog.root.visible = !r.in && !!r.dog; if (f.dog.root.visible) figDogUpd(f.dog, r.dog, dt);
    f.horse.root.visible = !!r.av;
    if (r.av) { if (rd) figHorseUpd(f.horse, r.x, r.y, r.av.h, r.av.kit | 1, r.moving ? 60 : 0, G.t * 5 * Math.PI, dt); else figHorseUpd(f.horse, r.av.x, r.av.y, r.av.h, r.av.kit, 0, 0, dt); }
  });
  // hunden og hesten din
  const dog = F.dog || (F.dog = (() => { const f = figQuad(DOG, 'm'); GL.scene.add(f.root); return f; })());
  dog.root.visible = G.started; if (G.started) figDogUpd(dog, D, dt);
  const hs = F.horse || (F.horse = (() => { const f = figQuad(FIG_HORSE, 'm'); GL.scene.add(f.root); return f; })());
  hs.root.visible = !!lv('horse');
  if (hs.root.visible) figHorseUpd(hs, HORSE.x, HORSE.y, HORSE.h, horseKit(HORSE.on), HORSE.on || HORSE.come ? HORSE.v : 0, HORSE.odo / HORSE_STRIDE * Math.PI, dt);
  // dyra
  figPool('animals', G.animals.filter(a => near(a.x, a.y)), a => a.id, a => { const f = SPEC[a.sp].bird ? figBird(SPEC[a.sp], a.sex) : figQuad(SPEC[a.sp], a.sex); f.side = a.id * 7 % 2 < 1 ? 1 : -1; return f; }, (f, a) => figAnimalUpd(f, a, dt));
  // folkene i landsbyen
  figPool('vill', VILL.filter(v => !v.in && near(v.x, v.y)), v => v, v => figHuman(VIL_PAL[v.pal]), (f, v) => figWalker(f, v, dt, v.act === 'chop' || v.act === 'smith' ? figChop({}, villChop(v)) : null));
  // bål, gapahuker, luktflasker og trær som faller
  figPool('fires', G.fires, q => q.id, figFire, (f, q) => {
    f.root.position.set(q.x, heightAt(q.x, q.y), q.y);
    f.flames.forEach((me, i) => { me.scale.set(1 + 0.15 * Math.sin(G.t * 9 + i * 2 + q.id * 9), 1 + 0.3 * Math.sin(G.t * 13 + i * 1.7 + q.id * 5), 1); me.rotation.y = G.t * (2 + i); });
  });
  figPool('huts', G.huts, q => q.id, figHut, (f, q) => f.root.position.set(q.x, heightAt(q.x, q.y), q.y));
  figPool('scents', G.scentObjs, q => q.id, figBottle, (f, q) => f.root.position.set(q.x, heightAt(q.x, q.y), q.y));
  figPool('falls', G.falls, q => q.x + ',' + q.y, figFall, (f, q) => { f.root.rotation.z = -q.dir * fallAng(q); });
  // trær og hus som dekker deg, hunden, hesten eller et dyr blir gjennomsiktige på kartet
  if (map && dt > 0) {
    const pts = [[P.x, P.y - 6]];
    if (lv('horse')) pts.push([HORSE.x, HORSE.y - 8]);
    if (G.started) pts.push([D.x, D.y - 4]);
    for (const a of G.animals) if (hyp(a.x - P.x, a.y - P.y) < 340) pts.push([a.x, a.y - (a.state === 'dead' ? 3 : SPEC[a.sp].leg) - (a.z || 0)]);
    for (const r of peers) if (!r.in) pts.push([r.x, r.y - 6]);
    glReveal(dt, pts);
  }
}
