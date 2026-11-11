// ===== Siktet i 3D: jegeren sett bakfra mens han tar børsa opp, så skogen sett fra øynene hans =====
// Bildet tegnes av 3D-scenen (glAim i 10-gl.js). Her regnes det ut hva kula treffer: dybden til bakken stråle for
// stråle fra de samme høydene, og trær, stein, busker og dyr som pikselbildene sine skalert etter avstand.
// Kula følger trådkorset: det første faste du ser der, er det den treffer.
// want: høyre musknapp holdes; raise: kartet går inn mot jegeren (0–1) og ut igjen når børsa senkes; tp: jegeren tar
// børsa opp, sett bakfra i 3D (0–1); tpF: bildet han er på; open: kikkerten foran øyet (0–1); in: vi gikk selv inn i siktet;
// ex, ey: øyets avstand fra midten av kikkerten; ringX, ringY, ringR: linsa i okularet (bufferpiksler); list2: det som er
// tegnet i synsfeltet rundt kikkerten; v3, snap, snapT: bildet som løses opp når vi bytter mellom kart og 3D
const AIM = { yaw: 0, pitch: 0, ry: 0, rp: 0, camYaw: 0, f: 300, eye: 15, far: 900, cx: 0, cy: 0, sx: 0, sy: 0, hy: 0, kick: 0, range: null, pick: null, list: [], list2: [], im: null, px: null,
  want: false, raise: 0, tp: 0, tpF: -1, open: 0, in: false, ex: 0, ey: 0, ringX: 0, ringY: 0, ringR: 0, lc: null, lensX: 0, lensY: 0, brT: 0, brIn: true, hbT: 0, held: false,
  v3: 0, camX: 0, camY: 0, snap: null, snapTmp: null, snapT: 0, pat: {}, masks: new Map() };
// FAR er hvor langt du ser i klarvær, FOG0 hvor disen begynner, og GND_FAR hvor langt ut bakken tegnes piksel for piksel
const EYE = 15, NEAR = 14, FAR = 1800, FOG0 = 280, GND_FAR = 1000, SWAY_K = 0.0035, PITCH_MAX = 0.35;
// Høyreklikk: kartet går inn mot jegeren (IN_T), så ser du ham bakfra i 3D ta børsa opp (TP_T, synsvidde TP_FOV grader),
// og kikkerten kommer opp foran øyet (OPEN_T). Slipper du, tas kikkerten ned (CLOSE_T) og kartet kommer tilbake (LOWER_T).
// Bytte mellom kart og 3D løses opp i rutemønster over DISS_T sekunder. Rundt kikkerten ser du skogen med synsvidde
// SURR_FOV grader, og linsa har radius LENS_K av skjermhøyden.
// Gress og bregner nærmere enn SOFT_NEAR tegnes ikke; de ville bare blitt store, uskarpe klosser rett foran deg
const IN_T = 0.12, TP_T = 0.55, TP_FOV = 60, OPEN_T = 0.22, CLOSE_T = 0.14, LOWER_T = 0.3, DISS_T = 0.15, SURR_FOV = 50, LENS_K = 0.28, SOFT_NEAR = 72, MASK = '#070a08';
// Bildet jegeren er på i 3D: griper reima, børsa foran brystet, ned på kne, kolben i skulderen
const tpFrame = () => Math.min(3, (AIM.tp / 0.19) | 0);
const aimThird = () => !P.aim && AIM.want && AIM.raise >= 1;
const FOG_HEX = '#a9b6a2', FOG = C(FOG_HEX), SKY_HEX = '#c6d4d2', GROUND0 = C('#3d5334'), CSB = Math.log2(CS);
// Gress, bregner, siv og lyng stopper ikke kula; alt annet du ser, gjør det
const SOFT = { fern: 1, grassT: 1, reed: 1, heather: 1 };
const HITN = { rock: 'en stein', stump: 'en stubbe', log: 'en stokk', juniper: 'en einer', shrub: 'en busk', cabin: 'en husvegg', npc: 'like ved en av folkene', cairn: 'varden', bauta: 'bautasteinen', tower: 'jakttårnet', fence: 'skigarden', pal: 'palisaden', gate: 'porten', well: 'brønnen', stall: 'en markedsbod', lamp: 'en lyktestolpe', vprop: 'noe på tunet' };
const CHIP = { rock: '#b4b8ac', juniper: '#4e8270', shrub: '#6a8a3a' };

// Brennvidde i bufferpiksler; synsfeltet blir smalere jo bedre kikkert, og hagla og buen ser vidt uten forstørrelse
const aimFocal = () => Math.ceil(H / ZB) / 2 / Math.tan((hagle() ? HST.fov : bue() ? BST.fov : ST.fov[lv('scope')]) * Math.PI / 360);
const tpFocal = () => Math.ceil(H / ZB) / 2 / Math.tan(TP_FOV * Math.PI / 360);
const surrFocal = () => Math.ceil(H / ZB) / 2 / Math.tan(SURR_FOV * Math.PI / 360);
// Med hagla kan du se høyt opp etter fugl i lufta
const pitchMax = () => hagle() ? 0.8 : PITCH_MAX;
// Jegeren kneler når han sikter; ute på djupt vann er øynene nærmere vannflata
const aimEye = () => P.deep ? EYE - 5 : EYE;

// Jegeren snur seg den av de fire retningene på kartet som ligger nærmest vinkelen
function faceTo(yaw) {
  const dx = Math.cos(yaw), dy = Math.sin(yaw);
  if (Math.abs(dx) > Math.abs(dy) * 0.8) { P.face = 'side'; P.flip = dx < 0; } else P.face = dy > 0 ? 'down' : 'up';
}

// ---------- å legge an ----------
// Høyreklikk: kartet går inn mot jegeren, du ser ham bakfra i 3D ta børsa opp, og så går bildet over i siktet (P.aim).
// Slipper du, tas kikkerten ned og kartet kommer tilbake mens jegeren senker børsa. I 3D-visningen står kameraet
// alt bak ham, så der går du rett til å ta børsa opp, og etterpå tilbake til å gå
function aimPress() {
  if (AIM.want || onHorse()) return;
  if (!G.gun) return noGun();
  AIM.want = true;
  if (P.aim) return; // kikkerten var på vei ned og kommer opp igjen
  aimStart(MOUSE.wx, MOUSE.wy); P.sway = [0, 0];
  sfx.shoulder();
}
function aimRelease() { AIM.want = false; P.hold = false; }
// Rett ut av siktet uten animasjon (bua, jaktboka, pause, vinduet mister fokus)
function aimReset() { P.aim = false; P.hold = false; AIM.want = AIM.in = false; AIM.raise = AIM.tp = AIM.open = 0; AIM.tpF = -1; AU.focus = false; }
function aimUpdate(dt) {
  // tatt ut av siktet av noe annet (f.eks. båret til bua): senk børsa derfra
  if (AIM.in && !P.aim) { AIM.in = AIM.want = false; AIM.open = 0; }
  if (P.aim) {
    AIM.open = clamp(AIM.open + (AIM.want ? dt / OPEN_T : -dt / CLOSE_T), 0, 1);
    if (!AIM.want && AIM.open <= 0) { P.aim = AIM.in = false; P.hold = false; sfx.lower(); }
  } else if (AIM.want) {
    // jegeren snur seg mot målet mens kartet går inn mot ham
    faceTo(AIM.yaw);
    if (AIM.raise < 1) AIM.raise = Math.min(1, AIM.raise + dt / IN_T);
    else {
      // i 3D; ute på djupt vann går det ikke an å knele, så da går du rett i siktet
      AIM.tp = P.deep ? 1 : Math.min(1, AIM.tp + dt / TP_T);
      const fr = tpFrame();
      if (fr !== AIM.tpF) { if (fr === 2) sfx.kneel(); if (fr === 3) sfx.settle(); AIM.tpF = fr; }
      // kolben er nettopp lagt i skulderen, så siktet er urolig det første sekundet
      if (AIM.tp >= 1) { P.aim = AIM.in = true; AIM.open = AIM.tp = 0; AIM.tpF = -1; P.unrest = Math.max(P.unrest, 0.35); }
    }
  } else { AIM.tp = 0; AIM.tpF = -1; AIM.raise = Math.max(0, AIM.raise - dt / LOWER_T); }
  AU.focus = P.aim || AIM.want;
  aimAudio(dt);
}
// Pusten i siktet: rolige drag inn og ut, tunge og raske når du er andpusten, stille mens du holder den, og et
// langt pust ut når du slipper. Hjertet banker når lufta tar slutt og når du er andpusten
function aimAudio(dt) {
  if (!P.aim) { AIM.brT = 0.5; AIM.brIn = true; AIM.held = false; return; }
  if ((P.hold && P.breath < 0.6 || P.winded) && (AIM.hbT -= dt) <= 0) {
    const k = P.winded ? 0.8 : 1 - P.breath / 0.6;
    AIM.hbT = lerp(1, 0.5, k); sfx.heart(0.35 + 0.65 * k);
  }
  if (P.hold) { AIM.held = true; return; }
  if (AIM.held) { AIM.held = false; sfx.exhale(); AIM.brT = 1.2; AIM.brIn = true; return; }
  if ((AIM.brT -= dt) <= 0) {
    const w = P.winded; sfx.breath(AIM.brIn, w);
    AIM.brT = AIM.brIn ? (w ? 0.45 : 1.3) : (w ? 0.55 : 1.9); AIM.brIn = !AIM.brIn;
  }
}

