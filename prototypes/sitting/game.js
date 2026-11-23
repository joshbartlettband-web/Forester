/* Halsey sittings: the deck builder's rules, with no drawing in them.
   Used by sitting.html and by tools/playtest/sitting-bot.js.

   Trust is what you spend. Credibility is what you win: Weight × Vivid per telling.
   Standing is your health across the run. Score decides your rank at the end.
   A run is a branching map west to east, from Halsey to the bridge over the Missouri. */
"use strict";
(function (root) {

/* ---------------- cards ----------------
   cost (trust), w (weight), v (vivid), theme, place, era, event, people, art {kind, src, over, credit}
   art kinds: archive (public photo, sepia), drawing (your notebook or a pen portrait), object (your sculpture
   or a creature), render (Gemini place in the event's ink, optionally with a drawing over it) */
const C = (id, title, quote, theme, place, era, event, cost, w, v, art, extra = {}) => ({ id, title, quote, theme, place, era, event, cost, w, v, art, people: [], ...extra });
const LOC = n => ({ kind: 'archive', src: `public/loc-${n}.jpg`, credit: 'Solomon D. Butcher · Library of Congress' });
const R = (img, over) => ({ kind: 'render', src: `img/${img}.jpg`, over: over && `sketches/${over}.png` });
const D = s => ({ kind: 'drawing', src: `sketches/${s}.png` });
const O = s => ({ kind: 'object', src: `objects/${s}.png` });
const CARDS = [
  // carried from home: your starting deck
  C('talk-weather', 'The weather, mostly', 'It was hot. Then it wasn’t.', 'Weather', 'halsey', 'Later', null, 0, 2, 1, D('stars'), { small: true }),
  C('talk-kin', 'Who’s related to who', 'Your aunt’s my cousin, near enough.', 'Kin', 'halsey', 'Later', null, 0, 2, 1, D('traveler'), { small: true }),
  C('rows', 'Planting the rows by hand', 'Twelve hundred a day with a bar and a bucket.', 'Work', 'halsey', '1903', 'Repeat', 1, 6, 1, R('halsey-rows', 'tower')),
  C('hail', 'The hail that flattened the rows', 'Somebody wrote down every broken tree.', 'Weather', 'halsey', '1903', 'Chain', 1, 5, 1, R('halsey-rows')),
  C('bridge-thing', 'The thing under the bridge', 'It didn’t chase me. It just looked.', 'Strange', 'halsey', 'Later', 'Risk', 2, 9, 2, D('critter')),
  C('tree-lights', 'Lights past the tower', 'They went out when I stopped walking.', 'Strange', 'halsey', '1974', 'Find', 1, 4, 2, D('tower')),
  C('walked-rows', 'Something walked the rows', 'Every row had the same track down the middle.', 'Strange', 'halsey', '1950', 'Repeat', 1, 5, 1, R('night-halsey-rows')),
  C('fence-posts', 'We burned the fence posts', 'We kept one. We walk around it.', 'Weather', 'sandhills', '1888', 'Spare', 1, 5, 1, { ...LOC(2005693378), credit: 'Solomon D. Butcher, 1886 · Library of Congress' }),
  C('turtle', 'The turtle crossing', 'We sat down in the road and waited.', 'Animals', 'sandhills', '1950', 'Spare', 1, 4, 1, O('beast-turtle')),
  C('stock-tank', 'Reading by the stock tank', 'The moon on the water was enough.', 'Light', 'sandhills', '1888', 'Repeat', 1, 5, 1, LOC(2005693384)),
  C('fog-cranes', 'Fog so thick the cranes walked', 'Thousands of feet in the water, nobody flying.', 'Animals', 'platte', 'Later', 'Chain', 1, 5, 2, R('platte-cranes', 'crane-standing')),
  C('power', 'When the power came', 'We stood in the yard looking at the house.', 'Light', 'sandhills', '1950', 'Find', 1, 6, 1, LOC(2005693387)),

  // Ruth (Halsey)
  C('ruth-page', 'My great-nephew’s page', '“Gus. Will want to leave.”', 'Kin', 'halsey', 'Later', 'Risk', 2, 8, 3, R('halsey-rows', 'drawn-gus'), { people: ['ruth', 'gus'], rare: true }),
  C('ruth-foreman', 'What the foreman said', '“Plant them like you’ll be here when they’re grown.”', 'Work', 'halsey', '1903', 'Find', 1, 6, 2, D('drawn-ruth'), { people: ['ruth'] }),
  C('ruth-twelve', 'Twelve hundred a day', 'My hands still count.', 'Work', 'halsey', '1903', 'Chain', 1, 7, 1, R('halsey-rows', 'drawn-ruth'), { people: ['ruth'] }),
  C('ruth-ledger', 'A page for every tree', 'Some pages have more in them than the tree.', 'Work', 'halsey', '1903', 'Spare', 1, 5, 2, O('arch-red-blue'), { people: ['ruth'] }),
  // Priya (Thedford)
  C('priya-green', 'A green sky over Thedford', 'The bees came home at noon.', 'Weather', 'thedford', '1974', 'Find', 1, 6, 2, R('thedford', 'drawn-priya'), { people: ['priya'] }),
  C('priya-rabbits', 'The jackrabbit census', 'You can’t count them. They count you.', 'Animals', 'thedford', 'Later', 'Repeat', 1, 5, 2, O('beast-jackrabbit'), { people: ['priya'] }),
  C('priya-shape', 'The shape over Thedford', 'Ten thousand birds, asking something.', 'Animals', 'thedford', 'Later', 'Chain', 2, 8, 3, D('crane-wings'), { people: ['priya'], rare: true }),
  C('priya-wind', 'Three days of wind', 'The sand came into the kitchen and lay down.', 'Weather', 'thedford', '1888', 'Risk', 2, 10, 1, LOC(2005693385), { people: ['priya'] }),
  // Deshawn (the Sandhills)
  C('deshawn-mill', 'A windmill lies about the wind', 'It tells you which way. Then it lies.', 'Weather', 'sandhills', 'Later', 'Repeat', 1, 6, 1, R('sandhills-windmill', 'face3'), { people: ['deshawn'] }),
  C('deshawn-well', 'The well that went sweet', 'Sixty years of pennies. Then it didn’t.', 'Water', 'sandhills', 'Later', 'Spare', 1, 6, 2, R('sandhills-windmill'), { people: ['deshawn'] }),
  C('deshawn-poles', 'Setting poles on the Ord line', 'You can see every pole you ever set.', 'Work', 'sandhills', '1950', 'Chain', 1, 7, 1, LOC(2005693377), { people: ['deshawn', 'arne'] }),
  C('deshawn-arch', 'The arch that moved', 'Nobody saw it go.', 'Strange', 'sandhills', 'Later', 'Repeat', 0, 3, 1, O('arch-black'), { people: ['deshawn'] }),
  // Frank, the holdout (the Dismal)
  C('frank-door', 'The door in the hill', 'It’s lit inside. It isn’t for me yet.', 'Strange', 'door', 'Later', 'Find', 1, 7, 3, R('painting-door-in-the-hill'), { people: ['frank'], rare: true, holdout: true }),
  C('frank-clay', 'The clay one by the cellar', 'It looked like old paper. Then it blinked.', 'Strange', 'dismal', 'Later', 'Spare', 1, 6, 2, O('beast-crumple'), { people: ['frank'], holdout: true }),
  C('frank-coyote', 'The coyote that walked us home', 'At the gate it sat down.', 'Animals', 'dismal', '1974', 'Risk', 2, 11, 2, O('beast-coyote'), { people: ['frank'], holdout: true }),
  C('frank-unsigned', 'Not signed', 'Write it down. It won’t count.', 'Kin', 'dismal', 'Later', 'Chain', 1, 8, 1, D('drawn-frank'), { people: ['frank', 'lou'], holdout: true }),
  // Walt (Broken Bow)
  C('walt-seed', 'The seed packet with my name', 'Mine is sweet corn.', 'Kin', 'brokenbow', '1950', 'Spare', 1, 6, 2, D('face1'), { people: ['walt'] }),
  C('walt-count', 'My aunt heard it count', 'To a number that doesn’t exist.', 'Strange', 'brokenbow', '1903', 'Chain', 2, 9, 2, LOC(2005693388), { people: ['walt'] }),
  C('walt-aurora', 'Aurora over Broken Bow', 'Pink first, then green like grass.', 'Light', 'brokenbow', 'Later', 'Chain', 1, 7, 2, R('night-broken-bow'), { people: ['walt'] }),
  C('walt-sod', 'A sod house on the Middle Loup', 'Grandmother kept a goat on the roof.', 'Kin', 'brokenbow', '1888', 'Find', 1, 6, 1, LOC(2005693381), { people: ['walt'] }),
  // Tomás (the North Loup)
  C('tomas-landing', 'The landing moved forty feet', 'The river doesn’t ask. I just move the post.', 'Water', 'loup', 'Later', 'Repeat', 1, 7, 2, R('loup-fog', 'drawn-tomas'), { people: ['tomas'] }),
  C('tomas-ada', 'Teaching Ada to pole', 'She doesn’t fight the river. She asks it.', 'Kin', 'loup', 'Later', 'Find', 1, 6, 2, D('drawn-ada'), { people: ['tomas', 'ada'] }),
  C('tomas-ice', 'Ice thick enough to drive', 'We walked it anyway, in the dark, listening.', 'Water', 'loup', '1974', 'Risk', 2, 10, 2, R('night-loup-fog'), { people: ['tomas'] }),
  C('tomas-pivot', 'An owl on the pivot', 'We named the pipe, not the owl.', 'Animals', 'loup', '2000', 'Chain', 1, 6, 1, O('beast-owl'), { people: ['tomas'] }),
  // Ada (the Platte)
  C('ada-412', 'Four hundred and twelve cranes', 'Then they all stood up and I lost count.', 'Animals', 'platte', 'Later', 'Chain', 2, 9, 3, R('platte-cranes', 'crane-dance-arms'), { people: ['ada'], rare: true }),
  C('ada-fours', 'Counting by fours', 'You count the legs and divide.', 'Animals', 'platte', 'Later', 'Find', 1, 5, 2, D('crane-step'), { people: ['ada'] }),
  C('ada-still', 'The one that stood still', 'All night. I watched it the whole time.', 'Animals', 'platte', 'Later', 'Spare', 1, 6, 2, O('beast-crane'), { people: ['ada'] }),
  C('ada-landing', 'He moved the post', 'So I moved my count.', 'Kin', 'loup', 'Later', 'Repeat', 1, 6, 1, D('drawn-ada'), { people: ['ada', 'tomas'] }),
  // Gus (the Archway)
  C('gus-sister', 'My sister took the water', 'She waved from the middle like it was nothing.', 'Leaving', 'bridge', 'Later', 'Chain', 1, 7, 2, D('drawn-gus'), { people: ['gus', 'imani'] }),
  C('gus-looked', 'It looked at me', 'Long legs, like sticks that made up their mind.', 'Strange', 'halsey', 'Later', 'Risk', 2, 10, 2, O('beast-critter'), { people: ['gus', 'ruth'] }),
  C('gus-notebook', 'The survey that never came back', 'Every page filled. No name.', 'Leaving', 'archway', 'Later', 'Find', 1, 6, 2, R('archway'), { people: ['gus'] }),
  C('gus-old', 'When I’m old enough', 'I’m going too.', 'Leaving', 'archway', 'Later', 'Spare', 1, 5, 2, R('archway', 'traveler'), { people: ['gus'] }),
  // Marisol (Columbus)
  C('marisol-cousins', 'Cousins in Columbus', 'Half signed, half didn’t. We still do Christmas.', 'Kin', 'columbus', '1974', 'Repeat', 1, 6, 2, R('columbus', 'drawn-marisol'), { people: ['marisol', 'odette'] }),
  C('marisol-quilt', 'Everyone’s initials', 'Ninety squares. Some are only initials now.', 'Kin', 'columbus', '1950', 'Spare', 1, 7, 2, D('drawn-marisol'), { people: ['marisol'] }),
  C('marisol-rivers', 'Where the two rivers argue', 'For a mile they won’t mix.', 'Water', 'columbus', '1974', 'Chain', 1, 7, 1, R('columbus'), { people: ['marisol'] }),
  C('marisol-star', 'The star hung upside down', 'On purpose. Three of us and a ladder.', 'Work', 'columbus', '1974', 'Find', 1, 6, 2, O('arch-red-hook'), { people: ['marisol'] }),
  // Arne (Main Street)
  C('arne-wire', 'The last wire into Omaha', 'The whole city came on, and only I saw.', 'Light', 'omaha', '1974', 'Risk', 2, 11, 2, R('omaha', 'face2'), { people: ['arne'] }),
  C('arne-bulb', 'The bulb that never burns out', 'We left it on a year. It got brighter.', 'Light', 'mainstreet', 'Later', 'Spare', 1, 6, 2, D('bulb'), { people: ['arne'] }),
  C('arne-poles', 'Every pole you ever set', 'Look back and there they all are.', 'Work', 'mainstreet', '1950', 'Chain', 1, 7, 1, D('face2'), { people: ['arne', 'deshawn'] }),
  C('arne-north', 'Lights in the north', 'Mother said, remember this. I have.', 'Weather', 'mainstreet', '2000', 'Find', 1, 6, 3, R('night-mainstreet'), { people: ['arne'], rare: true }),
  // Odette (the Register of Deeds)
  C('odette-survey', 'Her grandmother’s Survey', 'The baby is in four of the stories.', 'Kin', 'courthouse', '1903', 'Chain', 1, 8, 2, LOC(2005693386), { people: ['odette'] }),
  C('odette-copy', 'Copying the deed books', 'My hand will be in the record longer than I will.', 'Work', 'courthouse', 'Later', 'Spare', 1, 7, 2, D('drawn-odette'), { people: ['odette'] }),
  C('odette-lamp', 'The lamp they keep', 'Nobody pays for it. It’s in the agreement.', 'Light', 'courthouse', '1903', 'Spare', 2, 9, 3, D('bulb'), { people: ['odette'], rare: true }),
  C('odette-bees', 'Bees in the courthouse wall', 'The deeds smell like honey in July.', 'Animals', 'courthouse', 'Later', 'Find', 1, 6, 2, R('courthouse', 'crane-small'), { people: ['odette', 'priya'] }),
  // Imani, at the bridge
  C('imani-water', 'Taking the water at Brownville', 'You get in, and then you’re from somewhere else.', 'Leaving', 'bridge', 'Later', 'Risk', 2, 12, 3, R('bridge'), { people: ['imani'], rare: true }),
  C('imani-count', 'Who crosses the bridge', 'I count them both ways.', 'Leaving', 'bridge', 'Later', 'Repeat', 1, 7, 2, D('drawn-imani'), { people: ['imani'] }),
  C('imani-brown', 'Brown water at Omaha', 'Every handful is from somewhere.', 'Water', 'omaha', 'Later', 'Chain', 1, 7, 2, R('omaha'), { people: ['imani'] }),
  C('imani-back', 'More come back than you’d think', 'They come back carrying something.', 'Kin', 'bridge', 'Later', 'Spare', 1, 6, 2, R('night-bridge'), { people: ['imani', 'gus'] }),
  // found on the road
  C('peaches', 'Peaches from Dunning', 'She said they were spare.', 'Kin', 'sandhills', 'Later', 'Spare', 0, 4, 1, D('traveler')),
  C('cousin', 'A man who knows your cousin', 'You’re Odette’s cousin’s kid. I knew it.', 'Kin', 'brokenbow', 'Later', 'Chain', 1, 5, 2, D('face3'), { people: ['odette', 'marisol', 'walt'] }),
  C('cranes-lift', 'They lifted all at once', 'Furious and enormous.', 'Animals', 'platte', 'Later', 'Risk', 1, 8, 2, D('crane-dance')),
  C('culvert', 'Waiting out the storm', 'A stranger who keeps bees shared the culvert.', 'Weather', 'thedford', 'Later', 'Find', 1, 5, 2, R('thedford'), { people: ['priya'] }),
];
const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
const START = ['talk-weather', 'talk-kin', 'rows', 'hail', 'bridge-thing', 'tree-lights', 'walked-rows', 'fence-posts', 'turtle', 'stock-tank', 'fog-cranes', 'power'];
const PLACE = { halsey: 'Halsey', thedford: 'Thedford', sandhills: 'the Sandhills', dismal: 'the Dismal', brokenbow: 'Broken Bow', loup: 'the North Loup', platte: 'the Platte', archway: 'the Archway', columbus: 'Columbus', mainstreet: 'Main Street', courthouse: 'the Courthouse', omaha: 'Omaha', bridge: 'the bridge', door: 'the door in the hill', scottsbluff: 'Scotts Bluff' };

/* ---------------- tellers ----------------
   intents cycle one per day. ask: stories with that tag weigh double today.
   doubt: at day's end they knock that much off and you lose 1 standing, unless you told something they want.
   own: one of their stories is in your hand today. quiet: one less trust tomorrow.
   reservation: halves Vivid until a telling includes a story with that tag.
   cols: where on the map (0 Halsey to 7 the bridge) they can be met. */
const ask = (k, v, label) => ({ kind: 'ask', tag: [k, v], label });
const TELLERS = [
  { id: 'ruth', name: 'Ruth Ebersole', place: 'halsey', placeName: 'The planted forest, Halsey', img: 'img/halsey-rows.jpg', drawing: 'sketches/drawn-ruth.png', photo: 'img/cast-ruth.jpg', cols: [0],
    want: 'Work', line: 'Every tree in these rows has a page. Sit down.',
    reservation: { text: 'Only trusts people who’ve planted something', tag: ['theme', 'Work'] },
    intents: [ask('place', 'halsey', 'Asks about Halsey'), { kind: 'doubt', n: 12 }, { kind: 'own' }, { kind: 'quiet' }],
    stories: ['ruth-page', 'ruth-foreman', 'ruth-twelve', 'ruth-ledger'] },
  { id: 'priya', name: 'Priya Raman', place: 'thedford', placeName: 'Thedford', img: 'img/thedford.jpg', drawing: 'sketches/drawn-priya.png', photo: 'img/cast-priya.jpg', cols: [1, 2],
    want: 'Weather', line: 'The bees know the weather a day early. I write down what they say.',
    reservation: { text: 'Won’t talk to someone who’s never stopped for an animal', tag: ['theme', 'Animals'] },
    intents: [ask('theme', 'Weather', 'Asks about the sky'), { kind: 'doubt', n: 14 }, { kind: 'own' }, { kind: 'quiet' }],
    stories: ['priya-green', 'priya-rabbits', 'priya-shape', 'priya-wind'] },
  { id: 'deshawn', name: 'Deshawn Price', place: 'sandhills', placeName: 'A windmill in the Sandhills', img: 'img/sandhills-windmill.jpg', drawing: 'sketches/face3.png', photo: 'img/face3-photo.jpg', cols: [1, 2],
    want: 'Weather', line: 'A windmill tells you which way everything is going. Then it lies.',
    reservation: { text: 'Doesn’t trust anyone who hasn’t seen the Sandhills', tag: ['place', 'sandhills'] },
    intents: [{ kind: 'own' }, ask('place', 'sandhills', 'Asks about the Sandhills'), { kind: 'doubt', n: 14 }, ask('theme', 'Work', 'Asks about work')],
    stories: ['deshawn-mill', 'deshawn-well', 'deshawn-poles', 'deshawn-arch'] },
  { id: 'frank', name: 'Frank Dvorak', place: 'dismal', placeName: 'The Dismal River', img: 'img/dismal.jpg', drawing: 'sketches/drawn-frank.png', photo: 'img/cast-frank.jpg', cols: [2, 3, 5], holdout: true,
    want: 'Strange', line: 'I’m not signed. You can write it down. It won’t count.',
    reservation: { text: 'Not signed: he only listens to something strange', tag: ['theme', 'Strange'] },
    intents: [{ kind: 'doubt', n: 22 }, ask('theme', 'Strange', 'Asks what you’ve seen'), { kind: 'doubt', n: 22 }, { kind: 'own' }],
    stories: ['frank-door', 'frank-clay', 'frank-coyote', 'frank-unsigned'] },
  { id: 'walt', name: 'Walt Okamoto', place: 'brokenbow', placeName: 'Broken Bow', img: 'img/broken-bow.jpg', drawing: 'sketches/face1.png', photo: 'img/face1-photo.jpg', cols: [3, 4],
    want: 'Kin', line: 'I keep a packet for every child born in the county. Ask me yours.',
    reservation: { text: 'Wants to know whose child you are', tag: ['theme', 'Kin'] },
    intents: [{ kind: 'own' }, ask('era', '1903', 'Asks about 1903'), { kind: 'doubt', n: 18 }, { kind: 'quiet' }],
    stories: ['walt-seed', 'walt-count', 'walt-aurora', 'walt-sod'] },
  { id: 'tomas', name: 'Tomás Arriaga', place: 'loup', placeName: 'The North Loup in fog', img: 'img/loup-fog.jpg', drawing: 'sketches/drawn-tomas.png', photo: 'img/cast-tomas.jpg', cols: [3, 4],
    want: 'Water', line: 'The river moved forty feet this spring. Talk slow.',
    reservation: { text: 'Won’t talk to someone in a hurry', tag: ['event', 'Spare'] },
    intents: [{ kind: 'doubt', n: 18 }, ask('theme', 'Water', 'Asks about the river'), { kind: 'own' }, { kind: 'doubt', n: 18 }],
    stories: ['tomas-landing', 'tomas-ada', 'tomas-ice', 'tomas-pivot'] },
  { id: 'ada', name: 'Ada Nakamura-Hill', place: 'platte', placeName: 'The Platte at dusk', img: 'img/platte-cranes.jpg', drawing: 'sketches/drawn-ada.png', photo: 'img/cast-ada.jpg', cols: [4, 5],
    want: 'Animals', line: 'Four hundred and twelve. Then they all stood up and I lost count.',
    reservation: { text: 'Won’t listen unless you can find something', tag: ['event', 'Find'] },
    intents: [ask('theme', 'Animals', 'Asks about the cranes'), { kind: 'own' }, { kind: 'doubt', n: 20 }, ask('place', 'platte', 'Asks about the river')],
    stories: ['ada-412', 'ada-fours', 'ada-still', 'ada-landing'] },
  { id: 'gus', name: 'Gus Pfeiffer', place: 'archway', placeName: 'The Archway at Kearney', img: 'img/archway.jpg', drawing: 'sketches/drawn-gus.png', photo: 'img/cast-gus.jpg', cols: [5, 6],
    want: 'Leaving', line: 'My sister took the water. When I’m old enough I’m going too.',
    reservation: { text: 'Doesn’t believe grown-ups unless it’s strange', tag: ['theme', 'Strange'] },
    intents: [{ kind: 'own' }, { kind: 'doubt', n: 22 }, ask('theme', 'Leaving', 'Asks about leaving'), { kind: 'quiet' }],
    stories: ['gus-sister', 'gus-looked', 'gus-notebook', 'gus-old'] },
  { id: 'marisol', name: 'Marisol Ybarra', place: 'columbus', placeName: 'Where the Loup meets the Platte', img: 'img/columbus.jpg', drawing: 'sketches/drawn-marisol.png', photo: 'img/cast-marisol.jpg', cols: [5, 6],
    want: 'Kin', line: 'Every block is somebody. You just have to know who to look for.',
    reservation: { text: 'Every block is somebody: name someone', tag: ['people', 1] },
    intents: [ask('theme', 'Kin', 'Asks about family'), { kind: 'doubt', n: 24 }, { kind: 'own' }, ask('place', 'columbus', 'Asks about the rivers')],
    stories: ['marisol-cousins', 'marisol-quilt', 'marisol-rivers', 'marisol-star'] },
  { id: 'arne', name: 'Arne Lindqvist', place: 'mainstreet', placeName: 'Main Street', img: 'img/mainstreet.jpg', drawing: 'sketches/face2.png', photo: 'img/face2-photo.jpg', cols: [5, 6],
    want: 'Light', line: 'I put light in every house from here to the river. Now I’m collecting it back.',
    reservation: { text: 'Wants something that lasted since 1950', tag: ['era', '1950'] },
    intents: [{ kind: 'doubt', n: 24 }, ask('theme', 'Light', 'Asks about the power'), { kind: 'own' }, { kind: 'doubt', n: 24 }],
    stories: ['arne-wire', 'arne-bulb', 'arne-poles', 'arne-north'] },
  { id: 'odette', name: 'Odette Mbeki-Larsen', place: 'courthouse', placeName: 'Register of Deeds', img: 'img/courthouse.jpg', drawing: 'sketches/drawn-odette.png', photo: 'img/cast-odette.jpg', cols: [6],
    want: 'Kin', line: 'Everything in this room was signed by somebody’s grandmother.',
    reservation: { text: 'Wants it on the record: something from 1903', tag: ['era', '1903'] },
    intents: [ask('theme', 'Kin', 'Asks about family'), { kind: 'doubt', n: 26 }, { kind: 'own' }, ask('era', '1903', 'Asks about 1903')],
    stories: ['odette-survey', 'odette-copy', 'odette-lamp', 'odette-bees'] },
  { id: 'imani', name: 'Imani Cole', place: 'bridge', placeName: 'The bridge over the Missouri', img: 'img/bridge.jpg', drawing: 'sketches/drawn-imani.png', photo: 'img/cast-imani.jpg', cols: [7], boss: true,
    want: 'Leaving', line: 'I count who crosses, both ways. Tell me why you came.',
    reservation: { text: 'Wants to know why you’re going', tag: ['theme', 'Leaving'] },
    intents: [{ kind: 'own' }, ask('theme', 'Leaving', 'Asks why you’re going'), { kind: 'doubt', n: 26 }, ask('theme', 'Water', 'Asks about the river')],
    stories: ['imani-water', 'imani-count', 'imani-brown', 'imani-back'] },
];
const TELLER = Object.fromEntries(TELLERS.map(t => [t.id, t]));

/* ---------------- keepsakes: barn quilts that change the rules ---------------- */
const KEEPS = {
  sawtooth:  { name: 'Sawtooth', text: 'Your first telling each day gets +1 Vivid.', block: 'sawtooth' },
  ohiostar:  { name: 'Ohio Star', text: 'Threads give +2 Vivid instead of +1.', block: 'ohiostar' },
  logcabin:  { name: 'Log Cabin', text: 'Held-back Spare stories give +7 Weight instead of +4.', block: 'logcabin' },
  geese:     { name: 'Flying Geese', text: 'Chain gives +7 Weight instead of +4.', block: 'geese' },
  pinwheel:  { name: 'Pinwheel', text: 'Repeat copies every other event in the telling.', block: 'pinwheel' },
  bearpaw:   { name: 'Bear’s Paw', text: 'Unanswered doubts cost credibility, never standing.', block: 'bearpaw' },
  lonestar:  { name: 'Lone Star', text: 'Rare stories cost 1 less trust.', block: 'lonestar' },
  churndash: { name: 'Churn Dash', text: '+1 trust on the first day of every sitting.', block: 'churndash' },
  dresden:   { name: 'Dresden Plate', text: 'Small talk gets +4 Weight.', block: 'dresden' },
  drunkard:  { name: 'Drunkard’s Path', text: 'Risk never costs standing, but gives only +3 Weight.', block: 'drunkard' },
};

/* ---------------- road events (a map node between sittings) ---------------- */
const ROAD = [
  { title: 'A bicycle with a cart', text: 'A woman pedaling west with a cart of jars. “You’re on Survey? Take one. They’re spare.”',
    choices: [{ text: 'Take a jar', card: 'peaches' }, { text: 'Give her your small talk', dropSmall: true, standing: 1 }] },
  { title: 'Somebody you know', text: 'A man at the crossroads squints at you. “You’re Odette’s cousin’s kid. I knew it.”',
    choices: [{ text: 'Ask about them', card: 'cousin' }, { text: 'Keep walking', standing: 2 }] },
  { title: 'The arch moved', text: 'The arch you walked through at dawn is ahead of you again, standing in the road.',
    choices: [{ text: 'Walk through it again', retell: true }, { text: 'Go around', standing: 1 }] },
  { title: 'Cranes in the road', text: 'Hundreds of them, standing in the road, talking. They don’t move for you.',
    choices: [{ text: 'Wait for them', standing: 2 }, { text: 'Walk through them', card: 'cranes-lift' }] },
  { title: 'A lamp on a fence post', text: 'Out in the middle of nowhere, a lamp on a fence post, lit.',
    choices: [{ text: 'Take a closer look', keep: true, standing: -1 }, { text: 'Leave it lit', standing: 1, retell: true }] },
  { title: 'Weather coming', text: 'The sky goes the color of a bottle. The wind stops.',
    choices: [{ text: 'Shelter in the culvert', card: 'culvert', standing: -1 }, { text: 'Keep going', keep: true, standing: -2 }] },
];

const DAYS = 4, TRUST = 3, HAND = 5, MAX_TELL = 3, START_STANDING = 10, MAX_STANDING = 12, COLS = 8;
const RANKS = [[0, 'Noted'], [1300, 'Entered'], [1900, 'Recorded'], [2400, 'Indexed'], [2800, 'Bound into the record']];
const ENDINGS = {
  sign: { title: 'You sign', text: 'Your testimony goes into the record with everyone else’s. Somebody will read it in a hundred years and know exactly where the cranes stood.' },
  refuse: { title: 'You refuse, and stay', text: 'You keep your stories. You live outside the agreement but inside its presence, like Frank by the Dismal. People still wave.' },
  water: { title: 'You take the water', text: 'You walk down past Imani’s bridge, and you get in, and then you’re from somewhere else.' },
};

/* ---------------- helpers ---------------- */
function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pickR = (a, r) => a[Math.floor(r() * a.length)];
const tagOf = (c, [k, v]) => (k === 'event' ? c.event === v : k === 'people' ? c.people.length >= v : c[k] === v);
let uid = 0;
const inst = (id, mods = {}) => ({ uid: ++uid, ...CARD[id], people: [...CARD[id].people], ...mods });
const has = (G, k) => G.keeps.includes(k);
const costOf = (G, c) => Math.max(0, c.cost - (c.rare && has(G, 'lonestar') ? 1 : 0));

/* ---------------- the map ----------------
   columns west to east. Column 0 is Ruth at Halsey; column 7 is Imani at the bridge.
   kinds: sitting, holdout, road, arch, courthouse, bridge */
function makeMap(r) {
  const cols = [];
  cols.push([{ kind: 'sitting', teller: 'ruth' }]);
  for (let c = 1; c < COLS - 1; c++) {
    const n = 2 + (r() < .55 ? 1 : 0), col = [];
    const pool = TELLERS.filter(t => t.cols.includes(c) && !t.boss && !t.holdout && t.id !== 'ruth');
    const used = new Set();
    for (let i = 0; i < n; i++) {
      let kind;
      const x = r();
      if (c === 1) kind = x < .7 ? 'sitting' : 'road';
      else if (c === COLS - 2) kind = x < .4 ? 'courthouse' : x < .75 ? 'sitting' : 'arch';
      else kind = x < .42 ? 'sitting' : x < .58 ? 'road' : x < .72 ? 'arch' : x < .86 ? 'courthouse' : 'holdout';
      if (kind === 'holdout' && (!TELLER.frank.cols.includes(c) || cols.some(cl => cl.some(n => n.kind === 'holdout')) || col.some(n => n.kind === 'holdout'))) kind = 'sitting';   // one holdout per run
      if (kind !== 'sitting' && col.some(n => n.kind === kind)) kind = 'sitting';   // no two of the same stop side by side
      const node = { kind };
      if (kind === 'sitting') { const t = pool.filter(t => !used.has(t.id)); if (!t.length) node.kind = ['road', 'arch', 'courthouse'].find(k => !col.some(n => n.kind === k)) || 'road'; else { node.teller = pickR(t, r).id; used.add(node.teller); } }
      if (kind === 'holdout') node.teller = 'frank';
      if (node.kind === 'road') node.road = Math.floor(r() * ROAD.length);
      col.push(node);
    }
    cols.push(col);
  }
  cols.push([{ kind: 'bridge', teller: 'imani' }]);
  // edges: each node links to the one or two nearest in the next column; every node is reachable
  cols.forEach((col, c) => col.forEach((n, i) => { n.id = `${c}-${i}`; n.c = c; n.i = i; n.next = []; }));
  for (let c = 0; c < cols.length - 1; c++) {
    const a = cols[c], b = cols[c + 1];
    a.forEach((n, i) => {
      const pos = a.length === 1 ? (b.length - 1) / 2 : i / (a.length - 1) * (b.length - 1);
      const lo = Math.floor(pos), hi = Math.ceil(pos);
      n.next.push(b[lo].id); if (hi !== lo) n.next.push(b[hi].id);
      else if (b.length > 1 && r() < .45) n.next.push(b[Math.min(b.length - 1, lo + (r() < .5 ? -1 : 1))]?.id || b[lo].id);
    });
    b.forEach(m => { if (!a.some(n => n.next.includes(m.id))) a[Math.min(a.length - 1, Math.round(m.i / Math.max(1, b.length - 1) * (a.length - 1)))].next.push(m.id); });
    a.forEach(n => { n.next = [...new Set(n.next)]; });
  }
  return cols;
}
const nodeById = (G, id) => { const [c, i] = id.split('-').map(Number); return G.map[c][i]; };
function threshold(node) {
  const base = Math.round((120 + 44 * node.c) / 10) * 10;
  return node.kind === 'holdout' ? Math.round(base * 1.25 / 10) * 10 : node.kind === 'bridge' ? 350 : base;
}

/* ---------------- a run ---------------- */
function newRun(seed = Date.now()) {
  const r = rng(seed);
  const G = { seed, r, standing: START_STANDING, score: 0, filed: 0, deck: START.map(id => inst(id)), given: [], history: [], keeps: [], over: false, map: makeMap(r), at: null, visited: [] };
  return G;
}
function reachable(G) { return G.at ? nodeById(G, G.at).next.map(id => nodeById(G, id)) : [G.map[0][0]]; }
function goTo(G, id) { G.at = id; G.visited.push(id); return nodeById(G, id); }

function startSitting(G, node) {
  const T = TELLER[node.teller], r = G.r;
  const S = { T, node, threshold: threshold(node), cred: 0, day: 1, trustMax: TRUST, trust: TRUST + (has(G, 'churndash') ? 1 : 0), warm: false, reservation: true,
    draw: shuffle(G.deck.map(c => ({ ...c })), r), hand: [], discard: [], last: null, spareBonus: 0, answered: false, toldToday: 0, intentI: 0, log: [], result: null, G };
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
    const id = pickR(pool, G.r);
    if (id) { const c = inst(id, { borrowed: true }); S.hand.push(c); S.log.push({ t: 'own', card: c }); }
  }
}

/* score a telling (1 to 3 cards) without changing anything: the numbers the player sees */
function evaluate(S, cards) {
  const T = S.T, G = S.G, parts = [];
  if (!cards.length) return { weight: 0, vivid: 0, total: 0, parts, cost: 0, standing: 0, draw: 0 };
  const cost = cards.reduce((a, c) => a + costOf(G, c), 0);
  let weight = 0, asked = false;
  for (const c of cards) {
    let w = c.w + (c.small && has(G, 'dresden') ? 4 : 0);
    if (S.intent.kind === 'ask' && tagOf(c, S.intent.tag)) { w *= 2; asked = true; }
    weight += w;
  }
  if (asked) parts.push({ k: 'w', label: S.intent.label + ': ×2 weight' });
  if (cards.some(c => c.small) && has(G, 'dresden')) parts.push({ k: 'w', label: 'Dresden Plate: small talk +4' });
  let vivid = Math.max(...cards.map(c => c.v));
  const shared = key => cards.length > 1 && new Set(cards.map(c => c[key])).size < cards.length;
  if (shared('theme')) { vivid++; parts.push({ k: 'v', label: 'Witnesses: same theme +1' }); }
  if (shared('place')) { vivid++; parts.push({ k: 'v', label: 'Ground: same place +1' }); }
  if (shared('era')) { vivid++; parts.push({ k: 'v', label: 'Kept: same era +1' }); }
  const thread = cards.length > 1 && cards.some((c, i) => cards.some((d, j) => j !== i && c.people.some(p => d.people.includes(p))));
  const theirs = cards.some(c => c.people.includes(T.id));
  if (thread || theirs) { const n = has(G, 'ohiostar') ? 2 : 1; vivid += n; parts.push({ k: 'v', label: (thread ? 'Thread: people who know each other' : 'Their own story, told back') + ` +${n}` }); }
  if (cards.length === 3 && shared('theme') && shared('place') && shared('era')) { vivid++; parts.push({ k: 'v', label: 'Whole story +1' }); }
  if (cards.some(c => c.theme === T.want)) { vivid++; parts.push({ k: 'v', label: `They want ${T.want} +1` }); }
  if (S.toldToday === 0 && has(G, 'sawtooth')) { vivid++; parts.push({ k: 'v', label: 'Sawtooth: first telling today +1' }); }
  // events; Repeat copies the strongest other event (all of them, with Pinwheel)
  const evs = cards.map(c => c.event).filter(Boolean), order = ['Risk', 'Chain', 'Find', 'Spare'];
  const others = evs.filter(e => e !== 'Repeat'), best = order.find(e => others.includes(e));
  const fired = []; for (const e of evs) { if (e !== 'Repeat') fired.push(e); else if (has(G, 'pinwheel')) fired.push(...others); else if (best) fired.push(best); }
  let draw = 0, standing = 0;
  const chains = S.last && cards.some(c => S.last.some(l => l.theme === c.theme || l.place === c.place));
  const chainW = has(G, 'geese') ? 7 : 4, riskW = has(G, 'drunkard') ? 3 : 5;
  for (const e of fired) {
    if (e === 'Chain' && chains) { weight += chainW; parts.push({ k: 'w', label: `Chain: continues the last telling +${chainW}` }); }
    if (e === 'Find') { draw += 2; parts.push({ k: 'x', label: 'Find: draw 2' }); }
    if (e === 'Risk') { weight += riskW; parts.push({ k: 'w', label: `Risk +${riskW}` }); if (!S.warm && !has(G, 'drunkard')) { standing -= 1; parts.push({ k: 'bad', label: 'Risk: they aren’t warm yet, −1 standing' }); } }
  }
  if (S.spareBonus) { weight += S.spareBonus; parts.push({ k: 'w', label: `Spare held back +${S.spareBonus}` }); }
  let answer = false;
  if (S.reservation) {
    if (cards.some(c => tagOf(c, T.reservation.tag))) { answer = true; parts.push({ k: 'good', label: 'Answers their reservation' }); }
    else { vivid = Math.max(1, Math.ceil(vivid / 2)); parts.push({ k: 'bad', label: 'Reservation: vivid halved' }); }
  }
  return { weight, vivid, total: weight * vivid, parts, cost, standing, draw, answer, wants: cards.some(c => c.theme === T.want) };
}
function canTell(S, cards) { return cards.length > 0 && cards.length <= MAX_TELL && cards.reduce((a, c) => a + costOf(S.G, c), 0) <= S.trust; }

function tell(G, cards) {
  const S = G.S; if (!canTell(S, cards)) return null;
  const e = evaluate(S, cards);
  S.trust -= e.cost; S.cred += e.total; G.standing += e.standing; S.spareBonus = 0; S.toldToday++;
  if (e.answer) S.reservation = false;
  if (e.wants) S.answered = true;
  S.hand = S.hand.filter(c => !cards.includes(c));
  for (const c of cards) if (!c.borrowed) S.discard.push(c);
  S.last = cards; drawN(S, e.draw, G.r);
  if (!S.warm && S.cred >= S.threshold / 2) { S.warm = true; S.trustMax += 1; S.log.push({ t: 'warm' }); }
  S.log.push({ t: 'tell', cards, e });
  if (G.standing <= 0) { G.over = true; G.struck = true; }
  return e;
}

/* end of your day: the teller acts, spares are held, the day moves on */
function endTurn(G) {
  const S = G.S, out = { doubt: 0, held: 0 };
  if (S.intent.kind === 'doubt' && !S.answered) {
    out.doubt = Math.min(S.cred, S.intent.n); S.cred -= out.doubt;
    if (!has(G, 'bearpaw')) { G.standing -= 1; out.standing = -1; }
    if (G.standing <= 0) { G.over = true; G.struck = true; S.result = 'lost'; return finishSitting(G, out); }
  }
  const held = S.hand.filter(c => c.event === 'Spare' && !c.borrowed);
  out.held = held.length; S.spareBonus = held.length * (has(G, 'logcabin') ? 7 : 4);
  S.discard.push(...S.hand.filter(c => !held.includes(c) && !c.borrowed)); S.hand = held;
  const quiet = S.intent.kind === 'quiet';
  S.day++; S.answered = false; S.toldToday = 0;
  if (S.cred >= S.threshold) { S.result = 'won'; return finishSitting(G, out); }
  if (S.day > DAYS) { S.result = 'lost'; return finishSitting(G, out); }
  S.intentI = (S.intentI + 1) % S.T.intents.length; S.intent = S.T.intents[S.intentI];
  S.trust = S.trustMax - (quiet ? 1 : 0);
  drawN(S, HAND - S.hand.length, G.r); applyStartIntent(S, G);
  return out;
}
function finishSitting(G, out = {}) {
  const S = G.S; if (!S.result) S.result = S.cred >= S.threshold ? 'won' : 'lost';
  G.score += S.cred;
  if (S.result === 'lost') { G.standing -= 3; if (G.standing <= 0) { G.over = true; G.struck = true; } }
  G.history.push({ teller: S.T.id, kind: S.node.kind, cred: S.cred, threshold: S.threshold, result: S.result, day: Math.min(S.day, DAYS) });
  out.result = S.result; return out;
}

/* the trade: three of their stories, one of them maybe a story you gave away, retold */
function offers(G) {
  const T = G.S.T, ids = shuffle([...T.stories], G.r), list = ids.slice(0, 3).map(id => inst(id));
  const back = G.given.find(g => !g.returned && g.at < G.history.length - 1);
  if (back) {
    back.returned = true;
    list[2] = inst(back.card.id, { w: back.card.w + 2, v: back.card.v + 1, retold: T.name, quote: `I heard it from a surveyor: ${back.card.quote.replace(/^“|”$/g, '')}`, people: [...new Set([...back.card.people, T.id])] });
  }
  return list;
}
function trade(G, take, give) {
  if (give) { G.deck = G.deck.filter(c => c.uid !== give.uid); if (!give.small) G.given.push({ card: give, at: G.history.length - 1 }); }
  if (take) G.deck.push(take);
}
function keepOffer(G, n = 2) { return shuffle(Object.keys(KEEPS).filter(k => !G.keeps.includes(k)), G.r).slice(0, n); }
function takeKeep(G, k) { if (k && !G.keeps.includes(k)) G.keeps.push(k); }
/* the arch: rest, or retell one story (+1 vivid) */
function arch(G, choice, card) {
  if (choice === 'rest') G.standing = Math.min(MAX_STANDING, G.standing + 3);
  if (choice === 'retell' && card) { card.v += 1; card.retellings = (card.retellings || 0) + 1; }
}
/* the courthouse: file up to two stories into the record (they leave your deck for good) */
const fileValue = c => c.w * c.v * 6;
function canFile(G, c) { return !c.holdout && G.deck.length > 8; }
function file(G, cards) { let pts = 0; for (const c of cards) { if (!canFile(G, c)) continue; pts += fileValue(c); G.deck = G.deck.filter(d => d.uid !== c.uid); G.filed++; } G.score += pts; return pts; }
/* the road */
function roadChoose(G, ev, choice) {
  const out = { text: [] };
  if (choice.standing) { G.standing = Math.min(MAX_STANDING, G.standing + choice.standing); out.text.push(`${choice.standing > 0 ? '+' : ''}${choice.standing} standing`); }
  if (choice.card) { G.deck.push(inst(choice.card)); out.text.push(`“${CARD[choice.card].title}” joins your deck`); }
  if (choice.dropSmall) { const s = G.deck.filter(c => c.small); if (s.length) { G.deck = G.deck.filter(c => c !== s[0]); out.text.push('one small talk story gone'); } }
  if (choice.retell) { const b = [...G.deck].sort((a, b) => b.w * b.v - a.w * a.v)[0]; if (b) { b.v++; b.retellings = (b.retellings || 0) + 1; out.text.push(`“${b.title}” retold, +1 vivid`); } }
  if (choice.keep) { const k = keepOffer(G, 1)[0]; if (k) { takeKeep(G, k); out.keep = k; out.text.push(`keepsake: ${KEEPS[k].name}`); } }
  if (G.standing <= 0) { G.over = true; G.struck = true; }
  return out;
}
function finalScore(G) { return G.score + Math.max(0, G.standing) * 20; }
function rank(G) { const s = finalScore(G); let r = RANKS[0][1]; for (const [n, name] of RANKS) if (s >= n) r = name; return G.struck ? 'Struck from the record' : r; }

root.SITTING = { CARDS, CARD, START, PLACE, TELLERS, TELLER, KEEPS, ROAD, ENDINGS, DAYS, TRUST, HAND, MAX_TELL, START_STANDING, MAX_STANDING, COLS, RANKS,
  rng, newRun, reachable, goTo, nodeById, threshold, startSitting, evaluate, canTell, costOf, tell, endTurn, finishSitting, offers, trade, keepOffer, takeKeep, arch, fileValue, canFile, file, roadChoose, finalScore, rank, tagOf };
})(typeof window !== 'undefined' ? window : globalThis);
