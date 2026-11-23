// Bot playtester for prototypes/sitting: `node tools/playtest/sitting-bot.js [runs]`
// Each turn it tries every affordable telling of 1-3 cards and tells the best (credibility per trust, with
// a nudge toward answering reservations and wants), repeats while trust lasts, and holds Spare cards it can't use well.
// Trade: takes the strongest offer, gives away its weakest card. Arch: rests below 7 standing, else retells its best card.
require('../../prototypes/sitting/game.js');
const K = globalThis.SITTING;
const runs = +process.argv[2] || 500;

function combos(hand) {
  const out = [];
  for (let i = 0; i < hand.length; i++) { out.push([hand[i]]);
    for (let j = i + 1; j < hand.length; j++) { out.push([hand[i], hand[j]]);
      for (let k = j + 1; k < hand.length; k++) out.push([hand[i], hand[j], hand[k]]); } }
  return out;
}
function playTurn(G) {
  const S = G.S;
  for (let guard = 0; guard < 6; guard++) {
    let best = null;
    for (const c of combos(S.hand)) {
      if (!K.canTell(S, c)) continue;
      const e = K.evaluate(S, c);
      const val = e.total + (e.answer ? 25 : 0) + (e.wants && S.intent.kind === 'doubt' ? S.intent.n : 0) + e.standing * 30 + e.draw * 6;
      const per = val / Math.max(1, e.cost);
      if (!best || per + val * .02 > best.per + best.val * .02) best = { c, val, per };
    }
    if (!best) break;
    K.tell(G, best.c);
    if (G.over) return;
  }
}
const stats = K.TELLERS.map(() => ({ won: 0, played: 0, cred: 0, days: 0 }));
let struck = 0, finals = [], ranks = {};
for (let n = 0; n < runs; n++) {
  const G = K.newRun(1000 + n); K.startSitting(G);
  while (!G.over) {
    let out;
    do { playTurn(G); if (G.over) break; out = K.endTurn(G); } while (!out.result && !G.over);
    const h = G.history[G.history.length - 1]; if (h) { const s = stats[G.sitting]; s.played++; s.cred += h.cred; s.days += h.day; if (h.result === 'won') s.won++; }
    if (G.over) break;
    if (G.S.result === 'won') {
      const off = K.offers(G), take = off.sort((a, b) => b.w * b.v - a.w * a.v)[0];
      const give = [...G.deck].sort((a, b) => a.w * a.v - b.w * b.v)[0];
      K.trade(G, take, give);
    }
    if (G.standing < 7) K.arch(G, 'rest'); else K.arch(G, 'retell', [...G.deck].sort((a, b) => b.w * b.v - a.w * a.v)[0]);
    if (!K.nextSitting(G)) break;
  }
  if (G.struck) struck++;
  finals.push(K.finalScore(G)); const r = K.rank(G); ranks[r] = (ranks[r] || 0) + 1;
}
finals.sort((a, b) => a - b);
console.log(`runs ${runs}, struck from the record: ${(100 * struck / runs).toFixed(0)}%`);
K.TELLERS.forEach((T, i) => { const s = stats[i]; console.log(`${T.name.padEnd(20)} threshold ${String(T.threshold).padStart(4)}  won ${(100 * s.won / Math.max(1, s.played)).toFixed(0).padStart(3)}%  avg cred ${(s.cred / Math.max(1, s.played)).toFixed(0).padStart(4)}  avg day ${(s.days / Math.max(1, s.played)).toFixed(1)}`); });
console.log('final score: median', finals[runs >> 1], 'p10', finals[Math.floor(runs * .1)], 'p90', finals[Math.floor(runs * .9)]);
console.log('ranks', ranks);