// Høyreklikk: se dit musa pekte på kartet, og rett på dyret hvis du pekte på et
function aimStart(tx, ty) {
  let best = null, bd = 1e9, h = 6;
  for (const a of G.animals) {
    if (a.state === 'dead') continue;
    // musa peker på bakken bak dyret: kroppen står like høyt over føttene som punktet ligger bak dem (kartet ses i 45°)
    const A = SPEC[a.sp], d = hyp(a.x - tx, a.y - ((a.z || 0) + A.leg + A.Hh / 2) * GL_COS / GL_SIN - ty);
    if (d < A.L / 2 + 8 && d < bd) { bd = d; best = a; }
  }
  if (best) { tx = best.x; ty = best.y; h = SPEC[best.sp].leg + SPEC[best.sp].Hh / 2 + (best.z || 0); }
  const d = hyp(tx - P.x, ty - P.y);
  AIM.yaw = d > 8 ? Math.atan2(ty - P.y, tx - P.x) : P.face === 'side' ? (P.flip ? Math.PI : 0) : P.face === 'up' ? -Math.PI / 2 : Math.PI / 2;
  AIM.pitch = Math.atan((h - aimEye()) / Math.max(d, 30));
  AIM.camYaw = AIM.yaw; AIM.pitch = clamp(AIM.pitch, -pitchMax(), pitchMax());
  AIM.ry = AIM.yaw; AIM.rp = AIM.pitch;
  AIM.f = aimFocal(); AIM.kick = 0; AIM.ex = AIM.ey = 0; AIM.list.length = 0; AIM.pick = null; AIM.range = null;
}
// Musa flytter bildet like mange skjermpiksler som den beveger seg, uansett forstørrelse. Mens børsa tas opp,
// følger jegeren musa; i siktet henger kikkerten litt etter når du svinger fort
function aimLook(dx, dy) {
  const k = 0.9 / (ZB * AIM.f);
  AIM.yaw += dx * k; AIM.pitch = clamp(AIM.pitch - dy * k, -pitchMax(), pitchMax());
  if (P.aim) { AIM.ex -= dx / ZB * 0.15; AIM.ey -= dy / ZB * 0.15; }
}

