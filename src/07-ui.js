// ===== Grensesnitt: HUD, bua, jaktbok, tittel og input =====
const HUD = { dirtyMsg: true, t: 0, last: {} };
const fmtKr = n => n.toLocaleString('nb-NO').replace(/ /g, ' ') + ' kr';
const dataURL = c => c.toDataURL();
let ICONURL = {};
function cropSprite(s, pad) {
  const bb = s.pix.bbox(), c = document.createElement('canvas'); pad = pad || 1;
  c.width = bb[2] + pad * 2; c.height = bb[3] + pad * 2; c.getContext('2d').drawImage(s.c, -bb[0] + pad, -bb[1] + pad); return c;
}
function setText(id, t) { if (HUD.last[id] !== t) { HUD.last[id] = t; $(id).textContent = t; } }
function windName() {
  const fx = -G.wind.x, fy = -G.wind.y, deg = (Math.atan2(fx, -fy) * 180 / Math.PI + 360) % 360;
  const dir = ['nord', 'nordøst', 'øst', 'sørøst', 'sør', 'sørvest', 'vest', 'nordvest'][Math.round(deg / 45) % 8];
  const s = G.wind.s, str = s < 0.25 ? 'Flau vind' : s < 0.5 ? 'Svak vind' : s < 0.75 ? 'Lett bris' : 'Laber bris';
  return [str, 'fra ' + dir];
}
function hudUpdate(dt) {
  HUD.t -= dt; if (HUD.t > 0 && !HUD.dirtyMsg) return; HUD.t = 0.1;
  setText('kr', fmtKr(G.money));
  const hh = Math.floor(G.hour), mm = Math.floor((G.hour - hh) * 60 / 10) * 10;
  setText('clock', 'Dag ' + G.day + ' · ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'));
  const [ws, wd] = windName(); setText('windS', ws); setText('windD', wd);
  const others = [...NET.peers.values()].filter(r => r.started).map(r => r.name);
  $('who').hidden = !others.length; if (others.length) setText('who', 'Sammen med ' + others.join(', '));
  $('windArrow').style.transform = 'rotate(' + (G.wind.a + Math.PI / 2) + 'rad)';
  // ammo
  const cap = ST.cap[lv('mag')], key = cap + ':' + P.ammo + ':' + (P.reload > 0);
  if (HUD.last.ammo !== key) {
    HUD.last.ammo = key; const el = $('ammo'); el.innerHTML = '';
    for (let i = 0; i < cap; i++) { const s = document.createElement('span'); s.className = 'rnd' + (i < P.ammo && !P.reload ? ' on' : ''); el.appendChild(s); }
  }
  setText('ammoTxt', P.reload > 0 ? 'Lader …' : P.ammo ? ST.cap[lv('mag')] > 1 ? P.ammo + ' i magasinet' : 'Patron i kammeret' : 'Tomt · R');
  setText('callName', UPG[7].lv[lv('call')]);
  $('callCd').style.height = (P.callCd / 9 * 100) + '%';
  setText('scentN', '× ' + G.scents);
  $('breath').hidden = !P.aim; $('breathFill').style.width = (P.breath * 100) + '%';
  $('breathFill').classList.toggle('low', P.breath < 0.25);
  // handlingsprompt
  let pr = '';
  if (G.started && !G.paused && !P.aim) {
    const a = nearestDead();
    if (a) pr = 'Ta vare på ' + SPEC[a.sp].name.toLowerCase() + ' (' + SPEC[a.sp].sexn[a.sex] + ')';
    else { const c = nearestCabin(P.x, P.y); if (hyp(P.x - (c.x - 13), P.y - (c.y + 6)) < 26) pr = 'Gå inn i bua'; }
  }
  $('prompt').hidden = !pr; if (pr) setText('promptTxt', pr);
  if (G.panel === 'pause') $('pauseNote').hidden = !mp();
  if (HUD.dirtyMsg) {
    HUD.dirtyMsg = false; const el = $('log'); el.innerHTML = '';
    for (const mm_ of G.msgs) { const d = document.createElement('div'); d.className = 'msg ' + mm_.kind; d.textContent = mm_.text; el.appendChild(d); }
  }
  const kids = $('log').children;
  for (let i = 0; i < kids.length; i++) { const t = G.msgs[i] ? G.msgs[i].t : 9; kids[i].style.opacity = clamp(1 - (t - 5) / 2, 0, 1); }
}

