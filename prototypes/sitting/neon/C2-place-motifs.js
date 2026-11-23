// C2: Place motifs — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// Semitones are relative to D4 (MIDI 62 / 293.66 Hz). All motifs sit over a D drone.
// Sound API: playPlaceMotif(audioContext, destinationNode, startTime, { place, tempo, gain, withDrone })

(function (root) {
  'use strict';

  const D4_HZ = 293.6647679174076;

  // Each note: { semi: semitones from D4 (null = rest), dur: beats }
  const PLACE_MOTIFS = {
    // Open D Dorian / pentatonic — wide intervals like wind over grass dunes (10 notes)
    sandhills: {
      name: 'The Sandhills',
      mode: 'D Major Pentatonic (open)',
      tempo: 68,
      notes: [
        { semi: 0, dur: 1.5 },
        { semi: 7, dur: 0.5 },
        { semi: 9, dur: 1.0 },
        { semi: 14, dur: 1.5 },
        { semi: 12, dur: 0.5 },
        { semi: 9, dur: 1.0 },
        { semi: 7, dur: 1.5 },
        { semi: 4, dur: 0.5 },
        { semi: 2, dur: 1.0 },
        { semi: 0, dur: 2.0 },
      ],
    },
    // Braided river motion — D Mixolydian with gentle rocking eighth notes (12 notes)
    platte: {
      name: 'The Platte',
      mode: 'D Mixolydian',
      tempo: 82,
      notes: [
        { semi: 0, dur: 0.5 },
        { semi: 4, dur: 0.5 },
        { semi: 7, dur: 1.0 },
        { semi: 10, dur: 0.5 },
        { semi: 9, dur: 0.5 },
        { semi: 7, dur: 1.0 },
        { semi: 4, dur: 0.5 },
        { semi: 5, dur: 0.5 },
        { semi: 4, dur: 0.5 },
        { semi: 2, dur: 0.5 },
        { semi: 0, dur: 1.0 },
        { semi: -2, dur: 1.5 },
      ],
    },
    // Quiet, winding, misty — D Dorian in lower-middle register (11 notes)
    loup: {
      name: 'The Loup',
      mode: 'D Dorian',
      tempo: 64,
      notes: [
        { semi: 2, dur: 1.0 },
        { semi: 3, dur: 0.5 },
        { semi: 7, dur: 1.5 },
        { semi: 9, dur: 1.0 },
        { semi: 7, dur: 0.5 },
        { semi: 5, dur: 0.5 },
        { semi: 3, dur: 1.0 },
        { semi: 2, dur: 1.0 },
        { semi: 0, dur: 0.5 },
        { semi: -2, dur: 0.5 },
        { semi: 0, dur: 2.0 },
      ],
    },
    // Formal, archival, clockwork — D Aeolian / church-bell fourths & fifths (9 notes)
    courthouse: {
      name: 'The Courthouse',
      mode: 'D Aeolian (archival)',
      tempo: 60,
      notes: [
        { semi: 12, dur: 1.0 },
        { semi: 7, dur: 1.0 },
        { semi: 10, dur: 1.0 },
        { semi: 5, dur: 1.5 },
        { semi: 7, dur: 0.5 },
        { semi: 3, dur: 1.0 },
        { semi: 2, dur: 1.0 },
        { semi: 5, dur: 1.0 },
        { semi: 0, dur: 2.0 },
      ],
    },
    // Deep, broad, departing — D Minor Pentatonic descending toward the border (12 notes)
    missouri: {
      name: 'The Missouri',
      mode: 'D Minor Pentatonic',
      tempo: 72,
      notes: [
        { semi: 12, dur: 1.0 },
        { semi: 10, dur: 0.5 },
        { semi: 7, dur: 1.5 },
        { semi: 5, dur: 0.5 },
        { semi: 3, dur: 0.5 },
        { semi: 7, dur: 1.0 },
        { semi: 5, dur: 1.0 },
        { semi: 3, dur: 0.5 },
        { semi: 0, dur: 1.0 },
        { semi: -2, dur: 0.5 },
        { semi: -5, dur: 1.0 },
        { semi: 0, dur: 2.0 },
      ],
    },
  };

  function semiToHz(semi) {
    return D4_HZ * Math.pow(2, semi / 12);
  }

  function playPlaceMotif(audioContext, destinationNode, startTime, opts) {
    const o = opts || {};
    const key = o.place && PLACE_MOTIFS[o.place] ? o.place : 'sandhills';
    const motif = PLACE_MOTIFS[key];
    const tempo = o.tempo || motif.tempo;
    const beatSec = 60 / tempo;
    const level = o.gain ?? 0.16;
    const t0 = Math.max(audioContext.currentTime, startTime ?? audioContext.currentTime);
    const tr = o.transpose || 0; // semitones; Halsey's music key moves east (added in the repo)

    let totalBeats = 0;
    for (let i = 0; i < motif.notes.length; i++) totalBeats += motif.notes[i].dur;
    const totalSec = totalBeats * beatSec;

    // Optional soft D2+D3 drone underneath
    if (o.withDrone !== false) {
      const droneGain = audioContext.createGain();
      droneGain.gain.setValueAtTime(0.0001, t0);
      droneGain.gain.linearRampToValueAtTime(level * 0.38, t0 + 0.4);
      droneGain.gain.setValueAtTime(level * 0.38, t0 + totalSec - 0.6);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + totalSec + 0.4);
      droneGain.connect(destinationNode);

      const d1 = audioContext.createOscillator();
      const d2 = audioContext.createOscillator();
      d1.type = 'sine';
      d2.type = 'triangle';
      d1.frequency.setValueAtTime(semiToHz(tr - 24), t0); // D2
      d2.frequency.setValueAtTime(semiToHz(tr - 12), t0);  // D3

      const lpf = audioContext.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(420, t0);

      d1.connect(lpf);
      d2.connect(lpf);
      lpf.connect(droneGain);

      d1.start(t0);
      d2.start(t0);
      d1.stop(t0 + totalSec + 0.45);
      d2.stop(t0 + totalSec + 0.45);
    }

    // Schedule melody notes with warm plucked/reed envelope
    let cursor = t0;
    for (let i = 0; i < motif.notes.length; i++) {
      const n = motif.notes[i];
      const durSec = n.dur * beatSec;
      if (n.semi !== null && n.semi !== undefined) {
        const osc = audioContext.createOscillator();
        const env = audioContext.createGain();
        const filt = audioContext.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(semiToHz(n.semi + tr), cursor);

        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(1600, cursor);
        filt.frequency.exponentialRampToValueAtTime(650, cursor + durSec);

        env.gain.setValueAtTime(0.0001, cursor);
        env.gain.linearRampToValueAtTime(level, cursor + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, cursor + durSec * 0.96);

        osc.connect(filt);
        filt.connect(env);
        env.connect(destinationNode);

        osc.start(cursor);
        osc.stop(cursor + durSec + 0.04);
      }
      cursor += durSec;
    }

    return { endTime: cursor, durationSec: totalSec, motif };
  }

  root.PLACE_MOTIFS = PLACE_MOTIFS;
  root.playPlaceMotif = playPlaceMotif;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLACE_MOTIFS, playPlaceMotif };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
