/* Halsey sittings: the deck builder's rules, with no drawing in them.
   Used by sitting.html and by tools/playtest/sitting-bot.js.

   Trust is what you spend. Credibility is what you win: Weight × Vivid per telling.
   Standing is your health across the run. Score decides your rank at the end. */
"use strict";
(function (root) {

/* ---------------- cards ----------------
   cost (trust), w (weight), v (vivid), theme, place, era, event, people, art {kind, src, over}
   art kinds: archive (public photo, sepia), drawing (your notebook), object (your sculpture or a creature),
   render (Gemini place in the event's ink, optionally with a drawing over it) */
const C = (id, title, quote, theme, place, era, event, cost, w, v, art, extra = {}) => ({ id, title, quote, theme, place, era, event, cost, w, v, art, people: [], ...extra });
const CARDS = [
  // carried from home: your starting deck
  C('talk-weather', 'The weather, mostly', 'It was hot. Then it wasn’t.', 'Weather', 'halsey', 'Later', null, 0, 2, 1, { kind: 'drawing', src: 'sketches/stars.png' }, { small: true }),
  C('talk-kin', 'Who’s related to who', 'Your aunt’s my cousin, near enough.', 'Kin', 'halsey', 'Later', null, 0, 2, 1, { kind: 'drawing', src: 'sketches/traveler.png' }, { small: true }),
  C('rows', 'Planting the rows by hand', 'Twelve hundred a day with a bar and a bucket.', 'Work', 'halsey', '1903', 'Repeat', 1, 6, 1, { kind: 'render', src: 'img/halsey-rows.jpg', over: 'sketches/tower.png' }),
  C('hail', 'The hail that flattened the rows', 'Somebody wrote down every broken tree.', 'Weather', 'halsey', '1903', 'Chain', 1, 5, 1, { kind: 'render', src: 'img/halsey-rows.jpg' }),
  C('bridge-thing', 'The thing under the bridge', 'It didn’t chase me. It just looked.', 'Strange', 'halsey', 'Later', 'Risk', 2, 9, 2, { kind: 'drawing', src: 'sketches/critter.png' }),
  C('tree-lights', 'Lights past the tower', 'They went out when I stopped walking.', 'Strange', 'halsey', '1974', 'Find', 1, 4, 2, { kind: 'drawing', src: 'sketches/tower.png' }),
  C('walked-rows', 'Something walked the rows', 'Every row had the same track down the middle.', 'Strange', 'halsey', '1950', 'Repeat', 1, 5, 1, { kind: 'render', src: 'img/night-halsey-rows.jpg' }),
  C('fence-posts', 'We burned the fence posts', 'We kept one. We walk around it.', 'Weather', 'sandhills', '1888', 'Spare', 1, 5, 1, { kind: 'archive', src: 'public/loc-2005693378.jpg', credit: 'Solomon D. Butcher, 1886 · Library of Congress' }),
  C('turtle', 'The turtle crossing', 'We sat down in the road and waited.', 'Animals', 'sandhills', '1950', 'Spare', 1, 4, 1, { kind: 'object', src: 'objects/beast-turtle.png' }),
  C('stock-tank', 'Reading by the stock tank', 'The moon on the water was enough.', 'Light', 'sandhills', '1888', 'Repeat', 1, 5, 1, { kind: 'archive', src: 'public/loc-2005693384.jpg', credit: 'Solomon D. Butcher · Library of Congress' }),
  C('fog-cranes', 'Fog so thick the cranes walked', 'Thousands of feet in the water, nobody flying.', 'Animals', 'platte', 'Later', 'Chain', 1, 5, 2, { kind: 'render', src: 'img/platte-cranes.jpg', over: 'sketches/crane-standing.png' }),
  C('power', 'When the power came', 'We stood in the yard looking at the house.', 'Light', 'sandhills', '1950', 'Find', 1, 6, 1, { kind: 'archive', src: 'public/loc-2005693387.jpg', credit: 'Solomon D. Butcher · Library of Congress' }),

  // Ruth's stories (Halsey)
  C('ruth-page', 'My great-nephew’s page', '“Gus. Will want to leave.”', 'Kin', 'halsey', 'Later', 'Risk', 2, 8, 3, { kind: 'render', src: 'img/halsey-rows.jpg', over: 'sketches/drawn-gus.png' }, { people: ['ruth', 'gus'], rare: true }),
  C('ruth-foreman', 'What the foreman said', '“Plant them like you’ll be here when they’re grown.”', 'Work', 'halsey', '1903', 'Find', 1, 6, 2, { kind: 'drawing', src: 'sketches/drawn-ruth.png' }, { people: ['ruth'] }),
  C('ruth-twelve', 'Twelve hundred a day', 'My hands still count.', 'Work', 'halsey', '1903', 'Chain', 1, 7, 1, { kind: 'render', src: 'img/halsey-rows.jpg', over: 'sketches/drawn-ruth.png' }, { people: ['ruth'] }),
  C('ruth-ledger', 'A page for every tree', 'Some pages have more in them than the tree.', 'Work', 'halsey', '1903', 'Spare', 1, 5, 2, { kind: 'object', src: 'objects/arch-red-blue.png' }, { people: ['ruth'] }),

  // Tomás's stories (the North Loup)
  C('tomas-landing', 'The landing moved forty feet', 'The river doesn’t ask. I just move the post.', 'Water', 'loup', 'Later', 'Repeat', 1, 7, 2, { kind: 'render', src: 'img/loup-fog.jpg', over: 'sketches/drawn-tomas.png' }, { people: ['tomas'] }),
  C('tomas-ada', 'Teaching Ada to pole', 'She doesn’t fight the river. She asks it.', 'Kin', 'loup', 'Later', 'Find', 1, 6, 2, { kind: 'drawing', src: 'sketches/drawn-ada.png' }, { people: ['tomas', 'ada'] }),
  C('tomas-ice', 'Ice thick enough to drive', 'We walked it anyway, in the dark, listening.', 'Water', 'loup', '1974', 'Risk', 2, 10, 2, { kind: 'render', src: 'img/night-loup-fog.jpg' }, { people: ['tomas'] }),
  C('tomas-pivot', 'An owl on the pivot', 'We named the pipe, not the owl.', 'Animals', 'loup', '2000', 'Chain', 1, 6, 1, { kind: 'object', src: 'objects/beast-owl.png' }, { people: ['tomas'] }),

  // Odette's stories (the Register of Deeds)
  C('odette-survey', 'Her grandmother’s Survey', 'The baby is in four of the stories.', 'Kin', 'courthouse', '1903', 'Chain', 1, 8, 2, { kind: 'archive', src: 'public/loc-2005693386.jpg', credit: 'Solomon D. Butcher · Library of Congress' }, { people: ['odette'] }),
  C('odette-copy', 'Copying the deed books', 'My hand will be in the record longer than I will.', 'Work', 'courthouse', 'Later', 'Spare', 1, 7, 2, { kind: 'drawing', src: 'sketches/drawn-odette.png' }, { people: ['odette'] }),
  C('odette-lamp', 'The lamp they keep', 'Nobody pays for it. It’s in the agreement.', 'Light', 'courthouse', '1903', 'Spare', 2, 9, 3, { kind: 'drawing', src: 'sketches/bulb.png' }, { people: ['odette'], rare: true }),
  C('odette-bees', 'Bees in the courthouse wall', 'The deeds smell like honey in July.', 'Animals', 'courthouse', 'Later', 'Find', 1, 6, 2, { kind: 'render', src: 'img/courthouse.jpg', over: 'sketches/crane-small.png' }, { people: ['odette'] }),
];
const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
const START = ['talk-weather', 'talk-kin', 'rows', 'hail', 'bridge-thing', 'tree-lights', 'walked-rows', 'fence-posts', 'turtle', 'stock-tank', 'fog-cranes', 'power'];

/* ---------------- tellers ----------------
   intents cycle one per turn. ask: stories with that tag weigh double this turn.
   doubt: at the end of the turn they knock that much credibility off, unless you told something they want.
   own: they tell you one of theirs; it goes to your hand for this sitting. quiet: one less trust next turn.
   reservation: halves Vivid until a telling includes a story with that tag. */
const TELLERS = [
  { id: 'ruth', name: 'Ruth Ebersole', place: 'halsey', placeName: 'The planted forest, Halsey', img: 'img/halsey-rows.jpg', drawing: 'sketches/drawn-ruth.png', photo: 'img/cast-ruth.jpg',
    want: 'Work', line: 'Every tree in these rows has a page. Sit down.', threshold: 140,
    reservation: { text: 'Only trusts people who’ve planted something', tag: ['theme', 'Work'] },
    intents: [{ kind: 'ask', tag: ['place', 'halsey'], label: 'Asks about Halsey' }, { kind: 'doubt', n: 12 }, { kind: 'own' }, { kind: 'quiet' }],
    stories: ['ruth-page', 'ruth-foreman', 'ruth-twelve', 'ruth-ledger'] },
  { id: 'tomas', name: 'Tomás Arriaga', place: 'loup', placeName: 'The North Loup in fog', img: 'img/loup-fog.jpg', drawing: 'sketches/drawn-tomas.png', photo: 'img/cast-tomas.jpg',
    want: 'Water', line: 'The river moved forty feet this spring. Talk slow.', threshold: 240,
    reservation: { text: 'Won’t talk to someone in a hurry', tag: ['event', 'Spare'] },
    intents: [{ kind: 'doubt', n: 18 }, { kind: 'ask', tag: ['theme', 'Water'], label: 'Asks about the river' }, { kind: 'own' }, { kind: 'doubt', n: 18 }],
    stories: ['tomas-landing', 'tomas-ada', 'tomas-ice', 'tomas-pivot'] },
  { id: 'odette', name: 'Odette Mbeki-Larsen', place: 'courthouse', placeName: 'Register of Deeds', img: 'img/courthouse.jpg', drawing: 'sketches/drawn-odette.png', photo: 'img/cast-odette.jpg',
    want: 'Kin', line: 'Everything in this room was signed by somebody’s grandmother.', threshold: 340,
    reservation: { text: 'Wants it on the record: something from 1903', tag: ['era', '1903'] },
    intents: [{ kind: 'ask', tag: ['theme', 'Kin'], label: 'Asks about family' }, { kind: 'doubt', n: 25 }, { kind: 'own' }, { kind: 'ask', tag: ['era', '1903'], label: 'Asks about 1903' }],
    stories: ['odette-survey', 'odette-copy', 'odette-lamp', 'odette-bees'] },
];
const DAYS = 4, TRUST = 3, HAND = 5, MAX_TELL = 3, START_STANDING = 10;
const RANKS = [[0, 'Noted'], [600, 'Entered'], [850, 'Recorded'], [1050, 'Indexed'], [1250, 'Bound into the record']];

/* ---------------- helpers ---------------- */
function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const tagOf = (c, [k, v]) => (k === 'event' ? c.event === v : c[k] === v);
/* an instance of a card in a run: its base, plus upgrades and retellings */
let uid = 0;
const inst = (id, mods = {}) => ({ uid: ++uid, id, ...CARD[id], ...mods });

/* ---------------- a run ---------------- */
function newRun(seed = Date.now()) {
  return { seed, r: rng(seed), standing: START_STANDING, score: 0, sitting: 0, deck: START.map(id => inst(id)), given: [], history: [], over: false };
}

function startSitting(G) {
  const T = TELLERS[G.sitting], r = G.r;
  const S = { T, cred: 0, day: 1, trustMax: TRUST, trust: TRUST, warm: false, reservation: true, quietNext: false,
    draw: shuffle(G.deck.map(c => ({ ...c })), r), hand: [], discard: [], telling: [], last: null, spareBonus: 0, answered: false, intentI: 0, log: [], result: null };
  S.intent = T.intents[0];
  drawN(S, HAND, r); applyStartIntent(S, G);
  G.S = S; return S;
}
function drawN(S, n, r) {
  for (let i = 0; i < n; i++) {
    if (!S.draw.length) { if (!S.discard.length) return; S.draw = shuffle(S.discard, r); S.discard = []; }
    S.hand.push(S.draw.pop());
  }
}
function applyStartIntent(S, G) {
  if (S.intent.kind === 'own') {
    const pool = S.T.stories.filter(id => !S.hand.some(c => c.id === id));
    const id = pool[Math.floor(G.r() * pool.length)];
    if (id) { const c = inst(id, { borrowed: true }); S.hand.push(c); S.log.push({ t: 'own', card: c }); }
  }
}

/* score a telling (1 to 3 cards) without changing anything: the numbers the player sees */
function evaluate(S, cards) {
  const T = S.T, parts = [];
  if (!cards.length) return { weight: 0, vivid: 0, total: 0, parts, cost: 0, standing: 0, draw: 0 };
  const cost = cards.reduce((a, c) => a + c.cost, 0);
  let weight = 0;
  for (const c of cards) {
    let w = c.w;
    if (S.intent.kind === 'ask' && tagOf(c, S.intent.tag)) { w *= 2; }
    weight += w;
  }
  if (S.intent.kind === 'ask' && cards.some(c => tagOf(c, S.intent.tag))) parts.push({ k: 'w', label: S.intent.label + ': ×2 weight' });
  let vivid = Math.max(...cards.map(c => c.v));
  const shared = key => cards.length > 1 && new Set(cards.map(c => c[key])).size < cards.length;
  if (shared('theme')) { vivid++; parts.push({ k: 'v', label: 'Witnesses: same theme +1' }); }
  if (shared('place')) { vivid++; parts.push({ k: 'v', label: 'Ground: same place +1' }); }
  if (shared('era')) { vivid++; parts.push({ k: 'v', label: 'Kept: same era +1' }); }
  const thread = cards.length > 1 && cards.some((c, i) => cards.some((d, j) => j !== i && c.people.some(p => d.people.includes(p))));
  if (thread || cards.some(c => c.people.includes(T.id))) { vivid++; parts.push({ k: 'v', label: thread ? 'Thread: people who know each other +1' : 'Their own story, told back +1' }); }
  if (cards.length === 3 && shared('theme') && shared('place') && shared('era')) { vivid++; parts.push({ k: 'v', label: 'Whole story +1' }); }
  if (cards.some(c => c.theme === T.want)) { vivid++; parts.push({ k: 'v', label: `They want ${T.want} +1` }); }
  // events, Repeat copying the strongest other event in the telling
  const evs = cards.map(c => c.event).filter(Boolean);
  const order = ['Risk', 'Chain', 'Find', 'Spare'], best = order.find(e => evs.includes(e));
  const fired = evs.map(e => e === 'Repeat' ? best || null : e).filter(Boolean);
  let draw = 0, standing = 0;
  const chains = S.last && cards.some(c => S.last.some(l => l.theme === c.theme || l.place === c.place));
  for (const e of fired) {
    if (e === 'Chain' && chains) { weight += 4; parts.push({ k: 'w', label: 'Chain: continues the last telling +4' }); }
    if (e === 'Find') { draw += 2; parts.push({ k: 'x', label: 'Find: draw 2' }); }
    if (e === 'Risk') { weight += 5; parts.push({ k: 'w', label: 'Risk +5' }); if (!S.warm) { standing -= 1; parts.push({ k: 'bad', label: 'Risk: they aren’t warm yet, −1 standing' }); } }
  }
  if (S.spareBonus) { weight += S.spareBonus; parts.push({ k: 'w', label: `Spare held back +${S.spareBonus}` }); }
  let answer = false;
  if (S.reservation) {
    if (cards.some(c => tagOf(c, T.reservation.tag))) { answer = true; parts.push({ k: 'good', label: 'Answers their reservation' }); }
    else { vivid = Math.max(1, Math.ceil(vivid / 2)); parts.push({ k: 'bad', label: 'Reservation: vivid halved' }); }
  }
  return { weight, vivid, total: weight * vivid, parts, cost, standing, draw, answer, wants: cards.some(c => c.theme === T.want) };
}

function canTell(S, cards) { return cards.length > 0 && cards.length <= MAX_TELL && cards.reduce((a, c) => a + c.cost, 0) <= S.trust; }

function tell(G, cards) {
  const S = G.S; if (!canTell(S, cards)) return null;
  const e = evaluate(S, cards);
  S.trust -= e.cost; S.cred += e.total; G.standing += e.standing; S.spareBonus = 0;
  if (e.answer) S.reservation = false;
  if (e.wants) S.answered = true;
  S.hand = S.hand.filter(c => !cards.includes(c));
  for (const c of cards) if (!c.borrowed) S.discard.push(c);
  S.last = cards; drawN(S, e.draw, G.r);
  if (!S.warm && S.cred >= S.T.threshold / 2) { S.warm = true; S.trustMax += 1; S.log.push({ t: 'warm' }); }
  S.log.push({ t: 'tell', cards, e });
  if (G.standing <= 0) { G.over = true; G.struck = true; }
  return e;
}

/* end of your turn: the teller acts, spares are held, the day moves on */
function endTurn(G) {
  const S = G.S, T = S.T, out = { doubt: 0, held: 0 };
  if (S.intent.kind === 'doubt' && !S.answered) { out.doubt = Math.min(S.cred, S.intent.n); S.cred -= out.doubt; G.standing -= 1; out.standing = -1; if (G.standing <= 0) { G.over = true; G.struck = true; S.result = 'lost'; return finishSitting(G, out); } }
  const held = S.hand.filter(c => c.event === 'Spare' && !c.borrowed);
  out.held = held.length; S.spareBonus = held.length * 4;
  S.discard.push(...S.hand.filter(c => !held.includes(c) && !c.borrowed)); S.hand = held;
  const quiet = S.intent.kind === 'quiet';
  S.day++; S.answered = false; S.last = S.last;
  if (S.cred >= T.threshold) { S.result = 'won'; return finishSitting(G, out); }
  if (S.day > DAYS) { S.result = 'lost'; return finishSitting(G, out); }
  S.intentI = (S.intentI + 1) % T.intents.length; S.intent = T.intents[S.intentI];
  S.trust = S.trustMax - (quiet ? 1 : 0);
  drawN(S, HAND - S.hand.length, G.r); applyStartIntent(S, G);
  return out;
}
/* you can also finish early once you’ve reached their threshold */
function finishSitting(G, out = {}) {
  const S = G.S; if (!S.result) S.result = S.cred >= S.T.threshold ? 'won' : 'lost';
  G.score += S.cred;
  if (S.result === 'lost') { G.standing -= 3; if (G.standing <= 0) { G.over = true; G.struck = true; } }
  G.history.push({ teller: S.T.id, cred: S.cred, threshold: S.T.threshold, result: S.result, day: Math.min(S.day, DAYS) });
  out.result = S.result; return out;
}

/* the trade: what they offer (three of their stories, one of them maybe a story you gave away, retold) */
function offers(G) {
  const T = G.S.T, ids = [...T.stories];
  shuffle(ids, G.r);
  const list = ids.slice(0, 3).map(id => inst(id));
  const back = G.given.find(g => !g.returned && g.at < G.sitting);
  if (back) {
    back.returned = true;
    list[2] = inst(back.card.id, { w: back.card.w + 2, v: back.card.v + 1, retold: T.name, quote: `I heard it from a surveyor: ${back.card.quote.replace(/^“|”$/g, '')}`, people: [...new Set([...back.card.people, T.id])] });
  }
  return list;
}
function trade(G, take, give) {
  if (give) { G.deck = G.deck.filter(c => c.uid !== give.uid); if (!give.small) G.given.push({ card: give, at: G.sitting }); }
  if (take) G.deck.push(take);
}
/* the arch between sittings: rest, or retell one story (+1 vivid) */
function arch(G, choice, card) {
  if (choice === 'rest') G.standing = Math.min(START_STANDING, G.standing + 2);
  if (choice === 'retell' && card) { card.v += 1; card.retellings = (card.retellings || 0) + 1; }
}
function nextSitting(G) { G.sitting++; if (G.sitting >= TELLERS.length) { G.over = true; return null; } return startSitting(G); }
function finalScore(G) { return G.score + Math.max(0, G.standing) * 15; }
function rank(G) { const s = finalScore(G); let r = RANKS[0][1]; for (const [n, name] of RANKS) if (s >= n) r = name; return G.struck ? 'Struck from the record' : r; }

root.SITTING = { CARDS, CARD, START, TELLERS, DAYS, TRUST, HAND, MAX_TELL, START_STANDING, RANKS, rng, newRun, startSitting, evaluate, canTell, tell, endTurn, finishSitting, offers, trade, arch, nextSitting, finalScore, rank, tagOf };
})(typeof window !== 'undefined' ? window : globalThis);