// ---------- bua ----------
let shopCat = 'rifle';
function statRows() {
  const L = id => lv(id);
  return [
    ['Skade', ST.dmg[L('caliber')] / 145, UPG[2].lv[L('caliber')]],
    ['Presisjon', 1 - (ST.spread[L('barrel')] - 0.2) / 1.0, Math.round(ST.range[L('barrel')] * M_PER_PX) + ' m hold'],
    ['Ro i siktet', 1 - (ST.sway[L('stock')] - 0.7) / 2.8, UPG[3].lv[L('stock')]],
    ['Forstørrelse', (ST.mag[L('scope')] - 1) / 3, UPG[0].lv[L('scope')]],
    ['Repetering', 1 - (ST.cycle[L('bolt')] - 0.35) / 1.25, ST.cycle[L('bolt')].toFixed(2).replace('.', ',') + ' s'],
    ['Demping', 1 - (ST.noise[L('supp')] - 200) / 800, Math.round(ST.noise[L('supp')] * M_PER_PX) + ' m smell'],
  ];
}
function renderShop() {
  setText('shopKr', fmtKr(G.money));
  document.querySelectorAll('#shopTabs button').forEach(bt => bt.setAttribute('aria-selected', bt.dataset.cat === shopCat));
  const list = $('shopList'); list.innerHTML = '';
  for (const u of UPG.filter(u => u.cat === shopCat)) {
    const L = lv(u.id), max = L >= u.lv.length - 1, next = max ? null : L + 1, price = max ? 0 : u.price[next];
    const row = document.createElement('div'); row.className = 'item';
    row.innerHTML = `<img class="ico" alt="" src="${ICONURL[u.icon]}"><div class="it-body"><div class="it-head"><span class="it-name">${u.name}</span><span class="pips">${u.lv.map((_, i) => `<i class="${i <= L ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="it-now">${u.lv[L]}</div><div class="it-next">${max ? 'Fullt oppgradert.' : '<b>Neste:</b> ' + u.lv[next] + '. ' + u.d[next]}</div></div>`;
    const bt = document.createElement('button'); bt.className = 'buy'; bt.id = 'buy-' + u.id;
    bt.textContent = max ? 'Ferdig' : fmtKr(price); bt.disabled = max || G.money < price;
    bt.onclick = () => buy(u); row.appendChild(bt); list.appendChild(row);
  }
  if (shopCat === 'lure') {
    const row = document.createElement('div'); row.className = 'item';
    row.innerHTML = `<img class="ico" alt="" src="${ICONURL.flask}"><div class="it-body"><div class="it-head"><span class="it-name">Påfyll av luktstoff</span></div><div class="it-now">Du har ${G.scents} flasker.</div><div class="it-next">Tre flasker med ${UPG[8].lv[lv('scentLv')].toLowerCase()}.</div></div>`;
    const bt = document.createElement('button'); bt.className = 'buy'; bt.id = 'buy-flask'; bt.textContent = fmtKr(FLASK_PRICE); bt.disabled = G.money < FLASK_PRICE;
    bt.onclick = () => { if (G.money < FLASK_PRICE) return sfx.deny(); G.money -= FLASK_PRICE; G.scents += 3; sfx.buy(); save(); renderShop(); };
    row.appendChild(bt); list.appendChild(row);
  }
  const st = $('stats'); st.innerHTML = '';
  for (const [n, v, t] of statRows()) {
    const r = document.createElement('div'); r.className = 'stat';
    r.innerHTML = `<div class="st-top"><span>${n}</span><span class="st-v">${t}</span></div><div class="meter"><i style="width:${Math.round(clamp(v, 0.04, 1) * 100)}%"></i></div>`;
    st.appendChild(r);
  }
  setText('magTxt', ST.cap[lv('mag')] === 1 ? 'Enkeltskudd' : ST.cap[lv('mag')] + ' patroner i magasinet');
  setText('callTxt', CALLSP[lv('call')].map(s => SPEC[s].name.toLowerCase()).join(', '));
}
function buy(u) {
  const L = lv(u.id); if (L >= u.lv.length - 1) return;
  const p = u.price[L + 1]; if (G.money < p) { sfx.deny(); return; }
  G.money -= p; G.up[u.id] = L + 1; sfx.buy();
  if (u.id === 'mag') P.ammo = ST.cap[lv('mag')];
  save(); renderShop();
}
function openShop() {
  G.paused = true; G.panel = 'shop'; P.aim = false; try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  P.ammo = ST.cap[lv('mag')]; P.reload = 0;
  $('sleepBtn').hidden = mp();
  renderShop(); $('shop').hidden = false; sfx.ui();
}
function openBook() {
  G.paused = true; G.panel = 'book'; P.aim = false; try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  const sum = $('bookSpecies'); sum.innerHTML = '';
  for (const sp of SPECIES) {
    const k = G.journal.filter(j => j.sp === sp), best = k.reduce((a, j) => Math.max(a, j.kg), 0);
    const d = document.createElement('div'); d.className = 'sp' + (k.length ? '' : ' none');
    d.innerHTML = `<img alt="" src="${ICONURL['an_' + sp]}"><div class="sp-n">${SPEC[sp].name}</div><div class="sp-c">${k.length ? k.length + ' felt · størst ' + best + ' kg' : 'Ikke felt ennå'}</div>`;
    sum.appendChild(d);
  }
  const L = $('bookList'); L.innerHTML = '';
  if (!G.journal.length) L.innerHTML = '<p class="empty">Jaktboka er tom. Første dyr du tar vare på blir skrevet inn her.</p>';
  for (const j of G.journal.slice(0, 60)) {
    const r = document.createElement('div'); r.className = 'entry';
    r.innerHTML = `<span class="e-d">Dag ${j.day}</span><span class="e-n">${SPEC[j.sp].name}, ${SPEC[j.sp].sexn[j.sex]}</span><span class="e-k">${j.kg} kg</span><span class="e-z">${ZONES[j.zone][0]} · ${j.m} m</span><span class="e-kr">${fmtKr(j.kr)}</span>`;
    L.appendChild(r);
  }
  const tot = G.journal.reduce((a, j) => a + j.kr, 0);
  setText('bookTot', G.journal.length + ' dyr · ' + fmtKr(tot) + ' totalt');
  $('book').hidden = false; sfx.ui();
}
// Alene fryser verden; med andre på nettet står jegeren stille mens tida går videre
function openPause() {
  if (!G.started || G.panel) return;
  G.paused = true; G.panel = 'pause'; G.pauseT = performance.now(); P.aim = false; P.hold = false;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  save(); $('pauseNote').hidden = !mp(); $('pause').hidden = false; sfx.ui();
}
function resume() { closePanel(); lockPointer(); }
function closePanel() { if (!G.panel) return; $(G.panel).hidden = true; G.panel = null; G.paused = false; sfx.ui(); }

