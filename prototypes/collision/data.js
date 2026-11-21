/* Halsey, Nebraska: the cast, places, creatures, stories and road encounters.
   Shared by collision.html (play) and guide.html (the field guide). Plain data; no code runs here. */
"use strict";
window.HALSEY = (() => {

/* ---------------- people ----------------
   drawing: a pen portrait (yours for Walt, Arne and Deshawn; Gemini in your style for the rest)
   photo:   a Gemini photograph at the same framing, which the drawing develops into as trust grows */
const TELLERS = {
  ruth:    { name: 'Ruth Ebersole',      age: 84, role: 'Keeps the seed ledgers at the Halsey nursery', want: 'Work',    line: 'Every tree in these rows has a page. Some pages have more in them than the tree.', knows: ['gus'] },
  priya:   { name: 'Priya Raman',        age: 26, role: 'Keeps bees in Thedford',                         want: 'Weather', line: 'The bees know the weather a day early. I just write down what they say.', knows: ['walt'] },
  frank:   { name: 'Frank Dvorak',       age: 76, role: 'Refused the agreement. Lives by the Dismal.',    want: 'Strange', line: 'I’m not signed. You can write it down. It won’t count.', knows: ['lou'], holdout: true },
  deshawn: { name: 'Deshawn Price',      age: 44, role: 'Mends windmills from Mullen to Dunning',          want: 'Weather', line: 'A windmill tells you which way everything is going. Then it lies about it.', knows: ['arne'], drawing: 'sketches/face3.png', photo: 'img/face3-photo.jpg' },
  walt:    { name: 'Walt Okamoto',       age: 71, role: 'Keeps the seed library in Broken Bow',           want: 'Kin',     line: 'I keep a packet for every child born in the county. Ask me yours.', knows: ['priya', 'odette'], drawing: 'sketches/face1.png', photo: 'img/face1-photo.jpg' },
  tomas:   { name: 'Tomás Arriaga',      age: 34, role: 'Poles the ferry across the North Loup',          want: 'Water',   line: 'The river moved forty feet this spring. So I moved the landing.', knows: ['ada'] },
  ada:     { name: 'Ada Nakamura-Hill',  age: 11, role: 'Counts sandhill cranes for the record',          want: 'Animals', line: 'Four hundred and twelve. Then they all stood up at once and I lost count.', knows: ['tomas'] },
  gus:     { name: 'Gus Pfeiffer',       age: 9,  role: 'Saw the thing under the Halsey bridge',          want: 'Leaving', line: 'My sister took the water. When I’m old enough I’m going too.', knows: ['ruth', 'imani'] },
  marisol: { name: 'Marisol Ybarra',     age: 72, role: 'Paints barn quilts in Columbus and Gering',      want: 'Kin',     line: 'Every block is somebody. You just have to know who to look for.', knows: ['odette'] },
  arne:    { name: 'Arne Lindqvist',     age: 68, role: 'Retired lineman. Strung the last wire into Omaha.', want: 'Light', line: 'I put light in every house from here to the river. Now I’m collecting it back.', knows: ['deshawn'], drawing: 'sketches/face2.png', photo: 'img/face2-photo.jpg' },
  odette:  { name: 'Odette Mbeki-Larsen', age: 47, role: 'Clerk of the Register of Deeds',                want: 'Kin',     line: 'Everything in this room was signed by somebody’s grandmother. Sit down.', knows: ['marisol', 'walt'] },
  lou:     { name: 'Lou Haskins',        age: 63, role: 'Turns on the lights of the Kingsley dam tower',  want: 'Light',   line: 'Somebody has to turn them on. Nobody has to look at them.', knows: ['frank'] },
  imani:   { name: 'Imani Cole',         age: 55, role: 'Keeps the footbridge over the Missouri',         want: 'Leaving', line: 'I count who crosses, both ways. More come back than you’d think.', knows: ['gus'] },
};
for (const [k, t] of Object.entries(TELLERS)) { t.id = k; t.drawing ||= `sketches/drawn-${k}.png`; t.photo ||= `img/cast-${k}.jpg`; }

/* ---------------- places ----------------
   img: Gemini photograph (or your painting); night: the same place under your aurora; sky: mask for the live sky
   arch: one of your arch sculptures standing in the place; draw: your notebook drawings set into it
   beasts: creatures that live here; route: 'east' (Halsey to the Missouri), 'west' (errands), 'era' (era pockets) */
const PLACES = [
  { id: 'halsey',     name: 'The planted forest, Halsey', county: 'Thomas County', img: 'halsey-rows',        era: '1903', route: 'east', teller: 'ruth',    arch: { k: 'arch-red-blue', cx: .3, ground: .95, h: .42 }, draw: [{ k: 'tower', x: .86, y: .36, h: .22 }, { k: 'grass', x: 0, y: .83, h: .2 }], beasts: ['critter', 'owl'], murmur: false,
    note: 'Hand-planted in 1902 on open sand. The largest planted forest in the country, kept row by row.' },
  { id: 'thedford',   name: 'Thedford', county: 'Thomas County', img: 'thedford', era: '1950', route: 'east', teller: 'priya', arch: { k: 'arch-black', cx: .78, ground: .96, h: .3 }, draw: [{ k: 'stars', x: .04, y: .02, h: .24 }], beasts: ['jackrabbit', 'listener'], murmur: true,
    note: 'On the Middle Loup. The elevator is kept white.' },
  { id: 'dismal',     name: 'The Dismal River', county: 'Hooker County', img: 'dismal', era: 'Later', route: 'east', teller: 'frank', arch: { k: 'arch-red-hook', cx: .84, ground: .97, h: .36 }, draw: [{ k: 'critter', x: .06, y: .74, h: .16 }], beasts: ['coyote', 'folded'], murmur: false,
    note: 'Spring-fed and cold. The bridge has no road. A holdout lives downstream.' },
  { id: 'sandhills',  name: 'A windmill in the Sandhills', county: 'Cherry County', img: 'sandhills-windmill', era: '1888', route: 'east', teller: 'deshawn', arch: { k: 'arch-black', cx: .27, ground: .86, h: .3 }, draw: [{ k: 'stars', x: .04, y: .02, h: .26 }], beasts: ['turtle', 'gatewalker'], murmur: true },
  { id: 'broken-bow', name: 'Broken Bow', county: 'Custer County', img: 'broken-bow', era: '1903', route: 'east', teller: 'walt', arch: { k: 'arch-white', cx: .2, ground: .97, h: .4 }, draw: [{ k: 'bulb', x: .58, y: .02, h: .2, light: 1 }], beasts: ['jackrabbit'], murmur: true,
    note: 'The courthouse square, kept. Grass in the street.' },
  { id: 'loup-fog',   name: 'The North Loup in fog', county: 'Valley County', img: 'loup-fog', era: '1974', route: 'east', teller: 'tomas', arch: { k: 'arch-celadon', cx: .14, ground: .97, h: .36 }, draw: [{ k: 'grass', x: .5, y: .84, h: .18 }], beasts: ['owl', 'crane'], murmur: false },
  { id: 'platte',     name: 'The Platte at dusk', county: 'Buffalo County', img: 'platte-cranes', era: 'Later', route: 'east', teller: 'ada', arch: { k: 'arch-celadon', cx: .2, ground: .97, h: .4 }, draw: [{ k: 'cranes', x: .58, y: .02, h: .42, drift: 1 }, { k: 'grass', x: .55, y: .84, h: .18 }], beasts: ['crane'], murmur: false,
    note: 'Half a million cranes stop here in March. Ada counts them.' },
  { id: 'archway',    name: 'The Archway at Kearney', county: 'Buffalo County', img: 'archway', era: '2000', route: 'east', teller: 'gus', arch: { k: 'arch-red-hook', cx: .86, ground: .98, h: .34 }, draw: [{ k: 'traveler', x: .1, y: .62, h: .3 }], beasts: ['gatewalker', 'jackrabbit'], murmur: true,
    note: 'A building that spans the old interstate. The highway under it is wildflowers now.' },
  { id: 'columbus',   name: 'Where the Loup meets the Platte', county: 'Platte County', img: 'columbus', era: '1974', route: 'east', teller: 'marisol', arch: { k: 'arch-white', cx: .16, ground: .98, h: .36 }, draw: [{ k: 'grass', x: .0, y: .84, h: .18 }], beasts: ['crane'], murmur: true,
    note: 'Two rivers that won’t mix for a mile.' },
  { id: 'mainstreet', name: 'Main Street', county: 'Merrick County', img: 'mainstreet', era: '1950', route: 'east', teller: 'arne', arch: { k: 'arch-red-hook', cx: .5, ground: .97, h: .4 }, draw: [{ k: 'mainstreet', x: .52, y: .62, h: .1 }, { k: 'traveler', x: .7, y: .64, h: .3 }], beasts: ['folded', 'owl'], murmur: false },
  { id: 'courthouse', name: 'Register of Deeds', county: 'Dodge County', img: 'courthouse', era: '1903', route: 'east', teller: 'odette', arch: { k: 'arch-white', cx: .64, ground: .97, h: .48 }, draw: [{ k: 'bulb', x: .47, y: -.02, h: .24, light: 1 }, { k: 'traveler', x: .4, y: .5, h: .46 }], beasts: ['listener'], murmur: false, indoor: true,
    note: 'Where testimony is filed. The lamp has been on since before anyone’s grandmother.' },
  { id: 'omaha',      name: 'Omaha', county: 'Douglas County', img: 'omaha', era: 'Later', route: 'east', teller: 'arne', arch: { k: 'arch-black', cx: .86, ground: .98, h: .3 }, draw: [], beasts: ['critter'], murmur: true,
    note: 'Gray flag, white circle. The towers are kept and quiet.' },
  { id: 'bridge',     name: 'The bridge over the Missouri', county: 'Douglas County', img: 'bridge', era: 'Later', route: 'east', teller: 'imani', arch: { k: 'arch-celadon', cx: .18, ground: .98, h: .34 }, draw: [], beasts: ['gatewalker'], murmur: false, end: true,
    note: 'The end of the Survey. Sign, refuse and stay, or take the water.' },
  { id: 'scottsbluff', name: 'Scotts Bluff', county: 'Scotts Bluff County', img: 'scottsbluff', era: '1888', route: 'west', teller: 'marisol', arch: { k: 'arch-red-blue', cx: .82, ground: .98, h: .34 }, draw: [], beasts: ['bison', 'coyote'], murmur: true,
    note: 'The wagon ruts still show in a dry year.' },
  { id: 'niobrara',   name: 'The Niobrara at Valentine', county: 'Cherry County', img: 'niobrara', era: '1950', route: 'west', teller: 'priya', arch: { k: 'arch-black', cx: .16, ground: .98, h: .3 }, draw: [], beasts: ['bison'], murmur: false },
  { id: 'kingsley',   name: 'Kingsley Dam', county: 'Keith County', img: 'kingsley', era: '1974', route: 'west', teller: 'lou', arch: { k: 'arch-white', cx: .14, ground: .98, h: .34 }, draw: [], beasts: ['turtle'], murmur: true,
    note: 'Lou turns the tower lights on every dusk. Nobody sails.' },
  { id: 'door',       name: 'The door in the hill', county: 'an era pocket', img: 'painting-door-in-the-hill', fit: 'contain', era: 'Later', route: 'era', teller: 'frank', arch: { k: 'arch-red-hook', cx: .16, ground: .98, h: .36 }, draw: [{ k: 'critter', x: .74, y: .78, h: .14 }], beasts: ['folded'], noNight: true,
    note: 'Your painting, standing in for an era pocket: something kept inside the hill.' },
  { id: 'country',    name: 'A country in the same place', county: 'an era pocket', img: 'painting-same-place', fit: 'contain', era: 'Later', route: 'era', teller: 'walt', arch: { k: 'arch-celadon', cx: .84, ground: .98, h: .3 }, draw: [{ k: 'stars', x: .02, y: 0, h: .22 }], beasts: ['listener'], noNight: true,
    note: '“I moved to a different country once. It is in the same place as the one I left.”' },
];
PLACES.forEach((p, i) => { p.i = i; if (p.route === 'east') p.leg = PLACES.filter(q => q.route === 'east').indexOf(p) + 1; });

/* ---------------- creatures ----------------
   img: cut out of a Gemini render (animals; and creatures grown from your sculptures and your critter drawing)
   move: walk | crawl | perch | hop | still | creep (only moves when the lantern is away) */
const BEASTS = {
  crane:      { name: 'Sandhill crane', img: 'beast-crane', kind: 'animal', move: 'walk', speed: 14, h: .26, event: 'Chain', line: 'They call in chains, each one starting the next.' },
  coyote:     { name: 'Coyote', img: 'beast-coyote', kind: 'animal', move: 'walk', speed: 34, h: .16, event: 'Risk', line: 'Follows at ten feet. Sits down at gates.' },
  owl:        { name: 'Great horned owl', img: 'beast-owl', kind: 'animal', move: 'perch', h: .2, event: 'Find', line: 'Same pipe every night. We named the pipe.' },
  turtle:     { name: 'Ornate box turtle', img: 'beast-turtle', kind: 'animal', move: 'crawl', speed: 5, h: .08, event: 'Spare', line: 'Crosses the road in its own time.' },
  bison:      { name: 'Bison', img: 'beast-bison', kind: 'animal', move: 'walk', speed: 8, h: .24, event: 'Repeat', line: 'The river gets quieter when they drink.' },
  jackrabbit: { name: 'White-tailed jackrabbit', img: 'beast-jackrabbit', kind: 'animal', move: 'hop', speed: 60, h: .11, event: 'Chain', line: 'You can’t count them. They count you.' },
  listener:   { name: 'The Listener', img: 'beast-bloom', kind: 'strange', from: 'your sculpture (black bloom)', move: 'still', h: .17, event: 'Spare', line: 'It only comes when somebody is telling the truth. It came twice tonight.' },
  folded:     { name: 'The Folded', img: 'beast-crumple', kind: 'strange', from: 'your crumpled clay sculpture', move: 'still', h: .17, event: 'Find', line: 'Looks like a pile of old paper. Then it blinks.' },
  gatewalker: { name: 'Gatewalker', img: 'beast-archback', kind: 'strange', from: 'your black arch sculpture', move: 'creep', speed: 10, h: .2, event: 'Repeat', line: 'Somewhere else every morning. Nobody has seen it move.' },
  critter:    { name: 'Long-legs', img: 'beast-critter', kind: 'strange', from: 'your critter drawing', move: 'crawl', speed: 18, h: .18, event: 'Risk', line: 'The thing under the Halsey bridge. It didn’t chase. It looked.' },
  countbirds: { name: 'Count birds', kind: 'code', move: 'flock', event: 'Repeat', line: 'Ten thousand starlings making one shape, and the shape is asking something. (Drawn by code, day only.)' },
  lampmoths:  { name: 'Lamp moths', kind: 'code', move: 'glow', event: 'Find', line: 'They come out after dusk and gather wherever a story is being told. (Drawn by code, night only.)' },
};
for (const [k, b] of Object.entries(BEASTS)) b.id = k;

/* ---------------- stories ----------------
   [theme, title, quote, place, era, event, rarity, teller?]   rarity: c common, u uncommon, r rare (foil) */
const RAW = [
  ['Water', 'The year the Dismal came up to the porch', 'We sat on the roof and watched the chairs float off toward Dunning.', 'dismal', '1950', 'Find', 'u'],
  ['Water', 'Ice on the Loup thick enough to drive', 'Nobody drives now. We walked it anyway, in the dark, listening.', 'loup-fog', '1974', 'Risk', 'c'],
  ['Water', 'The landing moved forty feet', 'The river doesn’t ask. I don’t either. I just move the post.', 'loup-fog', 'Later', 'Repeat', 'c', 'tomas'],
  ['Water', 'The well that went sweet again', 'Sixty years it tasted like pennies. Then one morning it didn’t.', 'sandhills', 'Later', 'Spare', 'u'],
  ['Water', 'Where the two rivers argue', 'The Loup comes in green and the Platte comes in brown, and for a mile they won’t mix.', 'columbus', '1974', 'Chain', 'c'],
  ['Water', 'The lake that used to be a valley', 'My grandfather’s house is under there. On calm days you can see the chimney.', 'kingsley', '1950', 'Find', 'r'],
  ['Water', 'Brown water at Omaha', 'The Missouri carries the whole state past you. Every handful is from somewhere.', 'omaha', 'Later', 'Chain', 'c'],
  ['Water', 'My father’s boat, and where it went', 'He said it was going east. That’s all anyone ever says.', 'bridge', '2000', 'Spare', 'c'],

  ['Weather', 'The hail that flattened the rows', 'Ruth wrote down every broken tree. It took her the whole summer.', 'halsey', '1903', 'Repeat', 'c'],
  ['Weather', 'Three days the wind never stopped', 'On the third day the sand had come into the kitchen and lain down.', 'thedford', '1888', 'Risk', 'u'],
  ['Weather', 'A green sky over Thedford', 'The bees came home at noon. Then the sky went the color of a bottle.', 'thedford', '1974', 'Find', 'u', 'priya'],
  ['Weather', 'The winter we burned the fence posts', 'We kept one. It’s still standing in the yard. We walk around it.', 'sandhills', '1888', 'Spare', 'c'],
  ['Weather', 'Fog so thick the cranes walked', 'You could hear them stepping. Thousands of feet in the water and nobody flying.', 'platte', 'Later', 'Chain', 'r'],
  ['Weather', 'Lights in the north, the first time', 'Mother made us come out in our socks. She said, remember this. I have.', 'mainstreet', '2000', 'Find', 'r'],
  ['Weather', 'The drought year at the bluff', 'The wagon ruts came up out of the grass like they’d been waiting.', 'scottsbluff', '1888', 'Repeat', 'u'],
  ['Weather', 'Snow on the bridge cables', 'It came off all at once, like the bridge shook itself.', 'bridge', 'Later', 'Risk', 'c'],

  ['Work', 'Planting the rows by hand', 'Twelve hundred a day with a bar and a bucket. My hands still count.', 'halsey', '1903', 'Repeat', 'c', 'ruth'],
  ['Work', 'Setting poles on the Ord line', 'You set a pole and look back, and you can see every pole you ever set.', 'sandhills', '1950', 'Chain', 'u', 'arne'],
  ['Work', 'The last day at the elevator', 'They swept it out and left the broom. Somebody should keep sweeping.', 'mainstreet', '2000', 'Spare', 'c', 'deshawn'],
  ['Work', 'What the nursery foreman said', '“Plant them like you’ll be here when they’re grown.” He wasn’t.', 'halsey', '1903', 'Find', 'u'],
  ['Work', 'Turning on the tower lights', 'Every dusk. Nobody sails. I turn them on anyway.', 'kingsley', 'Later', 'Repeat', 'c', 'lou'],
  ['Work', 'Copying the deed books', 'Every line in my hand now. My hand will be in the record longer than I will.', 'courthouse', 'Later', 'Spare', 'u', 'odette'],
  ['Work', 'The quilt for the Gering barn', 'Three of us, one ladder, and we hung the star upside down on purpose.', 'scottsbluff', '1974', 'Chain', 'c', 'marisol'],
  ['Work', 'Pulling the pivot arms', 'We let one stand. It points at the same field every day.', 'loup-fog', '2000', 'Risk', 'c'],

  ['Strange', 'The thing under the Halsey bridge', 'Long legs, like a bundle of sticks that made up its mind. It didn’t chase me. It just looked.', 'halsey', 'Later', 'Risk', 'r', 'gus'],
  ['Strange', 'Lights in the trees past the tower', 'Not lamps. They went out when I stopped walking.', 'halsey', '1974', 'Find', 'u'],
  ['Strange', 'Something walked the rows at night', 'In the morning every row had the same track down the middle. Every one.', 'halsey', '1950', 'Repeat', 'u'],
  ['Strange', 'My aunt heard it count', 'Out loud, in the attic, slow. She said it got to a number that doesn’t exist.', 'broken-bow', '1903', 'Chain', 'r'],
  ['Strange', 'The arch that is somewhere else', 'Tuesday it was on the hill. Wednesday it was by the tank. Nobody saw it go.', 'sandhills', 'Later', 'Repeat', 'u'],
  ['Strange', 'The door in the hill', 'It’s lit inside. I’ve never gone in. I don’t think it’s for me yet.', 'door', 'Later', 'Find', 'r', 'frank'],
  ['Strange', 'The clay one by the cellar', 'It looked like a pile of old paper. Then it blinked.', 'dismal', 'Later', 'Spare', 'c'],
  ['Strange', 'The listener on the porch', 'It only comes when somebody’s telling something true. It came twice tonight.', 'thedford', 'Later', 'Spare', 'u'],

  ['Leaving', 'How my brother went east', 'He didn’t sign and he didn’t refuse. He just started walking and kept going.', 'archway', '2000', 'Chain', 'c'],
  ['Leaving', 'Taking the water at Brownville', 'You go down to the river and you get in, and then you’re from somewhere else.', 'bridge', 'Later', 'Risk', 'r', 'imani'],
  ['Leaving', 'The chair my mother rode to Omaha', 'Two hundred miles in a wheelchair, and she wouldn’t let anyone push.', 'omaha', '2000', 'Spare', 'u'],
  ['Leaving', 'The survey that never came back', 'They found the notebook under the Archway. Every page filled. No name.', 'archway', 'Later', 'Find', 'u'],
  ['Leaving', 'My sister took the water', 'She waved from the middle like it was nothing. Maybe it is.', 'bridge', 'Later', 'Chain', 'c', 'gus'],
  ['Leaving', 'A country in the same place', 'I moved to a different country once. It is in the same place as the one I left.', 'country', 'Later', 'Repeat', 'r'],
  ['Leaving', 'The wagon ruts', 'Everybody who ever left went by here. You can see where they leaned.', 'scottsbluff', '1888', 'Chain', 'c'],
  ['Leaving', 'Who crosses the bridge', 'I count them both ways. More come back than you’d think.', 'bridge', 'Later', 'Repeat', 'u', 'imani'],

  ['Light', 'When the power came to the ranch', 'Dad turned on every light and we stood in the yard looking at the house.', 'sandhills', '1950', 'Find', 'u', 'arne'],
  ['Light', 'The lamp they keep in the courthouse', 'It’s been on since before my grandmother. Nobody pays for it. It’s in the agreement.', 'courthouse', '1903', 'Spare', 'r'],
  ['Light', 'Reading by the stock tank', 'The moon on the water was enough. I read the whole Bible that way, twice.', 'sandhills', '1888', 'Repeat', 'c'],
  ['Light', 'The bulb that never burns out', 'We tested it. We left it on for a year. It got brighter.', 'mainstreet', 'Later', 'Risk', 'u'],
  ['Light', 'Aurora over Broken Bow', 'Pink first, then the green coming up under it like grass.', 'broken-bow', 'Later', 'Chain', 'r'],
  ['Light', 'The last wire into Omaha', 'I spliced it and the whole city came on at once, and I was the only one who saw.', 'omaha', '1974', 'Risk', 'u', 'arne'],
  ['Light', 'The tower at Kingsley', 'From the dam you can see it all the way across. It isn’t a warning. It’s a hello.', 'kingsley', '2000', 'Find', 'c', 'lou'],
  ['Light', 'A lit window in the Archway', 'Somebody lives up there. Their lamp is the same color as ours.', 'archway', 'Later', 'Spare', 'c'],

  ['Kin', 'Her grandmother’s Survey', 'She took her baby with her. The baby is in four of the stories.', 'courthouse', '1903', 'Chain', 'u', 'odette'],
  ['Kin', 'Cousins in Columbus', 'Half of us signed and half didn’t, and we still do Christmas.', 'columbus', '1974', 'Repeat', 'c', 'marisol'],
  ['Kin', 'The seed packet with my name', 'Walt keeps one for every child born in the county. Mine is sweet corn.', 'broken-bow', '1950', 'Spare', 'u', 'walt'],
  ['Kin', 'Two sisters arguing about a date', 'Each one corrects the other. They’re both right. It happened twice.', 'thedford', '1950', 'Chain', 'c'],
  ['Kin', 'Teaching Ada to pole', 'She’s better than me. She doesn’t fight the river. She asks it.', 'loup-fog', 'Later', 'Find', 'c', 'tomas'],
  ['Kin', 'My great-nephew’s page', 'I wrote him into the ledger before he was born. “Gus. Will want to leave.”', 'halsey', 'Later', 'Risk', 'r', 'ruth'],
  ['Kin', 'Frank’s sister at the dam', 'He won’t sign. I won’t stop asking. We both come to the dam on Sundays.', 'kingsley', 'Later', 'Repeat', 'u', 'lou'],
  ['Kin', 'The quilt with everyone’s initials', 'Ninety squares. Some of those people are only initials now.', 'columbus', '1950', 'Spare', 'c', 'marisol'],

  ['Animals', 'Four hundred and twelve cranes', 'Then they all stood up and I lost count, and I didn’t even mind.', 'platte', 'Later', 'Chain', 'r', 'ada'],
  ['Animals', 'The coyote that walked us home', 'Ten feet behind, all the way from the river. At the gate it sat down.', 'dismal', '1974', 'Risk', 'u'],
  ['Animals', 'An owl on the pivot', 'Every night on the same pipe. We named the pipe, not the owl.', 'loup-fog', '2000', 'Repeat', 'c'],
  ['Animals', 'The turtle crossing', 'It took the whole afternoon. We sat down in the road and waited.', 'sandhills', '1950', 'Spare', 'c'],
  ['Animals', 'Bison at the Niobrara', 'They came down to drink and the river went quiet.', 'niobrara', '1888', 'Find', 'u'],
  ['Animals', 'Bees in the courthouse wall', 'In July the honey runs down inside the plaster. The deeds smell like it.', 'courthouse', 'Later', 'Find', 'u', 'priya'],
  ['Animals', 'The jackrabbit census', 'You can’t count them. They count you.', 'thedford', 'Later', 'Repeat', 'c'],
  ['Animals', 'The shape over Thedford', 'Ten thousand birds making one shape, and the shape was asking something.', 'thedford', 'Later', 'Chain', 'r'],
];
const RARITY = { c: { vivid: 1, value: [6, 11] }, u: { vivid: 2, value: [9, 14] }, r: { vivid: 3, value: [13, 18] } };
const STORIES = RAW.map(([theme, title, quote, place, era, event, rarity, teller], i) => {
  const r = RARITY[rarity], value = r.value[0] + ((i * 7) % (r.value[1] - r.value[0] + 1));
  return { id: 's' + (i + 1), theme, title, quote, place, era, event, rarity, teller: teller || null, value, vivid: r.vivid };
});

/* the notebook drawing that goes on a story card when no teller is named */
const THEME_SKETCH = { Water: 'cranes', Weather: 'stars', Work: 'mainstreet', Strange: 'critter', Leaving: 'traveler', Light: 'bulb', Kin: 'traveler', Animals: 'cranes' };

/* ---------------- on the road between places ----------------
   each choice: text, then what it does: trust, daylight, detail, card (a story id), lantern, double (next story counts double) */
const ROAD = [
  { title: 'A bicycle with a cart', text: 'A woman pedaling west with a cart of jars. “You’re on Survey? Take one. They’re spare.”',
    choices: [{ text: 'Take a jar', card: 's4', note: 'She tells you whose well it came from.' }, { text: 'Trade her a story for it', trust: 2, note: 'She’ll tell the next one you’re coming.' }] },
  { title: 'Somebody you know', text: 'A man at the crossroads squints at you. “You’re Odette’s cousin’s kid. I knew it.”',
    choices: [{ text: 'Ask about them', card: 's49', note: 'He has a story about your grandmother.' }, { text: 'Keep walking', daylight: 1, note: 'You make good time.' }] },
  { title: 'The arch moved', text: 'The arch you walked through at dawn is ahead of you again, standing in the road.',
    choices: [{ text: 'Walk through it again', double: true, note: 'Something repeats. Your next story counts double.' }, { text: 'Go around', note: 'It doesn’t follow. You don’t look back to check.' }] },
  { title: 'Cranes in the road', text: 'Hundreds of them, standing in the road, talking. They don’t move for you.',
    choices: [{ text: 'Wait for them', trust: 1, note: 'It takes an hour. You don’t mind.' }, { text: 'Walk through them', detail: 3, trust: -1, note: 'They lift all at once, furious and enormous.' }] },
  { title: 'A shut gate', text: 'Hand-painted on the gate: NOT SIGNED. Somebody is watching from the porch.',
    choices: [{ text: 'Knock anyway', card: 's30', note: 'He talks, but tells you it won’t count.' }, { text: 'Leave a note on the post', trust: 1, note: 'You leave your name. That’s all.' }] },
  { title: 'A lamp on a fence post', text: 'Out in the middle of nowhere, a lamp on a fence post, lit.',
    choices: [{ text: 'Take a closer look', lantern: 40, note: 'Your lantern burns wider tonight.' }, { text: 'Leave it lit', trust: 1, note: 'Somebody meant it to be there.' }] },
  { title: 'A child on Survey', text: 'A girl of ten walking with her grandfather. She has a notebook like yours.',
    choices: [{ text: 'Walk a mile with them', card: 's57', note: 'Her grandfather tells you about the cranes.' }, { text: 'Trade notebooks for a look', detail: 2, note: 'Her handwriting is better than yours.' }] },
  { title: 'Weather coming', text: 'The sky goes the color of a bottle. The wind stops.',
    choices: [{ text: 'Shelter in the culvert', daylight: -1, card: 's11', note: 'You wait it out with a stranger who keeps bees.' }, { text: 'Keep going', detail: 4, trust: -1, note: 'You arrive soaked and nobody wants to sit near you.' }] },
  { title: 'The Listener', text: 'On somebody’s porch, a small pale thing with a black crown, standing very still.',
    choices: [{ text: 'Tell it something true', double: true, note: 'It stays. Your next story counts double.' }, { text: 'Say nothing', note: 'When you look back it’s gone.' }] },
  { title: 'People at the river', text: 'A few people on the bank, shoes off, looking at the water.',
    choices: [{ text: 'Sit with them', card: 's37', note: 'One of them tells you about her sister.' }, { text: 'Ask one why', trust: 2, note: '“Why not,” she says, and laughs, and stays.' }] },
];

const ENDINGS = {
  sign: { title: 'You sign', text: 'Your testimony goes into the record with everyone else’s. The abundance goes on. Somebody will read your stories in a hundred years and know exactly where the cranes stood.' },
  refuse: { title: 'You refuse, and stay', text: 'You keep your stories. You live outside the agreement but inside its presence, like Frank by the Dismal. People still wave.' },
  water: { title: 'You take the water', text: 'You walk down past Imani’s bridge, and you get in, and then you’re from somewhere else.' },
};

return { TELLERS, PLACES, BEASTS, STORIES, THEME_SKETCH, ROAD, ENDINGS };
})();
