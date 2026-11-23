#!/usr/bin/env node
/* Export the card, teller and keepsake data from prototypes/sitting/game.js to
   prototypes/sitting/cards.json, and refresh the copy built into the card editor
   (prototypes/sitting/editor.html), so the editor always opens on the current set.
   Run: node tools/export-cards.js */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'prototypes', 'sitting');
require(path.join(dir, 'game.js'));
const K = globalThis.SITTING;

const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const data = {
  note: 'Exported from prototypes/sitting/game.js by tools/export-cards.js. Weight (w) comes from the value budget; edit cost, v, event, theme, place, era, people, art, title and quote.',
  budget: K.BUDGET,
  eventMultiplier: K.EVMULT,
  vividCap: { basic: 1, uncommon: 2, rare: 3, exceptions: { 'fog-cranes': 2 } },
  minWeight: 2,
  cards: K.CARDS.map(c => {
    const o = pick(c, ['id', 'title', 'quote', 'theme', 'place', 'era', 'event', 'cost', 'w', 'v', 'rarity', 'people', 'art']);
    if (c.small) o.small = true;
    if (c.holdout) o.holdout = true;
    return o;
  }),
  tellers: K.TELLERS.map(t => {
    const o = pick(t, ['id', 'name', 'place', 'want', 'line', 'reservation', 'intents', 'stories', 'cols']);
    if (t.holdout) o.holdout = true;
    if (t.boss) o.boss = true;
    return o;
  }),
  keepsakes: Object.fromEntries(Object.entries(K.KEEPS).map(([k, v]) => [k, { name: v.name, text: v.text }])),
};
const json = JSON.stringify(data, null, 1);
fs.writeFileSync(path.join(dir, 'cards.json'), json + '\n');

const ed = path.join(dir, 'editor.html');
if (fs.existsSync(ed)) {
  const html = fs.readFileSync(ed, 'utf8');
  const re = /(<script id="seed-data" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) throw new Error('editor.html has no seed-data block');
  fs.writeFileSync(ed, html.replace(re, (_, a, b) => a + json.replace(/<\//g, '<\\/') + b));
}
console.log(`exported ${data.cards.length} cards, ${data.tellers.length} tellers, ${Object.keys(data.keepsakes).length} keepsakes`);
