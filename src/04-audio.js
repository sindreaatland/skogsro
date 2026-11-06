// ===== Lyd: alt syntetiseres med WebAudio, ingen lydfiler =====
const AU = { ctx: null, muted: false, pianoT: 2, birdT: 2, padT: 0, ch: -1, mi: 3 };
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  let c;
  try { c = AU.ctx = new AC(); } catch (e) { return; }
  AU.master = c.createGain(); AU.master.gain.value = 0.75; AU.master.connect(c.destination);
  // ekko gir skogklang
  AU.echoIn = c.createGain(); AU.echoIn.gain.value = 0.5;
  const dl = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter();
  dl.delayTime.value = 0.33; fb.gain.value = 0.45; lp.type = 'lowpass'; lp.frequency.value = 1700;
  AU.echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(AU.master);
  // romklang til pianoet: en støyhale som dør ut over tre sekunder
  const ir = c.createBuffer(2, c.sampleRate * 3, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4); }
  AU.verbIn = c.createConvolver(); AU.verbIn.buffer = ir;
  const vg = c.createGain(); vg.gain.value = 0.35; AU.verbIn.connect(vg); vg.connect(AU.master);
  const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = nb;
  // vindsus
  const ws = c.createBufferSource(); ws.buffer = nb; ws.loop = true;
  const wf = c.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 360; wf.Q.value = 0.5;
  AU.windG = c.createGain(); AU.windG.gain.value = 0.03; ws.connect(wf); wf.connect(AU.windG); AU.windG.connect(AU.master); ws.start();
  AU.windF = wf;
  // lav drone under musikken
  AU.pad = c.createGain(); AU.pad.gain.value = 0.0001; AU.pad.connect(AU.master);
  for (const f of [73.42, 110, 146.83]) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = c.createGain(); g.gain.value = f < 100 ? 0.5 : 0.25; o.connect(g); g.connect(AU.pad); o.start(); }
}
function auEnv(g, t, att, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + att + dur); }
function auOut(node, o) {
  const c = AU.ctx; let out = node;
  if (o && o.pan != null && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = o.pan; node.connect(p); out = p; }
  out.connect(AU.master); if (o && o.echo) out.connect(AU.echoIn); if (o && o.verb) out.connect(AU.verbIn);
}
function auTone(type, f0, f1, dur, vol, o) {
  if (!AU.ctx || AU.muted) return; o = o || {};
  const c = AU.ctx, t = c.currentTime + (o.delay || 0), os = c.createOscillator(), g = c.createGain(), att = o.att || 0.012;
  os.type = type; os.frequency.setValueAtTime(f0, t); if (f1) os.frequency.exponentialRampToValueAtTime(f1, t + att + dur);
  auEnv(g, t, att, vol, dur); os.connect(g); auOut(g, o); os.start(t); os.stop(t + att + dur + 0.1);
}
function auNoise(dur, vol, ftype, f0, f1, q, o) {
  if (!AU.ctx || AU.muted) return; o = o || {};
  const c = AU.ctx, t = c.currentTime + (o.delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), att = o.att || 0.004;
  s.buffer = AU.noise; s.loop = true; f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 0.8;
  auEnv(g, t, att, vol, dur); s.connect(f); f.connect(g); auOut(g, o); s.start(t, Math.random()); s.stop(t + att + dur + 0.15);
}
const sfx = {
  shot(supp, k = 1) {
    const v = [1, 0.55, 0.32, 0.18][supp] * k, e = supp < 2;
    auNoise(0.05, 0.7 * v, 'highpass', 2200, 0, 0.7, { echo: e });
    auNoise(0.45 - supp * 0.08, 0.9 * v, 'lowpass', 5200 - supp * 900, 260, 0.7, { echo: e });
    auTone('sine', 150, 42, 0.26, 0.8 * v, {});
    if (supp < 3) auNoise(1.6, 0.1 * v, 'lowpass', 900, 200, 0.5, { delay: 0.25, att: 0.2, echo: true });
  },
  bolt() { auNoise(0.03, 0.14, 'highpass', 3200, 0, 1); auNoise(0.035, 0.16, 'bandpass', 2400, 0, 2, { delay: 0.16 }); },
  reload() { auNoise(0.03, 0.12, 'bandpass', 1800, 0, 2); auNoise(0.03, 0.14, 'highpass', 3000, 0, 1, { delay: 0.22 }); auNoise(0.04, 0.16, 'bandpass', 2600, 0, 2, { delay: 0.38 }); },
  step(sneak, wet) { if (wet) auNoise(0.12, 0.05, 'bandpass', 1500 + Math.random() * 600, 700, 0.8); else auNoise(0.05, sneak ? 0.014 : 0.035, 'bandpass', 700 + Math.random() * 500, 0, 1.1); },
  call(lv, k = 1) {
    if (lv === 0) for (let i = 0; i < 3; i++) auTone('sine', 1850, 2300, 0.2, 0.09 * k, { delay: i * 0.34, echo: true, att: 0.03 });
    else if (lv === 1) { auTone('triangle', 150, 96, 1.0, 0.16 * k, { echo: true, att: 0.12 }); auTone('sine', 300, 190, 1.0, 0.05 * k, { echo: true, att: 0.12 }); }
    else if (lv === 2) for (let i = 0; i < 2; i++) { auTone('triangle', 270, 170, 0.7, 0.14 * k, { delay: i * 1.0, echo: true, att: 0.15 }); auTone('sine', 540, 330, 0.7, 0.03 * k, { delay: i * 1.0, echo: true, att: 0.15 }); }
    else { auTone('triangle', 210, 120, 1.1, 0.15 * k, { echo: true, att: 0.15 }); for (let i = 0; i < 2; i++) auTone('sine', 1700, 2200, 0.2, 0.06 * k, { delay: 1.3 + i * 0.3, echo: true, att: 0.03 }); }
  },
  answer() { auTone('triangle', 230, 150, 0.5, 0.035, { delay: 1.4, echo: true, pan: Math.random() * 1.6 - 0.8, att: 0.1 }); },
  thud() { auTone('sine', 95, 44, 0.2, 0.4); auNoise(0.12, 0.12, 'lowpass', 500, 120, 0.7); },
  bark() { auNoise(0.07, 0.3, 'bandpass', 800, 300, 1.4, { echo: true }); },
  coin() { auTone('sine', 587.3, 0, 0.7, 0.09, { echo: true }); auTone('sine', 880, 0, 0.9, 0.07, { delay: 0.13, echo: true }); auTone('sine', 1174.7, 0, 1.1, 0.04, { delay: 0.26, echo: true }); },
  ui() { auTone('square', 620, 0, 0.035, 0.02); },
  buy() { auTone('triangle', 523.3, 0, 0.18, 0.08); auTone('triangle', 784, 0, 0.3, 0.08, { delay: 0.09 }); },
  deny() { auTone('triangle', 196, 150, 0.16, 0.07); },
  scent() { auNoise(0.03, 0.12, 'bandpass', 1300, 0, 3); auNoise(0.25, 0.05, 'highpass', 4200, 0, 0.7, { delay: 0.1, att: 0.05 }); },
};
// Myk filtpiano: noen få deltoner gjennom et lavpass som lukker seg, og en lang hale i romklangen
function auPiano(f, delay, vol) {
  if (!AU.ctx || AU.muted) return;
  const c = AU.ctx, t = c.currentTime + delay, dur = clamp(5.5 - f / 150, 2.5, 5), lp = c.createBiquadFilter(), g = c.createGain();
  lp.type = 'lowpass'; lp.Q.value = 0.4; lp.frequency.setValueAtTime(Math.min(f * 5, 3000), t); lp.frequency.setTargetAtTime(f * 1.5, t + 0.02, 0.5);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.setTargetAtTime(vol * 0.4, t + 0.015, 0.15); g.gain.setTargetAtTime(0.0001, t + 0.4, dur / 5);
  // [deltone, styrke, cent]: grunntonen to ganger, litt forstemt, gir den svake svevingen et piano har
  for (const [r, a, cents] of [[1, 0.45, 0], [1, 0.25, 5], [2, 0.22, 2], [3, 0.08, 0], [4, 0.03, 3]]) {
    const o = c.createOscillator(), og = c.createGain(); o.frequency.value = f * r; o.detune.value = cents; og.gain.value = a;
    o.connect(og); og.connect(lp); o.start(t); o.stop(t + 0.4 + dur);
  }
  lp.connect(g); auOut(g, { pan: clamp((f - 260) / 600, -0.35, 0.35), verb: true });
}
// Rolig bakgrunn: piano over sakte akkorder i d-moll, fugler om dagen
const PIANO_CH = [[146.83, 220, 349.23], [116.54, 174.61, 293.66], [87.31, 130.81, 220], [130.81, 196, 293.66]]; // Dm, B♭, F, C
const PIANO_MEL = [293.66, 349.23, 392, 440, 523.25, 587.33, 698.46]; // D4 F4 G4 A4 C5 D5 F5
// Én takt: akkorden brutt opp nedenfra, så noen få melodinoter som vandrer i skalaen
function pianoBar(bar) {
  AU.ch = AU.ch > 0 && Math.random() < 0.25 ? 0 : (AU.ch + 1) % 4;
  let t = 0;
  for (const f of PIANO_CH[AU.ch]) { auPiano(f, t, 0.06); t += rnd(0.35, 0.7); }
  if (Math.random() < 0.2) return;
  t = rnd(2, 3);
  for (let n = 1 + ((Math.random() * 4) | 0); n > 0 && t < bar - 1; n--) {
    auPiano(PIANO_MEL[AU.mi], t, 0.08);
    AU.mi = clamp(AU.mi + ((Math.random() * 5) | 0) - 2, 0, PIANO_MEL.length - 1);
    t += [0.7, 1, 1.4, 2][(Math.random() * 4) | 0];
  }
}
function auAmbient(dt, dayl, windS) {
  const c = AU.ctx; if (!c) return;
  AU.windG.gain.setTargetAtTime(AU.muted ? 0 : 0.014 + 0.03 * windS, c.currentTime, 0.8);
  AU.pad.gain.setTargetAtTime(AU.muted ? 0.0001 : 0.022 + 0.012 * Math.sin(c.currentTime * 0.07), c.currentTime, 1.5);
  if (AU.muted) return;
  AU.pianoT -= dt;
  if (AU.pianoT <= 0) { const bar = rnd(8, 11); pianoBar(bar); AU.pianoT = bar; }
  // Bare korte, høye kvitter: ingenting i bakgrunnen skal kunne forveksles med lokkefløyta
  AU.birdT -= dt;
  if (AU.birdT <= 0) {
    AU.birdT = rnd(2, 8);
    if (dayl > 0.4) { const f = rnd(3200, 5600), n = 3 + ((Math.random() * 5) | 0), pan = rnd(-0.9, 0.9), gap = rnd(0.06, 0.1); for (let k = 0; k < n; k++) auTone('sine', f * rnd(0.9, 1.1), f * rnd(0.75, 1.35), rnd(0.025, 0.06), 0.016, { delay: k * gap, pan, att: 0.008 }); }
  }
}
function auMute(m) { AU.muted = m; if (AU.ctx) AU.master.gain.setTargetAtTime(m ? 0 : 0.75, AU.ctx.currentTime, 0.05); }
