/* The Recorder: the Survey's machine, reading testimony into the record in a calm, level voice.
   It speaks generated entries, not fixed scripts: each telling, each sitting's close and the whole run's
   record are composed from what you actually told, so every run's record is different.

   Voice: clips pre-rendered with Kokoro (a neural voice, Apache 2.0) with its pitch movement held to about
   two thirds of a person's, packed into files of about a minute each (voice/recorder-NN.mp3, indexed by
   voice/recorder.json), made by tools/render-voice.py. Whole phrases and whole numbers are rendered as one clip each so they flow;
   the player strings them together with Web Audio and paces the pauses between them like someone
   reading a ledger aloud. Anything without a clip (a story you wrote in the card editor) falls back to
   the device's own speech.
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
  'w.teller': 'Teller:', 'w.place': 'Place:', 'w.era': 'Era:', 'w.weight': 'Weight', 'w.vivid': 'Vivid', 'w.credibility': 'Credibility:',
  'w.of': 'of', 'w.entered': 'Entered:', 'w.status': 'Status:', 'w.sittings': 'Sittings:', 'w.believed': 'Believed:', 'w.filed': 'Filed:',
  'w.standing': 'Standing:', 'w.thousand': 'thousand', 'w.threshold': 'Threshold:',
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
const ERA = { '1888': 'Eighteen eighty-eight.', '1903': 'Nineteen oh three.', '1919': 'Nineteen nineteen.', '1926': 'Nineteen twenty-six.', '1950': 'Nineteen fifty.', '1974': 'Nineteen seventy-four.', '2000': 'Two thousand.', 'Later': 'Later.' };
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const word99 = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10) - 2] + (n % 10 ? '-' + ONES[n % 10] : '');
const word999 = n => n < 100 ? word99(n) : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + word99(n % 100) : '');
/* how the voice should say names it would otherwise get wrong; captions keep the real spelling */
const SAY = { 'Ebersole': 'Ebber-sole', 'Okamoto': 'Okka-mo-toe', 'Tomás': 'Toe-mahss', 'Arriaga': 'Ah-ree-ah-gah', 'Ybarra': 'Ee-bar-ah', 'Lindqvist': 'Lind-kvist',
  'Mbeki-Larsen': 'Em-bekky Larsen', 'Nakamura-Hill': 'Nakka-moora Hill', 'Pfeiffer': 'Fifer', 'Dvorak': 'Dvor-zhak', 'Pham': 'Fahm', 'Abuk': 'Ahbook', 'Deng': 'Deng',
  'Femi': 'Feh-mee', 'Adeyemi': 'Ah-deh-yeh-mee', 'Niobrara': 'Nye-oh-brair-ah', 'Platte': 'Plat', 'Loup': 'Loop', 'O’Neill': 'Oh Neel', 'Odette': 'Oh-det',
  'Priya': 'Pree-ya', 'Raman': 'Rah-mun', 'Deshawn': 'Deh-shawn', 'Imani': 'Ee-mah-nee', 'Marisol': 'Marry-sole', 'Arne': 'Arnah', 'Bettina': 'Beh-tee-na',
  'Maeve': 'Mayve', 'Kinkaid': 'Kin-kayd', 'Nadia': 'Nah-dya', 'Haddad': 'Hah-dad', 'Albrecht': 'Al-brekt', 'Sorensen': 'Sorr-en-sen',
  'Velzoe': 'Vel-zo', 'Ponca': 'Ponka' };
