/* Halsey sound: everything is synthesized with Web Audio, so there are no sound files.
   Ambience: wind in the grass, birds by day, crickets and a far owl at night, cranes on the rivers.
   Music: a slow drone and plucked pentatonic notes, a little like a guitar left out on a porch;
   the key moves as you travel east. Effects for every action.
   Nothing plays until the player turns sound on (browsers require a tap first). Exposes window.HSOUND. */
"use strict";
window.HSOUND = (() => {
  let hush = 0, ctx = null, master, musicBus, ambBus, fxBus, on = false, amb = null, music = null, region = { key: 0, time: 'day', water: false };
  const store = { get() { try { return localStorage.getItem('halsey-sound') === 'on'; } catch (e) { return false; } }, set(v) { try { localStorage.setItem('halsey-sound', v ? 'on' : 'off'); } catch (e) {} } };
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
  const hz = semi => 146.83 * Math.pow(2, semi / 12);   // D3

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = .32; musicBus.connect(comp);
    ambBus = ctx.createGain(); ambBus.gain.value = .5; ambBus.connect(comp);
    fxBus = ctx.createGain(); fxBus.gain.value = .7; fxBus.connect(comp);
    // a small room: a feedback delay as reverb
    const d = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter(); d.delayTime.value = .23; fb.gain.value = .38; lp.type = 'lowpass'; lp.frequency.value = 2400;
    musicBus.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(comp);
  }
  const now = () => ctx.currentTime;
  function noiseBuf(sec = 2) { const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), x = b.getChannelData(0); let last = 0; for (let i = 0; i < x.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; x[i] = last * 3.5; } return b; }
  function env(g, t, a, peak, dec) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(freq, { type = 'triangle', t = now(), a = .005, peak = .3, dec = .4, bus = fxBus, detune = 0, glide = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + a + dec); o.detune.value = detune;
    o.connect(g); g.connect(bus); env(g, t, a, peak, dec); o.start(t); o.stop(t + a + dec + .05);
  }
  function burst({ t = now(), dur = .08, freq = 2000, q = 1, peak = .4, type = 'bandpass', bus = fxBus } = {}) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf(.5); f.type = type; f.frequency.value = freq; f.Q.value = q;
    s.connect(f); f.connect(g); g.connect(bus); env(g, t, .004, peak, dur); s.start(t); s.stop(t + dur + .1);
  }
  /* a plucked string: a bright triangle with a fast decay and a quiet octave above */
  function pluck(semi, t, vel = 1) { tone(hz(semi), { t, peak: .22 * vel, dec: 1.6, bus: musicBus }); tone(hz(semi + 12), { t, peak: .06 * vel, dec: .7, type: 'sine', bus: musicBus }); }

  /* ---------- ambience ---------- */
  function startAmbience() {
    stopAmbience(); if (!ctx) return;
    const nodes = [], timers = [];
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(4); s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = region.time === 'night' ? 380 : 620; f.Q.value = .7;
    const g = ctx.createGain(); g.gain.value = .0001; s.connect(f); f.connect(g); g.connect(ambBus); s.start();
    g.gain.exponentialRampToValueAtTime(region.time === 'night' ? .09 : .14, now() + 2);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = region.time === 'night' ? 140 : 260; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    nodes.push(s, lfo, g);
    const every = (ms, fn) => { const tick = () => { if (!on) return; fn(); timers.push(setTimeout(tick, ms * (.5 + Math.random()))); }; timers.push(setTimeout(tick, ms * Math.random())); };
    if (region.time === 'night') {
      every(2600, () => { const t = now(); for (let i = 0; i < 3 + Math.random() * 4; i++) tone(4200 + Math.random() * 300, { t: t + i * .07, type: 'sine', peak: .025, dec: .04, bus: ambBus }); });
      every(14000, () => { const t = now(); tone(330, { t, type: 'sine', peak: .05, dec: .5, a: .08, bus: ambBus, glide: .92 }); tone(300, { t: t + .7, type: 'sine', peak: .04, dec: .7, a: .08, bus: ambBus, glide: .9 }); });
    } else {
      every(3800, () => { const t = now(), base = 2400 + Math.random() * 1800; for (let i = 0; i < 2 + Math.random() * 3; i++) tone(base * (1 + Math.random() * .25), { t: t + i * .11, type: 'sine', peak: .03, dec: .08, bus: ambBus, glide: 1.25 }); });
    }
    if (region.water) every(7000, () => { const t = now(); for (let i = 0; i < 4; i++) { tone(520 + Math.random() * 60, { t: t + i * .16, type: 'sawtooth', peak: .02, dec: .14, bus: ambBus, glide: .85 }); } });   // cranes, far off
    amb = { nodes, timers };
  }
  function stopAmbience() { if (!amb) return; amb.timers.forEach(clearTimeout); amb.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }); amb = null; }

  /* ---------- music ---------- */
  function startMusic() {
    stopMusic(); if (!ctx) return;
    const k = region.key, drone = [];
    for (const [semi, det] of [[k - 12, -6], [k - 5, 5]]) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = hz(semi); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = .0001; o.connect(f); f.connect(g); g.connect(musicBus); o.start(); g.gain.exponentialRampToValueAtTime(.05, now() + 4); drone.push(o, g); }
    let step = 0, deg = 2; const beat = region.time === 'night' ? 1.05 : .82;
    const timer = setInterval(() => {
      if (!on || now() < hush) return; const t = now() + .05;
      if (Math.random() < (region.time === 'night' ? .45 : .6)) { deg = Math.max(0, Math.min(PENTA.length - 1, deg + (Math.random() < .5 ? -1 : 1) * (Math.random() < .25 ? 2 : 1))); pluck(k + PENTA[deg], t, .7 + Math.random() * .3); }
      if (step % 8 === 0) pluck(k - 12 + PENTA[[0, 3, 4, 0][(step / 8) % 4 | 0]], t, .6);
      step++;
    }, beat * 1000);
    music = { drone, timer };
  }
  function stopMusic() { if (!music) return; clearInterval(music.timer); music.drone.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }); music = null; }

  /* ---------- effects ---------- */
  const FX = {
    /* touch sounds are clay and paper: short, low, a little different every time so they never nag */
    tock(primary) { const t = now(), v = 1 + (Math.random() - .5) * .06; tone((primary ? 260 : 210) * v, { t, type: 'sine', a: .002, peak: primary ? .32 : .24, dec: .07, glide: .55 }); burst({ t, freq: 1700 * v, dur: .018, q: 1.4, peak: .12 }); },
    pick(n = 1) { const t = now(), v = 1 + (Math.random() - .5) * .05; burst({ t, freq: 3000 * v, dur: .05, q: .8, peak: .14 }); tone(hz(region.key + 12 + PENTA[(n + 1) % PENTA.length]) * v, { t: t + .03, type: 'sine', peak: .12, dec: .12 }); tone(150, { t: t + .03, type: 'sine', a: .002, peak: .3, dec: .08, glide: .6 }); },
    unpick() { const t = now(); burst({ t, freq: 1600, dur: .05, peak: .14 }); tone(180, { t, type: 'sine', a: .002, peak: .2, dec: .07, glide: .7 }); },
    nope() { const t = now(); tone(120, { t, type: 'square', a: .002, peak: .06, dec: .06 }); tone(100, { t: t + .08, type: 'square', a: .002, peak: .06, dec: .08 }); },
    deal(n = 1) { const t = now(); for (let i = 0; i < Math.min(6, n); i++) burst({ t: t + i * .06, freq: 2600 + Math.random() * 1200, dur: .035, q: .9, peak: .1 }); },
    tell(total) { const t = now(); tone(110, { t, type: 'sine', a: .003, peak: .3 + Math.min(.25, total / 800), dec: .3, glide: .5 }); burst({ t, freq: 5200, dur: .18, q: .6, peak: .14 }); burst({ t: t + .07, freq: 4600, dur: .16, q: .6, peak: .1 });
      const n = Math.min(9, 2 + Math.floor(Math.log2(1 + total / 10))); for (let i = 0; i < n; i++) tone(hz(region.key + 12 + PENTA[i % PENTA.length]), { t: t + .12 + i * .065, peak: .12, dec: .25 }); },
    count(i) { tone(hz(region.key + 12 + PENTA[i % PENTA.length] + 12 * Math.floor(i / PENTA.length)), { peak: .07, dec: .08, type: 'square' }); },
    warm() { const t = now(); [0, 4, 7, 12].forEach((s, i) => tone(hz(region.key + 12 + s), { t: t + i * .05, a: .08, peak: .1, dec: 1.4 })); },
    answer() { const t = now(); tone(hz(region.key + 24), { t, type: 'sine', peak: .15, dec: 1.2 }); tone(hz(region.key + 31), { t: t + .09, type: 'sine', peak: .1, dec: 1.2 }); },
    doubt() { const t = now(); tone(70, { t, type: 'sine', peak: .5, dec: .5, glide: .6 }); burst({ t, freq: 220, dur: .2, peak: .3, type: 'lowpass' }); },
    standing() { const t = now(); burst({ t, freq: 600, dur: .07, peak: .5 }); burst({ t: t + .12, freq: 520, dur: .07, peak: .4 }); },
    step() { const t = now(); for (let i = 0; i < 3; i++) burst({ t: t + i * .19, freq: 900 + Math.random() * 500, dur: .06, q: .8, peak: .22 }); },
    day() { burst({ freq: 900, dur: .25, q: .4, peak: .12 }); },
    shuffle() { const t = now(); for (let i = 0; i < 8; i++) burst({ t: t + i * .03, freq: 2500 + Math.random() * 2000, dur: .03, peak: .15 }); },
    keepsake() { const t = now(); [7, 9, 12, 14, 16, 19].forEach((s, i) => tone(hz(region.key + 24 + s), { t: t + i * .09 + Math.random() * .03, type: 'sine', peak: .09, dec: 2.2 })); },
    file() { const t = now(); tone(90, { t, type: 'sine', peak: .5, dec: .25 }); burst({ t, freq: 400, dur: .1, peak: .4, type: 'lowpass' }); },
    win() { const t = now(); [0, 2, 4, 7, 9, 12, 16].forEach((s, i) => pluck(region.key + s, t + i * .11, 1)); },
    lose() { const t = now(); [7, 4, 2, 0, -3].forEach((s, i) => pluck(region.key + s, t + i * .18, .8)); },
  };

  return {
    get on() { return on; },
    wanted: store.get,
    async toggle(v = !on) {
      on = v; store.set(v);
      if (on) { init(); if (!ctx) return false; if (ctx.state === 'suspended') await ctx.resume(); startAmbience(); startMusic(); }
      else { stopAmbience(); stopMusic(); }
      return on;
    },
    /* where you are: key (semitones from D), time ('dawn', 'day', 'dusk', 'night'), water (cranes) */
    setRegion(r) { const changed = r.key !== region.key || r.time !== region.time || r.water !== region.water; region = { ...region, ...r }; if (on && changed) { startAmbience(); startMusic(); } },
    /* a place's own tune (Neon's C2 motifs), in the current key; the porch guitar rests while it plays */
    motif(place) {
      if (!on || !ctx || typeof playPlaceMotif !== 'function') return;
      try { const r = playPlaceMotif(ctx, musicBus, now() + .6, { place, transpose: region.key, gain: .2, withDrone: false }); hush = r.endTime + .4; } catch (e) {}
    },
    play(name, ...args) { if (on && ctx && FX[name]) try { FX[name](...args); } catch (e) {} },
  };
})();