// ---------- start ----------
function startGame(fresh) {
  if (fresh) { G.money = 0; for (const u of UPG) G.up[u.id] = 0; G.scents = 2; G.journal = []; if (!mp()) { G.day = 1; G.hour = 6.6; G.animals = []; } save(); }
  netSetName(); auInit(); G.started = true; G.paused = false; $('title').hidden = true; netAway();
  P.ammo = ST.cap[lv('mag')];
  const [s, d] = windName();
  msg('Vinden kommer ' + d + '. Gå mot vinden, så kjenner ikke dyrene lukta di.');
  msg('Høyreklikk for å sikte, venstreklikk for å skyte. Q lokker, E setter ut luktstoff.');
  lockPointer();
}
function lockPointer() { try { const r = cv.requestPointerLock && cv.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }

// ---------- input ----------
function bindInput() {
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') { if (e.code === 'Enter' && !G.started) startGame(false); return; }
    if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    // Esc/P: pause og fortsett (Esc lukker også bua og jaktboka). Håndteres før KEYS fordi
    // nettleseren kan svelge keyup for Esc når den slipper musepekeren.
    if (G.started && !e.repeat && (e.code === 'Escape' || e.code === 'KeyP')) {
      if (G.panel === 'pause') { if (performance.now() - G.pauseT > 300) resume(); }
      else if (G.panel) { if (e.code === 'Escape') closePanel(); }
      else openPause();
      return;
    }
    if (KEYS[e.code]) return; KEYS[e.code] = true;
    if (!G.started) { if (e.code === 'Enter') startGame(false); return; }
    if (G.panel === 'book' && (e.code === 'KeyJ' || e.code === 'Tab')) { closePanel(); return; }
    if (G.panel) return;
    switch (e.code) {
      case 'KeyR': startReload(); break;
      case 'KeyQ': doCall(); break;
      case 'KeyE': placeScent(); break;
      case 'KeyF': interact(); break;
      case 'KeyJ': case 'Tab': openBook(); break;
      case 'KeyM': auMute(!AU.muted); $('muteBtn').setAttribute('aria-pressed', AU.muted); msg(AU.muted ? 'Lyden er av.' : 'Lyden er på.'); break;
      case 'Space': if (P.aim) P.hold = true; break;
    }
  });
  addEventListener('keyup', e => { KEYS[e.code] = false; if (e.code === 'Space') P.hold = false; });
  addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; P.aim = false; P.hold = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('mousedown', e => {
    e.preventDefault(); auInit();
    if (!G.started || G.paused) return;
    if (!MOUSE.locked) lockPointer();
    if (e.button === 2) {
      P.aim = true; P.sway = [0, 0];
      let ax = MOUSE.wx, ay = MOUSE.wy; const d = hyp(ax - P.x, ay - P.y), mx = ST.range[lv('barrel')] * 1.4;
      if (d > mx) { ax = P.x + (ax - P.x) / d * mx; ay = P.y + (ay - P.y) / d * mx; }
      P.ax = ax; P.ay = ay;
    } else if (e.button === 0) shoot();
  });
  addEventListener('mouseup', e => { if (e.button === 2) { P.aim = false; P.hold = false; } });
  addEventListener('mousemove', e => {
    if (MOUSE.locked) { MOUSE.x = clamp(MOUSE.x + e.movementX * DPR, 0, W); MOUSE.y = clamp(MOUSE.y + e.movementY * DPR, 0, H); }
    else { MOUSE.x = e.clientX * DPR; MOUSE.y = e.clientY * DPR; }
    if (P.aim) {
      P.ax += e.movementX * DPR / CAM.S * 0.9; P.ay += e.movementY * DPR / CAM.S * 0.9;
      const d = hyp(P.ax - P.x, P.ay - P.y), mx = ST.range[lv('barrel')] * 1.6;
      if (d > mx) { P.ax = P.x + (P.ax - P.x) / d * mx; P.ay = P.y + (P.ay - P.y) / d * mx; }
    }
  });
  document.addEventListener('pointerlockchange', () => {
    MOUSE.locked = document.pointerLockElement === cv; document.body.classList.toggle('locked', MOUSE.locked);
    if (!MOUSE.locked && G.started && !G.panel) openPause();
  });
  // lagre når siden lukkes eller skjules
  addEventListener('pagehide', () => { if (G.started) save(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.started) save(); });
  addEventListener('resize', resize);
  document.querySelectorAll('#shopTabs button').forEach(bt => bt.onclick = () => { shopCat = bt.dataset.cat; sfx.ui(); renderShop(); });
  document.querySelectorAll('[data-close]').forEach(bt => bt.onclick = closePanel);
  $('sleepBtn').onclick = () => { if (mp()) return; if (G.hour > 5.5) G.day++; G.hour = 5.5; G.animals = []; G.scentObjs = []; msg('Du sov godt. Det lysner over skogen.'); save(); closePanel(); };
  $('startBtn').onclick = () => startGame(false);
  $('pauseBtn').onclick = () => openPause();
  $('resumeBtn').onclick = resume;
  $('quitBtn').onclick = () => { save(); location.reload(); };
  $('newBtn').onclick = () => { const bt = $('newBtn'); if (bt.dataset.arm) startGame(true); else { bt.dataset.arm = 1; bt.textContent = 'Sikker? Trykk igjen'; } };
  $('muteBtn').onclick = () => { auInit(); auMute(!AU.muted); $('muteBtn').setAttribute('aria-pressed', AU.muted); };
  $('bookBtn').onclick = () => { if (G.started && !G.panel) openBook(); };
}