const sayable = t => t.replace(/[“”"]/g, '').replace(/[A-Za-zÀ-ÿ’'-]+/g, w => SAY[w] || w);
const plain = t => t.replace(/^[“"]|[”"]$/g, '').trim();

/* ---------- every clip the grammar can ask for ---------- */
const placeOf = t => PLACE_NAME(t.place);
const opText = t => `Sitting opened. Teller: ${t.name}. Place: ${placeOf(t)}.`;
const clText = (t, won) => `Sitting closed. ${t.name}. ${won ? 'Believed.' : 'Not believed.'}`;
const atText = t => `At ${placeOf(t)}, to ${t.name.split(' ')[0]}.`;
const ofText = n => `of ${word999(n)}.`;
function thresholds(K) {
  const out = new Set();
  for (let c = 0; c <= (K.COLS || 8) + 4; c++) for (const kind of ['sitting', 'holdout', 'bridge']) out.add(K.threshold({ c, kind }));
  return [...out].sort((a, b) => a - b);
}
function vocab(K) {
  const v = [];
  const add = (id, text, say) => v.push({ id, text, say: sayable(say || text) });
  if (K.PLACE) PLACE_NAME = k => K.PLACE[k] || k;
  for (const [id, t] of Object.entries(LINES)) add(id, t);
  for (const [k, t] of Object.entries(ERA)) add('era.' + k, t);
  for (let n = 0; n < 1000; n++) add('n.' + n, word999(n), word999(n) + '.');   // whole numbers, said the way they end a line
  for (let n = 1; n < 100; n++) add('en.' + n, `Entry ${word99(n)}.`);
  for (const n of thresholds(K)) add('of.' + n, ofText(n));
  for (const t of K.TELLERS) { add('op.' + t.id, opText(t), opText(t).replace('Teller:', 'Teller.').replace('Place:', 'Place.')); /* a full stop, so the label never runs into the name */ add('cl.' + t.id + '.won', clText(t, true)); add('cl.' + t.id + '.lost', clText(t, false)); add('at.' + t.id, atText(t)); }
  for (const r of K.RANKS.map(r => r[1]).concat(['Struck from the record'])) add('rk.' + r.toLowerCase().replace(/\W+/g, '-'), r + '.');
  for (const [k, kp] of Object.entries(K.KEEPS)) add('kp.' + k, kp.name + '.');
  for (const c of K.CARDS) add('q.' + c.id, plain(c.quote));
  return v;
}

/* ---------- the grammar ---------- */
const tok = (id, text) => ({ id, text: text ?? LINES[id] });
/* a token whose words come from the game's data carries them as a check: if the data changed since the
   voice was rendered, the player says the new words another way */
const live = (id, text) => ({ id, text, check: text });
function num(n) {
  n = Math.max(0, Math.round(n)); const out = [];
  if (n >= 1000) { out.push(...num(Math.floor(n / 1000)), tok('w.thousand')); n %= 1000; if (!n) return out; }
  out.push(tok('n.' + n, word999(n))); return out;
}
const numText = toks => toks.map(t => t.text).join(' ');
const R = seed => { let s = (seed >>> 0) || 7; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const pick = (a, r) => a[Math.floor(r() * a.length)];
const gloss = (theme, r) => { const id = `g.${theme}.${1 + Math.floor(r() * 3)}`; return tok(id); };
const quote = c => live('q.' + c.id, plain(c.quote));
const most = arr => { const m = {}; for (const x of arr) m[x] = (m[x] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0]; };
const ofTok = n => live('of.' + n, ofText(n));

/* one telling: an opener, the testimony itself, sometimes what the machine makes of it, then the numbers */
function entry({ n, cards, e, seed }) {
  const r = R(seed), out = [];
  if (n === 1 || r() < .4) out.push(n < 100 ? tok('en.' + n, `Entry ${word99(n)}.`) : tok('o.entry'), ...(n < 100 ? [] : num(n)));
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
  const won = result === 'won';
  return dot([live(`cl.${teller.id}.${won ? 'won' : 'lost'}`, clText(teller, won)), tok('w.credibility'), ...num(cred), ofTok(threshold),
    ...(holdout && won ? [tok('v.unsigned')] : [])]);
}
function opening({ teller, threshold }) {
  return dot([live('op.' + teller.id, opText(teller)), tok('w.threshold'), ...num(threshold)]);
}
let PLACE_NAME = k => k;
/* the whole run, read back: where you were, what you said that counted most, what it came to */
function record({ sittings, told, given, filed, standing, keeps, rank, ending, struck, seed }) {
  const r = R(seed), segs = [[tok(pick(['r.head', 'r.head2'], r))]];
  for (const s of sittings) {
    const seg = [live('at.' + s.teller.id, atText(s.teller))];
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
/* captions read as sentences: a number ends with a period unless "of" follows it */
const isNum = t => t.id.startsWith('n.') || t.id === 'w.thousand';
function dot(toks) {
  return toks.map((t, i) => {
    const nx = toks[i + 1];
    if (isNum(t) && !(nx && isNum(nx)) && !/[.:]$/.test(t.text) && !(nx && (nx.id === 'w.of' || nx.id.startsWith('of.')))) return { ...t, text: t.text + '.' };
    return t;
  });
}
/* the pace: how long the reader waits after each clip, like someone reading a ledger aloud.
   Labels lead straight into their value, a sentence gets a breath, a story gets time to land. */
function pauseAfter(t, nx, i) {
  if (!nx) return 0;
  const j = 1 + (((i * 2654435761) >>> 0) % 1000 / 1000 - .5) * .22;   // a little unevenness, the same every time
  let ms;
  if (t.seg !== undefined && nx.seg !== t.seg) ms = 1050;               // the record: a new part
  else if (t.id.startsWith('q.')) ms = 700;                             // after testimony
  else if (/^[gev]\./.test(t.id) || t.id.startsWith('cl.') || t.id.startsWith('op.')) ms = 520;
  else if (/:$/.test(t.text)) ms = 120;                                 // a label, then its value
  else if (isNum(t) && nx && (nx.id === 'w.of' || nx.id.startsWith('of.'))) ms = 110;
  else if (isNum(t) && nx && isNum(nx)) ms = 30;
  else if (/[.,]$/.test(t.text)) ms = 330;
  else ms = 80;
  if (nx.id.startsWith('q.')) ms = Math.max(ms, 380);                    // a breath before testimony
  return Math.round(ms * j);
}

/* ---------- the player (browser only) ---------- */
function player() {
  let manifest = null, loading = null, run = 0, on = true, onCaption = () => {}, onEnd = () => {};
  try { on = localStorage.getItem('halsey-recorder') !== 'off'; } catch (e) {}
  /* the voice comes in files of about a minute each, fetched and decoded only when a line needs one.
     Decoded audio is large, so it's decoded at the voice's own low rate and only the last few files are kept. */
  const files = new Map(), KEEP = 12;
  async function load() {
    if (manifest) return manifest; if (loading) return loading;
    loading = (async () => { try { manifest = await (await fetch('voice/recorder.json')).json(); file(0); } catch (e) { manifest = null; loading = null; } return manifest; })();
    return loading;
  }
  function decoder() {
    const sr = (manifest && manifest.sr) || 16000;
    try { return new (root.OfflineAudioContext || root.webkitOfflineAudioContext)(1, sr, sr); } catch (e) { return null; }
  }
  function file(i, ctx) {
    if (files.has(i)) { const f = files.get(i); files.delete(i); files.set(i, f); return f; }
    const f = (async () => {
      const buf = await (await fetch('voice/' + manifest.files[i])).arrayBuffer();
      const dec = decoder() || ctx;
      try { return await new Promise((res, rej) => { const p = dec.decodeAudioData(buf, res, rej); if (p && p.catch) p.catch(rej); }); }
      catch (e) { if (ctx && dec !== ctx) return await ctx.decodeAudioData(buf); throw e; }
    })().catch(() => { files.delete(i); return null; });
    files.set(i, f);
    while (files.size > KEEP) files.delete(files.keys().next().value);
    return f;
  }
  /* the device's own voice, for words with no clip: a calm American voice if there is one */
  let devVoice;
  const PREFER = ['Microsoft Guy', 'Microsoft Andrew', 'Microsoft Christopher', 'Aaron', 'Evan', 'Nathan', 'Tom', 'Alex', 'Microsoft David', 'Google US English'];
  function deviceVoice() {
    if (devVoice !== undefined || !('speechSynthesis' in root)) return devVoice;
    const vs = speechSynthesis.getVoices(); if (!vs.length) return null;
    devVoice = PREFER.map(n => vs.find(v => v.name.startsWith(n) && /^en/i.test(v.lang))).find(Boolean) || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
    return devVoice;
  }
  function speakDevice(text, my) {
    return new Promise(res => {
      if (!('speechSynthesis' in root)) return res();
      const u = new SpeechSynthesisUtterance(text); const v = deviceVoice(); if (v) u.voice = v;
      u.rate = .9; u.pitch = .85; u.volume = .9;
      const cap = setTimeout(res, Math.min(15000, 900 + text.length * 85));   // some devices never say they finished
      u.onend = u.onerror = () => { clearTimeout(cap); res(); }; speechSynthesis.speak(u);
      const watch = setInterval(() => { if (my !== run) { speechSynthesis.cancel(); clearInterval(watch); res(); } }, 120);
      u.addEventListener('end', () => clearInterval(watch));
    });
  }
  function clip(t) {
    const m = manifest && manifest.clips[t.id]; if (!m) return null;
    if (t.check && m[3] !== t.check) return null;   // the card's words changed in the editor: say the new ones another way
    return m;
  }
  /* say a list of tokens. Returns when finished or interrupted. */
  async function say(toks, { ctx, bus, sound } = {}) {
    const my = ++run; if (!on) return;
    if (sound && ctx) {
      await load();
      /* fetch every file this line needs before it starts, so it doesn't stall halfway */
      if (manifest) await Promise.all([...new Set(toks.map(clip).filter(Boolean).map(m => m[0]))].map(i => file(i, ctx)));
      if (my !== run) return;
    }
    const words = [];
    for (let i = 0; i < toks.length; i++) {
      if (my !== run) return;
      const t = toks[i]; words.push(t.text); onCaption(words.join(' '), toks.map(x => x.text).join(' '), false);
      if (!sound || !ctx) { await wait(Math.min(3200, 160 + t.text.length * 62) + pauseAfter(t, toks[i + 1], i), my); continue; }
      const m = clip(t), buf = m && await file(m[0], ctx);
      if (my !== run) return;
      if (buf) {
        const src = ctx.createBufferSource(); src.buffer = buf; src.connect(bus);
        const lead = manifest.lead || 0;
        src.start(ctx.currentTime + .02, Math.max(0, m[1] + (manifest.shift || 0) - lead), m[2] + lead * 2);
        await wait((m[2] + lead) * 1000, my); if (my !== run) { try { src.stop(); } catch (e) {} return; }
      } else await speakDevice(t.text, my);
      await wait(pauseAfter(t, toks[i + 1], i), my);
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

root.RECORDER = { LINES, ERA, vocab, entry, close, opening, record, num, numText, sayable, pauseAfter, setPlaceNames(fn) { PLACE_NAME = fn; }, player: typeof window !== 'undefined' ? player() : null };
})(typeof window !== 'undefined' ? window : globalThis);
