// ===== Lyd: alt syntetiseres med WebAudio, ingen lydfiler =====
const AU = { ctx: null, muted: false, noteT: 3, birdT: 2, padT: 0 };
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
  out.connect(AU.master); if (o && o.echo) out.connect(AU.echoIn);
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
// Rolig bakgrunn: spredte toner i d-moll pentaton, fugler om dagen, ugle om natta
const NOTES = [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23, 392, 440, 523.25];
function auAmbient(dt, dayl, windS) {
  const c = AU.ctx; if (!c) return;
  AU.windG.gain.setTargetAtTime(AU.muted ? 0 : 0.014 + 0.03 * windS, c.currentTime, 0.8);
  AU.pad.gain.setTargetAtTime(AU.muted ? 0.0001 : 0.022 + 0.012 * Math.sin(c.currentTime * 0.07), c.currentTime, 1.5);
  if (AU.muted) return;
  AU.noteT -= dt;
  if (AU.noteT <= 0) {
    const n = 1 + ((Math.random() * 3) | 0); let i = (Math.random() * NOTES.length) | 0;
    for (let k = 0; k < n; k++) {
      const f = NOTES[i]; auTone('sine', f, 0, 3.2, 0.045, { delay: k * rnd(0.45, 0.9), echo: true, att: 0.04 }); auTone('sine', f * 2, 0, 1.6, 0.012, { delay: k * 0.7, att: 0.04 });
      i = clamp(i + ((Math.random() * 5) | 0) - 2, 0, NOTES.length - 1);
    }
    AU.noteT = rnd(5, 11);
  }
  AU.birdT -= dt;
  if (AU.birdT <= 0) {
    if (dayl > 0.4) { const f = rnd(2400, 4600), n = 2 + ((Math.random() * 4) | 0), pan = rnd(-0.9, 0.9), gap = rnd(0.09, 0.16); for (let k = 0; k < n; k++) auTone('sine', f * rnd(0.9, 1.1), f * rnd(0.8, 1.3), rnd(0.05, 0.11), 0.018, { delay: k * gap, pan, att: 0.01 }); AU.birdT = rnd(2, 8); }
    else { auTone('sine', 370, 345, 0.3, 0.03, { echo: true, att: 0.06 }); auTone('sine', 365, 330, 0.5, 0.03, { delay: 0.55, echo: true, att: 0.06 }); AU.birdT = rnd(10, 22); }
  }
}
function auMute(m) { AU.muted = m; if (AU.ctx) AU.master.gain.setTargetAtTime(m ? 0 : 0.75, AU.ctx.currentTime, 0.05); }
