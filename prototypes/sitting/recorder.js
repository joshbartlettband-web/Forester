/* The Recorder: the Survey's machine, reading testimony into the record in a flat computer voice.
   It speaks generated entries, not fixed scripts: each telling, each sitting's close and the whole run's
   record are composed from what you actually told, so every run's record is different.

   Voice: clips pre-rendered with eSpeak NG (a Klatt formant voice held to a monotone) into one sprite,
   voice/recorder.mp3 with voice/recorder.json, made by tools/render-voice.py. The player strings clips
   together with Web Audio. Anything without a clip (a story you wrote in the card editor) falls back to
   the device's own speech, preferring an old robotic voice where the device has one.
   Captions always show the words as a readout, so the record works with the sound off.

   Used in two places: sitting.html (window.RECORDER) and tools/render-voice.py (via node: vocab()). */
"use strict";
(function (root) {

/* ---------- the words ---------- */
const LINES = {
  // openers for an entry
  'o.entry': 'Entry', 'o.testimony': 'Testimony follows.', 'o.heard': 'Heard, and entered.', 'o.recorded': 'Recorded.',
  'o.sitting': 'Sitting opened.', 'o.closed': 'Sitting closed.',
  // ledger words
  'w.teller': 'Teller:', 'w.place': 'Place:', 'w.era': 'Era:', 'w.weight': 'Weight', 'w.vivid': 'Vivid', 'w.credibility': 'Credibility',
  'w.of': 'of', 'w.entered': 'Entered:', 'w.status': 'Status:', 'w.sittings': 'Sittings:', 'w.believed': 'Believed:', 'w.filed': 'Filed:',
  'w.standing': 'Standing:', 'w.at': 'At', 'w.to': 'to', 'w.hundred': 'hundred', 'w.thousand': 'thousand', 'w.threshold': 'Threshold',
  'w.given': 'Given away:', 'w.told': 'Stories told:', 'w.keepsakes': 'Keepsakes:',
  // verdicts
  'v.believed': 'Believed.', 'v.not': 'Not believed.', 'v.doubt': 'Doubt, unanswered.', 'v.answered': 'Reservation, answered.',
  'v.warm': 'Teller, warm.', 'v.unsigned': 'Unsigned. Will not be filed.', 'v.struck': 'Testimony, struck.',
  // the run's record
  'r.head': 'Record of the surveyor, as filed.', 'r.head2': 'Testimony of the surveyor, in order.', 'r.end': 'End of record.',
  'r.sign': 'The surveyor signed.', 'r.refuse': 'The surveyor refused, and stayed.', 'r.water': 'The surveyor took the water.',
  'r.also': 'Also entered:',
  // glosses: what the machine makes of a theme
  'g.Water.1': 'The river moved. The record did not.', 'g.Water.2': 'Water, moving. Source unknown.', 'g.Water.3': 'Something was kept by the river.',
  'g.Weather.1': 'Sky, entered as evidence.', 'g.Weather.2': 'Wind from the northwest. Noted.', 'g.Weather.3': 'Weather, recorded after the fact.',
  'g.Work.1': 'Hands, counted. Hours, counted.', 'g.Work.2': 'Labor, unpaid. Entered anyway.', 'g.Work.3': 'Done by hand. Entered by hand.',
  'g.Strange.1': 'Cause unknown. Retained.', 'g.Strange.2': 'Unexplained. Filed with the others.', 'g.Strange.3': 'It was seen. It was not explained.',
  'g.Leaving.1': 'Departure, noted. Return, possible.', 'g.Leaving.2': 'Crossing, both directions.', 'g.Leaving.3': 'Somebody left. The chair was kept.',
  'g.Light.1': 'Light, still on.', 'g.Light.2': 'Lamp, checked. Lamp, lit.', 'g.Light.3': 'Light, observed after dark.',
  'g.Kin.1': 'Relation, confirmed.', 'g.Kin.2': 'Kin, two generations removed.', 'g.Kin.3': 'Whose child. Entered.',
  'g.Animals.1': 'Count, approximate.', 'g.Animals.2': 'Animals, present. Animals, counted.', 'g.Animals.3': 'They were there first. Noted.',
  // glosses for an event
  'e.Find': 'Further items found.', 'e.Chain': 'Linked to the prior entry.', 'e.Risk': 'Risk, accepted.', 'e.Spare': 'Held in reserve.', 'e.Repeat': 'Repeated, for the record.',
};
const ERA = { '1888': 'Eighteen eighty-eight.', '1903': 'Nineteen oh three.', '1950': 'Nineteen fifty.', '1974': 'Nineteen seventy-four.', '2000': 'Two thousand.', 'Later': 'Later.' };
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const word99 = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10) - 2] + (n % 10 ? '-' + ONES[n % 10] : '');
/* how the voice should say names it would otherwise get wrong; captions keep the real spelling */
const SAY = { 'Ebersole': 'Ebber-sole', 'Okamoto': 'Okka-mo-toe', 'Tomás': 'Toe-mahss', 'Arriaga': 'Ah-ree-ah-gah', 'Ybarra': 'Ee-bar-ah', 'Lindqvist': 'Lind-kvist',
  'Mbeki-Larsen': 'Em-bekky Larsen', 'Nakamura-Hill': 'Nakka-moora Hill', 'Pfeiffer': 'Fifer', 'Dvorak': 'Dvor-zhak', 'Pham': 'Fahm', 'Abuk': 'Ahbook', 'Deng': 'Deng',
  'Femi': 'Feh-mee', 'Adeyemi': 'Ah-deh-yeh-mee', 'Niobrara': 'Nye-oh-brair-ah', 'Platte': 'Plat', 'Loup': 'Loop', 'O’Neill': 'Oh Neel', 'Odette': 'Oh-det',
  'Priya': 'Pree-ya', 'Raman': 'Rah-mun', 'Deshawn': 'Deh-shawn', 'Imani': 'Ee-mah-nee', 'Marisol': 'Marry-sole', 'Arne': 'Arnah', 'Bettina': 'Beh-tee-na',
  'Maeve': 'Mayve', 'Kinkaid': 'Kin-kayd', 'Nadia': 'Nah-dya', 'Haddad': 'Hah-dad', 'Albrecht': 'Al-brekt', 'Sorensen': 'Sorr-en-sen' };