// Ett 3D-bilde. Bak jegeren mens han går i 3D-visningen og mens han tar børsa opp; ellers fra øynene hans: med kikkert
// tegnes først det forstørrede bildet i linsa, så synsfeltet rundt, og kikkert, børse og hender i forgrunnen. Det bildet
// kula følger (linsa, ellers hele bildet) lagres i AIM for skudd og avstandsmåling
function render3D(dt) {
  AIM.kick = Math.max(0, AIM.kick - dt * 4);
  const third = !P.aim, bw = Math.ceil(W / ZB), bh = Math.ceil(H / ZB), ix = bw >> 1, need = new Map();
  const e = smooth(0, 1, AIM.open), scope = !third && G.gun === 'rifle' && lv('scope') > 0;
  let yaw, pitch, eye, camX = P.x, camY = P.y, fWide, fade = 0, ox = 0, oy = 0;
  if (third) {
    // bak og til høyre for jegeren, litt over hodet hans (AIM.tp er 0 mens han går); mens han tar børsa opp,
    // glir kameraet sakte nærmere, og til slutt inn i hodet hans mens han tones bort
    const push = smooth(0, 0.7, AIM.tp), dive = smooth(0.72, 1, AIM.tp), back = lerp(60, 50, push) * (1 - 0.8 * dive), side = 12 * (1 - 0.8 * dive);
    yaw = AIM.yaw; pitch = AIM.pitch - 0.07 * (1 - dive); eye = lerp(24, aimEye(), dive); fWide = tpFocal(); fade = smooth(0.72, 0.95, AIM.tp);
    camX = P.x - Math.cos(yaw) * back - Math.sin(yaw) * side; camY = P.y - Math.sin(yaw) * back + Math.cos(yaw) * side;
  } else {
    // fra øynene: siktelinja fra musa, pluss rekyl. Skogen står stille; pust og skjelving flytter kikkerten eller
    // siktene (ox, oy bufferpiksler) over bildet. Mens børsa kommer opp, snevres synsfeltet inn fra det vide bildet bak skulderen
    yaw = AIM.yaw; pitch = AIM.pitch + AIM.kick * AIM.kick * 0.06; eye = aimEye();
    fWide = lerp(tpFocal(), scope ? surrFocal() : aimFocal(), e);
    const [swx, swy] = aimSway(), fk = SWAY_K * (scope ? aimFocal() : fWide);
    ox = Math.round(swx * fk); oy = Math.round(swy * fk);
  }
  const cam = { x: camX, y: camY, yaw, pitch, eye }, iy = (bh >> 1) + Math.round((1 - e) * bh * 0.55), R = Math.round(bh * LENS_K);
  // kikkert: det forstørrede bildet tegnes først i et utsnitt rundt linsa, lyssettes og klippes ut som en rund linse.
  // Øyet finner tilbake til midten av kikkerten etter et raskt sving
  let lens = null;
  if (scope) {
    const sp = Math.exp(-dt * 7), om = Math.round(R * 0.2); AIM.ex *= sp; AIM.ey *= sp;
    const eo = hyp(AIM.ex, AIM.ey); if (eo > om) { AIM.ex *= om / eo; AIM.ey *= om / eo; }
    AIM.ringX = ix + ox + Math.round(AIM.ex); AIM.ringY = iy + oy + Math.round(AIM.ey + AIM.kick * AIM.kick * bh * 0.04); AIM.ringR = R;
    const pad = R + om + 2, x0 = Math.max(0, ix + ox - pad), y0 = Math.max(0, iy + oy - pad), x1 = Math.min(bw, ix + ox + pad + 1), y1 = Math.min(bh, iy + oy + pad + 1);
    if (x1 > x0 && y1 > y0) {
      shotView(world({ ...cam, f: aimFocal(), cy: iy + 0.5, clip: [x0, y0, x1, y1] }, bw, bh, need, AIM.list));
      reticle(ix + ox, iy + oy, R, lv('scope'));
      b.globalCompositeOperation = 'multiply'; b.fillStyle = lightAt(G.hour); b.fillRect(x0, y0, x1 - x0, y1 - y0); b.globalCompositeOperation = 'source-over';
      lens = cutLens(x0, y0, x1 - x0, y1 - y0, ix + ox, iy + oy, R, om);
    }
  }
  // synsfeltet over hele skjermen; rundt kikkerten litt dempet, som det andre øyet ser det
  const wv = world({ ...cam, f: fWide, third, fade, zb2: !!lens, hole: lens && [AIM.ringX + 0.5, AIM.ringY + 0.5, R + Math.round(bh * 0.07)] }, bw, bh, need, lens ? AIM.list2 : AIM.list);
  if (!lens) shotView(wv);
  AIM.sx += ox; AIM.sy += oy;
  if (scope) { b.globalAlpha = 0.25; b.fillStyle = MASK; b.fillRect(0, 0, bw, bh); b.globalAlpha = 1; scopeBody(AIM.ringX, AIM.ringY, R, bh); }
  else if (!third) drawSights(bw, bh, ix + ox, iy + oy);
  // døgnlys over skog, kikkert og børse; linsa er alt lyssatt, så munningsglimtet til slutt
  b.globalCompositeOperation = 'multiply'; b.fillStyle = lightAt(G.hour); b.fillRect(0, 0, bw, bh);
  b.globalCompositeOperation = 'source-over';
  if (lens) b.drawImage(lens, AIM.lensX, AIM.lensY);
  if (AIM.kick > 0.7) { b.globalCompositeOperation = 'lighter'; b.globalAlpha = (AIM.kick - 0.7) * 0.8; b.fillStyle = '#ffd890'; b.fillRect(0, 0, bw, bh); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; }
  if (!third) breathBar(bw, bh);

  m.setTransform(1, 0, 0, 1, 0, 0); m.imageSmoothingEnabled = false;
  m.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * ZB, bh * ZB);
  // avstandsmåleren leser det som ligger i trådkorset, ellers bakken
  const pk = AIM.pick = aimPick(AIM.sx, AIM.sy), zg = groundZ(AIM.sx, AIM.sy);
  AIM.range = pk ? pk.it.z : zg < AIM.far ? zg : null;
  drawOverlay();
  // tegn bakken for biter vi ser ut over men ikke har tegnet ennå, nærmeste først
  const t0 = performance.now();
  for (const [kx, ky] of [...need.values()].sort((p, q) => p[2] - q[2])) { genGround(getChunk(kx, ky)); if (performance.now() - t0 > 6) break; }
  if ((G.t | 0) % 5 === 0) evictChunks(anchors());
}
// Åsene bak synsranda, nærmest først: [farge, laveste høyde og utslag (radianer), hvor fort den skifter, frø]
const RIDGES = [['#8ea39c', 0.006, 0.03, 5.5, 301], ['#a0b3b2', 0.02, 0.045, 3.6, 302], ['#b4c5c8', 0.04, 0.06, 2.4, 303]];
// Bakken der biten ikke er tegnet (langt unna, eller ikke rukket ennå): én farge per rute på 32 × 32 piksler, snittet av
// fire punkter i ruta, husket i en liten tabell
const FARN = 1 << 14, farK = new Int32Array(FARN * 2).fill(1 << 30), farV = new Uint32Array(FARN);
function farCol(ix, iy) {
  const gx = ix >> 5, gy = iy >> 5, h = (Math.imul(gx, 73856093) ^ Math.imul(gy, 19349663)) & (FARN - 1);
  if (farK[h * 2] === gx && farK[h * 2 + 1] === gy) return farV[h];
  const x = (gx << 5) + 16, y = (gy << 5) + 16, fl = fields(x, y, cabinsNear(x, y));
  let r = 0, g = 0, bl = 0;
  const hx = (heightRaw(x + 16, y) - heightRaw(x - 16, y)) / 32, hy = (heightRaw(x, y + 16) - heightRaw(x, y - 16)) / 32, hh = heightRaw(x, y), sg = hyp(hx, hy);
  for (let i = 0; i < 4; i++) { const c = groundColor(x + (i & 1) * 11 - 5, y + (i >> 1) * 11 - 5, fl, hh, sg); r += c & 255; g += (c >>> 8) & 255; bl += (c >>> 16) & 255; }
  farK[h * 2] = gx; farK[h * 2 + 1] = gy;
  // skyggelagt etter hellingen, som den tegnede bakken
  return farV[h] = lightC((0xff000000 | (bl >> 2) << 16 | (g >> 2) << 8 | r >> 2) >>> 0, shadeK(hx + hy));
}
// Bildet kula følger: midten er trådkorset
function shotView(v) { Object.assign(AIM, { cx: v.cx, cy: v.cy, hy: v.hy, f: v.f, eye: v.eye, camZ: v.camZ, far: v.far, camYaw: v.yaw, camX: v.x, camY: v.y, sx: v.cx, sy: v.cy }); }
// Skogen sett fra (o.x, o.y) i øyehøyde o.eye, i retning o.yaw/o.pitch med brennvidde o.f, tegnet inn i bufferen. Midten av
// bildet er (bw/2, o.cy). Med o.clip ([x0, y0, x1, y1]) tegnes bare det utsnittet. Ting helt bak o.hole ([x, y, r],
// der okularet dekker) tegnes ikke, og med o.zb2 havner bakkedybden i AIM.zb2, så AIM.zb beholder den fra bildet i
// kikkerten. Med o.third står jegeren i bildet, tonet bort med o.fade.
// Det kula kan treffe, havner i L, nærmest sist
function world(o, bw, bh, need, L) {
  const camX = o.x, camY = o.y, f = o.f, eye = o.eye, [x0, y0, x1, y1] = o.clip || [0, 0, bw, bh];
  const vx = Math.cos(o.yaw), vy = Math.sin(o.yaw), rx = -vy, ry = vx;
  const cx = (bw >> 1) + 0.5, cy = o.cy || (bh >> 1) + 0.5, hy = cy + Math.tan(o.pitch) * f;
  // disen begynner et stykke ute og tetner mot synsranda; morgentåka trekker begge nærmere
  const mi = mist(G.hour), far = FAR * (1 - 0.45 * mi), fog0 = FOG0 * (1 - mi), fog = z => smooth(fog0, far, z);

  // bitene vi ser ut over (trær og høyder; bakken tegnes ved behov)
  const ex = (cx + 8) / f * far, xs = [camX, camX + vx * far + rx * ex, camX + vx * far - rx * ex], ys = [camY, camY + vy * far + ry * ex, camY + vy * far - ry * ex];
  const kx0 = Math.floor((Math.min(...xs) - 40) / CS), kx1 = Math.floor((Math.max(...xs) + 40) / CS), ky0 = Math.floor((Math.min(...ys) - 40) / CS), ky1 = Math.floor((Math.max(...ys) + 40) / CS);
  for (let ky = ky0; ky <= ky1; ky++) for (let kx = kx0; kx <= kx1; kx++) getChunk(kx, ky);
  // øyet står eye over bakken; bak jegeren løftes kameraet så det ikke havner under bakken i en motbakke
  const camZ = eye + Math.max(heightAt(camX, camY), o.third ? heightAt(P.x, P.y) : 0);

  // terreng: hver kolonne i bildet går utover fra kameraet, steg for steg, og tegner det stykket av bakken som stikker
  // opp over det som alt er tegnet i kolonnen. Stegene er korte nært og lengre utover (aldri over 16 piksler, så en
  // bakke som vender mot deg, ikke blir stripete). Nært leses bakken piksel for piksel, lenger ute fra utgaven i kvart
  // oppløsning, og lengst ute grovt (farCol). zb husker dybden til bakken i hver piksel, så ting bak en ås skjules
  if (!AIM.im || AIM.im.width !== bw || AIM.im.height !== bh) { AIM.im = b.createImageData(bw, bh); AIM.px = new Uint32Array(AIM.im.data.buffer); AIM.zb = new Float32Array(bw * bh); AIM.zb2 = new Float32Array(bw * bh); }
  const px = AIM.px, zb = o.zb2 ? AIM.zb2 : AIM.zb, M = CS - 1, fr = FOG & 255, fg = (FOG >>> 8) & 255, fb = (FOG >>> 16) & 255;
  px.fill(0); zb.fill(1e9);
  const fogC = (c, fo) => { if (!fo) return c; const r = c & 255, g = (c >>> 8) & 255, bl = (c >>> 16) & 255; return (0xff000000 | (bl + ((fb - bl) * fo >> 8)) << 16 | (g + ((fg - g) * fo >> 8)) << 8 | (r + ((fr - r) * fo >> 8))) >>> 0; };
  const ZS = [], ZF = [], kz = 0.5 / (eye * f);
  for (let z = 2; z < far; z += clamp(z * z * kz, 1, 16)) { ZS.push(z); ZF.push(Math.round(fog(z) * 256)); }
  for (let x = x0; x < x1; x++) {
    const t = (x + 0.5 - cx) / f, dxw = vx + rx * t, dyw = vy + ry * t;
    let yb = y1, lkx = NaN, lky = NaN, hg = null, gp = null, gm = null, bx = 0, by = 0, pwx = camX, pwy = camY, psy = y1;
    // fargen på bakken i (ix, iy) i biten vi står i: piksel for piksel nært, kvart oppløsning lenger ute, grovt lengst ute
    const colAt = (ix, iy, z) => gp && z < 190 ? gp[(iy & M) << CSB | ix & M] : gm && z < GND_FAR ? gm[((iy & M) >> 2) << 6 | (ix & M) >> 2] : farCol(ix, iy);
    for (let s = 0; s < ZS.length && yb > y0; s++) {
      const z = ZS[s], wx = camX + dxw * z, wy = camY + dyw * z, ix = Math.floor(wx), iy = Math.floor(wy), kx = ix >> CSB, ky = iy >> CSB;
      if (kx !== lkx || ky !== lky) {
        lkx = kx; lky = ky; bx = kx << CSB; by = ky << CSB;
        const key = kx + ',' + ky, ch = chunks.get(key);
        hg = ch ? ch.hg : null; gp = ch ? ch.gpix : null; gm = ch ? ch.gmid : null;
        if (!gp && z < GND_FAR) need.set(key, [kx, ky, z]);
      }
      let h;
      if (hg) {
        const u = (wx - bx) / HG, v = (wy - by) / HG, i = u | 0, j = v | 0, a = (j + 1) * HN + i + 1, fu = u - i, h0 = hg[a] + (hg[a + 1] - hg[a]) * fu, h1 = hg[a + HN] + (hg[a + HN + 1] - hg[a + HN]) * fu;
        h = h0 + (h1 - h0) * (v - j);
      } else h = heightRaw(wx, wy);
      const sy = hy + (camZ - h) * f / z, yt = sy < y0 ? y0 : Math.ceil(sy);
      if (yt < yb) {
        const fo = ZF[s], q0 = yt * bw + x;
        // en bakke som vender mot deg, fyller mange rader mellom to steg: da leses fargen for hver rad langs bakken
        // mellom forrige punkt og dette, ellers ville stykket blitt en ensfarget stripe
        if (yb - yt > 2 && s && z - ZS[s - 1] >= 2 && fo < 256) {
          const kq = 1 / Math.max(1, psy - sy);
          for (let y = yt, q = q0; y < yb; y++, q += bw) { const tq = Math.min(1, (y - sy) * kq), qx = Math.floor(wx + (pwx - wx) * tq), qy = Math.floor(wy + (pwy - wy) * tq); px[q] = fogC(colAt(qx >> CSB === kx && qy >> CSB === ky ? qx : ix, qx >> CSB === kx && qy >> CSB === ky ? qy : iy, z), fo); zb[q] = z; }
        } else {
          const c = fo >= 256 ? FOG : fogC(colAt(ix, iy, z), fo);
          for (let y = yt, q = q0; y < yb; y++, q += bw) { px[q] = c; zb[q] = z; }
        }
        yb = yt;
      }
      pwx = wx; pwy = wy; psy = sy;
    }
  }
  // selve bildet tegnes i 3D (10-gl.js) med samme projeksjon; bakken over er bare dybden treff og skjuling regnes etter
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.imageSmoothingEnabled = false;
  b.clearRect(x0, y0, x1 - x0, y1 - y0);
  b.drawImage(glAim({ x: camX, y: camY, camZ, yaw: o.yaw, f, cx, hy, far, fog0, third: o.third, fade: o.fade || 0 }, bw, bh), x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);

  // alt som står i synsfeltet, som sprites skalert etter avstand
  L.length = 0;
  const add = (wx, wy, s, flip, it) => {
    const dx = wx - camX, dy = wy - camY, z = dx * vx + dy * vy;
    if (z < NEAR || z > far || z < SOFT_NEAR && it.o && SOFT[it.o.k]) return;
    const gz = it.o ? it.o.h : heightAt(wx, wy);
    const k = f / z, X = Math.round(cx + (dx * rx + dy * ry) * k - (flip ? s.w - s.ax : s.ax) * k), Y = Math.round(hy + (camZ - gz - (it.hz || 0) - s.ay) * k);
    const Wd = Math.max(1, Math.round(s.w * k)), Hd = Math.max(1, Math.round(s.h * k));
    // lyng, gress og småstein langt unna er mindre enn to piksler og tegnes ikke
    if (Hd < 2 && it.o) return;
    if (X > x1 || X + Wd < x0 || Y > y1 || Y + Hd < y0) return;
    // helt bak okularet
    if (o.hole) { const hx = o.hole[0], hy2 = o.hole[1], r2 = o.hole[2] * o.hole[2], fx = Math.max(Math.abs(X - hx), Math.abs(X + Wd - hx)), fy = Math.max(Math.abs(Y - hy2), Math.abs(Y + Hd - hy2)); if (fx * fx + fy * fy < r2) return; }
    // bak en ås: midt under tingen leses dybden til bakken oppover fra foten. Er bakken nærmere enn tingen helt opp,
    // er den skjult; ellers tegnes bare det som stikker opp over åsen (clipY)
    const xc = clamp(X + (Wd >> 1), x0, x1 - 1), zt = z * 0.96 - 4, yf = Math.min(y1, Y + Hd) - 1;
    let yv = yf; while (yv >= Y && yv >= y0 && zb[yv * bw + xc] < zt) yv--;
    if (yv < Y || yv < y0) return;
    Object.assign(it, { z, k, X, Y, W: Wd, H: Hd, s, flip, fo: fog(z), clipY: yv < yf ? yv + 1 : null });
    if (it.sw && Math.abs(it.sw * k) < 0.5) it.sw = 0;
    if (it.fo < 0.99) { L.push(it); return it; }
  };
  // bare trærne rører seg, og bare når det blåser mer enn flau vind
  const wl = (G.wind.x * rx + G.wind.y * ry) * 0.6, wa = Math.max(0, G.wind.s - 0.25) * 1.8;
  for (let ky = ky0; ky <= ky1; ky++)
    for (let kx = kx0; kx <= kx1; kx++)
      for (const ob of getChunk(kx, ky).objs) {
        const s0 = SPR[ob.k][ob.k === 'fence' || ob.k === 'pal' ? 0 : ob.v], s = s0.s3 || s0; // skigarden vender alltid langsida mot siktet, og husene ses rett forfra
        add(ob.x, ob.y, s, false, { o: ob, solid: !SOFT[ob.k], sw: s.sway ? (Math.sin(G.t * 1.0 + ob.ph) * 0.8 + wl) * wa * gust(ob.x, ob.y) : 0 });
      }
  // dyra vises i profil og snus etter hvilken vei de går sett herfra; fugl i lufta tegnes i sin høyde.
  // Andre jegere vises bare på kartet, aldri i siktet.
  for (const a of G.animals) add(a.x, a.y, animalSprite(a), Math.cos(a.head) * rx + Math.sin(a.head) * ry < 0, { a, solid: a.state !== 'dead', hz: a.z || 0 });
  L.sort((p, q) => q.z - p.z);
  b.setTransform(1, 0, 0, 1, 0, 0);
  // bak alt: blånende åser i tre lag over synsranda, de nærmeste først, og så himmelen. Høyden følger retningen du ser
  // i (støy rundt en sirkel, så den går rundt uten skjøt), åsene er høyest mot fjellet i nord, og tåka visker dem ut
  b.globalCompositeOperation = 'destination-over';
  // ser du ned fra en høyde, når ikke terrenget opp til synsranda: der ligger disen
  if (hy < y1) { b.fillStyle = FOG_HEX; b.fillRect(x0, Math.max(y0, Math.floor(hy)), x1 - x0, y1 - Math.max(y0, Math.floor(hy))); }
  b.globalAlpha = clamp(1.15 - mi * 1.5, 0, 1);
  for (const [col, base, amp, R, sd] of RIDGES) {
    b.fillStyle = col;
    for (let x = x0; x < x1; x++) {
      const an = o.yaw + Math.atan((x + 0.5 - cx) / f), e = base + amp * fbm(Math.cos(an) * R + 50, Math.sin(an) * R + 50, sd, 3) * (1 + 0.7 * Math.max(0, -Math.sin(an)));
      const top = Math.round(hy - e * f); if (top < hy) b.fillRect(x, top, 1, Math.ceil(hy) - top + 1);
    }
  }
  b.globalAlpha = 1;
  const g = b.createLinearGradient(0, hy - f * 0.5, 0, hy); g.addColorStop(0, SKY_HEX); g.addColorStop(1, FOG_HEX);
  b.fillStyle = g; b.fillRect(x0, y0, x1 - x0, y1 - y0);
  b.globalCompositeOperation = 'source-over';
  return { cx, cy, hy, f, eye, camZ, far, yaw: o.yaw, x: camX, y: camY };
}
// Hvor mye en stripe av et tre svaier: ingenting i den nederste halvdelen (stammen står fast), mest i toppen
const swayQ = (y, h) => Math.max(0, 1 - 2 * y / h);
// ---------- sikter, kikkert og børse ----------
// Tegnes i de samme bufferpikslene som skogen, så alt i bildet har samme pikselstørrelse. Kikkerten eller børsa glir
// opp fra underkanten når du legger an (AIM.open), og ned igjen når du slipper.
// Åpne sikter, hagle og bue: mørkere hjørner, og børsa med siktene (eller buen med siktepinnene) midt i bildet
function drawSights(bw, bh, ix, iy) {
  const hg = hagle();
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1;
  b.drawImage(hg || bue() ? vigMask(bw, bh, 0.78, 0.35) : vigMask(bw, bh, 0.7, 0.5), 0, 0);
  if (bue()) bowSights(ix, iy, bh); else gunSights(ix, iy, bh, hg);
}
// Siktepinnene på buen: avstand i meter og farge. Den øverste står midt i bildet (buen er skutt inn på BST.zero m), de andre
// under, der pila går på den avstanden. Compoundbuen har en pinne til
const PINS = [[20, '#8ee070'], [30, '#f0d040'], [40, '#ec5a40'], [50, '#e8ecf0']];
const pinsOf = () => PINS.slice(0, lv('bue') >= 3 ? 4 : 3);
const pinY = m => AIM.f * arrowDrop(m / M_PER_PX);
// Buen sett fra skytteren: armen med grepet i venstre hånd til venstre for midten og lemmene ut av bildet over og under,
// pila på pilhylla med spissen mot midten, og siktehuset med pinnene for hver avstand
function bowSights(ix, iy, bh) {
  const U = bh / 100, rx = Math.round(ix - 15 * U), top = iy - 26 * U, bot = iy + 34 * U, wood = bue() && lv('bue') >= 3 ? ['#2a2e2a', '#43483f', '#191c19'] : ['#6e4a2c', '#8c6038', '#3e2818'];
  // lemmene bøyer seg bakover mot skytteren, armen er tykkest ved grepet
  trap(-2, top, rx - 7 * U, rx - 5 * U, rx - 2 * U, rx + 2 * U, wood[0]); trap(-2, top, rx - 7 * U, rx - 6 * U, rx - 2 * U, rx - 1 * U, wood[1]);
  trap(bot, bh + 2, rx - 2 * U, rx + 2 * U, rx - 8 * U, rx - 5 * U, wood[0]); trap(bot, bh + 2, rx - 2 * U, rx - 1 * U, rx - 8 * U, rx - 7 * U, wood[1]);
  trap(top, bot, rx - 2 * U, rx + 2 * U, rx - 3 * U, rx + 3 * U, wood[0]); trap(top, bot, rx - 2 * U, rx - 1 * U, rx - 3 * U, rx - 2 * U, wood[1]); trap(top, bot, rx + 1 * U, rx + 2 * U, rx + 2 * U, rx + 3 * U, wood[2]);
  // siktehuset: en arm ut fra buen og en ring rundt pinnene
  const P0 = pinsOf(), ys = P0.map(([m]) => iy + Math.round(pinY(m))), ry0 = Math.min(...ys) - 4 * U, ry1 = Math.max(...ys) + 4 * U, hw = Math.round(5 * U);
  b.fillStyle = '#1a1816'; b.fillRect(Math.round(rx + 2 * U), Math.round((ry0 + ry1) / 2) - 1, Math.round(ix - hw - rx - 2 * U), 3);
  b.fillRect(ix - hw - 1, Math.round(ry0), 2, Math.round(ry1 - ry0)); b.fillRect(ix + hw, Math.round(ry0), 2, Math.round(ry1 - ry0));
  b.fillRect(ix - hw - 1, Math.round(ry0), hw * 2 + 3, 2); b.fillRect(ix - hw - 1, Math.round(ry1) - 2, hw * 2 + 3, 2);
  // pinnene: en tynn stang inn fra venstre og en lysende prikk der pila går
  P0.forEach(([m, col], k) => { const y = ys[k]; b.fillStyle = '#2c2a26'; b.fillRect(ix - hw + 1, y, hw - 1, 1); b.fillStyle = col; b.fillRect(ix - 1, y - 1, 3, 3); b.fillStyle = '#ffffff'; b.fillRect(ix, y - 1, 1, 1); });
  // pila: fra strengen nede ved kinnet og opp til pilhylla, med jaktspissen like forbi buen
  const ay = iy + 7 * U;
  if (inGun('bue') && !P.reload) {
    trap(ay, bh + 2, rx + 2 * U, rx + 3 * U, ix + 2 * U, ix + 5 * U, '#24221e'); trap(ay, bh + 2, rx + 2 * U, rx + 2.5 * U, ix + 2 * U, ix + 3 * U, '#4a463e');
    trap(ay - 2 * U, ay + 1, rx - 1 * U, rx + 1 * U, rx - 1 * U, rx + 3 * U, '#9aa0a4'); b.fillStyle = '#d8dde0'; b.fillRect(Math.round(rx), Math.round(ay - 2 * U), 1, Math.round(2 * U));
    trap(bh - 9 * U, bh + 2, ix + 1 * U, ix + 3 * U, ix + 6 * U, ix + 11 * U, '#c43a2c'); trap(bh - 9 * U, bh + 2, ix + 3 * U, ix + 4 * U, ix + 2 * U, ix + 3 * U, '#e8e2d0');
  }
  // venstre hånd rundt grepet, med ermet ned mot hjørnet
  trap(iy + 14 * U, bh + 2, rx - 4 * U, rx + 3 * U, rx - 22 * U, rx - 6 * U, '#3f502e'); trap(iy + 14 * U, bh + 2, rx - 3 * U, rx + 2 * U, rx - 20 * U, rx - 8 * U, '#586c3e');
  glove(rx, iy + 12 * U, 4 * U, 5 * U);
}
// Trådkorset i kikkerten: tykke stolper inn mot midten og tynne tråder (det beste siktet har merker og rød midtprikk,
// men ingen stolpe ovenfra). Står fast der kula går
function reticle(ix, iy, R, l) {
  const g0 = Math.round(R * 0.28), far = R * 2;
  b.setTransform(1, 0, 0, 1, 0, 0); b.fillStyle = '#0c0e0c';
  b.fillRect(ix - far, iy - 1, far - g0, 3); b.fillRect(ix + g0 + 1, iy - 1, far, 3); b.fillRect(ix - 1, iy + g0 + 1, 3, far);
  if (l < 3) b.fillRect(ix - 1, iy - far, 3, far - g0);
  b.fillRect(ix - g0, iy, g0 * 2 + 1, 1); b.fillRect(ix, iy - g0, 1, g0 * 2 + 1);
  if (l === 3) {
    for (let i = 1; i <= 4; i++) { const d = Math.round(i * g0 / 5); b.fillRect(ix + d, iy - 1, 1, 3); b.fillRect(ix - d, iy - 1, 1, 3); b.fillRect(ix - 1, iy + d, 3, 1); b.fillRect(ix - 1, iy - d, 3, 1); }
    b.fillStyle = '#e8402c'; b.fillRect(ix, iy, 1, 1);
  }
}
// Klipper det forstørrede bildet (utsnittet x0, y0, w, h av bufferen) ut som en rund linse der okularet står (AIM.ringX/Y),
// med mørkere kant rundt den optiske aksen (ix, iy). Står øyet skjevt, blir kanten en halvmåneformet skygge
function cutLens(x0, y0, w, h, ix, iy, R, om) {
  const c = AIM.lc || (AIM.lc = document.createElement('canvas'));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d'), d = disc(R), dx = AIM.ringX - R - x0, dy = AIM.ringY - R - y0, v = lensVig(R, Math.round(R * 0.2), om + 2), o = v.width >> 1;
  g.imageSmoothingEnabled = false;
  g.globalCompositeOperation = 'copy'; g.drawImage(buf, x0, y0, w, h, 0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(d, dx, dy);
  g.clearRect(0, 0, w, dy); g.clearRect(0, dy + d.height, w, h); g.clearRect(0, dy, dx, d.height); g.clearRect(dx + d.width, dy, w, d.height);
  g.globalCompositeOperation = 'source-atop'; g.drawImage(v, ix - o - x0, iy - o - y0);
  g.globalCompositeOperation = 'source-over';
  AIM.lensX = x0; AIM.lensY = y0; return c;
}
// Kikkerten sett med øyet inntil: okularet rundt linsa, toppen av tårnene bak det, låskassa og kolben under, og begge
// hendene i hansker med jakkeermene inn fra kantene. (wx, wy) er midt i linsa og R radien
function scopeBody(wx, wy, R, bh) {
  const U = bh / 100, th = Math.round(bh * 0.07), O = R + th, ys = bh - Math.round(9 * U);
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1;
  // venstre hånd på forskjeftet, delvis bak okularet, med ermet ned mot hjørnet til venstre
  trap(wy + O * 0.7, bh + 2, wx - O * 1.05, wx - O * 0.7, wx - O * 1.9, wx - O * 1.1, '#3f502e');
  trap(wy + O * 0.7, bh + 2, wx - O * 1.0, wx - O * 0.76, wx - O * 1.8, wx - O * 1.18, '#586c3e');
  glove(wx - O * 0.82, wy + O * 0.72, 5 * U, 4 * U);
  // låskasse og feste rett under kikkerten, knotten på sluttstykket til høyre, kolben nederst mot kinnet
  trap(wy + O - 6, bh + 2, wx - R * 0.42, wx + R * 0.42, wx - R * 0.9, wx + R * 0.9, '#1c1a18');
  trap(wy + O - 6, bh + 2, wx - R * 0.4, wx - R * 0.3, wx - R * 0.86, wx - R * 0.62, '#34302a');
  ell(wx + R * 0.98, wy + O + 4 * U, 2.4 * U, 2.2 * U, '#141210'); ell(wx + R * 0.95, wy + O + 3.6 * U, 1.6 * U, 1.4 * U, '#3a3630');
  trap(ys, bh + 2, wx - R * 0.75, wx + R * 0.75, wx - R * 1.15, wx + R * 1.15, '#6e4a2c');
  trap(ys, bh + 2, wx - R * 0.75, wx - R * 0.55, wx - R * 1.15, wx - R * 0.85, '#8c6038');
  trap(ys, ys + 1, wx - R * 0.75, wx + R * 0.75, wx - R * 0.75, wx + R * 0.75, '#3e2818');
  // høyre hånd på grepet nederst til høyre, ermet ut mot kanten
  trap(bh - 6 * U, bh + 2, wx + R * 0.95, wx + R * 1.6, wx + R * 1.3, wx + R * 2.4, '#3f502e');
  trap(bh - 6 * U, bh + 2, wx + R * 1.0, wx + R * 1.5, wx + R * 1.38, wx + R * 2.25, '#586c3e');
  glove(wx + R * 1.0, bh - 5 * U, 7 * U, 5 * U);
  // høyde- og sidetårnet stikker så vidt fram bak okularet
  knurl(wx - R * 0.26, wy - O - R * 0.14, Math.round(R * 0.52), Math.round(R * 0.14 + th * 0.6), true);
  knurl(wx + O - th * 0.6, wy - R * 0.24, Math.round(R * 0.14 + th * 0.6), Math.round(R * 0.48), false);
  b.drawImage(eyepiece(R, th), wx - O, wy - O);
}
// Hanske: håndbak med lys kant og knoker
function glove(x, y, rx, ry) {
  ell(x, y + 1, rx, ry, '#3a2c1e'); ell(x - 1, y, rx - 1, ry - 1, '#5a4632');
  b.fillStyle = '#76603f'; b.fillRect(Math.round(x - rx * 0.6), Math.round(y - ry * 0.6), Math.round(rx * 0.9), 1);
  b.fillStyle = '#3a2c1e'; for (let i = -1; i <= 1; i++) b.fillRect(Math.round(x + i * rx * 0.4), Math.round(y - ry * 0.1), 1, Math.round(ry * 0.8));
}
// Tårnhette med riller: loddrette på toppen, vannrette på siden
function knurl(x, y, w, h, vert) {
  x = Math.round(x); y = Math.round(y);
  b.fillStyle = '#070807'; b.fillRect(x - 1, y - 1, w + 2, h + 2);
  b.fillStyle = '#1e211e'; b.fillRect(x, y, w, h);
  b.fillStyle = '#121412';
  if (vert) for (let i = 1; i < w; i += 2) b.fillRect(x + i, y + 1, 1, h - 1); else for (let j = 1; j < h; j += 2) b.fillRect(x + 1, y + j, w - 1, 1);
  b.fillStyle = '#3e433e'; if (vert) b.fillRect(x, y, w, 1); else b.fillRect(x, y, 1, h);
}
// Åpne sikter og hagle: løpet går ned mot skjermkanten over forskjeftet, som ligger i venstre hånd. Rifla har bakre
// skjæring med hakk og to hvite prikker og korn med gul perle; hagla har ett eller to løp med skinne og hvit perle
function gunSights(ix, iy, bh, hg) {
  const U = bh / 100, bot = bh + iy - (bh >> 1), y0 = iy + (hg ? 2 : 4), yw = Math.round(iy + (bot - iy) * 0.42);
  trap(yw, bot, ix - 3 * U, ix + 3 * U, ix - 17 * U, ix + 17 * U, '#6e4a2c');
  trap(yw, bot, ix - 3 * U, ix - 2 * U, ix - 17 * U, ix - 12 * U, '#8c6038');
  trap(yw, bot, ix + 2 * U, ix + 3 * U, ix + 13 * U, ix + 17 * U, '#3e2818');
  if (hg && lv('hagle') === 2) {
    trap(y0, bot, ix - 3, ix, ix - 13 * U, ix, '#1a1816'); trap(y0, bot, ix + 1, ix + 4, ix + 1, ix + 13 * U + 1, '#1a1816');
    trap(y0, bot, ix - 2, ix - 1, ix - 11 * U, ix - 8 * U, '#33302c'); trap(y0, bot, ix + 2, ix + 3, ix + 3 * U, ix + 5 * U, '#33302c');
    trap(y0, bot, ix, ix + 1, ix - 1, ix + 2, '#3a352e');
  } else {
    trap(y0, bot, ix - 2, ix + 3, ix - 8 * U, ix + 8 * U + 1, hg ? '#1a1816' : '#1c1814');
    trap(y0, bot, ix - 1, ix, ix - 6 * U, ix - 4 * U, hg ? '#33302c' : '#3a3026');
    trap(y0, bot, ix, ix + 1, ix - 1, ix + 2, hg ? '#3a352e' : '#2a241e');
  }
  hand(ix - 11 * U, bot - 16 * U, U);
  if (hg) { b.fillStyle = '#f2ead0'; b.fillRect(ix - 1, iy, 3, 2); b.fillStyle = '#ffffff'; b.fillRect(ix - 1, iy, 1, 1); return; }
  // korn med perle: toppen av perla er der kula går
  b.fillStyle = '#0e0c0a'; b.fillRect(ix - 1, iy + 2, 3, 6);
  b.fillStyle = '#e8b030'; b.fillRect(ix - 1, iy, 3, 2); b.fillStyle = '#ffd860'; b.fillRect(ix - 1, iy, 1, 1);
  // bakre skjæring: plate med hakk midt på, kornet står i hakket
  const hw = Math.round(9 * U), top = iy + 2, ph = Math.max(5, Math.round(2.2 * U)), nw = 4, nd = 4;
  b.fillStyle = '#16120e'; b.fillRect(ix - hw, top, hw - nw, ph); b.fillRect(ix + nw + 1, top, hw - nw, ph); b.fillRect(ix - nw, top + nd, nw * 2 + 1, ph - nd);
  b.fillStyle = '#3a3026'; b.fillRect(ix - hw, top, hw - nw, 1); b.fillRect(ix + nw + 1, top, hw - nw, 1);
  b.fillStyle = '#e8e0c8'; b.fillRect(ix - nw - 3, top + 2, 2, 2); b.fillRect(ix + nw + 2, top + 2, 2, 2);
}
// Venstre hånd i hanske rundt forskjeftet: håndflaten under til venstre, fire fingre lagt over treverket,
// og jakkeermet ned mot hjørnet. (x, y) er midt på hånden
function hand(x, y, U) {
  trap(y + 2 * U, y + 34 * U, x - 4 * U, x + 3 * U, x - 20 * U, x - 6 * U, '#3f502e');
  trap(y + 2 * U, y + 34 * U, x - 3 * U, x + 2 * U, x - 18 * U, x - 8 * U, '#586c3e');
  ell(x - 2 * U, y + 0.5 * U, 4 * U, 4 * U, '#3a2c1e'); ell(x - 2.4 * U, y, 3.4 * U, 3.4 * U, '#5a4632');
  for (let i = 0; i < 4; i++) {
    const fy = Math.round(y - 3.2 * U + i * 1.7 * U), fh = Math.max(2, Math.round(1.4 * U)), fx = Math.round(x - U), fw = Math.round((i === 0 || i === 3 ? 4.5 : 6) * U);
    b.fillStyle = '#3a2c1e'; b.fillRect(fx, fy, fw + 1, fh + 1);
    b.fillStyle = '#5a4632'; b.fillRect(fx, fy, fw, fh);
    b.fillStyle = '#76603f'; b.fillRect(fx, fy, fw - 1, 1);
  }
}
// Fyll rad for rad mellom to kanter som går rett fra (xa0, xb0) på rad y0 til (xa1, xb1) på siste rad før y1
function trap(y0, y1, xa0, xb0, xa1, xb1, col) {
  b.fillStyle = col; y0 = Math.round(y0); y1 = Math.round(y1);
  for (let y = Math.max(0, y0); y < y1; y++) { const t = (y - y0) / Math.max(1, y1 - 1 - y0), xa = Math.round(lerp(xa0, xa1, t)), xb = Math.round(lerp(xb0, xb1, t)); if (xb > xa) b.fillRect(xa, y, xb - xa, 1); }
}
function ell(cx, cy, rx, ry, col) {
  b.fillStyle = col;
  for (let y = Math.ceil(cy - ry); y <= cy + ry; y++) { const t = (y + 0.5 - cy) / ry, hw = rx * Math.sqrt(Math.max(0, 1 - t * t)), xa = Math.round(cx - hw), xb = Math.round(cx + hw); if (xb > xa) b.fillRect(xa, y, xb - xa, 1); }
}
// Okularet: gummiring med riller ytterst, metallring innenfor og en mørk kant inn mot linsa, lys fra oppe til venstre.
// Hullet i midten er linsa; midten av ruta er midt i piksel O
function eyepiece(R, th) {
  const key = 'e' + R + '|' + th, c = AIM.masks.get(key); if (c) return c;
  const O = R + th, n = O * 2 + 1, p = new Pix(n, n), met = T('#121412', '#1e211e', '#2c302c', '#3e433e'), rub = T('#0c0d0c', '#161816', '#222522');
  const lip = C('#050605'), edge = C('#070807'), mid = R + Math.round(th * 0.4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x - O, dy = y - O, d = Math.sqrt(dx * dx + dy * dy); if (d < R || d >= O + 0.5) continue;
    const l = -(dx * 0.6 + dy * 0.8) / Math.max(1, d);
    p.d[y * n + x] = d < R + 2 ? lip : d >= O - 0.5 ? edge : d < mid ? tone(met, 0.45 + 0.4 * l, x, y) : d < mid + 1 ? (l > 0 ? met[3] : met[0])
      : tone(rub, 0.5 + 0.35 * l - ((Math.atan2(dy, dx) * O / 2.5 | 0) & 1) * 0.3, x, y);
  }
  return cacheMask(key, p.canvas());
}
// Rund maske for linsa: hel inne i radius R, midt i piksel R
function disc(R) {
  const key = 'd' + R, c = AIM.masks.get(key); if (c) return c;
  const n = R * 2 + 1, p = new Pix(n, n), w = C('#ffffff');
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x - R) * (x - R) + (y - R) * (y - R) < R * R) p.d[y * n + x] = w;
  return cacheMask(key, p.canvas());
}
// Mørk kant i linsa med ordnet dithering, svart utenfor R; ruta strekker seg ext forbi kanten, så den dekker linsa
// også når øyet står skjevt
function lensVig(R, vw, ext) {
  const key = 'l' + R + '|' + vw + '|' + ext, c = AIM.masks.get(key); if (c) return c;
  const Hh = R + ext, n = Hh * 2 + 1, p = new Pix(n, n), black = C(MASK);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const d = Math.sqrt((x - Hh) * (x - Hh) + (y - Hh) * (y - Hh)); if (d >= R || smooth(R - vw, R, d) > dith(x, y)) p.d[y * n + x] = black; }
  return cacheMask(key, p.canvas());
}
// Mørkere hjørner med dithering rundt åpne sikter og hagle
function vigMask(w, h, inner, dmax) {
  const key = 'v' + w + 'x' + h + '|' + inner + '|' + dmax;
  const c = AIM.masks.get(key); if (c) return c;
  const p = new Pix(w, h), cx = w / 2, cy = h / 2, rr = Math.sqrt(cx * cx + cy * cy), black = C(MASK);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (smooth(inner, 1, Math.sqrt(dx * dx + dy * dy) / rr) * dmax > dith(x, y)) p.d[y * w + x] = black; }
  return cacheMask(key, p.canvas());
}
function cacheMask(key, c) { const ca = AIM.masks; if (ca.size > 8) ca.delete(ca.keys().next().value); ca.set(key, c); return c; }