// ---------- oppstart ----------
function boot() {
  cv = $('cv'); m = cv.getContext('2d');
  buf = document.createElement('canvas'); b = buf.getContext('2d');
  shL = document.createElement('canvas'); sh = shL.getContext('2d');
  genAll();
  for (const k in ICON) ICONURL[k] = dataURL(ICON[k]);
  for (const sp of SPECIES) ICONURL['an_' + sp] = dataURL(cropSprite(ANI[sp].m.stand[0], 2));
  $('windArrow').src = dataURL(FX.arrow); $('callIco').src = ICONURL.call; $('scentIco').src = ICONURL.scent;
  const has = load();
  P.x = -13; P.y = 6; CAM.x = P.x; CAM.y = P.y - 30;
  if (has) {
    $('startBtn').textContent = 'Fortsett jakt'; $('newBtn').hidden = false;
    setText('saveTxt', 'Lagret jakt: dag ' + G.day + ' · ' + fmtKr(G.money) + ' · ' + G.journal.length + ' dyr felt'); $('saveTxt').hidden = false;
  }
  resize(); bindInput(); netInit();
  // noen dyr i nærheten av bua fra start
  for (let i = 0; i < 3; i++) { const a = rnd(0, TAU), d = rnd(260, 420); const x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d; if (!isWater(x, y)) spawnAnimal(i === 0 ? 'radyr' : pickSpecies(x, y), x, y); }
  $('loading').hidden = true; $('titleBtns').hidden = false;
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); render(dt); hudUpdate(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
setTimeout(boot, 30);
