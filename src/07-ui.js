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
  setText('xp', 'Nivå ' + xpLevel() + ' · ' + G.xp + ' / ' + xpNext() + ' XP'); setText('story', STORY[G.story] ? 'Oppdrag: ' + storyGoal() : 'Historien er fullført');
  const hh = Math.floor(G.hour), mm = Math.floor((G.hour - hh) * 60 / 10) * 10;
  setText('clock', 'Dag ' + G.day + ' · ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'));
  const [ws, wd] = windName(); setText('windS', ws); setText('windD', wd);
  const others = [...NET.peers.values()].filter(r => r.started).map(r => r.name);
  $('who').hidden = !others.length; if (others.length) setText('who', 'Sammen med ' + others.join(', '));
  $('windArrow').style.transform = 'rotate(' + (G.wind.a + Math.PI / 2) + 'rad)';
  // våpen og ammo
  const hg = hagle(), bw = bue(), cap = gunCap(), n = inGun(), key = G.gun + ':' + cap + ':' + n + ':' + (P.reload > 0);
  if (HUD.last.ammo !== key) {
    HUD.last.ammo = key; const el = $('ammo'); el.innerHTML = '';
    for (let i = 0; i < cap; i++) { const s = document.createElement('span'); s.className = 'rnd' + (hg ? ' sh' : bw ? ' ar' : '') + (i < n && !P.reload ? ' on' : ''); el.appendChild(s); }
  }
  setText('gunName', G.gun ? { rifle: 'Rifle', hagle: 'Hagle', bue: 'Bue' }[G.gun] : 'Ingen våpen');
  // det som sitter i våpenet, og hvor mange du har igjen i sekken
  const left = G[ammoKey()];
  setText('ammoTxt', !G.gun ? 'Dra et våpen opp i inventaret (E)' : P.reload > 0 ? (bw ? 'Legger på en pil …' : 'Lader …') : !n ? (left ? 'Tomt · R · ' + left + ' i sekken' : 'Tomt · kjøp i landsbyen')
    : (bw ? 'Pil på strengen' : cap === 1 ? 'Patron i kammeret' : n + (hg ? ' i hagla' : ' i magasinet')) + ' · ' + left + ' i sekken');
  setText('callName', UPG[7].lv[lv('call')]);
  $('callCd').style.height = (P.callCd / 9 * 100) + '%';
  setText('scentN', '× ' + G.scents);
  setText('treatN', '× ' + G.treats);
  setText('dogTxt', { heel: 'Send ut hunden', search: 'Kall inn hunden', mark: 'Kall inn hunden', back: 'Hunden kommer' }[D.st]);
  $('cold').hidden = !(G.started && P.cold > 0);
  if (P.cold > 0) { setText('coldTxt', P.wet ? 'I vannet · fryser' : 'Våt og kald · tørker'); $('coldFill').style.width = (P.cold * 100) + '%'; }
  // i siktet, og mens børsa tas opp, viker alt grensesnitt unna bortsett fra meldingene
  document.body.classList.toggle('aiming', G.started && (P.aim || AIM.want));
  // pustemåleren vises så lenge du springer eller henter deg inn etterpå; i siktet er den en strek nederst i bildet
  $('breath').hidden = !(G.started && !P.aim && P.breath < 1); $('breathFill').style.width = (P.breath * 100) + '%';
  $('breathFill').classList.toggle('low', P.breath < 0.25 || P.winded);
  setText('breathTxt', P.winded ? 'Andpusten · hent deg inn' : TOUCH.on ? 'Pust' : 'Pust · hold Space for å springe');
  // helse, leirutstyr og arbeid som pågår
  $('hp').hidden = !G.started;
  setText('hpTxt', 'Helse ' + Math.ceil(P.hp) + (P.sick ? ' · forkjølet' : P.warm ? ' · varmer deg' : '') + (G.wear.shoes === 'bare' ? ' · barbeint' : G.shoeHp <= 25 ? ' · slitte sko' : ''));
  $('hpFill').style.width = P.hp + '%'; $('hpFill').classList.toggle('low', P.sick || P.hp < 30);
  setText('campN', 'Ved × ' + G.wood + ' · kjøtt ' + fmtKg(meatKg())); setText('campS', 'Sekken ' + String(sackKg()).replace('.', ',') + ' / ' + fmtKg(sackCap()) + (horseNear() ? ' · hesten ' + String(horseKg()).replace('.', ',') + ' / ' + horseCap() + ' kg' : ''));
  $('campS').classList.toggle('full', sackFree() < WOOD_KG);
  $('work').hidden = !P.work;
  if (P.work) { setText('workTxt', { chop: 'Hogger …', build: 'Bygger gapahuk …', cook: 'Steker kjøtt …' }[P.work.kind]); $('workFill').style.width = (P.work.t / P.work.dur * 100) + '%'; }
  // handlingsprompt
  let pr = '';
  if (G.started && !G.paused && !P.aim && !P.work) { const ac = action(); if (ac) pr = ac[0]; }
  $('prompt').hidden = !pr; if (pr) setText('promptTxt', pr);
  // knappene på berøringsskjerm står bare framme mens du går og sikter
  $('tc').hidden = !G.started || G.paused; if (!P.aim) STICK.hold = false;
  if (G.panel === 'pause') setText('pauseNote', pauseNote());
  if (HUD.dirtyMsg) {
    HUD.dirtyMsg = false; const el = $('log'); el.innerHTML = '';
    for (const mm_ of G.msgs) { const d = document.createElement('div'); d.className = 'msg ' + mm_.kind; d.textContent = mm_.text; el.appendChild(d); }
  }
  const kids = $('log').children;
  for (let i = 0; i < kids.length; i++) { const t = G.msgs[i] ? G.msgs[i].t : 9; kids[i].style.opacity = clamp(1 - (t - 5) / 2, 0, 1); }
}