// ---------- overgang mellom kart og 3D ----------
// Det forrige bildet ligger over det nye og løses opp i rutemønster, med ruter like store som pikslene i spillet
function snapStart() {
  const c = AIM.snap || (AIM.snap = document.createElement('canvas'));
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  c.getContext('2d').drawImage(cv, 0, 0); AIM.snapT = DISS_T;
}
function snapDraw(dt) {
  if (AIM.snapT <= 0) return;
  const v = AIM.snapT / DISS_T, t = AIM.snapTmp || (AIM.snapTmp = document.createElement('canvas'));
  AIM.snapT -= dt;
  if (t.width !== W || t.height !== H) { t.width = W; t.height = H; }
  const g = t.getContext('2d');
  g.globalCompositeOperation = 'copy'; g.drawImage(AIM.snap, 0, 0);
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = spat(g, v > 0.66 ? 3 : v > 0.33 ? 2 : 1); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(t, 0, 0);
}
// Rutemønster med én, to eller tre av fire ruter fylt; hver rute er ZB skjermpiksler
function spat(g, k) {
  const key = k + '|' + ZB; if (AIM.pat[key]) return AIM.pat[key];
  const c = document.createElement('canvas'); c.width = c.height = 2 * ZB;
  const cg = c.getContext('2d'); cg.fillStyle = '#fff'; cg.fillRect(0, 0, ZB, ZB); if (k > 1) cg.fillRect(ZB, ZB, ZB, ZB); if (k > 2) cg.fillRect(ZB, 0, ZB, ZB);
  return AIM.pat[key] = g.createPattern(c, 'repeat');
}
// Pusten som en tynn strek nederst i bildet, bare mens du holder den eller henter deg inn
function breathBar(bw, bh) {
  if (P.breath >= 1 && !P.hold) return;
  const w = Math.round(bw * 0.12), x = (bw - w) >> 1, y = bh - 7;
  b.fillStyle = MASK; b.fillRect(x - 1, y - 1, w + 2, 4);
  b.fillStyle = '#26302a'; b.fillRect(x, y, w, 2);
  b.fillStyle = P.breath < 0.25 || P.winded ? '#d07a3c' : '#7f9c55'; b.fillRect(x, y, Math.round(w * P.breath), 2);
}
// Avstandsmåleren i kikkerten (nivå 2–3) lyser øverst i synsfeltet
function aimHud() {
  if (bue()) {
    if (AIM.open < 0.8) return;
    // samme rad som pinnen i bowSights, også mens buen kommer opp
    const bh = Math.ceil(H / ZB), ix = Math.ceil(W / ZB) >> 1, iy = (bh >> 1) + Math.round((1 - smooth(0, 1, AIM.open)) * bh * 0.55), U = bh / 100;
    for (const [m, col] of pinsOf()) pxText(m + ' m', (ix + 7 * U) * ZB, (iy + Math.round(pinY(m)) + 0.5) * ZB, Math.round(13 * DPR), col, 'left');
    return;
  }
  const l = lv('scope');
  if (G.gun !== 'rifle' || l < 2 || AIM.open < 0.8) return;
  const a = AIM.pick && AIM.pick.it.a;
  let line = AIM.range == null ? '– m' : Math.round(AIM.range * M_PER_PX) + ' m';
  if (l === 3 && a) line = SPEC[a.sp].name + ', ' + SPEC[a.sp].sexn[a.sex] + ' · ca. ' + fmtKg(a.kg >= 20 ? Math.round(a.kg / 5) * 5 : a.kg >= 3 ? Math.round(a.kg) : a.kg) + ' · ' + line;
  pxText(line, (AIM.ringX + 0.5) * ZB, (AIM.ringY - AIM.ringR) * ZB + 34 * DPR, Math.round(15 * DPR), '#f0b450');
}
// Første faste ting under et punkt i bufferen, nærmest først: { it, lx, ly } med pikselen i spriten
function aimPick(px, py) {
  const L = AIM.list;
  for (let i = L.length - 1; i >= 0; i--) { const h = pickAt(L[i], px, py); if (h) return h; }
  return null;
}
// Treffer punktet (px, py) i bufferen noe fast i det tegnede it? Gir { it, lx, ly } eller null
function pickAt(it, px, py) {
  if (!it.solid || it.clipY != null && py >= it.clipY) return null;
  const s = it.s, ly = Math.floor((py - it.Y) * s.h / it.H);
  if (ly < 0 || ly >= s.h) return null;
  let u = px - it.X;
  if (it.sw) { const q = swayQ(ly - ly % 6, s.h); u -= Math.round(it.sw * q * q * it.k); }
  let lx = Math.floor(u * s.w / it.W);
  if (lx < 0 || lx >= s.w) return null;
  if (it.flip) lx = s.w - 1 - lx;
  return s.pix.get(lx, ly) ? { it, lx, ly } : null;
}
// Punktet i verden der strålen gjennom (px, py) når dybden z: [x, y, høyde over bakken]
function aimPoint(px, py, z) {
  const st = z / AIM.f, vx = Math.cos(AIM.camYaw), vy = Math.sin(AIM.camYaw), lat = (px - AIM.cx) * st;
  const x = P.x + vx * z - vy * lat, y = P.y + vy * z + vx * lat;
  return [x, y, AIM.camZ - (py - AIM.hy) * st - heightAt(x, y)];
}
// Dybden til bakken i bufferpunktet (px, py) i bildet kula følger; uendelig mot himmelen og utenfor bildet
function groundZ(px, py) {
  const w = AIM.im.width, x = Math.floor(px), y = Math.floor(py);
  if (x < 0 || y < 0 || x >= w || y >= AIM.im.height) return Infinity;
  const z = AIM.zb[y * w + x]; return z < 1e8 ? z : Infinity;
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
  } else {
    const z = groundZ(px, py);
    if (z < FAR * 1.5) { const [x, y] = aimPoint(px, py, z); burst(x, y, 0, isWater(x, y) ? '#a4ccc6' : '#8a7a5c', 5, 14); }
  }
  return r;
}
// Pil i 3D: pila går ut langs siktelinja med litt spredning og faller på veien (arrowDrop). Den treffer det første faste den
// møter i buen den går i, eller bakken der den lander. Et lyst spor viser banen et øyeblikk
function aimArrow() {
  const Lv = lv('bue'), sd = BST.spread[Lv] / 100, px = AIM.sx + gauss() * sd * AIM.f, py0 = AIM.sy - gauss() * sd * 0.8 * AIM.f;
  const at = z => py0 + AIM.f * arrowDrop(z, Lv), over = z => aimPoint(px, at(z), z)[2];
  // dybden der pila når bakken
  let zg = Infinity;
  for (let z = NEAR; z < FAR * 1.5; z += 2) if (over(z) <= 0) { zg = z; break; }
  let pk = null;
  for (let i = AIM.list.length - 1; i >= 0 && !pk; i--) { const it = AIM.list[i]; if (it.solid && it.z < zg) pk = pickAt(it, px, at(it.z)); }
  const end = pk ? pk.it.z : Math.min(zg, FAR * 1.5), r = { ang: AIM.camYaw + Math.atan((px - AIM.cx) / AIM.f), a: null, zone: null, block: null };
  AIM.kick = 0.4;
  for (let z = NEAR + 6; z < end; z += Math.max(3, z / 30)) { const [x, y, h] = aimPoint(px, at(z), z); G.parts.push({ x, y, z: h, vx: 0, vy: 0, vz: 0, life: 0.18 + z / 900, col: '#ece6d2' }); }
  if (pk && pk.it.a) {
    const a = pk.it.a, [x, y, h] = aimPoint(px, at(pk.it.z), pk.it.z);
    Object.assign(r, { a, zone: hitZone(a, pk.it.s, pk.lx, pk.ly), d: hyp(a.x - P.x, a.y - P.y), hx: x, hy: y - h });
    burst(x, y, h, '#a8302a', 3, 6);
  } else if (pk) {
    const k = pk.it.o.k, [x, y, h] = aimPoint(px, at(pk.it.z), pk.it.z);
    r.block = k; burst(x, y, h, CHIP[k] || '#c8a474', 4, 10);
    msg('Pila traff ' + (HITN[k] || 'et tre') + '.', 'warn');
  } else if (zg < FAR * 1.5) { const [x, y] = aimPoint(px, at(zg), zg); burst(x, y, 0, isWater(x, y) ? '#a4ccc6' : '#8a7a5c', 3, 8); }
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
    else if (puffs++ < 8) {
      const z = groundZ(px, py);
      if (z < FAR) { const [x, y] = aimPoint(px, py, z); burst(x, y, 0, isWater(x, y) ? '#a4ccc6' : '#8a7a5c', 2, 10); }
    }
  }
  return { ang: AIM.camYaw + Math.atan((AIM.sx - AIM.cx) / AIM.f), hits: [...by.values()].filter(e => e.dmg > 0) };
}
