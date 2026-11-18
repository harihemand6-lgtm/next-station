// Sound: everything is synthesised with the Web Audio API (no audio files, nothing to download).
// Phones only allow audio after the first tap, so the engine starts on the first pointer/key event.
// AE_SOUND.sfx(name), .ambience({...}), .engine(type, speed), .music(on), .cycle() for the speaker button.
window.AE_SOUND = (function () {
  let an = null, ctx = null, master, sfxG, ambG, musG, comp, noiseBuf = null, started = false;
  const pref = (() => { try { return Object.assign({ on: true, music: true }, JSON.parse(localStorage.getItem("ns.sound") || "{}")); } catch (e) { return { on: true, music: true }; } })();
  const savePref = () => { try { localStorage.setItem("ns.sound", JSON.stringify(pref)); } catch (e) { } };
  const now = () => ctx.currentTime;
  function start() {
    if (started) { if (ctx && ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    started = true;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = pref.on ? 0.9 : 0; master.connect(comp);
    an = ctx.createAnalyser(); an.fftSize = 2048; comp.connect(an);
    sfxG = ctx.createGain(); sfxG.gain.value = 1.5; sfxG.connect(master);
    ambG = ctx.createGain(); ambG.gain.value = 0.9; ambG.connect(master);
    musG = ctx.createGain(); musG.gain.value = pref.music ? 0.5 : 0; musG.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startAmbience(); if (wantMusic) startMusic();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, start, { passive: true }));
  document.addEventListener("visibilitychange", () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (pref.on) ctx.resume(); });
  const ok = () => ctx && pref.on && ctx.state === "running";

  // ── building blocks ──
  function tone(f, dur, o) {
    o = o || {}; const t = (o.at || now()), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
    if (o.detune) osc.detune.value = o.detune;
    const v = o.vol == null ? 0.3 : o.vol, a = o.a || 0.005;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc; if (o.lp) { const f2 = ctx.createBiquadFilter(); f2.type = "lowpass"; f2.frequency.value = o.lp; node.connect(f2); node = f2; }
    node.connect(g); g.connect(o.out || sfxG); osc.start(t); osc.stop(t + dur + 0.05);
    return osc;
  }
  function noise(dur, o) {
    o = o || {}; const t = o.at || now(), s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = o.rate || 1; f.type = o.ft || "bandpass"; f.frequency.value = o.f || 1000; f.Q.value = o.q || 1;
    const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(o.out || sfxG); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  const notes = (list, o) => list.forEach(([f, dt, d], i) => tone(f, d || 0.25, Object.assign({}, o, { at: now() + dt })));

  // ── one-shot sounds ──
  const SFX = {
    click: () => tone(1250, 0.05, { vol: 0.08, type: "triangle" }),
    open: () => notes([[660, 0, 0.08], [990, 0.05, 0.12]], { vol: 0.08, type: "triangle" }),
    coin: () => notes([[988, 0, 0.08], [1319, 0.07, 0.3]], { vol: 0.12, type: "square", lp: 3500 }),
    spend: () => { tone(260, 0.12, { vol: 0.12, to: 180, type: "triangle" }); noise(0.08, { f: 1800, vol: 0.05 }); },
    notify: () => notes([[784, 0, 0.5], [1047, 0.09, 0.7]], { vol: 0.1 }),
    goal: () => { notes([[523, 0, 0.3], [659, 0.1, 0.3], [784, 0.2, 0.3], [1047, 0.3, 0.8]], { vol: 0.12, type: "triangle" }); SFX.sparkle(0.35); },
    error: () => notes([[220, 0, 0.12], [196, 0.13, 0.18]], { vol: 0.1, type: "sawtooth", lp: 1200 }),
    chat: () => tone(880, 0.09, { vol: 0.07, to: 1180, glide: 0.06 }),
    step: (k) => noise(0.05, { f: 700 + Math.random() * 500 * (k || 1), q: 1.4, vol: 0.05 }),
    sparkle: (delay) => { for (let i = 0; i < 9; i++) tone([1568, 1976, 2349, 2637, 3136][i % 5] * (1 + Math.floor(i / 5)), 0.35, { vol: 0.05, at: now() + (delay || 0) + i * 0.045 }); },
    doorbell: () => notes([[880, 0, 0.6], [698, 0.32, 0.9]], { vol: 0.12 }),
    payday: () => { SFX.coin(); setTimeout(SFX.coin, 120); setTimeout(() => notes([[1319, 0, 0.6], [1760, 0.08, 0.8]], { vol: 0.08 }), 280); },
    honkAuto: () => { [0, 0.18].forEach(dt => { tone(410, 0.12, { at: now() + dt, type: "square", vol: 0.07, lp: 1800 }); tone(423, 0.12, { at: now() + dt, type: "square", vol: 0.05, lp: 1800 }); }); },
    honkCar: () => { tone(350, 0.32, { type: "sawtooth", vol: 0.06, lp: 1500 }); tone(440, 0.32, { type: "sawtooth", vol: 0.05, lp: 1500 }); },
    honkBus: () => { tone(220, 0.6, { type: "sawtooth", vol: 0.07, lp: 900 }); tone(277, 0.6, { type: "sawtooth", vol: 0.05, lp: 900 }); },
    ferryHorn: () => { tone(147, 1.4, { type: "sawtooth", vol: 0.09, lp: 700, a: 0.12 }); tone(220, 1.4, { type: "sawtooth", vol: 0.06, lp: 700, a: 0.12 }); },
    metroChime: () => notes([[659, 0, 0.9], [523, 0.35, 0.9], [392, 0.7, 1.4]], { vol: 0.1 }),
    doors: () => { noise(0.5, { f: 600, ft: "lowpass", vol: 0.08, a: 0.05 }); tone(1046, 0.25, { vol: 0.04, at: now() + 0.5 }); },
    vroom: () => { tone(70, 1.2, { to: 180, glide: 0.8, type: "sawtooth", vol: 0.07, lp: 900, a: 0.08 }); },
    wedding: () => notes([[587, 0, 0.3], [659, 0.15, 0.3], [784, 0.3, 0.3], [880, 0.45, 0.6], [784, 0.75, 0.3], [880, 0.9, 0.9]], { vol: 0.1, type: "triangle" }),
    baby: () => notes([[1047, 0, 0.4], [880, 0.25, 0.4], [988, 0.5, 0.4], [784, 0.75, 0.8]], { vol: 0.07 }),
    sleep: () => notes([[523, 0, 0.6], [440, 0.35, 0.6], [392, 0.7, 0.6], [330, 1.05, 1.2]], { vol: 0.07 }),
    eat: () => { noise(0.07, { f: 2500, vol: 0.05 }); setTimeout(() => noise(0.07, { f: 2200, vol: 0.05 }), 140); },
    crow: () => { [0, 0.32].forEach(dt => { tone(720, 0.22, { at: now() + dt, to: 520, type: "sawtooth", vol: 0.035, lp: 1600 }); }); },
    bird: () => { const b = 2400 + Math.random() * 1800, n = 3 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(b * (1 + Math.random() * 0.2), 0.08, { at: now() + i * 0.11, to: b * 1.3, glide: 0.05, vol: 0.025 }); },
    gull: () => tone(1300, 0.5, { to: 900, glide: 0.45, type: "triangle", vol: 0.025 })
  };
  function sfx(name, arg) { if (!ok() || !SFX[name]) return; try { SFX[name](arg); } catch (e) { } }

  // ── ambience: three looping beds (traffic, water, night) mixed by where you stand ──
  const beds = {}; let amb = { city: 0.5, water: 0, park: 0, night: 0 }, ambTimer = 0;
  function bed(f, q, type, rate) { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = rate || 1; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(ambG); s.start(); return { g, fl }; }
  function startAmbience() {
    beds.city = bed(380, 0.6, "lowpass", 0.6);
    beds.water = bed(700, 0.5, "lowpass", 0.8);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 0.35; lfo.connect(lg); lg.connect(beds.water.fl.frequency); lfo.start();
    // crickets: a high tone pulsed by a fast LFO
    const cr = ctx.createOscillator(), pulse = ctx.createGain(), crg = ctx.createGain(), am = ctx.createOscillator(), amg = ctx.createGain(); cr.frequency.value = 4600; am.frequency.value = 28; amg.gain.value = 0.5; pulse.gain.value = 0.5; crg.gain.value = 0;
    am.connect(amg); amg.connect(pulse.gain); cr.connect(pulse); pulse.connect(crg); crg.connect(ambG); cr.start(); am.start(); beds.night = { g: crg };
    clearInterval(ambTimer); ambTimer = setInterval(ambientEvents, 1700);
  }
  function ambience(a) { amb = Object.assign(amb, a || {}); if (!ctx || !beds.city) return; const t = now();
    beds.city.g.gain.setTargetAtTime(0.11 * amb.city, t, 0.8); beds.water.g.gain.setTargetAtTime(0.16 * amb.water, t, 0.8); beds.night.g.gain.setTargetAtTime(0.004 * amb.night, t, 1.2); }
  function ambientEvents() {
    if (!ok() || document.hidden) return; const r = Math.random();
    if (amb.night > 0.5) return;
    if (amb.park > 0.3 && r < 0.45) SFX.bird();
    else if (amb.water > 0.4 && r < 0.18) SFX.gull();
    else if (r < 0.07) SFX.crow();
    else if (amb.city > 0.4 && r < 0.14) (Math.random() < 0.6 ? SFX.honkAuto : SFX.honkCar)();
  }

  // ── engine: one oscillator pair that follows your vehicle's speed ──
  let eng = null;
  function engine(type, speed) {
    if (!ctx) return;
    if (!type) { if (eng) { eng.g.gain.setTargetAtTime(0, now(), 0.2); const e = eng; setTimeout(() => { try { e.o1.stop(); e.o2.stop(); } catch (er) { } }, 600); eng = null; } return; }
    const base = { cycle: 0, scooter: 95, bike: 55, car: 48, suv: 42, metro: 70 }[type] || 60;
    if (!base) { engine(null); return; }
    if (!eng || eng.type !== type) { engine(null); const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o1.type = "sawtooth"; o2.type = type === "metro" ? "sine" : "square"; f.type = "lowpass"; f.frequency.value = type === "metro" ? 300 : 700; g.gain.value = 0; o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxG); o1.start(); o2.start(); eng = { o1, o2, g, f, type, base }; }
    const t = now(), sp = Math.max(0, Math.min(1, speed));
    eng.o1.frequency.setTargetAtTime(eng.base * (1 + sp * 1.2), t, 0.15); eng.o2.frequency.setTargetAtTime(eng.base * 0.5 * (1 + sp * 1.2), t, 0.15);
    eng.g.gain.setTargetAtTime(pref.on ? (type === "metro" ? 0.05 : 0.025 + sp * 0.03) : 0, t, 0.15);
  }

  // ── music: a gentle generative loop in Mohanam (a pentatonic raga): soft pad, plucked melody, light mridangam-style beat ──
  let wantMusic = pref.music, musTimer = 0, beat = 0, motif = [], chordI = 0, nextT = 0, night = false;
  const SCALE = [0, 2, 4, 7, 9], ROOT = 293.66; // D
  const CH = [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]];
  const nf = st => ROOT * Math.pow(2, st / 12);
  function newMotif() { motif = []; let i = 5 + Math.floor(Math.random() * 3); for (let k = 0; k < 8; k++) { if (Math.random() < 0.3) { motif.push(null); continue; } i = Math.max(0, Math.min(10, i + Math.floor(Math.random() * 5) - 2)); motif.push(SCALE[i % 5] + 12 * Math.floor(i / 5)); } }
  function startMusic() { if (!ctx || musTimer) return; newMotif(); nextT = now() + 0.2; beat = 0; musTimer = setInterval(schedule, 120); }
  function stopMusic() { clearInterval(musTimer); musTimer = 0; }
  function schedule() {
    if (!ctx || document.hidden) return;
    const spb = night ? 0.5 : 0.36; // seconds per eighth note
    while (nextT < now() + 0.4) {
      const t = nextT, b = beat % 16;
      if (b === 0) { chordI = (chordI + 1) % CH.length; if (beat % 64 === 0) newMotif(); CH[chordI].forEach(st => { tone(nf(st - 12), spb * 16, { at: t, type: "sawtooth", vol: 0.012, lp: 700, a: 0.6, out: musG }); tone(nf(st - 12), spb * 16, { at: t, type: "sawtooth", vol: 0.01, lp: 700, a: 0.6, detune: 9, out: musG }); }); }
      const m = motif[b % 8];
      if (m != null && (b < 8 || Math.random() < 0.75)) { tone(nf(m), 0.6, { at: t, type: "triangle", vol: 0.06, out: musG }); tone(nf(m) * 2, 0.25, { at: t, vol: 0.015, out: musG }); }
      if (!night) {
        if (b % 8 === 0) tone(65, 0.25, { at: t, to: 45, glide: 0.2, vol: 0.12, out: musG });
        if (b % 8 === 3 || b % 8 === 6) tone(190, 0.18, { at: t, to: 150, glide: 0.15, vol: 0.05, type: "triangle", out: musG });
        if (b % 2 === 1) noise(0.04, { at: t, f: 7000, ft: "highpass", vol: 0.012, out: musG });
      }
      nextT += spb; beat++;
    }
  }
  function music(on) { wantMusic = on; if (!ctx) return; musG.gain.setTargetAtTime(on && pref.music ? 0.5 : 0, now(), 0.5); if (on && pref.music) startMusic(); else setTimeout(() => { if (!wantMusic || !pref.music) stopMusic(); }, 1200); }
  function setNight(n) { night = !!n; }

  // speaker button: sound + music → sound only → mute
  function cycle() {
    if (pref.on && pref.music) pref.music = false; else if (pref.on) pref.on = false; else { pref.on = true; pref.music = true; }
    savePref(); start();
    if (ctx) { master.gain.setTargetAtTime(pref.on ? 0.9 : 0, now(), 0.1); music(wantMusic); if (pref.on) ctx.resume(); }
    return state();
  }
  function state() { return !pref.on ? "off" : pref.music ? "all" : "sfx"; }
  const icon = () => ({ all: "🔊", sfx: "🔉", off: "🔇" })[state()];

  // speak a metro announcement with the phone's own voice (en-IN if the phone has one)
  function announce(text) {
    if (!ok() || !window.speechSynthesis) return;
    try { const u = new SpeechSynthesisUtterance(text), v = speechSynthesis.getVoices().find(v2 => /en-IN/i.test(v2.lang)) || speechSynthesis.getVoices().find(v2 => /^en/i.test(v2.lang)); if (v) u.voice = v; u.rate = 0.95; u.volume = 0.8; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { }
  }

  // test hook: loudness right now (peak and RMS of the output)
  function __level() { if (!an) return null; const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let pk = 0, ss = 0; d.forEach(v => { pk = Math.max(pk, Math.abs(v)); ss += v * v; }); return { peak: +pk.toFixed(3), rms: +Math.sqrt(ss / d.length).toFixed(4) }; }
  return { __level, sfx, ambience, engine, music, setNight, cycle, state, icon, announce, start };
})();