const sayable = t => t.replace(/[“”"]/g, '').replace(/[A-Za-zÀ-ÿ’'-]+/g, w => SAY[w] || w);
const plain = t => t.replace(/^[“"]|[”"]$/g, '').trim();

/* ---------- every clip the grammar can ask for ---------- */
function vocab(K) {
  const v = [];
  const add = (id, text) => v.push({ id, text, say: sayable(text) });
  for (const [id, t] of Object.entries(LINES)) add(id, t);
  for (const [k, t] of Object.entries(ERA)) add('era.' + k, t);
  for (let n = 0; n < 100; n++) add('n.' + n, word99(n));
  for (const t of K.TELLERS) { add('nm.' + t.id, t.name + '.'); add('fn.' + t.id, t.name.split(' ')[0]); }
  for (const [k, p] of Object.entries(K.PLACE)) add('pl.' + k, p);
  for (const th of ['Water', 'Weather', 'Work', 'Strange', 'Leaving', 'Light', 'Kin', 'Animals']) add('th.' + th, th + '.');
  for (const r of K.RANKS.map(r => r[1]).concat(['Struck from the record'])) add('rk.' + r.toLowerCase().replace(/\W+/g, '-'), r + '.');
  for (const [k, kp] of Object.entries(K.KEEPS)) add('kp.' + k, kp.name + '.');
  for (const c of K.CARDS) add('q.' + c.id, plain(c.quote));
  return v;
}

/* ---------- the grammar ---------- */
const tok = (id, text) => ({ id, text: text ?? LINES[id] });
function num(n) {
  n = Math.max(0, Math.round(n)); const out = [];
  if (n >= 1000) { out.push(...num(Math.floor(n / 1000)), tok('w.thousand')); n %= 1000; if (!n) return out; }
  if (n >= 100) { out.push(tok('n.' + Math.floor(n / 100), ONES[Math.floor(n / 100)]), tok('w.hundred')); n %= 100; if (!n) return out; }
  out.push(tok('n.' + n, word99(n))); return out;
}
const numText = toks => toks.map(t => t.text).join(' ');
const R = seed => { let s = (seed >>> 0) || 7; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const pick = (a, r) => a[Math.floor(r() * a.length)];
const gloss = (theme, r) => { const id = `g.${theme}.${1 + Math.floor(r() * 3)}`; return tok(id); };
const quote = c => ({ id: 'q.' + c.id, text: plain(c.quote), check: plain(c.quote) });
const most = arr => { const m = {}; for (const x of arr) m[x] = (m[x] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0]; };

/* one telling: an opener, the testimony itself, sometimes what the machine makes of it, then the numbers */
function entry({ n, cards, e, seed }) {
  const r = R(seed), out = [];
  if (n === 1 || r() < .4) out.push(tok('o.entry'), ...num(n).map((t, i, a) => i === a.length - 1 ? { ...t, text: t.text + '.' } : t));
  else out.push(tok(pick(['o.testimony', 'o.heard', 'o.recorded'], r)));
  for (const c of cards) out.push(quote(c));
  const theme = most(cards.map(c => c.theme)), ev = cards.map(c => c.event).filter(Boolean);
  if (r() < .45) out.push(gloss(theme, r));
  else if (ev.length && r() < .5) out.push(tok('e.' + ev[0]));
  if (r() < .5) out.push(tok('w.weight'), ...num(e.weight), tok('w.vivid'), ...num(e.vivid));
  out.push(tok('w.entered'), ...num(e.total));
  if (e.answer) out.push(tok('v.answered'));
  return dot(out);
}
/* a sitting closes */
function close({ teller, result, cred, threshold, holdout }) {
  return dot([tok('o.closed'), tok('nm.' + teller.id, teller.name + '.'), tok(result === 'won' ? 'v.believed' : 'v.not'),
    tok('w.credibility'), ...num(cred), tok('w.of'), ...num(threshold), ...(holdout && result === 'won' ? [tok('v.unsigned')] : [])]);
}
function opening({ teller, placeKey, threshold }) {
  return dot([tok('o.sitting'), tok('w.teller'), tok('nm.' + teller.id, teller.name + '.'), tok('w.place'), tok('pl.' + placeKey, PLACE_NAME(placeKey)), tok('w.threshold'), ...num(threshold)]);
}
let PLACE_NAME = k => k;
/* the whole run, read back: where you were, what you said that counted most, what it came to */
function record({ sittings, told, given, filed, standing, keeps, rank, ending, struck, seed }) {
  const r = R(seed), segs = [[tok(pick(['r.head', 'r.head2'], r))]];
  for (const s of sittings) {
    const seg = [tok('w.at'), tok('pl.' + s.place, PLACE_NAME(s.place) + ','), tok('w.to'), tok('fn.' + s.teller.id, s.teller.name.split(' ')[0] + '.')];
    if (s.best) for (const c of s.best) seg.push(quote(c));
    seg.push(tok(s.result === 'won' ? 'v.believed' : 'v.not')); segs.push(seg);
  }
  const themes = [...new Set(sittings.flatMap(s => (s.all || []).map(c => c.theme)))];
  if (themes.length) segs.push([tok('r.also'), ...themes.sort(() => r() - .5).slice(0, 3).map(th => gloss(th, r))]);
  const tail = [tok('w.told'), ...num(told), tok('w.given'), ...num(given), tok('w.filed'), ...num(filed)];
  if (keeps.length) tail.push(tok('w.keepsakes'), ...keeps.map(k => tok('kp.' + k.id, k.name + '.')));
  tail.push(tok('w.standing'), ...num(Math.max(0, standing))); segs.push(tail);
  const end = [];
  if (struck) end.push(tok('v.struck')); else if (ending) end.push(tok('r.' + ending));
  end.push(tok('w.status'), tok('rk.' + rank.toLowerCase().replace(/\W+/g, '-'), rank + '.'), tok('r.end')); segs.push(end);
  return dot(segs.flatMap((seg, i) => seg.map(t => ({ ...t, seg: i }))));
}
/* captions read as sentences: a number run ends with a period when the next word starts a new phrase */
function dot(toks) {
  return toks.map((t, i) => {
    const nx = toks[i + 1];
    if (t.id.startsWith('n.') || t.id === 'w.hundred' || t.id === 'w.thousand') {
      const endsRun = !nx || !(nx.id.startsWith('n.') || nx.id === 'w.hundred' || nx.id === 'w.thousand') ;
      if (endsRun && !/[.:]$/.test(t.text) && !(nx && nx.id === 'w.of')) return { ...t, text: t.text + '.' };
    }
    return t;
  });
}

/* ---------- the player (browser only) ---------- */
function player() {
  let sprite = null, manifest = null, loading = null, run = 0, on = true, onCaption = () => {}, onEnd = () => {};
  try { on = localStorage.getItem('halsey-recorder') !== 'off'; } catch (e) {}
  async function load(ctx) {
    if (sprite || !ctx) return sprite; if (loading) return loading;
    loading = (async () => {
      try {
        manifest = await (await fetch('voice/recorder.json')).json();
        const buf = await (await fetch('voice/recorder.mp3')).arrayBuffer();
        sprite = await ctx.decodeAudioData(buf);
      } catch (e) { sprite = null; }
      return sprite;
    })();
    return loading;
  }
  /* the device's own voice, for words with no clip: an old robotic voice if there is one */
  let devVoice;
  function deviceVoice() {
    if (devVoice !== undefined || !('speechSynthesis' in root)) return devVoice;
    const vs = speechSynthesis.getVoices(); if (!vs.length) return null;
    devVoice = ['Fred', 'Ralph', 'Zarvox', 'Albert', 'Junior'].map(n => vs.find(v => v.name.startsWith(n))).find(Boolean) || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
    return devVoice;
  }
  function speakDevice(text, my) {
    return new Promise(res => {
      if (!('speechSynthesis' in root)) return res();
      const u = new SpeechSynthesisUtterance(text); const v = deviceVoice(); if (v) u.voice = v;
      u.rate = .92; u.pitch = v && /Fred|Ralph|Zarvox|Albert|Junior/.test(v.name) ? 1 : .55; u.volume = .9;
      const cap = setTimeout(res, Math.min(15000, 900 + text.length * 85));   // some devices never say they finished
      u.onend = u.onerror = () => { clearTimeout(cap); res(); }; speechSynthesis.speak(u);
      const watch = setInterval(() => { if (my !== run) { speechSynthesis.cancel(); clearInterval(watch); res(); } }, 120);
      u.addEventListener('end', () => clearInterval(watch));
    });
  }
  function clip(ctx, bus, t) {
    const m = manifest && manifest.clips[t.id]; if (!m || !sprite) return null;
    if (t.check && m[2] !== t.check) return null;   // the card's words changed in the editor: say the new ones another way
    return m;
  }
  /* say a list of tokens. Returns when finished or interrupted. */
  async function say(toks, { ctx, bus, sound } = {}) {
    const my = ++run; if (!on) return;
    if (sound && ctx) await load(ctx);
    const words = [];
    for (let i = 0; i < toks.length; i++) {
      if (my !== run) return;
      const t = toks[i]; words.push(t.text); onCaption(words.join(' '), toks.map(x => x.text).join(' '), false);
      if (!sound || !ctx) { await wait(Math.min(2200, 110 + t.text.length * 45), my); continue; }
      const m = clip(ctx, bus, t);
      if (m) {
        const src = ctx.createBufferSource(); src.buffer = sprite; src.connect(bus);
        const lead = manifest.lead || 0;
        src.start(ctx.currentTime + .02, Math.max(0, m[0] + (manifest.shift || 0) - lead), m[1] + lead * 2);
        await wait((m[1] + lead) * 1000, my); if (my !== run) { try { src.stop(); } catch (e) {} return; }
      } else await speakDevice(t.text, my);
      await wait(/[.:]$/.test(t.text) ? 170 : 40, my);
    }
    if (my === run) { onCaption(toks.map(x => x.text).join(' '), null, true); onEnd(); }
  }
  const wait = (ms, my) => new Promise(r => { const t0 = Date.now(); const tick = () => (my !== run || Date.now() - t0 >= ms) ? r() : setTimeout(tick, Math.min(40, ms)); tick(); });
  return {
    say, load,
    stop() { run++; try { if ('speechSynthesis' in root) speechSynthesis.cancel(); } catch (e) {} },
    get on() { return on; },
    set(v) { on = v; try { localStorage.setItem('halsey-recorder', v ? 'on' : 'off'); } catch (e) {} if (!v) this.stop(); },
    caption(fn) { onCaption = fn; }, ended(fn) { onEnd = fn; },
  };
}

root.RECORDER = { LINES, ERA, vocab, entry, close, opening, record, num, numText, sayable, setPlaceNames(fn) { PLACE_NAME = fn; }, player: typeof window !== 'undefined' ? player() : null };
})(typeof window !== 'undefined' ? window : globalThis);