// ---------- handel ----------
// Hvert slags hus (se PLACES) har sine faner med varer og kjøper sine ting (gruppene i sellOffer). meatK er hvor mye av
// verdien stedet gir for kjøtt, bed om du kan sove der, og sells det som står over varene om hva stedet kjøper. I koia og
// på puben er det ingen som handler: da står note i stedet for varene
const SHOPS = {
  store: { name: 'Bua', who: 'Landhandleren', tabs: ['lure', 'gear', 'clo', 'camp'], buys: ['use', 'clo', 'upg'], bed: true,
    sells: 'Landhandleren kjøper ved til fastpris, og utstyr, klær og forbruksvarer for halv pris.' },
  gun: { name: 'Børsemakeren', who: 'Børsemakeren', tabs: ['rifle', 'hagle', 'bue'], buys: ['gun'], sells: 'Børsemakeren tar våpen og våpendeler tilbake for halv pris, ett trinn om gangen.' },
  game: { name: 'Viltmottaket', who: 'Viltmottaket', tabs: [], buys: ['meat'], sells: 'Viltmottaket betaler det dyret var verdt.' },
  smith: { name: 'Smia', who: 'Smeden', tabs: ['smith'], buys: ['smith'], sells: 'Smeden tar kniver og økser tilbake for halv pris, ett trinn om gangen.' },
  stable: { name: 'Stallen', who: 'Stallkaren', tabs: ['stable'], buys: [] },
  farm: { name: 'Garden', who: 'Grunneieren', tabs: ['quest'], buys: [] },
  post: { name: '', who: 'Verten', tabs: ['post'], buys: ['meat', 'use'], meatK: 0.8, bed: true, sells: 'Verten gir 80 % av det viltmottaket i landsbyen betaler for kjøttet, og halv pris for forbruksvarer.' },
  pub: { name: 'Puben', who: 'Verten', tabs: [], buys: [], bed: true, note: 'Verten har ei seng til deg på loftet. Peisen varmer deg og tørker klærne, og du kan sove her til morgengry.' },
  koie: { name: 'Koia', who: '', tabs: [], buys: [], bed: true, note: 'Koia er ubetjent. Ovnen varmer deg og tørker klærne, og du kan sove her til morgengry. Handle må du gjøre i landsbyen eller på en av utpostene.' },
};
// stedet du er inne i
let shopAt = PLACES[0];
const shopNow = () => SHOPS[shopAt.kind];
let shopCat = 'lure';
const upg = id => UPG.find(u => u.id === id);
// ikonet til et trinn: kniven har ett per kniv, resten ett for alle trinnene
const upgIco = (u, L = lv(u.id)) => u.icons ? u.icons[L] : u.icon;
// Stolpene øverst i fanen cat: [navn, verdi 0–1, tekst]. Bare fanene som har noe å måle (rifla, hagla og buen når du
// eier dem, og klærne); L gir trinnet på en oppgradering, så et annet trinn kan forhåndsvises
function statRows(cat, L = lv) {
  const N = id => upg(id).lv[L(id)];
  if (cat === 'hagle') return L('hagle') ? [
    ['Skudd', HST.cap[L('hagle')] / 3, N('hagle')],
    ['Samlet sverm', 1 - (HST.spread[L('choke')] - 0.03) / 0.05, N('choke')],
    ['Kraft per hagl', HST.pdmg[L('shell')] / 3.2, N('shell')],
    ['Hold', HST.prange[L('shell')] / 145, Math.round(HST.prange[L('shell')] * M_PER_PX) + ' m med full kraft'],
  ] : [];
  if (cat === 'bue') {
    const b = L('bue'), drop = m => Math.round(arrowDrop(m / M_PER_PX, b) * m * 100);
    return b ? [
      ['Pilfart', BST.spd[b] / 76, BST.spd[b] + ' m/s'],
      ['Flat bane', 1 - drop(40) / 60, 'Faller ' + drop(40) + ' cm på 40 m'],
      ['Skade', BST.dmg[b] / 105, Math.round(BST.range[b] * M_PER_PX) + ' m med full kraft'],
      ['Ro i siktet', 1 - (BST.sway[b] - 0.7) / 1.5, N('bue')],
    ] : [];
  }
  if (cat === 'clo') {
    const w = cloSum('warm'), cm = cloMul('camo'), nz = cloMul('noise'), rn = cloMul('run'), sh = worn('shoes');
    return [
      ['Varme', (w + 0.5) / 1.1, w >= 0.3 ? 'Varmt kledd' : w <= -0.1 ? 'Tynt kledd' : 'Greit kledd'],
      ['Kamuflasje', (1.25 - cm) / 0.8, cm < 1 ? Math.round((1 - cm) * 100) + ' % vanskeligere å se' : cm > 1 ? 'Synes godt' : 'Vanlig'],
      ['Stille steg', (2 - nz) / 1.6, 'Skritt høres ' + Math.round(95 * nz * M_PER_PX) + ' m'],
      ['Spring', rn / 2, String(Math.round(5 * rn * 10) / 10).replace('.', ',') + ' s'],
      ['Tørre føtter', 1 - sh.wet, sh.wet <= 0.3 ? 'Tørr i grunt vann' : sh.wet < 1 ? 'Tåler litt vann' : 'Våt med en gang'],
      ['Skoene', sh.life ? G.shoeHp / 100 : 0, sh.life ? Math.ceil(G.shoeHp) + ' % igjen' : 'Barbeint'],
    ];
  }
  if (cat === 'rifle') return [
    ['Skade', ST.dmg[L('caliber')] / 145, N('caliber')],
    ['Presisjon', 1 - (ST.spread[L('barrel')] - 0.2) / 1.0, Math.round(ST.range[L('barrel')] * M_PER_PX) + ' m hold'],
    ['Ro i siktet', 1 - (ST.sway[L('stock')] - 0.7) / 2.8, N('stock')],
    ['Forstørrelse', (ST.mag[L('scope')] - 1) / 3, N('scope')],
    ['Repetering', 1 - (ST.cycle[L('bolt')] - 0.35) / 1.25, ST.cycle[L('bolt')].toFixed(2).replace('.', ',') + ' s'],
    ['Demping', 1 - (ST.noise[L('supp')] - 200) / 800, Math.round(ST.noise[L('supp')] * M_PER_PX) + ' m smell'],
  ];
  return [];
}
// Stolpene slik de er nå, eller slik de blir med ov: { id, lv } er en oppgradering på et annet trinn, { clo } et plagg tatt på
function statsFor(ov) {
  if (ov && ov.clo) {
    const sl = CLO[ov.clo].slot, was = G.wear[sl], hp = G.shoeHp;
    G.wear[sl] = ov.clo; if (sl === 'shoes') G.shoeHp = 100;
    const R = statRows(shopCat); G.wear[sl] = was; G.shoeHp = hp; return R;
  }
  return statRows(shopCat, id => ov && ov.id === id ? ov.lv : lv(id));
}
// Tegner stolpene. Holder du musa over en vare (ov), vises det den endrer: økningen i gult, det du mister i rødt,
// og den nye verdien i teksten
function renderStats(ov) {
  const A = statsFor(null), B = ov ? statsFor(ov) : A, st = $('stats'), pct = v => Math.round(v * 100);
  $('shopStats').hidden = !A.length; if (!A.length) return;
  setText('statLab', { rifle: 'Rifla di nå', hagle: 'Hagla di nå', bue: 'Buen din nå', clo: 'Klærne dine nå' }[shopCat] || '');
  st.innerHTML = '';
  A.forEach(([n, v, t], i) => {
    const w = B[i] || A[i], a = clamp(v, 0.04, 1), c = clamp(w[1], 0.04, 1), d = Math.abs(c - a), r = document.createElement('div'); r.className = 'stat';
    r.innerHTML = `<div class="st-top"><span>${n}</span><span class="st-v${w[2] !== t || d > 0.005 ? ' new' : ''}">${w[2]}</span></div><div class="meter"><i style="width:${pct(Math.min(a, c))}%"></i>${d > 0.005 ? `<i class="${c > a ? 'gain' : 'loss'}" style="width:${pct(d)}%"></i>` : ''}</div>`;
    st.appendChild(r);
  });
  $('statNote').hidden = shopCat !== 'rifle';
  setText('statNote', ST.cap[lv('mag')] === 1 ? 'Enkeltskudd: ett skudd, så må du lade.' : ST.cap[lv('mag')] + ' patroner i magasinet.');
}
const shopHead = (list, t) => { const h = document.createElement('div'); h.className = 'lab clo-h'; h.textContent = t; list.appendChild(h); };
// Forbruksvarene i hver fane: [ikon, navn, antall du har, hva du får, id, pris, kjøp]
function supplies(cat) {
  const r = inGun('rifle'), h = inGun('hagle'), b = inGun('bue');
  return ({
    rifle: [['caliber', 'Riflepatroner', G.rounds + r, `Eske med ${AMMO.rifle.n} i ${upg('caliber').lv[lv('caliber')]}. ${r} sitter i rifla.`, 'rounds', AMMO.rifle.price, () => { G.rounds += AMMO.rifle.n; refill(); }]],
    hagle: [['shell', 'Haglpatroner', G.shells + h, `Eske med ${AMMO.hagle.n}, ${upg('shell').lv[lv('shell')].toLowerCase()}. ${h} sitter i hagla.`, 'shells', AMMO.hagle.price, () => { G.shells += AMMO.hagle.n; refill(); }]],
    bue: [['arrows', 'Piler', G.arrows + b, `Bunt med ${AMMO.bue.n} karbonpiler med jaktspiss. ${b ? 'Én ligger på strengen.' : ''}`, 'arrows', AMMO.bue.price, () => { G.arrows += AMMO.bue.n; refill(); }]],
    lure: [['flask', 'Luktstoff', G.scents, `Tre flasker med ${upg('scentLv').lv[lv('scentLv')].toLowerCase()}.`, 'flask', FLASK_PRICE, () => { G.scents += 3; }]],
    gear: [['treat', 'Godbiter til hunden', G.treats, `${TREAT_N} godbiter. Hunden får én hver gang den står for et dyr.`, 'treat', TREAT_PRICE, () => { G.treats += TREAT_N; }]],
    camp: [['match', 'Fyrstikker', G.matches, `Eske med ${MATCH_N}. Hver fyrstikk tenner ett bål.`, 'match', MATCH_PRICE, () => { G.matches += MATCH_N; }]],
  })[cat] || [];
}
// Hagla og buen før du eier dem: én rute med hva du får
const GUN_PITCH = {
  hagle: 'Til fugl i flukt og småvilt på kort hold. Haglpatroner, choke og grovere hagl kjøper du her etterpå.',
  bue: `Nesten lydløs, og dyr du feller med bue, gir ${Math.round((BOW_MEAT - 1) * 100)} % mer kjøtt. Pila faller på veien, så du sikter med pinnene for 20, 30 og 40 m. Piler kjøper du her etterpå.`,
};
// Varene i fanen cat, som ruter i butikkens inventar: { ico, n, d, price, why, buy, ov, back, max }. why er en grunn til
// at du ikke kan kjøpe (utenom pengene), ov det stolpene viser mens musa står over ruta (se statsFor), back raden fra
// sellOffer når stedet tar varen tilbake ett trinn, og max at den er fullt oppgradert
const SHOP_TAB = { rifle: 'Rifla', hagle: 'Hagla', bue: 'Pil og bue', lure: 'Lokking', gear: 'Utstyr', clo: 'Klær', camp: 'Leir', smith: 'Kniv og øks', stable: 'Hest og utstyr', post: 'Påfyll', quest: 'Oppdrag' };
function wares(cat) {
  const W = [];
  const sup = c => {
    for (const [ico, name, have, desc, , price, add] of supplies(c)) W.push({ ico, n: name, d: desc + ' Du har ' + have + '.', price,
      buy: () => { G.money -= price; add(); sfx.buy(); save(); renderShop(); } });
  };
  // utpostene har bare påfyll av det du bruker opp, til de våpnene du eier
  if (cat === 'post') { for (const c of ['rifle', 'hagle', 'bue', 'lure', 'gear', 'camp']) if (!GUNS[c] || GUNS[c].own()) sup(c); return W; }
  // klærne etter plass på kroppen; det du har på deg, er merket
  if (cat === 'clo') {
    const room = slotsOf('gear').includes(null);
    for (const [sl] of CLO_SLOTS) for (const id in CLO) {
      const c = CLO[id]; if (c.slot !== sl || !c.price) continue;
      const on = G.wear[sl] === id, k = G.slots.gear.filter(o => o && o.clo === id).length;
      W.push({ ico: c.icon, n: c.name + (on ? ' · på deg' : '') + (k ? ' · ' + k + ' i utstyret' : ''), d: cloTags(c) + '. ' + c.d + ' Havner i utstyret; dra det over på kroppen for å ta det på.',
        on, price: c.price, why: !room && 'Utstyret er fullt, så selg noe først.', buy: () => buyClo(id), ov: !on && { clo: id } });
    }
    return W;
  }
  // et våpen du ikke eier ennå, er bare én rute; resten av fanen kommer når du har det
  if (GUNS[cat] && !GUNS[cat].own()) {
    const u = upg(cat);
    return [{ ico: u.icon, n: u.lv[1], d: u.d[1] + ' ' + GUN_PITCH[u.id] + ' Den havner i utstyret. Dra den opp i en våpenplass i inventaret (E).', price: u.price[1], why: newGunFull(u) && 'Utstyret er fullt, så selg noe først.', buy: () => buy(u) }];
  }
  // forbruksvarene først, så oppgraderingene: ruta viser neste trinn, og tallet hvilket trinn du har
  sup(cat);
  for (const u of UPG.filter(u => u.cat === cat)) {
    const L = lv(u.id), top = u.lv.length - 1, max = L >= top, next = max ? L : L + 1;
    W.push({ ico: upgIco(u, next), n: u.name + ': ' + u.lv[next], d: u.d[next] + (max ? '' : ' Du har nå: ' + u.lv[L].toLowerCase() + '.'), c: 1, lab: L + '/' + top, max, price: u.price[next],
      why: u.need && !lv(u.need) && 'Kjøp hest først.', buy: () => buy(u), ov: !max && { id: u.id, lv: next }, back: sellOffer(u.id).find(r => r[6] === 'u:' + u.id) });
  }
  return W;
}
// På berøringsskjerm viser første trykk på en rute tipset med prisen, og neste trykk på den samme handler
let tapKey = null;
function tapFirst(s, it, key) {
  if (!TOUCH.on || tapKey === key) return false;
  tapKey = key; const r = s.getBoundingClientRect(); mcTip(it, r.right - 8, r.top + 8); return true;
}
// En vare i butikkens inventar: prisen står i tipset, klikk kjøper, og Shift+klikk selger ett trinn tilbake der stedet
// tar varen. Det du ikke har råd til, er dempet
function wareOn(s, w) {
  if (!w) return;
  const short = w.price - G.money, cant = !w.max && (w.why || short > 0), b = w.back && w.back[4][0];
  w.hint = (w.max ? 'Fullt oppgradert.' : 'Pris: ' + fmtKr(w.price) + '. ' + (w.why || (short > 0 ? 'Du mangler ' + fmtKr(short) + '.' : 'Klikk for å kjøpe.')))
    + (b ? b[3] ? ' ' + w.back[3] : ` Shift+klikk selger ett trinn tilbake for ${fmtKr(b[1])}.` : '');
  s.classList.add('ware'); s.classList.toggle('nosell', !!cant);
  // stolpene over varene viser hva varen endrer mens musa står over den
  if (w.ov) { const tip = s.onmouseenter; s.onmouseenter = e => { tip(e); renderStats(w.ov); }; s.onmouseleave = () => { mcTip(null); renderStats(null); }; }
  const act = e => {
    if (e.shiftKey) { if (!b || b[3]) return sfx.deny(); b[2](); return sellDone(w.back[1], b[1], w.back[5]); }
    if (w.max || tapFirst(s, w, 'w:' + w.n)) return;
    if (cant) return sfx.deny();
    w.buy();
  };
  s.onclick = act;
  s.onkeydown = e => { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); act(e); } };
}
// Bua: det du har til venstre og butikkens inventar til høyre, med en fane per slags vare. Over varene står hva stedet
// kjøper og stolpene for våpenet eller klærne; oppdragene til grunneieren står som en liste
function renderShop() {
  const SH = shopNow(), quest = shopCat === 'quest';
  setText('shopName', SH.name || shopAt.name); setText('shopWho', SH.who || SH.name);
  setText('shopNote', SH.note || (SH.tabs.includes(shopCat) && !quest ? 'Klikk på en vare for å kjøpe den. ' : '') + (SH.buys.length ? 'Shift+klikk på det du har, eller dra det hit, for å selge det. ' + SH.sells : ''));
  setText('shopSum', sold ? 'Solgt: ' + sold : '');
  const tabs = $('shopTabs'); tabs.innerHTML = ''; tabs.hidden = SH.tabs.length < 2;
  for (const k of SH.tabs) {
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'mc-tab'; bt.setAttribute('role', 'tab'); bt.setAttribute('aria-selected', k === shopCat);
    bt.textContent = SHOP_TAB[k]; bt.onclick = () => { if (shopCat === k) return; shopCat = k; sfx.ui(); renderShop(); };
    tabs.appendChild(bt);
  }
  const grid = $('shopGrid'), list = $('shopList'); grid.innerHTML = ''; list.innerHTML = '';
  renderMine(); renderStats(null);
  $('shopStore').hidden = !!SH.note || quest;
  if (quest) renderQuest(list);
  else if (!SH.note) {
    // varene først, og tomme ruter ut de tre radene, som i sekken
    const W = wares(shopCat);
    for (const w of W) grid.appendChild(mcSlot(w, wareOn));
    for (let i = W.length; i < Math.max(27, Math.ceil(W.length / 9) * 9); i++) grid.appendChild(mcSlot(null));
  }
  // alt kjøttet på én knapp når du har flere partier med deg
  const k0 = G.meat[0] ? 'meat:' + G.meat[0].sp : G.rack[0] ? 'rack:' + G.rack[0].sp : null, am = sellOffer(k0).find(r => r[6] === 'allmeat'), mb = $('meatBtn');
  mb.hidden = !am;
  if (am) { mb.textContent = 'Selg alt kjøttet · ' + fmtKr(am[4][0][1]); mb.onclick = () => { am[4][0][2](); sellDone(am[1], am[4][0][1], 'meat'); }; }
}
// ---------- oppdrag ----------
const COMPASS = ['nord', 'nordøst', 'øst', 'sørøst', 'sør', 'sørvest', 'vest', 'nordvest'], MARK_N = { cairn: 'Varden', bauta: 'Bautasteinen', tower: 'Jakttårnet' };
const questTitle = q => q.kind === 'meat' ? 'Kjøtt til garden: ' + SPEC[q.sp].name.toLowerCase() : SPEC[q.sp].name + ' ' + questArea(q).at;
// hvor området ligger sett fra der du står
function questWhere(q) {
  const g = questArea(q), dx = g.mk.x - P.x, dy = g.mk.y - P.y;
  return ` Området ligger ${Math.round(hyp(dx, dy) * M_PER_PX / 50) * 50} m mot ${COMPASS[Math.round(((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360) / 45) % 8]}. ${MARK_N[g.mk.k]} står midt i det, og en pil viser vei.`;
}
function questRow(list, q, now, btns) {
  const row = document.createElement('div'); row.className = 'item';
  row.innerHTML = `<img class="ico" alt="" src="${ICONURL['an_' + q.sp]}"><div class="it-body"><div class="it-head"><span class="it-name"></span></div><div class="it-now"></div><div class="it-next"></div></div>`;
  row.querySelector('.it-name').textContent = questTitle(q); row.querySelector('.it-now').textContent = now;
  row.querySelector('.it-next').textContent = questText(q) + (q.kind === 'cull' ? questWhere(q) : '');
  const box = document.createElement('div'); box.className = 'sell-bts';
  for (const [lab, fn, off] of btns) { const bt = document.createElement('button'); bt.className = 'buy'; bt.type = 'button'; bt.textContent = lab; bt.disabled = !!off; bt.onclick = () => { fn(); renderShop(); }; box.appendChild(bt); }
  row.appendChild(box); list.appendChild(row);
}
// Grunneieren: oppdraget du har, med levering, eller dagens tilbud
function renderQuest(list) {
  const q = G.quest, top = document.createElement('p'); top.className = 'side-note';
  top.textContent = 'Grunneieren har tre nye oppdrag hver dag. Du kan ha ett om gangen, og det står til du leverer det eller gir det opp.';
  list.appendChild(top);
  if (q) {
    const ready = questReady(q), have = kg1(questLots(q).reduce((s, l) => s + l.kg, 0));
    shopHead(list, 'Oppdraget ditt');
    questRow(list, q, ready ? 'Klart til levering.' : q.kind === 'meat' ? `Du har ${fmtKg(have)} av ${fmtKg(q.kg)} med deg.` : 'Ikke felt ennå.',
      [['Lever · ' + fmtKr(q.kr), questDeliver, !ready], ['Gi opp', () => { G.quest = null; sfx.ui(); save(); }]]);
    return;
  }
  if (G.qd.day !== G.day) G.qd = { day: G.day, used: [] };
  shopHead(list, 'Dagens oppdrag');
  const L = questOffers().map((o, i) => [o, i]).filter(([, i]) => !G.qd.used.includes(i));
  for (const [o, i] of L) questRow(list, o, 'Premie ' + fmtKr(o.kr), [['Ta oppdraget', () => { G.quest = o; G.qd.used.push(i); sfx.buy(); msg('Nytt oppdrag: ' + questText(o), 'good'); save(); }]]);
  if (!L.length) { const n = document.createElement('p'); n.className = 'side-note'; n.textContent = 'Ingen flere oppdrag i dag. Kom tilbake i morgen.'; list.appendChild(n); }
}
// Klær: ett plagg av hvert på kroppen. Det du kjøper, havner i utstyret, og du tar det på ved å dra det over på kroppen
// (i inventaret eller til venstre i bua); det du hadde på deg, havner da i utstyret
function cloTags(c) {
  const T = [];
  if (c.warm) T.push(c.warm >= 0.3 ? 'Svært varm' : c.warm > 0 ? 'Varm' : 'Kald');
  if (c.camo) T.push(c.camo < 1 ? 'Kamuflerer' : 'Synes godt');
  if (c.noise) T.push(c.noise < 1 ? 'Stille' : 'Bråker');
  if (c.run) T.push('Spring ' + String(5 * c.run).replace('.', ',') + ' s');
  if (c.wet) T.push(c.wet <= 0.3 ? 'Tørr i grunt vann' : c.wet < 1 ? 'Tåler litt vann' : 'Våt med en gang');
  if (c.life) T.push(c.life < 1200 ? 'Slites fort' : c.life >= 2400 ? 'Holder lenge' : 'Holder en stund');
  if (c.steady) T.push('Roligere sikte i kulde');
  if (c.work) T.push('Hogger og bygger fortere');
  if (c.slow) T.push('Treg lading');
  if (c.dry) T.push('Tørker fort');
  return T.join(' · ') || 'Vanlig';
}
function buyClo(id) {
  const c = CLO[id], j = slotsOf('gear').indexOf(null);
  if (j < 0 || G.money < c.price) { sfx.deny(); return; }
  G.money -= c.price; G.slots.gear[j] = c.slot === 'shoes' ? { clo: id, hp: 100 } : { clo: id };
  msg(c.name + ' ligger i utstyret. Ta det på i inventaret (E): dra plagget over på kroppen.', 'good');
  sfx.buy(); save(); renderShop();
}
// ---------- salg ----------
// Til venstre i bua ligger det du har, i de samme rutene som i inventaret. Shift+klikk på en rute, eller dra den over til
// butikken, selger den: hele stabelen av kjøtt, ved og forbruksvarer, og utstyr og klær stykkevis. Et vanlig klikk på en
// stabel selger én (ett kilo kjøtt). Prisen står i tipset. Våpendeler og annet i flere trinn selges fra butikkens side
// (se wareOn). dragKey er ruta du drar, sold det du sist solgte, og grp gruppa i sellOffer (kjøtt teller i historien)
let dragKey = null, sold = '';
const sellDone = (name, kr, grp) => { if (grp === 'meat') storyEv('sell'); G.money += kr; sold = name + ' · ' + fmtKr(kr); sfx.coin(); save(); renderShop(); };
// q er mengden en stabel kan deles i: { max, step, fmt(n), kr(n), take(n) }
const qMany = q => !!q && q.max > q.step;
// én eller alle av noe du har flere av
const sellN = (n, each, take) => n > 1 ? [['Selg 1', each, () => take(1)], ['Selg alle', each * n, () => take(n)]] : [['Selg', each, () => take(1)]];
const halfKr = p => Math.max(1, Math.round(p * SELL_K));
// Det bua byr for ruta k, som rader [ikon, navn, nå, mer, knapper]; tomt hvis bua ikke kjøper det. Kjøttet til verdien
// dyret hadde, ved til fastpris, forbruksvarer og utstyr du har kjøpt for halv pris
const sellOffer = k => sellOffer0(k).filter(r => shopNow().buys.includes(r[5]));
function sellOffer0(k) {
  const R = [], mk = shopNow().meatK || 1, mkr = v => Math.round(v * mk);
  if (!k) return R;
  // kjøtt i sekken (meat:art) eller på hesten (rack:art); det på hesten selges bare når den står parkert ved bua
  if (k.startsWith('meat:') || k.startsWith('rack:')) {
    const horse = k.startsWith('rack:'), here = horseNear(HORSE_SHOP), L = horse ? G.rack : G.meat;
    if (horse && !here) return R;
    const l = L.find(l => k.slice(5) === l.sp); if (!l) return R;
    // en del av partiet tar med seg sin del av verdien
    const part = n => n >= l.kg ? l.kr : Math.round(l.kr * n / l.kg);
    R.push([l.sp && ICONURL['an_' + l.sp] ? 'an_' + l.sp : 'meat', meatName(l) + (horse ? ' på hesten' : ''), fmtKg(l.kg) + '.', fmtKr(Math.round(mkr(l.kr) / l.kg)) + ' per kg.', [['Selg', mkr(l.kr), () => L.splice(L.indexOf(l), 1)]], 'meat', k,
      { max: l.kg, step: 0.1, fmt: fmtKg, kr: n => mkr(part(n)), take: n => { if (n >= l.kg) L.splice(L.indexOf(l), 1); else { l.kr -= part(n); l.kg = kg1(l.kg - n); } } }]);
    // alt kjøttet du har med deg: sekken, og hesten når den står her
    const both = here && G.rack.length, n = G.meat.length + (here ? G.rack.length : 0);
    if (n > 1) R.push(['meat', 'Alt kjøttet', fmtKg(kg1(meatKg() + (both ? rackKg() : 0))) + (both ? ' i sekken og på hesten.' : ' i sekken.'), 'Selg alt på en gang.',
      [['Selg alt', mkr(meatKr() + (both ? rackKr() : 0)), () => { G.meat.length = 0; if (both) G.rack.length = 0; }]], 'meat', 'allmeat']);
    return R;
  }
  // plagget du har på deg; selger du det, går du uten (barbeint for skoene)
  if (k.startsWith('clo:')) {
    const sl = k.slice(4), c = worn(sl), back = cloTrade(sl), shoes = sl === 'shoes';
    if (back) R.push([c.icon, c.name, shoes ? Math.ceil(G.shoeHp) + ' % igjen.' : 'På deg nå.', 'Du får halv pris' + (shoes ? ' etter hvor slitt de er' : '') + '. Etterpå går du ' + (shoes ? 'barbeint' : 'uten ' + CLO_SLOTS.find(s => s[0] === sl)[1].toLowerCase()) + '.',
      [['Selg', back, () => { G.wear[sl] = CLO_NONE[sl]; }]], 'clo', k]);
    return R;
  }
  // et plagg i utstyret (o:gear:rute) eller på hesten (o:horse:rute) når den står ved bua
  if (k.startsWith('o:')) {
    const [, g, i] = k.split(':'), o = (G.slots[g] || [])[+i];
    if (!o || typeof o !== 'object' || !o.clo || g === 'horse' && !horseNear(HORSE_SHOP)) return R;
    const c = CLO[o.clo], shoes = c.slot === 'shoes';
    R.push([c.icon, c.name + (g === 'horse' ? ' på hesten' : ''), shoes ? Math.ceil(o.hp) + ' % igjen.' : g === 'horse' ? 'På hesten.' : 'I utstyret.', 'Du får halv pris' + (shoes ? ' etter hvor slitt de er' : '') + '.',
      [['Selg', cloKr(c, o.hp), () => { G.slots[g][+i] = null; }]], 'clo', k]);
    return R;
  }
  // ved til fastpris, og patroner og forbruksvarer for halv pris: hos deg, eller (horse:) på hesten når den står ved bua.
  // Bare patronene i sekken selges; de som sitter i våpenet, blir der
  const horse = k.startsWith('horse:'), id = horse ? k.slice(4) : { scent: 'scents', treat: 'treats', match: 'matches' }[k] || k, S = horse ? G.cargo : G;
  if (CARGO.includes(id) && S[id] > 0 && (!horse || horseNear(HORSE_SHOP))) {
    const [ico, name, unit] = CARGO_UI[id], n = S[id], wood = id === 'wood';
    const each = wood ? WOOD_PRICE : halfKr({ rounds: AMMO.rifle.price / AMMO.rifle.n, shells: AMMO.hagle.price / AMMO.hagle.n, arrows: AMMO.bue.price / AMMO.bue.n, scents: FLASK_PRICE / 3, treats: TREAT_PRICE / TREAT_N, matches: MATCH_PRICE / MATCH_N }[id]);
    R.push([ico, name + (horse ? ' på hesten' : ''), `Du har ${n} ${unit}${horse ? ' på hesten' : id === 'rounds' || id === 'shells' || id === 'arrows' ? ' i sekken' : ''}.`,
      wood ? `Fastpris ${fmtKr(WOOD_PRICE)} per kubbe.` : `Du får halv pris: ${fmtKr(each)} stykket.`, sellN(n, each, n => { S[id] -= n; }), 'use', (horse ? 'horse:' : '') + id,
      { max: n, step: 1, fmt: v => v + ' stk', kr: v => each * v, take: v => { S[id] -= v; } }]);
  }
  if (horse) return R;
  // utstyret i ruta går ett trinn ned, og bua gir halv pris for trinnet du selger. Rifla og hagla er flere deler, og
  // luktstoffet har en styrke. Sekken og hundesekken kan bare byttes ned hvis det du bærer, får plass
  const ids = GUNS[k] ? UPG.filter(u => u.cat === k).map(u => u.id) : k === 'scent' ? ['scentLv'] : [k];
  for (const u of UPG.filter(u => ids.includes(u.id) && lv(u.id) > 0)) {
    const L = lv(u.id), full = (u.id === 'pack' || u.id === 'dogpack') && sackKg() > sackCap() - ST[u.id][L] + ST[u.id][L - 1];
    R.push([upgIco(u, L), u.name, u.lv[L], full ? `Du bærer for mye til en mindre sekk. Selg kjøtt eller ved først.` : `Du får halv pris. Etterpå har du ${u.lv[L - 1].toLowerCase()}.`, [['Selg', halfKr(u.price[L]), () => sellUpg(u), full]], GUNS[u.cat] ? 'gun' : u.cat === 'smith' || u.cat === 'stable' ? u.cat : 'upg', 'u:' + u.id]);
  }
  return R;
}
// Klikk på ruta k hos deg: en stabel selger én om gangen, og med all (Shift, eller dratt over til butikken) hele. Utstyr
// og klær selges bare med all, så du ikke selger noe med et uhell
function sellClick(k, all) {
  const r = sellOffer(k)[0]; if (!r || GUNS[k]) return;
  const stack = r[5] === 'meat' || r[5] === 'use', q = r[7], b = r[4][r[4].length - 1];
  if (!stack && !all) return;
  if (b[3]) return sfx.deny();
  if (!all && qMany(q)) { const n = Math.min(q.max, 1), kr = q.kr(n); q.take(n); return sellDone(r[1], kr, r[5]); }
  b[2](); sellDone(r[1], b[1], r[5]);
}
// hvor ruta k kan selges, når stedet du er på, ikke kjøper den
function buyers(k) {
  const g = (sellOffer0(k)[0] || [])[5]; if (!g) return '';
  const N = [...new Set(Object.values(SHOPS).filter(S => S.buys.includes(g)).map(S => S.name || 'utpostene'))];
  return N.length ? 'Kjøpes ikke her. Selges her: ' + N.join(', ') + '.' : '';
}
function dragDone() { dragKey = null; $('shop').classList.remove('dragging'); $('shopMain').classList.remove('over'); }
// Det du har, til venstre i bua, og lasten på hesten når den står parkert ved bua. Det bua kjøper, kan selges med
// Shift+klikk eller dras over til butikken, og tipset sier hva du får for det
function renderMine() {
  const on = (s, it, at) => {
    // et plagg du har kjøpt, kan dras rett over på plassen sin på kroppen her også
    if (at && at.g === 'wear') {
      const src = () => { const m = /^o:(gear|horse):(\d+)$/.exec(dragKey || ''), o = m && G.slots[m[1]][+m[2]]; return o && typeof o === 'object' && o.clo && CLO[o.clo].slot === at.i ? { g: m[1], i: +m[2], obj: o } : null; };
      s.ondragover = e => { if (!src()) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; };
      s.ondrop = e => { const d = src(); if (!d) return; e.preventDefault(); dragDone(); invDrop(d, 'wear', at.i); sfx.kneel(); save(); renderShop(); };
    }
    if (!it || it.empty || !it.sk) return;
    const r = sellOffer(it.sk)[0];
    // det stedet ikke kjøper, er dempet og sier hvor det kan selges
    if (!r) { s.classList.add('nosell'); it.hint = buyers(it.sk); return; }
    // våpnene består av flere deler, som selges én for én fra butikkens side
    if (GUNS[it.sk]) { it.hint = 'Delene selger du én for én: Shift+klikk på delen til høyre.'; return; }
    const stack = r[5] === 'meat' || r[5] === 'use', q = r[7], b = r[4][r[4].length - 1], one = q && Math.min(q.max, 1);
    it.hint = b[3] ? r[3] : (stack && qMany(q) ? `Klikk selger ${q.fmt(one)} for ${fmtKr(q.kr(one))}. Shift+klikk, eller dra over til høyre, selger alt for ${fmtKr(b[1])}.`
      : `Shift+klikk, eller dra over til høyre, selger for ${fmtKr(b[1])}.`);
    s.classList.add('sell'); s.draggable = true;
    s.ondragstart = e => { mcTip(null); dragKey = it.sk; e.dataTransfer.setData('text/plain', it.n); e.dataTransfer.effectAllowed = 'move'; $('shop').classList.add('dragging'); };
    s.ondragend = dragDone;
    const act = e => { if (!tapFirst(s, it, it.sk)) sellClick(it.sk, e.shiftKey || TOUCH.on); };
    s.onclick = act;
    s.onkeydown = e => { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); act(e); } };
  };
  mcRender($('shopMc'), on, renderMine, horseNear(HORSE_SHOP) && gridItems('horse').some(Boolean) && 'Hesten står utenfor.', true);
}
// Et våpen du ikke har fra før, havner i utstyret, så det må være en ledig rute der
const newGunFull = u => !!GUNS[u.id] && !lv(u.id) && !slotsOf('gear').includes(null);
function sellUpg(u) {
  const L = lv(u.id); if (!L) return;
  G.up[u.id] = L - 1;
  // selger du hagla eller buen helt, er den borte fra våpenplassen eller utstyret, og det som satt i den, går i sekken
  if (GUNS[u.id] && !lv(u.id)) armsFix();
  if (u.id === 'mag' || GUNS[u.id]) refill();
}
function buy(u) {
  const L = lv(u.id); if (L >= u.lv.length - 1) return;
  const p = u.price[L + 1]; if (G.money < p || newGunFull(u) || u.need && !lv(u.need)) { sfx.deny(); if (newGunFull(u)) msg('Utstyret er fullt. Selg noe først, så det blir plass til ' + GUNS[u.id].the + '.', 'warn'); return; }
  G.money -= p; G.up[u.id] = L + 1; sfx.buy();
  // et nytt våpen legges i utstyret; du drar det opp i en våpenplass i inventaret
  if (GUNS[u.id] && L === 0) { armsFix(); msg(u.lv[1] + ' ligger i utstyret. Dra den opp i en våpenplass i inventaret (E). ' + (u.id === 'bue' ? 'Piler' : 'Haglpatroner') + ' kjøper du her under ' + (u.id === 'bue' ? 'Pil og bue' : 'Hagla') + '.', 'good'); }
  if (u.id === 'mag' || GUNS[u.id]) refill();
  if (u.id === 'axe') msg('Stå inntil et tre og trykk F for å hogge ved.', 'good');
  if (u.id === 'horse') { horsePark(); msg('Hesten står ved stallveggen. Trykk F inntil den for å laste over kjøttet fra sekken. Ved og annet flytter du i inventaret (E). For å ri trenger du sal.', 'good'); }
  if (u.id === 'saddle') msg('Hesten har fått sal. Gå bort til den og trykk F for å ri.', 'good');
  save(); renderShop();
}
function openShop(c) {
  shopAt = c || PLACES[0]; const S = shopNow();
  G.paused = true; G.panel = 'shop'; aimReset(); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  // tom for riflepatroner og uten penger eller kjøtt til en eske: bua gir deg noen, så du kan jakte igjen
  if (!G.rounds && !G.cargo.rounds && !inGun('rifle') && G.money + meatKr() < AMMO.rifle.price) { G.rounds = AMMO_AID; msg(`Du fikk ${AMMO_AID} riflepatroner på krita, så du kan jakte igjen.`, 'good'); }
  // våpnene lades fra sekken, og ovnen og maten i bua gjør deg tørr, varm og frisk
  refill(); if (P.sick) msg('Du varmet deg ved ovnen og er frisk igjen.', 'good'); healFull();
  // har du kjøtt med deg der de kjøper det, vises kjøttet til venstre
  if (S.buys.includes('meat') && (G.meat.length || G.rack.length && horseNear(HORSE_SHOP))) invTab = 'meat';
  if (!S.tabs.includes(shopCat)) shopCat = S.tabs[0] || '';
  sold = ''; tapKey = null; invNote = '';
  $('sleepBtn').hidden = mp() || !S.bed;
  renderShop(); $('shop').hidden = false; sfx.ui();
}
function openBook() {
  G.paused = true; G.panel = 'book'; aimReset(); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  const st = $('bookStory'); st.innerHTML = '';
  const row = (cls, t, d) => { const r = document.createElement('div'); r.className = 'ch ' + cls; const b = document.createElement('b'); b.textContent = t; r.append(b, d); st.appendChild(r); };
  const lab = document.createElement('div'); lab.className = 'lab'; lab.textContent = `Historien · nivå ${xpLevel()}, ${rankName().toLowerCase()} · ${G.xp} / ${xpNext()} XP`; st.appendChild(lab);
  STORY.slice(0, G.story).forEach(c => row('done', '✓ ' + c.t, '+' + c.xp + ' XP'));
  const c = STORY[G.story];
  if (c) row('now', c.t + ' · ' + storyGoal() + ' (+' + c.xp + ' XP)', G.sst ? c.d.join(' ') : ''); else row('now', 'Historien er fullført', '');
  const sum = $('bookSpecies'); sum.innerHTML = '';
  for (const sp of SPECIES) {
    const k = G.journal.filter(j => j.sp === sp), best = k.reduce((a, j) => Math.max(a, j.kg), 0);
    const d = document.createElement('div'); d.className = 'sp' + (k.length ? '' : ' none');
    d.innerHTML = `<img alt="" src="${ICONURL['an_' + sp]}"><div class="sp-n">${SPEC[sp].name}</div><div class="sp-c">${k.length ? k.length + ' felt · størst ' + fmtKg(best) : 'Ikke felt ennå'}</div>`;
    sum.appendChild(d);
  }
  const L = $('bookList'); L.innerHTML = '';
  if (!G.journal.length) L.innerHTML = '<p class="empty">Jaktboka er tom. Første dyr du tar vare på blir skrevet inn her.</p>';
  for (const j of G.journal.slice(0, 60)) {
    const r = document.createElement('div'); r.className = 'entry';
    r.innerHTML = `<span class="e-d">Dag ${j.day}</span><span class="e-n">${SPEC[j.sp].name}, ${SPEC[j.sp].sexn[j.sex]}</span><span class="e-k">${fmtKg(j.kg)}</span><span class="e-z">${ZONES[j.zone][0]} · ${j.m} m</span><span class="e-kr">${fmtKr(j.kr)}</span>`;
    L.appendChild(r);
  }
  const tot = G.journal.reduce((a, j) => a + j.kr, 0);
  setText('bookTot', G.journal.length + ' dyr · ' + fmtKr(tot) + ' totalt');
  $('book').hidden = false; sfx.ui();
}
// ---------- oversiktskart ----------
// Hele jaktfeltet sett ovenfra (M). Terrenget tegnes én gang fra de samme feltene som bakken, én piksel per MAP_STEP
// piksler i verden, og elver og stier legges oppå der støyfeltene deres skifter fortegn, så de blir hele streker.
// Over det står områdenavnene, landemerkene og husene, og alt som flytter seg: du, hesten, hunden, de andre jegerne,
// felte dyr, bål og gapahuker. Rutene du ikke har oppdaget (se discover), er bare grovt skissert i gråtoner (mapVague:
// innsjøer, lavland og fjell), og det som står der, vises ikke; navnet på et område står midt i den delen av det du
// har sett
const MAP_N = 600, MAP_STEP = 2 * WORLD / MAP_N, MAP_MARK = { cairn: '#dce4e8', bauta: '#a0728c', tower: '#e6bd52' };
const MAP_VN = 100, MAP_GREY = T('#1b1f1d', '#3a3e3b', '#5c605b');
let mapGround = null, mapFog = null;
function mapVague() {
  const p = new Pix(MAP_VN, MAP_VN), st = 2 * WORLD / MAP_VN;
  for (let j = 0; j < MAP_VN; j++) for (let i = 0; i < MAP_VN; i++) {
    const f = fields((i + 0.5) * st - WORLD, (j + 0.5) * st - WORLD, []);
    p.d[j * MAP_VN + i] = MAP_GREY[f[2] < 0.12 ? 0 : f[6] > 0.55 ? 2 : 1];
  }
  return p.canvas();
}
function drawMap() {
  const el = $('mapCv'), g = el.getContext('2d'), K = el.width / (2 * WORLD), at = o => [Math.round((o.x + WORLD) * K), Math.round((o.y + WORLD) * K)];
  mapGround ||= mapTerrain(); mapFog ||= mapVague();
  g.imageSmoothingEnabled = false; g.drawImage(mapFog, 0, 0, el.width, el.height);
  const text = (t, x, y, size, col) => {
    g.font = `${size}px "Jersey 25", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 5; g.strokeStyle = 'rgba(10,14,12,.85)'; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
  };
  const icon = (c, [x, y], z) => g.drawImage(c, x - Math.round(c.width * z / 2), y - Math.round(c.height * z / 2), c.width * z, c.height * z);
  const dot = ([x, y], r, col) => { g.fillStyle = '#121a16'; g.fillRect(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4); g.fillStyle = col; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const cs = el.width / FOG_N, gs = MAP_N / FOG_N, sum = REGIONS.map(() => [0, 0, 0]);
  for (let j = 0; j < FOG_N; j++) for (let i = 0; i < FOG_N; i++) {
    if (!G.seen[j * FOG_N + i]) continue;
    g.drawImage(mapGround, i * gs, j * gs, gs, gs, i * cs, j * cs, cs, cs);
    const x = (i + 0.5) * FOG_S - WORLD, y = (j + 0.5) * FOG_S - WORLD, a = sum[regionAt(x, y).idx]; a[0] += x; a[1] += y; a[2]++;
  }
  for (const q of MARKS) if (seenAt(q.x, q.y)) dot(at(q), 3, MAP_MARK[q.k]);
  REGIONS.forEach((rg, i) => { const a = sum[i]; if (!a[2]) return; const [x, y] = at({ x: a[0] / a[2], y: a[1] / a[2] }); text(rg.name, x, y - 34, 22, 'rgba(236,228,207,.85)'); });
  // landsbyen er ett merke; utpostene står med navn, koiene uten
  for (const c of PLACES) {
    if (inVillage(c) && c !== PLACES[0] || !seenAt(c.x, c.y)) continue;
    const q = at(c); icon(FX.house, q, c.kind === 'koie' ? 2 : 3);
    if (c.kind !== 'koie') text(c.name, q[0], q[1] + 26, 24, '#ece4cf');
  }
  // området oppdraget gjelder, til dyret er felt
  const qu = G.quest;
  if (qu && qu.kind === 'cull' && !qu.got) { const [x, y] = at(questArea(qu).mk); g.lineWidth = 3; g.strokeStyle = '#f0b450'; g.setLineDash([8, 6]); g.beginPath(); g.arc(x, y, 44, 0, TAU); g.stroke(); g.setLineDash([]); text('Oppdrag', x, y + 58, 22, '#f0b450'); }
  for (const h of G.huts) dot(at(h), 3, '#836244');
  for (const f of G.fires) dot(at(f), 3, '#d07a3c');
  for (const a of G.animals) if (a.state === 'dead' && (!a.by || a.by === NET.id)) icon(FX.deer, at(a), 2);
  if (lv('horse') && !HORSE.on) icon(FX.horse, at(HORSE), 2);
  if (D.st !== 'heel') icon(FX.dog, at(D), 2);
  for (const r of NET.peers.values()) if (r.started && !r.in) { const q = at(r); dot(q, 4, '#a4ccc6'); text(r.name, q[0], q[1] - 20, 22, '#a4ccc6'); }
  dot(at(P), 5, '#f2efe2');
}
function openMap() {
  G.paused = true; G.panel = 'mapSheet'; aimReset(); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  drawMap(); $('mapSheet').hidden = false; sfx.ui();
}
// ---------- inventar ----------
// Som i et klossespill: jegeren med plassene for klærne på kroppen og jaktkniven i kors, en rad for våpnene, sekken og
// pengene, og under det du bærer i to faner, utstyr og kjøtt. Bare det du har, vises. Alt i rutene kan dras dit du vil ha det (G.slots
// husker hvor), og et plagg i utstyret dras over på plassen sin på kroppen for å ta det på; det du hadde på deg, havner
// der plagget lå. Står hesten like ved (eller du sitter på den), ligger lasten dens til høyre med ledige ruter, og det du
// drar eller klikker over, flyttes til den andre siden. Hold musa over en rute, så står navnet og hva den gjør ved pekeren.
// Det samme inventaret står til venstre i bua
// invHeld er ruta du har tatt opp med et klikk; den henger på pekeren til du klikker der den skal ligge
let invTab = 'gear', invNote = '', invDrag = null, invHeld = null;
function holdMove(e) { const g = $('mcHeld'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }
function holdStart(it, e) { invHeld = it; mcTip(null); const g = $('mcHeld'); g.src = ICONURL[it.ico]; g.hidden = false; holdMove(e); addEventListener('mousemove', holdMove); }
function holdEnd() { if (!invHeld) return; invHeld = null; $('mcHeld').hidden = true; removeEventListener('mousemove', holdMove); }
const INV_N = { gear: 27, meat: 27, horse: 24 };
// det som kan ligge på hesten i tillegg til kjøtt og klær (se CARGO): ikon, navn og hva det telles i
const CARGO_UI = { wood: ['wood', 'Ved', 'ved'], rounds: ['caliber', 'Riflepatroner', 'riflepatroner'], shells: ['shell', 'Haglpatroner', 'haglpatroner'], arrows: ['arrows', 'Piler', 'piler'],
  scents: ['scent', 'Luktstoff', 'flasker luktstoff'], treats: ['treat', 'Godbiter', 'godbiter'], matches: ['match', 'Fyrstikker', 'fyrstikker'] };
const upgName = id => upg(id).lv[lv(id)];
// hva et våpen er, til verktøytipset
function gunDesc(g) {
  const L = upgName;
  if (g === 'hagle') return L('choke') + ' · ' + L('shell') + '. Til fugl og småvilt.';
  if (g === 'bue') return upg('bue').d[lv('bue')] + ' Dyr du feller med bue, gir ' + Math.round((BOW_MEAT - 1) * 100) + ' % mer kjøtt.';
  return L('caliber') + ' · ' + L('scope') + ' · ' + L('barrel') + '. Til storvilt.';
}
// Det som ligger i hvert rutenett nå, etter nøkkel. sk sier hva bua byr på når du vil selge det (se sellOffer)
function itemsOf(g) {
  // ett parti kjøtt per art, med dyret på ruta og kiloene i hjørnet; i sekken og på hesten hver for seg
  const lot = (l, horse) => ['meat:' + l.sp, { ico: l.sp && ICONURL['an_' + l.sp] ? 'an_' + l.sp : 'meat', sk: (horse ? 'rack:' : 'meat:') + l.sp, n: meatName(l), c: l.kg, lab: (l.kg < 10 ? String(l.kg).replace('.', ',') : Math.round(l.kg)) + ' kg',
    d: fmtKg(l.kg) + ', verdt ' + fmtKr(l.kr) + ' på viltmottaket.' + (horse ? '' : ' Stek det over bålet (F) og spis for helse.') }];
  if (g === 'meat') return Object.fromEntries(G.meat.map(l => lot(l)));
  if (g === 'horse') return Object.fromEntries([...G.rack.map(l => lot(l, true)), ...CARGO.filter(k => G.cargo[k] > 0).map(k => {
    const [ico, n, unit] = CARGO_UI[k];
    return [k, { ico, sk: 'horse:' + k, n, c: G.cargo[k], d: G.cargo[k] + ' ' + unit + ' på hesten.' + (k === 'wood' ? ' ' + WOOD_KG + ' kg hver.' : '') }];
  })]);
  const L = upgName, r = inGun('rifle'), h = inGun('hagle'), bw = inGun('bue'), all = {
    rounds: G.rounds + r && { ico: 'caliber', sk: 'rounds', n: 'Riflepatroner', c: G.rounds + r, d: `${r} i rifla og ${G.rounds} i sekken, ${L('caliber')}. Lad med R, og kjøp flere i landsbyen.` },
    shells: G.shells + h && { ico: 'shell', sk: 'shells', n: 'Haglpatroner', c: G.shells + h, d: `${h} i hagla og ${G.shells} i sekken, ${L('shell').toLowerCase()}. Lad med R, og kjøp flere i landsbyen.` },
    arrows: G.arrows + bw && { ico: 'arrows', sk: 'arrows', n: 'Piler', c: G.arrows + bw, d: `${bw ? 'Én på strengen' : 'Ingen på strengen'} og ${G.arrows} i sekken. Legg på en ny med R, og kjøp flere i landsbyen.` },
    call: { ico: 'call', sk: 'call', n: L('call'), d: 'Lokker ' + CALLSP[lv('call')].map(s => SPEC[s].name.toLowerCase()).join(', ') + '. Lokk fra hjulet.' },
    scents: G.scents && { ico: 'scent', sk: 'scent', n: 'Luktstoff', c: G.scents, d: L('scentLv') + '. Sett ut en flaske fra hjulet.' },
    deo: lv('deo') && { ico: 'deo', sk: 'deo', n: L('deo'), d: upg('deo').d[lv('deo')] },
    axe: lv('axe') && { ico: 'axe', sk: 'axe', n: 'Øks', d: upg('axe').d[1] },
    dogpack: lv('dogpack') && { ico: 'dogpack', sk: 'dogpack', n: L('dogpack'), d: upg('dogpack').d[lv('dogpack')] + ' Plassen kommer i tillegg til ryggsekken.' },
    wood: G.wood && { ico: 'wood', sk: 'wood', n: 'Ved', c: G.wood, d: 'Et bål tar én kubbe, en gapahuk ' + HUT_WOOD + '. Hogg trær med øks (F). ' + WOOD_KG + ' kg hver i sekken, ' + fmtKr(WOOD_PRICE) + ' hver i landsbyen.' },
    matches: G.matches && { ico: 'match', sk: 'match', n: 'Fyrstikker', c: G.matches, d: 'Hver fyrstikk tenner ett bål. Tenn bål fra hjulet.' },
    treats: G.treats && { ico: 'treat', sk: 'treat', n: 'Godbiter', c: G.treats, d: 'Hunden får én hver gang den står for et dyr. Send den ut fra hjulet.' },
  };
  for (const k in all) if (!all[k]) delete all[k];
  return all;
}
// Rutene i rutenettet g slik du har lagt dem: det du har fått siden sist, havner i første ledige rute, og det du ikke har
// lenger, blir borte. Plaggene ligger i rutene selv og blir der til du flytter, tar på eller selger dem
function slotsOf(g, items = itemsOf(g)) {
  const L = G.slots[g];
  while (L.length < INV_N[g]) L.push(null);
  for (let i = 0; i < L.length; i++) if (typeof L[i] === 'string' && !(L[i] in items)) L[i] = null;
  for (const k in items) if (!L.includes(k)) { const i = L.indexOf(null); L[i < 0 ? L.length : i] = k; }
  return L;
}
const slotLab = sl => CLO_SLOTS.find(s => s[0] === sl)[1];
// Rutene i g som det ruta viser: key for det du har av noe, obj for et plagg, og g og i for hvor den ligger
function gridItems(g) {
  const items = itemsOf(g);
  return slotsOf(g, items).map((e, i) => {
    if (e == null) return null;
    if (typeof e === 'string') return { ...items[e], key: e, g, i };
    // et våpen som ikke er i en våpenplass; i bua selges det som rifla, hagla eller buen (sk)
    if (e.gun) return { ico: GUNS[e.gun].ico, sk: e.gun, obj: e, g, i, n: gunLabel(e.gun), d: gunDesc(e.gun) };
    const c = CLO[e.clo], sh = c.slot === 'shoes';
    return { ico: c.icon, sk: 'o:' + g + ':' + i, obj: e, g, i, n: c.name, d: cloTags(c) + '. ' + c.d + (sh ? ' ' + Math.ceil(e.hp) + ' % igjen.' : ''), dur: sh ? e.hp / 100 : null };
  });
}
// En plass på kroppen: plagget du har på deg, eller en tom plass med omrisset av det som hører hjemme der
function wearItem(sl) {
  const c = worn(sl), sh = sl === 'shoes';
  if (G.wear[sl] === CLO_NONE[sl]) return { ico: c.icon, empty: true, n: slotLab(sl), d: c.name + '. Dra ' + (sh ? 'sko' : 'et plagg') + ' hit fra utstyret for å ta ' + (sh ? 'dem' : 'det') + ' på.' };
  return { ico: c.icon, sk: 'clo:' + sl, g: 'wear', i: sl, n: c.name, d: cloTags(c) + '. ' + c.d + (sh ? ' ' + Math.ceil(G.shoeHp) + ' % igjen før de er utslitt.' : ''), dur: sh ? G.shoeHp / 100 : null };
}
// Verktøytipset ved pekeren: navnet, hva det er, og hva du kan gjøre med det. Uten it skjules det
function mcTip(it, x, y) {
  const t = $('mcTip');
  if (!it || invHeld) { t.hidden = true; t._it = null; return; }
  if (t._it !== it) {
    t._it = it; t.innerHTML = '';
    for (const [c, s] of [['n', it.n], ['d', it.d], ['h', it.hint]]) if (s) { const d = document.createElement('div'); d.className = c; d.textContent = s; t.appendChild(d); }
  }
  t.hidden = false;
  const w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = (x + 14 + w > innerWidth - 6 ? x - 14 - w : x + 14) + 'px'; t.style.top = clamp(y - 12, 6, innerHeight - h - 6) + 'px';
}
// Én rute, tom uten it. at er hvor ruta ligger ({ g, i }), og on(s, it, at) gir den mer å gjøre (i bua: selg, i
// inventaret: dra, slipp og klikk)
function mcSlot(it, on, at) {
  const s = document.createElement('div'); s.className = 'mc-slot';
  if (!it) { if (on && at) on(s, null, at); return s; }
  s.tabIndex = 0; s.setAttribute('aria-label', it.n + (it.c != null ? ': ' + it.c : ''));
  s.classList.toggle('on', !!it.on); s.classList.toggle('mc-empty', !!it.empty);
  s.innerHTML = `<img alt="" draggable="false" src="${ICONURL[it.ico]}">` + (it.c ? `<span class="mc-n">${it.lab ?? (it.c < 1e4 ? it.c : Math.floor(it.c / 1000) + 'k')}</span>` : '')
    // slitasje som i et klossespill: en strek nederst som går fra grønn til rød
    + (it.dur != null ? `<i class="mc-dur"><b style="width:${Math.round(clamp(it.dur, 0, 1) * 100)}%;background:hsl(${Math.round(clamp(it.dur, 0, 1) * 120)},70%,45%)"></b></i>` : '');
  s.onmouseenter = s.onmousemove = e => mcTip(it, e.clientX, e.clientY);
  s.onfocus = () => { const r = s.getBoundingClientRect(); mcTip(it, r.right - 8, r.top + 8); };
  s.onmouseleave = s.onblur = () => mcTip(null);
  if (on) on(s, it, at);
  return s;
}
// Nederst i inventaret står alltid hvor mye du bærer (kjøtt og ved hver for seg) og pengene dine
const sackTxt = () => 'Bærer ' + String(sackKg()).replace('.', ',') + ' av ' + fmtKg(sackCap())
  + (sackKg() > 0 ? ' · ' + [G.meat.length && 'kjøtt ' + fmtKg(meatKg()), G.wood && 'ved ' + fmtKg(G.wood * WOOD_KG)].filter(Boolean).join(', ') : '');
// Hele inventaret inn i root; redo tegner det på nytt (når du bytter fane). Med horse (teksten under lasten) står
// hesten til høyre, eller som en tredje fane ved siden av utstyret og kjøttet når horseTab er satt (i bua, der det
// ikke er plass til den under sekken)
function mcRender(root, on, redo, horse, horseTab) {
  const side = horse && !horseTab;
  if (invTab === 'horse' && !(horse && horseTab)) invTab = 'gear';
  const tab = invTab === 'meat' || invTab === 'horse' ? invTab : 'gear', L = upgName, held = ' (i hendene)';
  mcTip(null);
  root.innerHTML = `<div class="mc"><div class="mc-top"><div class="mc-me"><img alt="Jegeren" src="${ICONURL.hunter}"><div class="mc-name"></div></div>
    <div class="mc-eq"><div class="mc-lab">Bekledning</div><div class="mc-cross"></div></div>
    <div class="mc-eq"><div class="mc-lab">Våpen</div><div class="mc-row"></div><div class="mc-lab">Sekk</div><div class="mc-row"></div></div></div>
    <div class="mc-tabs" role="tablist"></div><div class="mc-store"><div class="mc-lab"></div><div class="mc-grid"></div><div class="mc-sum"></div></div>
    <div class="mc-foot"><span class="mc-kg"></span><span class="mc-krn"></span></div></div>`
    + (side ? '<div class="mc mc-horse"><div class="mc-lab"></div><div class="mc-grid"></div><div class="mc-sum"></div></div>' : '');
  root.querySelector('.mc-name').textContent = NET.name || 'Jeger';
  const [rw, rp] = root.querySelectorAll('.mc-row'), cross = root.querySelector('.mc-cross');
  // de to våpenplassene står der alltid; en tom plass viser omrisset av et våpen. Det i hendene er merket
  G.arms.forEach((g, i) => rw.appendChild(mcSlot(g ? { ico: GUNS[g].ico, sk: g, g: 'arms', i, n: gunLabel(g) + (g === G.gun ? held : ''), d: gunDesc(g) + ' Bytt mellom våpnene i hjulet (hold Q).', on: g === G.gun }
    : { ico: 'rifle', empty: true, n: 'Våpenplass', d: 'Dra et våpen hit fra utstyret for å ha det med deg. Du bytter mellom de to våpnene i hjulet (hold Q).' }, on, { g: 'arms', i })));
  // bekledningen i kors (rutene plasseres med grid-area etter navnet): hatt øverst, hansker, jakke og jaktkniv i midten,
  // så bukse og sko nederst. Skoene har en strek for hvor slitt de er. Kniven er utstyr fra smia og kan ikke dras
  for (const [sl] of CLO_SLOTS) { const s = mcSlot(wearItem(sl), on, { g: 'wear', i: sl }); s.style.gridArea = sl; cross.appendChild(s); }
  const kn = upg('knife'), ks = mcSlot({ ico: upgIco(kn), sk: 'knife', n: L('knife'), d: kn.d[lv('knife')] + (lv('knife') < kn.lv.length - 1 ? ' Bedre kniver får du kjøpt hos smeden i landsbyen.' : '') }, on);
  ks.style.gridArea = 'knife'; cross.appendChild(ks);
  rp.appendChild(mcSlot({ ico: 'pack', sk: 'pack', n: L('pack'), d: 'Rommer ' + fmtKg(ST.pack[lv('pack')]) + ' kjøtt og ved' + (lv('dogpack') ? ', og hunden bærer ' + fmtKg(ST.dogpack[lv('dogpack')]) + ' til' : '') + '. Du bærer ' + fmtKg(sackKg()) + '. Større sekker får du kjøpt i landsbyen.' }, on));
  const kgEl = root.querySelector('.mc-kg'); kgEl.textContent = sackTxt(); kgEl.classList.toggle('warn', sackFree() < 0.1);
  root.querySelector('.mc-krn').textContent = fmtKr(G.money);
  const tabs = root.querySelector('.mc-tabs');
  for (const [k, ico, lab] of [['gear', 'call', 'Utstyr'], ['meat', 'meat', 'Kjøtt' + (G.meat.length ? ' · ' + fmtKg(meatKg()) : '')], ...(horse && horseTab ? [['horse', '', 'Hesten']] : [])]) {
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'mc-tab'; bt.setAttribute('role', 'tab'); bt.setAttribute('aria-selected', invTab === k);
    bt.innerHTML = (ico ? `<img alt="" src="${ICONURL[ico]}">` : '') + '<span></span>'; bt.lastChild.textContent = lab;
    bt.onclick = () => { if (invTab === k) return; invTab = k; sfx.ui(); redo(); };
    tabs.appendChild(bt);
  }
  const horseTxt = () => 'Hesten · ' + String(horseKg()).replace('.', ',') + ' av ' + horseCap() + ' kg';
  const lab = root.querySelector('.mc-store .mc-lab'); lab.textContent = tab === 'horse' ? horseTxt() : ''; lab.hidden = tab !== 'horse';
  const grid = root.querySelector('.mc-grid'), S = gridItems(tab), sum = root.querySelector('.mc-sum');
  S.forEach((it, i) => grid.appendChild(mcSlot(it, on, { g: tab, i })));
  sum.textContent = invNote || (tab === 'horse' ? horse : tab === 'gear' ? '' : G.meat.length ? fmtKg(meatKg()) + ' i sekken · verdt ' + fmtKr(meatKr()) + ' på viltmottaket'
    : 'Ingen kjøtt. Vilt du feller og tar vare på (F), havner i sekken.');
  sum.classList.toggle('warn', !!invNote);
  if (side) {
    const box = root.querySelector('.mc-horse'), g = box.querySelector('.mc-grid');
    box.querySelector('.mc-lab').textContent = horseTxt();
    gridItems('horse').forEach((it, i) => g.appendChild(mcSlot(it, on, { g: 'horse', i })));
    box.querySelector('.mc-sum').textContent = horse;
  }
}
// Flytter ruta it til rute i i rutenettet g ('gear', 'meat' eller 'horse'; i < 0 er første ledige), eller til plassen i
// på kroppen når g er 'wear'. Gir tomt svar når det gikk, ellers hvorfor ikke
const cargoKey = k => !!k && (k.startsWith('meat:') || CARGO.includes(k));
function invDrop(it, g, i) {
  // et våpen opp i en våpenplass; det som lå der, havner der våpenet lå. To våpenplasser bytter plass
  if (g === 'arms') {
    if (it.g === 'arms') { [G.arms[i], G.arms[it.i]] = [G.arms[it.i], G.arms[i]]; return ''; }
    if (!it.obj || !it.obj.gun) return 'Bare våpen kan ligge i våpenplassene.';
    if (it.g === 'horse' && !horseNear()) return 'Hesten er for langt unna.';
    const was = G.arms[i]; G.arms[i] = it.obj.gun; G.slots[it.g][it.i] = was ? { gun: was } : null; armsFix(); return '';
  }
  // ta på et plagg; det du hadde på deg, havner der plagget lå
  if (g === 'wear') {
    if (it.g === 'wear') return it.i === i ? '' : 'Det passer ikke der.';
    if (!it.obj || !it.obj.clo || CLO[it.obj.clo].slot !== i) return 'Det passer ikke der. Bare ' + slotLab(i).toLowerCase() + ' kan ligge på den plassen.';
    G.slots[it.g][it.i] = takeOff(i); putOn(it.obj); return '';
  }
  // klær og våpen hører hjemme i utstyret, ikke i kjøttfanen
  if (g === 'meat' && (it.obj || it.g === 'wear' || it.g === 'arms')) { g = 'gear'; i = -1; }
  // et våpen ned fra våpenplassen: i ruta du slipper det (et våpen som ligger der, kommer opp i stedet), ellers første ledige
  if (it.g === 'arms') {
    const D = slotsOf(g), o = D[i];
    if (o && typeof o === 'object' && o.gun) { D[i] = { gun: G.arms[it.i] }; G.arms[it.i] = o.gun; armsFix(); return ''; }
    const j = i >= 0 && D[i] == null ? i : D.indexOf(null); if (j < 0) return g === 'horse' ? 'Hesten er full.' : 'Utstyret er fullt.';
    D[j] = { gun: G.arms[it.i] }; G.arms[it.i] = null; armsFix(); return '';
  }
  // ta av et plagg, eller bytt det med et av samme slag
  if (it.g === 'wear') {
    const D = slotsOf(g), o = D[i];
    if (o && typeof o === 'object' && o.clo && CLO[o.clo].slot === it.i) { D[i] = takeOff(it.i); putOn(o); return ''; }
    const j = i >= 0 && D[i] == null ? i : D.indexOf(null); if (j < 0) return g === 'horse' ? 'Hesten er full.' : 'Utstyret er fullt.';
    D[j] = takeOff(it.i); return '';
  }
  // innen samme rutenett bytter de to rutene plass
  if (it.g === g) { if (i >= 0) { const D = G.slots[g]; [D[i], D[it.i]] = [D[it.i], D[i]]; } return ''; }
  if (it.g !== 'horse' && g !== 'horse') return '';
  // mellom deg og hesten: plagg flyttes hele, og av resten så mye som får plass
  const toHorse = g === 'horse';
  if (it.obj) {
    if (!horseNear()) return 'Hesten er for langt unna.';
    const D = slotsOf(toHorse ? 'horse' : 'gear'), j = (toHorse || g === 'gear') && i >= 0 && D[i] == null ? i : D.indexOf(null);
    if (j < 0) return toHorse ? 'Hesten er full.' : 'Utstyret er fullt.';
    G.slots[it.g][it.i] = null; D[j] = it.obj; return '';
  }
  if (!cargoKey(it.key)) return 'Det blir med deg.';
  const r = moveCargo(it.key, toHorse); if (r) return r;
  const to = toHorse ? 'horse' : it.key.startsWith('meat:') ? 'meat' : 'gear', D = G.slots[to];
  if (to === g && i >= 0 && D[i] == null && !D.includes(it.key)) D[i] = it.key;
  return '';
}
// Det du henter fra hesten, vises i fanen det havner i
function invDo(it, g, i) {
  invNote = invDrop(it, g, i);
  if (invNote) sfx.deny(); else { sfx.kneel(); save(); if (it.g === 'horse' && g !== 'horse') invTab = it.key && it.key.startsWith('meat:') ? 'meat' : 'gear'; }
  renderInv();
}
// Klikk: ta av og på klær, og flytt til den andre siden når hesten står like ved
function invClick(it) {
  if (it.g === 'wear' || it.g === 'arms') return invDo(it, 'gear', -1);
  // et våpen i utstyret opp i en ledig våpenplass, eller i stedet for det du ikke har i hendene
  if (it.obj && it.obj.gun && it.g !== 'horse') return invDo(it, 'arms', G.arms[0] == null ? 0 : G.arms[1] == null ? 1 : G.arms.findIndex(a => a !== G.gun));
  if (it.obj) return it.g === 'horse' ? invDo(it, 'gear', -1) : invDo(it, 'wear', CLO[it.obj.clo].slot);
  if (horseNear() && cargoKey(it.key)) invDo(it, it.g === 'horse' ? 'gear' : 'horse', -1);
}
function invOn(s, it, at) {
  if (!at) return;
  s.ondragover = e => { if (!invDrag || invDrag === it) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; s.classList.add('over'); };
  s.ondragleave = () => s.classList.remove('over');
  s.ondrop = e => { if (!invDrag) return; e.preventDefault(); e.stopPropagation(); const d = invDrag; invDrag = null; invDo(d, at.g, at.i); };
  // klikk med noe på pekeren legger det i denne ruta (samme rute legger det tilbake)
  const put = () => { const d = invHeld; holdEnd(); if (d.g !== at.g || d.i !== at.i) invDo(d, at.g, at.i); else renderInv(); };
  if (!it || it.empty) { s.onclick = () => { if (invHeld) put(); }; return; }
  s.classList.toggle('held', !!invHeld && invHeld.g === at.g && invHeld.i === at.i);
  const near = horseNear(), other = it.g === 'horse' ? 'Shift+klikk tar det med deg.' : 'Shift+klikk legger det på hesten.';
  it.hint = 'Klikk for å ta det opp, og klikk der det skal ligge. ' + (it.g === 'wear' ? 'Shift+klikk tar det av.' : it.g === 'arms' ? 'Shift+klikk legger det i utstyret.'
    : it.obj && it.obj.gun && it.g !== 'horse' ? 'Shift+klikk tar det med i en våpenplass.' : it.obj ? it.g === 'horse' ? other : 'Shift+klikk tar det på.'
    : near && cargoKey(it.key) ? other : '');
  s.classList.add('move'); s.draggable = true;
  s.onclick = e => { if (invHeld) put(); else if (e.shiftKey) invClick(it); else { holdStart(it, e); s.classList.add('held'); } };
  s.onkeydown = e => { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); invClick(it); } };
  s.ondragstart = e => { holdEnd(); mcTip(null); invDrag = it; e.dataTransfer.setData('text/plain', it.n); e.dataTransfer.effectAllowed = 'move'; };
  s.ondragend = () => { invDrag = null; };
}
function renderInv() {
  const horse = horseNear(), root = $('invMc');
  mcRender(root, invOn, renderInv, horse && 'Shift+klikk på noe, eller dra det over, for å flytte det mellom deg og hesten.');
  // klikker du utenfor rutene med noe på pekeren, legges det tilbake (fanene kan du bytte mellom)
  root.onclick = e => { if (invHeld && !e.target.closest('.mc-slot, .mc-tab')) { holdEnd(); renderInv(); } };
  // slipper du noe ved siden av rutene på den andre siden, havner det i første ledige rute der
  root.querySelectorAll('.mc').forEach((box, i) => {
    const ok = () => invDrag && (invDrag.g === 'horse') !== (i === 1);
    box.ondragover = e => { if (!ok()) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    box.ondrop = e => { if (!ok()) return; e.preventDefault(); const d = invDrag; invDrag = null; invDo(d, i === 1 ? 'horse' : invTab, -1); };
  });
}
function openInv() {
  G.paused = true; G.panel = 'inv'; aimReset(); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  invNote = ''; renderInv(); $('inv').hidden = false; sfx.ui();
}

// ---------- hjulet ----------
// Hold Q: alt jegeren kan gjøre utenom å gå, sikte og skyte ligger i en ring midt på skjermen. Musa peker ut en
// handling, og den blir gjort når du slipper Q (eller klikker). Slipper du med pekeren i midten, skjer ingenting.
// Det som ikke går an akkurat nå, er blekt, og midten forteller hvorfor
const WHEEL = { open: false, x: 0, y: 0, sel: -1, items: [] }, WHEEL_R = 150, WHEEL_DEAD = 28;
function wheelItems() {
  const other = G.arms.find(a => a && a !== G.gun), out = D.st !== 'heel', L = [
    { ico: 'call', n: 'Lokk', ok: P.callCd <= 0, act: doCall,
      d: P.callCd > 0 ? 'Fløyta er klar om ' + Math.ceil(P.callCd) + ' s.' : upg('call').lv[lv('call')] + ' når ' + CALLSP[lv('call')].map(s => SPEC[s].name.toLowerCase()).join(', ') + '.' },
    { ico: 'scent', n: 'Luktstoff × ' + G.scents, ok: G.scents > 0, act: placeScent,
      d: G.scents > 0 ? 'Sett ut en flaske. Vinden tar lukta med seg.' : 'Tom for luktstoff. Kjøp mer i landsbyen.' },
    { ico: 'dog', n: out ? D.st === 'back' ? 'Hunden kommer' : 'Kall inn hunden' : 'Send ut hunden', ok: out ? D.st !== 'back' : G.treats > 0, act: sendDog,
      d: out ? 'Hunden kommer tilbake til foten.' : G.treats > 0 ? 'Hunden søker opp nærmeste dyr og står for det. ' + G.treats + ' godbiter igjen.' : 'Tom for godbiter. Kjøp flere i landsbyen.' },
    { ico: 'fire', n: 'Tenn bål', ok: G.wood > 0 && G.matches > 0, act: lightFire, d: G.wood + ' ved og ' + G.matches + ' fyrstikker. Et bål tar én av hver.' },
    { ico: 'hut', n: 'Bygg gapahuk', ok: !!lv('axe') && G.wood >= HUT_WOOD, act: buildHut,
      d: lv('axe') ? 'Tar ' + HUT_WOOD + ' ved. Du har ' + G.wood + '.' : 'Du trenger en øks. Kjøp en hos smeden i landsbyen.' },
    { ico: other ? GUNS[other].ico : 'rifle', n: other ? 'Ta ' + GUNS[other].the : 'Bytt våpen', ok: !!other, act: switchGun,
      d: other ? gunDesc(other) : 'Du har bare ett våpen i våpenplassene. Dra et til opp i inventaret (E).' },
    { ico: 'an_radyr', n: 'Jaktbok', ok: true, act: openBook, d: G.journal.length + ' dyr felt.' },
  ];
  if ([...NET.peers.values()].some(r => r.started)) L.push({ ico: 'hunter', n: 'Til en jeger', ok: !P.aim, act: goToHunter, d: 'Gå bort til en av de andre jegerne. Velg igjen for den neste.' });
  // har du hest, kan du kalle på den når den står innen HORSE_CALL
  if (lv('horse')) {
    const m = Math.round(hyp(HORSE.x - P.x, HORSE.y - P.y) * M_PER_PX), near = m <= HORSE_CALL * M_PER_PX;
    L.push({ ico: 'horse', n: HORSE.come ? 'Hesten kommer' : 'Kall på hesten', ok: !HORSE.on && !HORSE.come && near, act: horseCall,
      d: HORSE.on ? 'Du sitter på den.' : HORSE.come ? 'Hesten er på vei til deg.' : near ? 'Hesten kommer til deg. Den står ' + m + ' m unna.' : 'Hesten står ' + m + ' m unna. Den hører deg innen 100 m.' });
  }
  // på hesten går det ikke an å slå leir eller gå bort til en annen jeger
  if (HORSE.on) for (const it of L) if (it.ico === 'fire' || it.ico === 'hut' || it.ico === 'hunter') { it.ok = false; it.d = 'Gå av hesten først (F).'; }
  return L;
}
function wheelOpen() {
  if (!G.started || G.paused || P.aim || AIM.want || WHEEL.open) return;
  Object.assign(WHEEL, { open: true, x: 0, y: 0, sel: -2, items: wheelItems() });
  const box = $('wheelIts'), n = WHEEL.items.length; box.innerHTML = '';
  WHEEL.items.forEach((it, i) => {
    const a = -Math.PI / 2 + i * TAU / n, el = document.createElement('div');
    el.className = 'wh-it' + (it.ok ? '' : ' off'); el.style.left = Math.round(Math.cos(a) * WHEEL_R) + 'px'; el.style.top = Math.round(Math.sin(a) * WHEEL_R) + 'px';
    el.innerHTML = (i < 9 ? `<b class="wh-k">${i + 1}</b>` : '') + `<img alt="" src="${ICONURL[it.ico]}"><span></span>`; el.lastChild.textContent = it.n;
    box.appendChild(el);
  });
  // på små skjermer krymper hjulet så hele ringen får plass
  $('wheelRing').style.transform = `scale(${Math.min(1, Math.min(innerWidth, innerHeight) / 470)})`;
  wheelMove(0, 0); $('wheel').hidden = false;
}
// Pekeren i hjulet flyttes av musa og holdes innenfor ringen; retningen fra midten velger handlingen
function wheelMove(dx, dy) {
  WHEEL.x += dx; WHEEL.y += dy;
  const l = hyp(WHEEL.x, WHEEL.y), n = WHEEL.items.length;
  if (l > WHEEL_R) { WHEEL.x *= WHEEL_R / l; WHEEL.y *= WHEEL_R / l; }
  $('wheelDot').style.transform = `translate(${Math.round(WHEEL.x)}px, ${Math.round(WHEEL.y)}px)`;
  const sel = l < WHEEL_DEAD ? -1 : (Math.round((Math.atan2(WHEEL.y, WHEEL.x) + Math.PI / 2) / (TAU / n)) % n + n) % n;
  if (sel === WHEEL.sel) return;
  WHEEL.sel = sel; const it = WHEEL.items[sel];
  [...$('wheelIts').children].forEach((el, i) => el.classList.toggle('on', i === sel));
  setText('wheelN', it ? it.n : TOUCH.on ? 'Velg' : 'Velg med musa'); setText('wheelD', it ? it.d : TOUCH.on ? 'Trykk på det du vil gjøre, eller utenfor for å lukke.' : 'Slipp Q for å gjøre det du peker på.');
}
function wheelClose(run) {
  if (!WHEEL.open) return;
  WHEEL.open = false; $('wheel').hidden = true;
  const it = run && WHEEL.items[WHEEL.sel]; if (it) it.act();
}
// Alene fryser verden; med andre på nettet står jegeren stille mens tida går videre
function openPause() {
  if (!G.started || G.panel) return;
  wheelClose(false); G.paused = true; G.panel = 'pause'; G.pauseT = performance.now(); aimReset();
  try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  save(); setText('pauseNote', pauseNote()); plMenu(); $('pause').hidden = false; sfx.ui();
}
const pauseNote = () => 'Fremgangen din lagres automatisk i denne nettleseren.' + (mp() ? ' Andre jegere er i skogen, så tida går videre.' : '');
// Tastene og spillerne er egne vinduer over pausen; «Tilbake» eller Esc går tilbake til pausemenyen
const PAUSE_SUB = ['keysSheet', 'plSheet'];
function pauseSub(id) { $('pause').hidden = true; G.panel = id; $(id).hidden = false; sfx.ui(); }
function pauseBack() {
  if (!PAUSE_SUB.includes(G.panel)) return;
  $(G.panel).hidden = true; G.panel = 'pause'; setText('pauseNote', pauseNote()); plMenu(); $('pause').hidden = false; sfx.ui();
}
function resume() { closePanel(); if (!G.panel) lockPointer(); }
function closePanel() {
  if (!G.panel) return; holdEnd(); mcTip(null); $(G.panel).hidden = true; G.panel = null; G.paused = false; sfx.ui();
  if (NOTES.length) notice(...NOTES.shift());
}
// Beskjed midt på skjermen som må lukkes (OK, Enter eller Esc): tittel, tekst og en liten forklaring under.
// Er et annet panel oppe, venter den til det er lukket
const NOTES = [];
function notice(title, text, sub) {
  if (G.panel) { NOTES.push([title, text, sub]); return; }
  G.paused = true; G.panel = 'notice'; aimReset(); wheelClose(false); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  setText('noticeT', title); setText('noticeD', text); setText('noticeS', sub || '');
  $('notice').hidden = false; sfx.deny(); $('noticeOk').focus();
}

// ---------- samtaler ----------
// Det den du snakker med, sier, står i en boks nederst, én replikk om gangen. F, Enter, Space eller et trykk går videre
const TALK = { lines: [], i: 0 };
function talk(who, lines) {
  if (G.panel) return;
  G.paused = true; G.panel = 'talk'; aimReset(); wheelClose(false); try { document.exitPointerLock && document.exitPointerLock(); } catch (e) { }
  TALK.lines = lines; TALK.i = -1; setText('talkWho', who); $('talk').hidden = false; talkNext();
}
function talkNext() {
  if (++TALK.i >= TALK.lines.length) return resume();
  setText('talkTxt', TALK.lines[TALK.i]); sfx.ui();
}

// ---------- start ----------
// Utenfor døra på bua, med hesten ved stallen: der et nytt spill begynner
function spawnHome() { P.x = PLACES[0].door[0] + PLACES[0].out[0] * 8; P.y = PLACES[0].door[1] + PLACES[0].out[1] * 8; P.face = 'down'; P.flip = false; CAM.x = P.x; CAM.y = P.y - 30; horsePark(); }
function startGame(fresh) {
  if (fresh) { spawnHome(); G.money = 0; for (const u of UPG) G.up[u.id] = 0; G.scents = 2; G.treats = TREAT_START; G.wood = G.matches = 0; G.rounds = AMMO.rifle.start; G.shells = 0; G.meat = []; G.rack = []; for (const k of CARGO) G.cargo[k] = 0; G.slots = { gear: [], meat: [], horse: [] }; G.arms = ['rifle', null]; G.gun = 'rifle'; G.arrows = 0; G.wear = { ...CLO_START }; G.shoeHp = 100; healFull(); G.huts = []; G.cut = new Set(); seenUnpack(''); chunks.clear(); G.journal = []; G.quest = null; G.qd = { day: 0, used: [] }; G.xp = 0; G.story = 0; G.sst = 0; if (!mp()) { G.day = 1; G.hour = 6.6; G.animals = []; } save(); }
  netSetName(); auInit(); G.started = true; G.paused = false; $('title').hidden = true; netAway();
  armsFix();
  // alle patronene ligger i sekken når du starter (lagringen tar med dem som satt i våpnene)
  for (const g in P.mag) P.mag[g] = 0; refill(); dogReset();
  const [s, d] = windName();
  msg('Vinden kommer ' + d + '. Gå mot vinden, så kjenner ikke dyrene lukta di.');
  if (TOUCH.on) {
    msg('Styr med venstre tommel der du setter den ned. Skyv helt fram for å springe.');
    msg('Sikt tar børsa opp, og Skyt fyrer av. Dra fingeren over bildet for å flytte siktet.');
    msg('Hjul har lokk, luktstoff, hund, bål og mer.');
  } else {
    msg('Høyreklikk for å sikte, venstreklikk for å skyte. E åpner inventaret.');
    msg('Hold Q for hjulet: lokk, luktstoff, hund, bål og mer. Pek med musa og slipp Q.');
  }
  msg('Hunden følger deg. Send den ut fra hjulet for å finne dyr; den spiser en godbit hver gang den står for et.');
  lockPointer();
}
function lockPointer() { try { const r = cv.requestPointerLock && cv.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }

// ---------- berøring ----------
// På telefon styrer venstre tommel med en spak der du setter den ned (helt fram er spring), og å dra over resten av
// bildet flytter siktet. Knappene nede til høyre sikter, skyter, lader, sniker og åpner hjulet, der du trykker på det
// du vil gjøre. t er når skjermen sist ble rørt, så musehendelsene nettleseren lager av et trykk, kan ses bort fra
const TOUCH = { on: false, t: -1e9, stick: null, look: null }, STICK_R = 48;
function touchOn() {
  if (TOUCH.on) return;
  TOUCH.on = true; document.body.classList.add('touch'); touchPoint();
  document.querySelectorAll('.tbtn, .xbtn, #noticeOk').forEach(bt => bt.textContent = bt.textContent.replace(/ \(.*\)/, ''));
}
// uten mus peker du rett fram: dit går skuddet fra hofta, og dit ser du når du tar børsa opp
function touchPoint() { MOUSE.x = W / 2; MOUSE.y = H * 0.3; }
function stickSet(dx, dy) {
  const l = Math.max(1, hyp(dx, dy) / STICK_R), x = dx / STICK_R / l, y = dy / STICK_R / l;
  STICK.x = Math.abs(x) < 0.25 ? 0 : x; STICK.y = y < -0.3 ? -1 : y > 0.5 ? 1 : 0; STICK.run = y < -0.6 && hyp(x, y) > 0.95;
  $('stick').firstChild.style.transform = `translate(${x * STICK_R}px, ${y * STICK_R}px)`;
}
function stickEnd() { TOUCH.stick = null; STICK.x = STICK.y = 0; STICK.run = false; $('stick').hidden = true; }
function bindTouch() {
  if (matchMedia('(pointer: coarse)').matches) touchOn();
  for (const ev of ['touchstart', 'touchend']) addEventListener(ev, () => { TOUCH.t = performance.now(); touchOn(); }, { capture: true, passive: true });
  cv.addEventListener('touchstart', e => {
    e.preventDefault(); auInit();
    if (!G.started || G.paused) return;
    for (const t of e.changedTouches) {
      if (!TOUCH.stick && t.clientX < innerWidth / 2) {
        TOUCH.stick = { id: t.identifier, x: t.clientX, y: t.clientY };
        const el = $('stick'); el.style.left = t.clientX + 'px'; el.style.top = t.clientY + 'px'; el.hidden = false; stickSet(0, 0);
      } else if (!TOUCH.look) TOUCH.look = { id: t.identifier, x: t.clientX, y: t.clientY };
    }
  }, { passive: false });
  cv.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const s = TOUCH.stick, l = TOUCH.look;
      if (s && t.identifier === s.id) stickSet(t.clientX - s.x, t.clientY - s.y);
      else if (l && t.identifier === l.id) {
        if (P.aim || AIM.want) aimLook((t.clientX - l.x) * DPR, (t.clientY - l.y) * DPR);
        l.x = t.clientX; l.y = t.clientY;
      }
    }
  }, { passive: false });
  const end = e => { for (const t of e.changedTouches) { if (TOUCH.stick && t.identifier === TOUCH.stick.id) stickEnd(); if (TOUCH.look && t.identifier === TOUCH.look.id) TOUCH.look = null; } };
  cv.addEventListener('touchend', end); cv.addEventListener('touchcancel', end);
  // det som haster, skjer idet fingeren treffer knappen; det som åpner noe, først når den slippes, så trykket ikke
  // går videre til det som kommer opp under den
  const tap = (id, fn, ev = 'pointerdown') => $(id).addEventListener(ev, e => { e.preventDefault(); auInit(); if (G.started && !G.paused && !WHEEL.open) fn(); });
  tap('tcAim', () => AIM.want ? aimRelease() : aimPress());
  tap('tcFire', () => { if (P.aim || !AIM.want) shoot(); });
  tap('tcLoad', startReload);
  tap('tcSneak', () => { STICK.sneak = !STICK.sneak; $('tcSneak').setAttribute('aria-pressed', STICK.sneak); });
  tap('tcWheel', wheelOpen, 'click');
  tap('prompt', () => { if (!P.aim && !AIM.want) interact(); }, 'click');
  const hold = $('tcHold');
  hold.onpointerdown = e => { e.preventDefault(); STICK.hold = true; }; hold.onpointerup = hold.onpointercancel = hold.onpointerleave = () => { STICK.hold = false; };
  $('wheel').onclick = e => { const el = e.target.closest('.wh-it'); if (el) WHEEL.sel = [...el.parentNode.children].indexOf(el); wheelClose(!!el); };
}

// ---------- input ----------
// Hvor mye jegeren snur seg på kartet per piksel musa flyttes sidelengs (radianer)
const MOUSE_TURN = 0.004;
function bindInput() {
  bindTouch();
  addEventListener('keydown', e => {
    // glidebryteren i bua styres med piltastene; Esc lukker fortsatt
    if (e.target.type === 'range' && e.code !== 'Escape') return;
    if (e.target.tagName === 'INPUT' && e.target.type !== 'range') { if (e.code === 'Enter' && !G.started) startGame(false); return; }
    if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    // Esc/P: pause og fortsett (Esc lukker også bua og jaktboka). Håndteres før KEYS fordi
    // nettleseren kan svelge keyup for Esc når den slipper musepekeren.
    if (G.started && !e.repeat && (e.code === 'Escape' || e.code === 'KeyP')) {
      if (G.panel === 'pause') { if (performance.now() - G.pauseT > 300) resume(); }
      else if (PAUSE_SUB.includes(G.panel)) pauseBack();
      else if (G.panel) { if (e.code === 'Escape') closePanel(); }
      else openPause();
      return;
    }
    // Enter eller Space lukker en beskjed og går rett tilbake til spillet
    if (G.panel === 'notice' && !e.repeat && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); resume(); return; }
    if (G.panel === 'talk' && !e.repeat && (e.code === 'KeyF' || e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); talkNext(); return; }
    if (KEYS[e.code]) return; KEYS[e.code] = true;
    if (!G.started) { if (e.code === 'Enter') startGame(false); return; }
    if (G.panel === 'inv' && e.code === 'KeyE') { closePanel(); return; }
    if (G.panel === 'mapSheet' && e.code === 'KeyM') { closePanel(); return; }
    // mens hjulet er oppe, kan du gå, men ikke gjøre noe annet
    if (G.panel || WHEEL.open) return;
    // bare de faste tastene; resten ligger i hjulet (hold Q)
    switch (e.code) {
      case 'KeyR': startReload(); break;
      // i siktet skyter F, akkurat som venstreklikk; ellers er F handling
      case 'KeyF': if (P.aim) shoot(); else if (!AIM.want) interact(); break;
      case 'KeyE': openInv(); break;
      case 'KeyM': openMap(); break;
      case 'KeyQ': wheelOpen(); break;
      // talltastene gjør det samme som plassene i hjulet, i samme rekkefølge
      default: {
        const m = /^Digit([1-9])$/.exec(e.code), it = m && !G.paused && !P.aim && !AIM.want && wheelItems()[m[1] - 1];
        if (it) { if (it.ok) it.act(); else { sfx.deny(); msg(it.d); } }
      }
    }
  });
  addEventListener('keyup', e => { KEYS[e.code] = false; if (e.code === 'Space') P.hold = false; if (e.code === 'KeyQ') wheelClose(true); });
  addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; wheelClose(false); aimReset(); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('mousedown', e => {
    e.preventDefault(); auInit();
    if (!G.started || G.paused || performance.now() - TOUCH.t < 800) return;
    if (!MOUSE.locked) lockPointer();
    // i hjulet velger venstreklikk det du peker på, høyreklikk lukker det
    if (WHEEL.open) { wheelClose(e.button === 0); return; }
    if (e.button === 2) aimPress();
    // mens børsa er på vei opp, går det ikke an å skyte
    else if (e.button === 0 && (P.aim || !AIM.want)) shoot();
  });
  addEventListener('mouseup', e => { if (e.button === 2) aimRelease(); });
  addEventListener('mousemove', e => {
    if (performance.now() - TOUCH.t < 800) return;
    if (WHEEL.open) { wheelMove(e.movementX, e.movementY); return; }
    // til fots på kartet snur musa sidelengs jegeren og bildet; pekeren står midt i bildet og flyttes bare fram og tilbake
    if (G.started && !G.paused && !HORSE.on && !P.aim && !AIM.want) { P.h += e.movementX * MOUSE_TURN; MOUSE.x = W / 2; MOUSE.y = clamp(MOUSE.y + e.movementY * DPR, 0, H); }
    else if (MOUSE.locked) { MOUSE.x = clamp(MOUSE.x + e.movementX * DPR, 0, W); MOUSE.y = clamp(MOUSE.y + e.movementY * DPR, 0, H); }
    else { MOUSE.x = e.clientX * DPR; MOUSE.y = e.clientY * DPR; }
    // i siktet og i 3D-visningen snur musa blikket
    if (P.aim || AIM.want) aimLook(e.movementX * DPR, e.movementY * DPR);
  });
  document.addEventListener('pointerlockchange', () => {
    MOUSE.locked = document.pointerLockElement === cv; document.body.classList.toggle('locked', MOUSE.locked);
    if (!MOUSE.locked && G.started && !G.panel) openPause();
  });
  // lagre når siden lukkes eller skjules
  addEventListener('pagehide', () => { if (G.started) save(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.started) save(); });
  addEventListener('resize', () => { resize(); if (TOUCH.on) touchPoint(); });
  // det du drar fra venstre side, kan slippes hvor som helst på butikkens side og selges da
  const sm = $('shopMain');
  sm.ondragenter = sm.ondragover = e => { if (!dragKey) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; sm.classList.add('over'); };
  sm.ondragleave = e => { if (!sm.contains(e.relatedTarget)) sm.classList.remove('over'); };
  sm.ondrop = e => { e.preventDefault(); const k = dragKey; dragDone(); if (k) sellClick(k, true); };
  document.querySelectorAll('[data-close]').forEach(bt => bt.onclick = closePanel);
  $('sleepBtn').onclick = () => { if (mp()) return; sleepToDawn('Du sov godt. Det lysner over skogen.'); closePanel(); };
  $('startBtn').onclick = () => startGame(false);
  $('pauseBtn').onclick = () => openPause();
  $('resumeBtn').onclick = () => { auInit(); resume(); }; $('noticeOk').onclick = resume; $('talk').onclick = talkNext;
  $('keysBtn').onclick = () => pauseSub('keysSheet');
  $('plBtn').onclick = () => { plList(); pauseSub('plSheet'); };
  document.querySelectorAll('[data-back]').forEach(bt => bt.onclick = pauseBack);
  // MIDLERTIDIG juksekode for testing: fjern knappen (#cheatBtn i shell.html) og denne linja før utgivelse
  $('cheatBtn').onclick = () => { G.money += 1000; sfx.coin(); msg('Juks: +' + fmtKr(1000), 'money'); save(); };
  $('quitBtn').onclick = () => { save(); location.reload(); };
  $('newBtn').onclick = () => { const bt = $('newBtn'); if (bt.dataset.arm) startGame(true); else { bt.dataset.arm = 1; bt.textContent = 'Sikker? Trykk igjen'; } };
  $('muteBtn').onclick = () => { auInit(); auMute(!AU.muted); $('muteBtn').setAttribute('aria-pressed', AU.muted); };
  $('bookBtn').onclick = () => { if (G.started && !G.panel) openBook(); };
  $('invBtn').onclick = () => { if (G.started && !G.panel) openInv(); };
  $('mapBtn').onclick = () => { if (G.started && !G.panel) openMap(); };
}

// ---------- oppstart ----------
function boot() {
  cv = $('cv'); m = cv.getContext('2d');
  buf = document.createElement('canvas'); b = buf.getContext('2d');
  genAll(); glInit();
  for (const k in ICON) ICONURL[k] = dataURL(ICON[k]);
  for (const sp of SPECIES) ICONURL['an_' + sp] = dataURL(cropSprite(ANI[sp].m.stand[0], 2));
  // jegeren forfra (inventaret, «til en jeger») og bakfra (3D), hunden og gapahuken til hjulet
  ICONURL.hunter = dataURL(cropSprite(HUN.down[0][0], 2)); ICONURL.back = dataURL(cropSprite(HUN.up[0][0], 2));
  ICONURL.dog = dataURL(cropSprite(DOGSPR.stand[0], 1)); ICONURL.hut = dataURL(cropSprite(FX.hut, 1));
  for (const k of ['house', 'horse', 'dog', 'deer']) $('leg_' + k).src = dataURL(FX[k]);
  $('windArrow').src = dataURL(FX.arrow); $('callIco').src = ICONURL.call; $('scentIco').src = ICONURL.scent; $('treatIco').src = ICONURL.treat; $('campIco').src = ICONURL.pack;
  spawnHome();
  const has = load();
  if (has) {
    $('startBtn').textContent = 'Fortsett jakt'; $('newBtn').hidden = false;
    setText('saveTxt', 'Lagret jakt: dag ' + G.day + ' · ' + fmtKr(G.money) + ' · ' + G.journal.length + ' dyr felt'); $('saveTxt').hidden = false;
  }
  resize(); bindInput(); netInit();
  // noen dyr i nærheten av bua fra start
  for (let i = 0; i < 3; i++) { const a = rnd(0, TAU), d = rnd(260, 420); const x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d; if (!isWater(x, y) && nearestCabin(x, y).d > 220) spawnAnimal(i === 0 ? 'radyr' : pickSpecies(x, y), x, y); }
  $('loading').hidden = true; $('titleBtns').hidden = false;
  devResume();
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); render(dt); hudUpdate(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
setTimeout(boot, 30);
