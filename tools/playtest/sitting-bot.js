// Bot playtester for prototypes/sitting: `node tools/playtest/sitting-bot.js [runs]`
// Walks the map (sittings and holdouts when standing is healthy, arches and roads when it isn't),
// tries every affordable telling of 1-3 cards each time and tells the best, trades its weakest card for
// the strongest offer, files its weakest stories at courthouses, and takes keepsakes when offered.
require('../../prototypes/sitting/game.js');
const K = globalThis.SITTING;
const runs = +process.argv[2] || 400;

function combos(h) { const o = []; for (let i = 0; i < h.length; i++) { o.push([h[i]]); for (let j = i + 1; j < h.length; j++) { o.push([h[i], h[j]]); for (let k = j + 1; k < h.length; k++) o.push([h[i], h[j], h[k]]); } } return o; }
function playTurn(G) {
  const S = G.S;
  for (let guard = 0; guard < 6; guard++) {
    let best = null;
    for (const c of combos(S.hand)) {
      if (!K.canTell(S, c)) continue;
      const e = K.evaluate(S, c);
      const val = e.total + (e.answer ? 25 : 0) + (e.wants && S.intent.kind === 'doubt' ? S.intent.n + 20 : 0) + e.standing * 40 + e.draw * 6;
      const per = val / Math.max(1, e.cost);
      if (!best || per + val * .02 > best.per + best.val * .02) best = { c, val, per };
    }
    if (!best) break;
    K.tell(G, best.c); if (G.over) return;
  }
}
const strength = c => c.w * c.v;
function sitting(G, node) {
  K.startSitting(G, node);
  let out; do { playTurn(G); if (G.over) return; out = K.endTurn(G); } while (!out.result && !G.over);
  if (G.over) return;
  if (G.S.result === 'won') {
    const take = K.offers(G).sort((a, b) => strength(b) - strength(a))[0], give = [...G.deck].sort((a, b) => strength(a) - strength(b))[0];
    K.trade(G, take, give);
    if (node.kind === 'holdout') K.takeKeep(G, K.keepOffer(G, 1)[0]);
  }
}
const kindsSeen = {}, byCol = {}; let struck = 0, finals = [], ranks = {}, keepsHeld = 0;
for (let n = 0; n < runs; n++) {
  const G = K.newRun(5000 + n);
  while (!G.over) {
    const opts = K.reachable(G); if (!opts.length) break;
    const pref = nd => nd.kind === 'bridge' ? 0 : G.standing >= 7 ? ({ sitting: 1, holdout: G.standing >= 9 ? 0 : 3, courthouse: 2, road: 4, arch: 5 })[nd.kind] : ({ arch: 1, road: 2, courthouse: 3, sitting: 4, holdout: 6 })[nd.kind];
    const node = opts.sort((a, b) => pref(a) - pref(b))[0];
    K.goTo(G, node.id); kindsSeen[node.kind] = (kindsSeen[node.kind] || 0) + 1;
    if (node.teller) { sitting(G, node); const h = G.history[G.history.length - 1]; if (h) { const k = node.kind === 'sitting' ? 'col' + node.c : node.kind; (byCol[k] ||= { won: 0, n: 0, thr: h.threshold, cred: 0 }); byCol[k].n++; byCol[k].cred += h.cred; if (h.result === 'won') byCol[k].won++; } }
    if (node.kind === 'arch') { if (G.standing < 8) K.arch(G, 'rest'); else K.arch(G, 'retell', [...G.deck].sort((a, b) => strength(b) - strength(a))[0]); }
    if (node.kind === 'road') { const ev = K.ROAD[node.road]; K.roadChoose(G, ev, ev.choices[G.standing < 7 ? ev.choices.findIndex(c => (c.standing || 0) > 0) >= 0 ? ev.choices.findIndex(c => (c.standing || 0) > 0) : 0 : 0]); }
    if (node.kind === 'courthouse') { const f = [...G.deck].filter(c => K.canFile(G, c)).sort((a, b) => strength(a) - strength(b)).slice(0, 2); K.file(G, f); K.takeKeep(G, K.keepOffer(G, 2)[0]); }
    if (node.kind === 'bridge') break;
  }
  if (G.struck) struck++; keepsHeld += G.keeps.length;
  finals.push(K.finalScore(G)); const r = K.rank(G); ranks[r] = (ranks[r] || 0) + 1;
}
finals.sort((a, b) => a - b);
console.log(`runs ${runs}, struck from the record ${(100 * struck / runs).toFixed(0)}%, keepsakes per run ${(keepsHeld / runs).toFixed(1)}`);
for (const k of Object.keys(byCol).sort()) { const s = byCol[k]; console.log(`${k.padEnd(9)} threshold ${String(s.thr).padStart(4)}  won ${(100 * s.won / s.n).toFixed(0).padStart(3)}%  avg cred ${(s.cred / s.n).toFixed(0).padStart(4)}  (${s.n})`); }
console.log('nodes visited', kindsSeen);
console.log('final score: p10', finals[Math.floor(runs * .1)], 'median', finals[runs >> 1], 'p90', finals[Math.floor(runs * .9)]);
console.log('ranks', ranks);
