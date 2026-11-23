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
/* public-domain images from Neon's pool, checked against Wikimedia's license records */
const PD = (id, credit, kind = 'archive') => ({ kind, src: `public/${id}.jpg`, credit });
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
  C('deshawn-mill', 'A windmill lies about the wind', 'It tells you which way. Then it lies.', 'Weather', 'sandhills', 'Later', 'Repeat', 1, 6, 1, PD('pd_sandhills_print', 'Kady B. Faulkner, Nebraska Sandhills · public domain', 'painting'), { people: ['deshawn'] }),
  C('deshawn-above', 'The Sandhills from above', 'Somebody flew over once and said the lakes looked like dropped coins.', 'Strange', 'sandhills', 'Later', 'Find', 1, 6, 2, PD('pd_sat_sandhills', 'NASA Terra satellite · public domain', 'painting'), { people: ['deshawn', 'priya'] }),
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
  C('marisol-bluff', 'The drought year at the bluff', 'The wagon ruts came up out of the grass like they’d been waiting.', 'Weather', 'scottsbluff', '1888', 'Repeat', 1, 6, 1, PD('pd_scotts_bluff_view', 'NPS photo, Scotts Bluff · public domain'), { people: ['marisol'] }),
  // Arne (Main Street)
  C('arne-wire', 'The last wire into Omaha', 'The whole city came on, and only I saw.', 'Light', 'omaha', '1974', 'Risk', 2, 11, 2, R('omaha', 'face2'), { people: ['arne'] }),
  C('arne-bulb', 'The bulb that never burns out', 'We left it on a year. It got brighter.', 'Light', 'mainstreet', 'Later', 'Spare', 1, 6, 2, D('bulb'), { people: ['arne'] }),
  C('arne-poles', 'Every pole you ever set', 'Look back and there they all are.', 'Work', 'mainstreet', '1950', 'Chain', 1, 7, 1, PD('pd_silo_bennet', 'Grain elevator, Bennet · CC0, Wikimedia Commons'), { people: ['arne', 'deshawn'] }),
  C('arne-north', 'Lights in the north', 'Mother said, remember this. I have.', 'Weather', 'mainstreet', '2000', 'Find', 1, 6, 3, R('night-mainstreet'), { people: ['arne'], rare: true }),
  C('arne-elevator', 'The last day at the elevator', 'They swept it out and left the broom. Somebody should keep sweeping.', 'Work', 'mainstreet', '2000', 'Spare', 1, 6, 2, PD('pd_silo_kimball', 'Grain elevator, Kimball · CC0, Wikimedia Commons'), { people: ['arne', 'deshawn'] }),
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
  // Lou (Kingsley Dam)
  C('lou-valley', 'The lake that used to be a valley', 'My grandfather’s house is under there. On calm days you can see the chimney.', 'Water', 'kingsley', '1950', 'Find', 2, 9, 3, R('kingsley'), { people: ['lou'], rare: true }),
  C('lou-lights', 'Turning on the tower lights', 'Every dusk. Nobody sails. I turn them on anyway.', 'Light', 'kingsley', 'Later', 'Repeat', 1, 6, 2, R('night-kingsley', 'drawn-lou'), { people: ['lou'] }),
  C('lou-hello', 'It isn’t a warning', 'From the dam you can see the tower all the way across. It’s a hello.', 'Light', 'kingsley', '2000', 'Chain', 1, 6, 2, D('drawn-lou'), { people: ['lou'] }),
  C('lou-sundays', 'Sundays at the dam with Frank', 'He won’t sign. I won’t stop asking. We both come anyway.', 'Kin', 'kingsley', 'Later', 'Spare', 1, 6, 2, R('kingsley', 'drawn-frank'), { people: ['lou', 'frank'] }),
  // Cal (the Niobrara)
  C('cal-keeps', 'What the river keeps', 'A wedding ring, a dog’s collar, a whole canoe. I put them on the shelf by the register.', 'Water', 'niobrara', 'Later', 'Find', 1, 6, 2, R('niobrara', 'drawn-cal'), { people: ['cal'] }),
  C('cal-falls', 'The falls froze standing up', 'All winter, like it was holding its breath.', 'Weather', 'niobrara', '1974', 'Spare', 1, 6, 2, R('night-niobrara'), { people: ['cal'] }),
  C('cal-bison', 'Bison at the crossing', 'They came down to drink and the river went quiet.', 'Animals', 'niobrara', '1888', 'Chain', 1, 6, 2, O('beast-bison'), { people: ['cal'] }),
  C('cal-upstream', 'The canoe that came back upstream', 'Empty. Dry inside. It tied itself to my dock.', 'Strange', 'niobrara', 'Later', 'Risk', 2, 10, 3, D('drawn-cal'), { people: ['cal'], rare: true }),
  // Lan (Toadstool)
  C('lan-tracks', 'The tracks go into the rock', 'They don’t come out the other side. I checked.', 'Strange', 'toadstool', 'Later', 'Find', 1, 6, 2, R('toadstool', 'drawn-lan'), { people: ['lan'] }),
  C('lan-caps', 'Every cap is balanced', 'Every year one falls, and nobody hears it.', 'Weather', 'toadstool', '1950', 'Repeat', 1, 6, 2, R('toadstool'), { people: ['lan'] }),
  C('lan-rhino', 'The rhino in the clay', 'Barrel-shaped. Short legs. It looked surprised.', 'Animals', 'toadstool', '1888', 'Chain', 2, 9, 3, O('beast-rhino'), { people: ['lan', 'bettina'], rare: true }),
  C('lan-shelter', 'A sod shelter in the badlands', 'Somebody built with the ground they stood on. The wall is mostly bones.', 'Work', 'toadstool', '1888', 'Spare', 1, 6, 2, R('night-toadstool'), { people: ['lan'] }),
  // Maeve (O’Neill)
  C('maeve-shamrock', 'Painting the shamrock', 'Every spring, in the middle of the crossroads. The trucks go around.', 'Work', 'oneill', '1974', 'Repeat', 1, 6, 2, R('oneill', 'drawn-maeve'), { people: ['maeve'] }),
  C('maeve-postcards', 'A shoebox of postcards', 'Boston, Butte, Brisbane. All of them say come home.', 'Leaving', 'oneill', '1950', 'Find', 1, 6, 2, D('drawn-maeve'), { people: ['maeve', 'imani'] }),
  C('maeve-boat', 'My mother came on a boat', 'She brought a cup of dirt from home and planted it under the porch.', 'Kin', 'oneill', '1903', 'Chain', 2, 9, 3, R('night-oneill'), { people: ['maeve'], rare: true }),
  C('maeve-hail', 'Hail the size of potatoes', 'We put them in the freezer. Proof.', 'Weather', 'oneill', '2000', 'Risk', 2, 10, 2, R('oneill'), { people: ['maeve'] }),
  // Nadia (Scotts Bluff)
  C('nadia-summit', 'Driving the summit road', 'Three tunnels. In the middle one everybody stops talking.', 'Leaving', 'scottsbluff', 'Later', 'Chain', 1, 6, 2, R('scottsbluff', 'drawn-nadia'), { people: ['nadia', 'marisol'] }),
  C('nadia-hat', 'The wind took my hat to Wyoming', 'Probably. I never saw it land.', 'Weather', 'scottsbluff', '2000', 'Risk', 2, 10, 2, R('night-scottsbluff'), { people: ['nadia'] }),
  C('nadia-goods', 'Dry goods for the wagons', 'My great-grandfather sold needles, coffee, and a map that was mostly blank.', 'Leaving', 'scottsbluff', '1888', 'Spare', 1, 6, 2, R('scottsbluff'), { people: ['nadia'] }),
  C('nadia-blank', 'The blank part of the map', 'He said the blank was where the good stories were.', 'Strange', 'scottsbluff', '1888', 'Find', 2, 9, 3, D('drawn-nadia'), { people: ['nadia'], rare: true }),
  // Bettina (Ashfall)
  C('bettina-brush', 'One brush at a time', 'A rib a summer. They waited twelve million years. They can wait for me.', 'Work', 'ashfall', 'Later', 'Spare', 1, 6, 2, R('ashfall', 'drawn-bettina'), { people: ['bettina'] }),
  C('bettina-calf', 'The calf under its mother', 'Even in the ash she was keeping it out of the weather.', 'Animals', 'ashfall', '1974', 'Chain', 2, 9, 3, R('ashfall'), { people: ['bettina'], rare: true }),
  C('bettina-sky', 'Snow that didn’t melt', 'The ash came a thousand miles and fell like snow. It never melted.', 'Weather', 'ashfall', '1974', 'Risk', 2, 10, 2, O('beast-rhino'), { people: ['bettina'] }),
  C('bettina-blinked', 'The skull blinked', 'Once, in the afternoon. I didn’t tell the others.', 'Strange', 'ashfall', 'Later', 'Find', 1, 6, 2, R('night-ashfall'), { people: ['bettina', 'frank'] }),
  // Abuk (Lexington)
  C('abuk-train', 'The four o’clock train', 'I race it every morning. Some mornings it lets me win.', 'Work', 'lexington', 'Later', 'Chain', 1, 6, 2, R('lexington', 'drawn-abuk'), { people: ['abuk'] }),
  C('abuk-cranes', 'Cranes over the parking lot', 'Shift change. All of us stopped and looked up.', 'Animals', 'lexington', '2000', 'Find', 1, 6, 2, R('night-lexington', 'crane-wings'), { people: ['abuk', 'ada'] }),
  C('abuk-break', 'Thirty languages on the line', 'Nobody shares one. Everybody knows the word for break.', 'Work', 'lexington', '2000', 'Repeat', 1, 6, 2, R('lexington'), { people: ['abuk'] }),
  C('abuk-sister', 'My sister at three in the morning', 'It’s noon where she is. She tells me her weather. I tell her mine.', 'Leaving', 'lexington', 'Later', 'Spare', 2, 9, 3, D('drawn-abuk'), { people: ['abuk'], rare: true }),
  // Femi (Nebraska City)
  C('femi-graft', 'A graft from the Halsey rows', 'Ruth mailed me a twig in a wet sock. It took.', 'Kin', 'nebraskacity', 'Later', 'Chain', 1, 6, 2, R('nebraskacity', 'drawn-femi'), { people: ['femi', 'ruth'] }),
  C('femi-frost', 'Fires between the rows', 'Frost on the blossoms. We stayed up all night talking to the trees.', 'Weather', 'nebraskacity', '1974', 'Risk', 2, 10, 2, R('night-nebraskacity'), { people: ['femi'] }),
  C('femi-apple', 'An apple nobody has a name for', 'It tastes like the year you were born. Everyone says so.', 'Strange', 'nebraskacity', 'Later', 'Find', 1, 6, 3, D('drawn-femi'), { people: ['femi'], rare: true }),
  C('femi-ledger', 'Every tree in one book', 'Every tree planted in the state, by hand. The book stops in 1903.', 'Work', 'nebraskacity', '1903', 'Spare', 1, 6, 2, PD('pd_aerial_otoe_1949', 'USDA aerial index, Otoe County, 1949 · public domain', 'painting'), { people: ['femi'] }),
  // Dot (the Capitol)
  C('dot-sower', 'The Sower turned around', 'Once, in a thunderstorm. He was facing west in the morning.', 'Strange', 'capitol', '1974', 'Risk', 2, 10, 3, R('capitol', 'drawn-dot'), { people: ['dot'], rare: true }),
  C('dot-weather', 'Weather from three counties', 'From the top you can see it coming. I used to warn the senators.', 'Weather', 'capitol', '1950', 'Find', 1, 6, 2, R('capitol'), { people: ['dot'] }),
  C('dot-dome', 'Checking the dome lights', 'They put the lamps on a timer. I still go up and check.', 'Light', 'capitol', '2000', 'Repeat', 1, 6, 2, R('night-capitol'), { people: ['dot', 'arne'] }),
  C('dot-gate', 'What they say on the way up', 'Senators, schoolchildren. Everybody tells the elevator the truth.', 'Kin', 'capitol', '1950', 'Spare', 1, 6, 2, D('drawn-dot'), { people: ['dot', 'odette'] }),
  // found on the road
  C('peaches', 'Peaches from Dunning', 'She said they were spare.', 'Kin', 'sandhills', 'Later', 'Spare', 0, 4, 1, D('traveler')),
  C('cousin', 'A man who knows your cousin', 'You’re Odette’s cousin’s kid. I knew it.', 'Kin', 'brokenbow', 'Later', 'Chain', 1, 5, 2, D('face3'), { people: ['odette', 'marisol', 'walt'] }),
  C('cranes-lift', 'They lifted all at once', 'Furious and enormous.', 'Animals', 'platte', 'Later', 'Risk', 1, 8, 2, D('crane-dance')),
  C('trail-ruts', 'The wagon ruts', 'Everybody who ever left went by here. You can see where they leaned.', 'Leaving', 'scottsbluff', '1888', 'Chain', 1, 6, 2, PD('pd_chimney_rock_1904', 'Chimney Rock, 1904 · NARA, public domain'), { people: ['gus'] }),
  C('lookout', 'The lookout tower', 'From the top you can see three counties and nobody in them.', 'Light', 'platte', 'Later', 'Find', 1, 6, 2, PD('pd_platte_tower', 'Platte River State Park tower · public domain, Wikimedia Commons'), { people: ['ada'] }),
  C('elevator-sunday', 'Sweeping the elevator on Sundays', 'Nobody asked. It’s just that somebody should.', 'Work', 'mainstreet', 'Later', 'Spare', 0, 4, 1, PD('pd_silo_mclean', 'Grain elevator, McLean · public domain, Wikimedia Commons'), { people: ['deshawn'] }),
  C('duffel-east', 'A bag pointed east', 'Somebody set it down facing the river and kept going without it.', 'Leaving', 'sandhills', 'Later', 'Chain', 1, 6, 2, R('road-duffel')),
  C('boot-fence', 'Every boot on the fence', 'One for everybody who walked away and kept walking.', 'Leaving', 'sandhills', '1974', 'Spare', 1, 6, 2, R('road-bootfence')),
  C('kolaches', 'Kolaches after the funeral', 'Apricot, poppy seed, prune. Everybody knew whose were whose.', 'Kin', 'mainstreet', '1950', 'Find', 1, 6, 2, R('road-kolaches')),
  C('culvert', 'Waiting out the storm', 'A stranger who keeps bees shared the culvert.', 'Weather', 'thedford', 'Later', 'Find', 1, 5, 2, R('thedford'), { people: ['priya'] }),
];
/* ---------------- the value budget ----------------
   Every card's Weight is set from a budget, so cards of the same rarity and cost are worth the same
   per trust, and the event decides the shape of that value (the deckbuilder guide's per-energy baseline).
   Solo value = Weight × Vivid, told alone.
     budget (solo value):   cost 0   cost 1   cost 2
       basic                  2        6       13      (6 per trust: the baseline)
       uncommon               4       10       22
       rare                   6       14       30
   Event multipliers: Find ×0.65 (it draws 2: the cantrip penalty), Chain ×0.85 (+4 when it continues),
   Risk ×0.9 (+5, may cost standing), Spare ×0.9 (Retain; +4 to the next telling), Repeat ×1, none ×1.
   Vivid is the multiplicative axis, so it is capped by rarity: basic 1 (fog-cranes 2), uncommon 2, rare 3.
   Weight = round(budget × event ÷ Vivid), at least 2. */
const BUDGET = { basic: [2, 6, 13], uncommon: [4, 10, 22], rare: [6, 14, 30] };
const EVMULT = { Find: .65, Chain: .85, Risk: .9, Spare: .9, Repeat: 1 };
const START_IDS = new Set(['talk-weather', 'talk-kin', 'rows', 'hail', 'bridge-thing', 'tree-lights', 'walked-rows', 'fence-posts', 'turtle', 'stock-tank', 'fog-cranes', 'power']);
for (const c of CARDS) {
  if (c.small) continue;
  c.rarity = START_IDS.has(c.id) ? 'basic' : c.rare ? 'rare' : 'uncommon';
  c.v = Math.min(c.v, c.rarity === 'basic' ? (c.id === 'fog-cranes' ? 2 : 1) : c.rarity === 'uncommon' ? 2 : 3);
  c.w = Math.max(2, Math.round(BUDGET[c.rarity][c.cost] * (EVMULT[c.event] ?? 1) / c.v));
}
CARDS.filter(c => c.small).forEach(c => { c.rarity = 'basic'; });
/* bridges between people (the guide's 30% glue): stories that tie two tellers together */
const GLUE = { 'tree-lights': ['ruth'], 'fog-cranes': ['ada'], 'power': ['arne'], 'priya-green': ['walt'], 'deshawn-well': ['tomas'], 'walt-aurora': ['arne'],
  'tomas-pivot': ['ada'], 'gus-notebook': ['imani'], 'marisol-rivers': ['tomas'], 'arne-bulb': ['odette'], 'imani-brown': ['marisol'], 'priya-wind': ['deshawn'],
  'frank-unsigned': ['lou'], 'cal-keeps': ['tomas', 'imani'], 'lan-tracks': ['deshawn'], 'maeve-boat': ['walt'], 'nadia-goods': ['gus'], 'bettina-calf': ['ada'], 'abuk-train': ['arne'], 'abuk-sister': ['imani'], 'femi-ledger': ['ruth'], 'dot-weather': ['priya'] };
for (const [id, ps] of Object.entries(GLUE)) { const c = CARDS.find(c => c.id === id); if (c) c.people = [...new Set([...c.people, ...ps])]; }
/* what a card is worth on its own, for comparing a draft to your deck's average */
const strength = c => Math.round(c.w * c.v / (EVMULT[c.event] ?? 1) / Math.max(1, c.cost) * 10) / 10;
const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
const START = ['talk-weather', 'talk-kin', 'rows', 'hail', 'bridge-thing', 'tree-lights', 'walked-rows', 'fence-posts', 'turtle', 'stock-tank', 'fog-cranes', 'power'];
const PLACE = { halsey: 'Halsey', thedford: 'Thedford', sandhills: 'the Sandhills', dismal: 'the Dismal', brokenbow: 'Broken Bow', loup: 'the North Loup', platte: 'the Platte', archway: 'the Archway', columbus: 'Columbus', mainstreet: 'Main Street', courthouse: 'the Courthouse', omaha: 'Omaha', bridge: 'the bridge', door: 'the door in the hill', scottsbluff: 'Scotts Bluff',
  kingsley: 'Kingsley Dam', niobrara: 'the Niobrara', toadstool: 'Toadstool', oneill: 'O’Neill', ashfall: 'Ashfall', lexington: 'Lexington', nebraskacity: 'Nebraska City', capitol: 'the Capitol' };

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
    stories: ['deshawn-mill', 'deshawn-well', 'deshawn-poles', 'deshawn-arch', 'deshawn-above'] },
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
    stories: ['marisol-cousins', 'marisol-quilt', 'marisol-rivers', 'marisol-star', 'marisol-bluff'] },
  { id: 'arne', name: 'Arne Lindqvist', place: 'mainstreet', placeName: 'Main Street', img: 'img/mainstreet.jpg', drawing: 'sketches/face2.png', photo: 'img/face2-photo.jpg', cols: [5, 6],
    want: 'Light', line: 'I put light in every house from here to the river. Now I’m collecting it back.',
    reservation: { text: 'Wants something that lasted since 1950', tag: ['era', '1950'] },
    intents: [{ kind: 'doubt', n: 24 }, ask('theme', 'Light', 'Asks about the power'), { kind: 'own' }, { kind: 'doubt', n: 24 }],
    stories: ['arne-wire', 'arne-bulb', 'arne-poles', 'arne-north', 'arne-elevator'] },
  { id: 'odette', name: 'Odette Mbeki-Larsen', place: 'courthouse', placeName: 'Register of Deeds', img: 'img/courthouse.jpg', drawing: 'sketches/drawn-odette.png', photo: 'img/cast-odette.jpg', cols: [6],
    want: 'Kin', line: 'Everything in this room was signed by somebody’s grandmother.',
    reservation: { text: 'Wants it on the record: something from 1903', tag: ['era', '1903'] },
    intents: [ask('theme', 'Kin', 'Asks about family'), { kind: 'doubt', n: 26 }, { kind: 'own' }, ask('era', '1903', 'Asks about 1903')],
    stories: ['odette-survey', 'odette-copy', 'odette-lamp', 'odette-bees'] },
  { id: 'lou', name: 'Lou Haskins', place: 'kingsley', placeName: 'Kingsley Dam at dusk', img: 'img/kingsley.jpg', drawing: 'sketches/drawn-lou.png', photo: 'img/cast-lou.jpg', cols: [2, 3],
    want: 'Light', line: 'Somebody has to turn them on. Nobody has to look at them.',
    reservation: { text: 'Listens to people who keep doing a thing nobody asked for', tag: ['event', 'Repeat'] },
    intents: [{ kind: 'own' }, ask('theme', 'Light', 'Asks about the tower lights'), { kind: 'doubt', n: 16 }, { kind: 'quiet' }],
    stories: ['lou-valley', 'lou-lights', 'lou-hello', 'lou-sundays'] },
  { id: 'cal', name: 'Cal Sorensen', place: 'niobrara', placeName: 'The Niobrara near Valentine', img: 'img/niobrara.jpg', drawing: 'sketches/drawn-cal.png', photo: 'img/cast-cal.jpg', cols: [1, 2],
    want: 'Weather', line: 'A river is just weather lying down. It keeps one thing from everybody who floats through.',
    reservation: { text: 'Only listens if you’ve seen what comes down to drink', tag: ['theme', 'Animals'] },
    intents: [ask('theme', 'Weather', 'Asks what the sky did'), { kind: 'doubt', n: 14 }, { kind: 'own' }, ask('theme', 'Animals', 'Asks what came down to drink')],
    stories: ['cal-keeps', 'cal-falls', 'cal-bison', 'cal-upstream'] },
  { id: 'lan', name: 'Lan Pham', place: 'toadstool', placeName: 'The badlands at Toadstool', img: 'img/toadstool.jpg', drawing: 'sketches/drawn-lan.png', photo: 'img/cast-lan.jpg', cols: [1, 2, 3],
    want: 'Animals', line: 'Something walked here before the rock was rock. I’m following it.',
    reservation: { text: 'Wants proof: something from 1888 or before', tag: ['era', '1888'] },
    intents: [{ kind: 'doubt', n: 14 }, ask('theme', 'Animals', 'Asks what left the tracks'), { kind: 'own' }, ask('theme', 'Strange', 'Asks what you’ve seen')],
    stories: ['lan-tracks', 'lan-caps', 'lan-rhino', 'lan-shelter'] },
  { id: 'maeve', name: 'Maeve Kinkaid', place: 'oneill', placeName: 'The crossroads at O’Neill', img: 'img/oneill.jpg', drawing: 'sketches/drawn-maeve.png', photo: 'img/cast-maeve.jpg', cols: [2, 3],
    want: 'Kin', line: 'Half this town left. Every one of them sends a postcard in March. Whose are you?',
    reservation: { text: 'Won’t say a word until you’ve talked about the weather', tag: ['theme', 'Weather'] },
    intents: [{ kind: 'own' }, ask('theme', 'Leaving', 'Asks who left'), { kind: 'doubt', n: 16 }, ask('theme', 'Work', 'Asks what you do')],
    stories: ['maeve-shamrock', 'maeve-postcards', 'maeve-boat', 'maeve-hail'] },
  { id: 'nadia', name: 'Nadia Haddad', place: 'scottsbluff', placeName: 'The summit road, Scotts Bluff', img: 'img/scottsbluff.jpg', drawing: 'sketches/drawn-nadia.png', photo: 'img/cast-nadia.jpg', cols: [3, 4],
    want: 'Weather', line: 'The wind takes a little of the bluff every day. I drive people up before it’s gone.',
    reservation: { text: 'Only trusts someone who’s taken a chance', tag: ['event', 'Risk'] },
    intents: [ask('theme', 'Weather', 'Asks about the wind'), { kind: 'own' }, { kind: 'doubt', n: 18 }, { kind: 'quiet' }],
    stories: ['nadia-summit', 'nadia-hat', 'nadia-goods', 'nadia-blank'] },
  { id: 'bettina', name: 'Bettina Novak', place: 'ashfall', placeName: 'The rhino barn at Ashfall', img: 'img/ashfall.jpg', drawing: 'sketches/drawn-bettina.png', photo: 'img/cast-bettina.jpg', cols: [3, 4],
    want: 'Strange', line: 'They all died waiting for water. I brush them off one at a time.',
    reservation: { text: 'Only listens to stories about animals', tag: ['theme', 'Animals'] },
    intents: [{ kind: 'own' }, { kind: 'doubt', n: 18 }, ask('theme', 'Strange', 'Asks what you can’t explain'), ask('theme', 'Water', 'Asks about the waterhole')],
    stories: ['bettina-brush', 'bettina-calf', 'bettina-sky', 'bettina-blinked'] },
  { id: 'abuk', name: 'Abuk Deng', place: 'lexington', placeName: 'The frontage road at Lexington', img: 'img/lexington.jpg', drawing: 'sketches/drawn-abuk.png', photo: 'img/cast-abuk.jpg', cols: [4, 5],
    want: 'Work', line: 'I run to the plant at four in the morning. The trains wait for me.',
    reservation: { text: 'Trusts people who work for a living', tag: ['theme', 'Work'] },
    intents: [ask('theme', 'Work', 'Asks about the night shift'), { kind: 'doubt', n: 20 }, { kind: 'own' }, ask('theme', 'Kin', 'Asks about home')],
    stories: ['abuk-train', 'abuk-cranes', 'abuk-break', 'abuk-sister'] },
  { id: 'femi', name: 'Femi Adeyemi', place: 'nebraskacity', placeName: 'The orchard at Nebraska City', img: 'img/nebraskacity.jpg', drawing: 'sketches/drawn-femi.png', photo: 'img/cast-femi.jpg', cols: [5, 6],
    want: 'Kin', line: 'Every tree here is grafted from one that was somebody’s. Ask me whose.',
    reservation: { text: 'Wants to hear about weather that hurt something', tag: ['theme', 'Weather'] },
    intents: [ask('theme', 'Kin', 'Asks whose tree'), { kind: 'own' }, { kind: 'doubt', n: 22 }, ask('theme', 'Work', 'Asks about the work')],
    stories: ['femi-graft', 'femi-frost', 'femi-apple', 'femi-ledger'] },
  { id: 'dot', name: 'Dot Albrecht', place: 'capitol', placeName: 'The Capitol tower, Lincoln', img: 'img/capitol.jpg', drawing: 'sketches/drawn-dot.png', photo: 'img/cast-dot.jpg', cols: [6],
    want: 'Light', line: 'Fifty years in that elevator. I know what everybody says on the way up.',
    reservation: { text: 'Wants one story to lead into the next', tag: ['event', 'Chain'] },
    intents: [{ kind: 'doubt', n: 24 }, ask('theme', 'Light', 'Asks about the tower at night'), { kind: 'own' }, ask('theme', 'Weather', 'Asks what’s coming')],
    stories: ['dot-sower', 'dot-weather', 'dot-dome', 'dot-gate'] },
  { id: 'imani', name: 'Imani Cole', place: 'bridge', placeName: 'The bridge over the Missouri', img: 'img/bridge.jpg', drawing: 'sketches/drawn-imani.png', photo: 'img/cast-imani.jpg', cols: [7], boss: true,
    want: 'Leaving', line: 'I count who crosses, both ways. Tell me why you came.',
    reservation: { text: 'Wants to know why you’re going', tag: ['theme', 'Leaving'] },
    intents: [{ kind: 'own' }, ask('theme', 'Leaving', 'Asks why you’re going'), { kind: 'doubt', n: 26 }, ask('theme', 'Water', 'Asks about the river')],
    stories: ['imani-water', 'imani-count', 'imani-brown', 'imani-back'] },
];
const TELLER = Object.fromEntries(TELLERS.map(t => [t.id, t]));

/* ---------------- keepsakes: barn quilts that change the rules ---------------- */
/* Keepsakes are relics: passive rules outside the deck. Each subscribes to hooks, and they resolve
   left to right in the order you collected them (the order shown in the top bar).
     weight(card, w, ctx) -> w        per card, before Weight is summed (additive)
     vivid(v, ctx) -> v               after links (multiplicative axis: these are gated mid-run)
     chain / risk / spare: replace an event's amount
     cost(card, n) -> n;  firstDayTrust(n) -> n;  doubtCostsStanding -> false */
const KEEPS = {
  sawtooth:  { name: 'Sawtooth', text: 'Your first telling each day gets +1 Vivid.', block: 'sawtooth', vivid: (v, x) => x.firstToday ? v + 1 : v },
  ohiostar:  { name: 'Ohio Star', text: 'Threads give +2 Vivid instead of +1.', block: 'ohiostar', vivid: (v, x) => x.thread ? v + 1 : v },
  logcabin:  { name: 'Log Cabin', text: 'Retained Spare stories give +7 Weight instead of +4.', block: 'logcabin', spare: () => 7 },
  geese:     { name: 'Flying Geese', text: 'Chain gives +7 Weight instead of +4.', block: 'geese', chain: () => 7 },
  pinwheel:  { name: 'Pinwheel', text: 'Repeat copies every other event in the telling.', block: 'pinwheel', repeatAll: true },
  bearpaw:   { name: 'Bear’s Paw', text: 'Unanswered doubts cost credibility, never standing.', block: 'bearpaw', doubtCostsStanding: false },
  lonestar:  { name: 'Lone Star', text: 'Rare stories cost 1 less trust.', block: 'lonestar', cost: (c, n) => c.rare ? Math.max(0, n - 1) : n },
  churndash: { name: 'Churn Dash', text: '+1 trust on the first day of every sitting.', block: 'churndash', firstDayTrust: n => n + 1 },
  dresden:   { name: 'Dresden Plate', text: 'Small talk gets +4 Weight.', block: 'dresden', weight: (c, w) => c.small ? w + 4 : w },
  drunkard:  { name: 'Drunkard’s Path', text: 'Risk never costs standing, but gives only +3 Weight.', block: 'drunkard', risk: () => 3, riskSafe: true },
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
  { title: 'The old trail', text: 'Two ruts in the grass, side by side, running west toward a rock like a chimney. Wagons made them a long time ago.',
    choices: [{ text: 'Walk in the ruts a while', card: 'trail-ruts' }, { text: 'Sit and rest on the rise', standing: 2 }] },
  { title: 'A lookout tower', text: 'A red steel tower over the trees by the river, stairs going up and up.',
    choices: [{ text: 'Climb it', card: 'lookout', standing: -1 }, { text: 'Rest at the bottom', standing: 2 }] },
  { title: 'An empty elevator', text: 'A grain elevator at the edge of a town nobody lives in now. The door is open and the floor is swept.',
    choices: [{ text: 'Pick up the broom', card: 'elevator-sunday', standing: 1 }, { text: 'Sleep in the office', standing: 3 }] },
  { title: 'Weather coming', text: 'The sky goes the color of a bottle. The wind stops.',
    choices: [{ text: 'Shelter in the culvert', card: 'culvert', standing: -1 }, { text: 'Keep going', keep: true, standing: -2 }] },  { title: 'A bag by the mile marker', text: 'A duffel bag on the shoulder, zipped, set down neatly, facing east.',
    choices: [{ text: 'Carry it a while', card: 'duffel-east' }, { text: 'Leave it where it was put', standing: 2 }] },
  { title: 'A fence of boots', text: 'Every post for a mile wears an old boot, upside down. Somebody added a pair this week.',
    choices: [{ text: 'Count them', card: 'boot-fence' }, { text: 'Hang up your small talk', dropSmall: true, standing: 1 }] },
  { title: 'A church sale', text: 'A sign on the church door: kolaches, coffee, everybody welcome. The basement smells like apricots.',
    choices: [{ text: 'Sit and listen', card: 'kolaches', standing: 1 }, { text: 'Eat and rest', standing: 2 }] },
];

const DAYS = 4, TRUST = 3, HAND = 5, MAX_TELL = 3, START_STANDING = 10, MAX_STANDING = 12, COLS = 8;
const RANKS = [[0, 'Noted'], [1300, 'Entered'], [1800, 'Recorded'], [2200, 'Indexed'], [2550, 'Bound into the record']];
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
const hooks = (G, name) => G.keeps.map(k => [k, KEEPS[k]]).filter(([, h]) => h[name] !== undefined);
const costOf = (G, c) => hooks(G, 'cost').reduce((n, [, h]) => h.cost(c, n), c.cost);

/* ---------------- the map ----------------
   columns west to east. Column 0 is Ruth at Halsey; column 7 is Imani at the bridge.
   kinds: sitting, holdout, road, arch, courthouse, bridge */
function makeMap(r) {
  const cols = [], met = new Set(['ruth']);   // a teller appears once per run unless their columns run out
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
      if (kind === 'sitting') { const fresh = pool.filter(t => !used.has(t.id) && !met.has(t.id)), t = fresh.length ? fresh : pool.filter(t => !used.has(t.id)); if (!t.length) node.kind = ['road', 'arch', 'courthouse'].find(k => !col.some(n => n.kind === k)) || 'road'; else { node.teller = pickR(t, r).id; used.add(node.teller); met.add(node.teller); } }
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
  const base = Math.round((120 + 48 * node.c) / 10) * 10;
  return node.kind === 'holdout' ? Math.round(base * 1.25 / 10) * 10 : node.kind === 'bridge' ? 390 : base;
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
  const S = { T, node, threshold: threshold(node), cred: 0, day: 1, trustMax: TRUST, trust: hooks(G, 'firstDayTrust').reduce((n, [, h]) => h.firstDayTrust(n), TRUST), warm: false, reservation: true,
    draw: shuffle(G.deck.map(c => ({ ...c })), r), hand: [], discard: [], last: null, spareBonus: 0, answered: false, toldToday: 0, intentI: 0, log: [], result: null, G };
  /* a teller starts anywhere in their cycle but never opens with a doubt, so the same person plays differently each run */
  const opens = T.boss ? [0] : T.intents.map((x, i) => i).filter(i => T.intents[i].kind !== 'doubt');   // Imani, the finale, always opens the same way
  S.intentI = pickR(opens, r); S.intent = T.intents[S.intentI];
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
    let w = hooks(G, 'weight').reduce((w, [, h]) => h.weight(c, w), c.w);
    if (S.intent.kind === 'ask' && tagOf(c, S.intent.tag)) { w *= 2; asked = true; }
    weight += w;
  }
  if (asked) parts.push({ k: 'w', label: S.intent.label + ': ×2 weight' });
  for (const [k, h] of hooks(G, 'weight')) if (cards.some(c => h.weight(c, c.w) !== c.w)) parts.push({ k: 'w', label: `${KEEPS[k].name}: ${KEEPS[k].text}` });
  let vivid = Math.max(...cards.map(c => c.v));
  const shared = key => cards.length > 1 && new Set(cards.map(c => c[key])).size < cards.length;
  if (shared('theme')) { vivid++; parts.push({ k: 'v', label: 'Witnesses: same theme +1' }); }
  if (shared('place')) { vivid++; parts.push({ k: 'v', label: 'Ground: same place +1' }); }
  if (shared('era')) { vivid++; parts.push({ k: 'v', label: 'Kept: same era +1' }); }
  const thread = cards.length > 1 && cards.some((c, i) => cards.some((d, j) => j !== i && c.people.some(p => d.people.includes(p))));
  const theirs = cards.some(c => c.people.includes(T.id));
  if (thread || theirs) { vivid++; parts.push({ k: 'v', label: (thread ? 'Thread: people who know each other' : 'Their own story, told back') + ' +1' }); }
  if (cards.length === 3 && shared('theme') && shared('place') && shared('era')) { vivid++; parts.push({ k: 'v', label: 'Whole story +1' }); }
  if (cards.some(c => c.theme === T.want)) { vivid++; parts.push({ k: 'v', label: `They want ${T.want} +1` }); }
  const ctx = { firstToday: S.toldToday === 0, thread: thread || theirs };
  for (const [k, h] of hooks(G, 'vivid')) { const nv = h.vivid(vivid, ctx); if (nv !== vivid) parts.push({ k: 'v', label: `${KEEPS[k].name} +${nv - vivid}` }); vivid = nv; }
  // events; Repeat copies the strongest other event (all of them, with Pinwheel)
  const evs = cards.map(c => c.event).filter(Boolean), order = ['Risk', 'Chain', 'Find', 'Spare'];
  const others = evs.filter(e => e !== 'Repeat'), best = order.find(e => others.includes(e));
  const fired = []; for (const e of evs) { if (e !== 'Repeat') fired.push(e); else if (hooks(G, 'repeatAll').length) fired.push(...others); else if (best) fired.push(best); }
  let draw = 0, standing = 0;
  const chains = S.last && cards.some(c => S.last.some(l => l.theme === c.theme || l.place === c.place));
  const chainW = hooks(G, 'chain').reduce((n, [, h]) => h.chain(n), 4), riskW = hooks(G, 'risk').reduce((n, [, h]) => h.risk(n), 5), riskSafe = hooks(G, 'riskSafe').length > 0;
  for (const e of fired) {
    if (e === 'Chain' && chains) { weight += chainW; parts.push({ k: 'w', label: `Chain: continues the last telling +${chainW}` }); }
    if (e === 'Find') { draw += 2; parts.push({ k: 'x', label: 'Find: draw 2' }); }
    if (e === 'Risk') { weight += riskW; parts.push({ k: 'w', label: `Risk +${riskW}` }); if (!S.warm && !riskSafe) { standing -= 1; parts.push({ k: 'bad', label: 'Risk: they aren’t warm yet, −1 standing' }); } }
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
    if (!hooks(G, 'doubtCostsStanding').length) { G.standing -= 1; out.standing = -1; }
    if (G.standing <= 0) { G.over = true; G.struck = true; S.result = 'lost'; return finishSitting(G, out); }
  }
  const held = S.hand.filter(c => c.event === 'Spare' && !c.borrowed);
  out.held = held.length; S.spareBonus = held.length * hooks(G, 'spare').reduce((n, [, h]) => h.spare(n), 4);
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
  /* win-more guard: credibility past the threshold counts half toward your score */
  S.scored = S.result === 'won' ? S.threshold + Math.floor((S.cred - S.threshold) / 2) : S.cred;
  G.score += S.scored;
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
/* the skip button: you may take nothing, give nothing, or both. Draft value = the card's strength
   minus your deck's average strength: below zero, it makes your average hand worse. */
const deckAverage = G => Math.round(G.deck.reduce((a, c) => a + strength(c), 0) / Math.max(1, G.deck.length) * 10) / 10;
const draftValue = (G, c) => Math.round((strength(c) - deckAverage(G)) * 10) / 10;
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

root.SITTING = { BUDGET, EVMULT, strength, deckAverage, draftValue, CARDS, CARD, START, PLACE, TELLERS, TELLER, KEEPS, ROAD, ENDINGS, DAYS, TRUST, HAND, MAX_TELL, START_STANDING, MAX_STANDING, COLS, RANKS,
  rng, newRun, reachable, goTo, nodeById, threshold, startSitting, evaluate, canTell, costOf, tell, endTurn, finishSitting, offers, trade, keepOffer, takeKeep, arch, fileValue, canFile, file, roadChoose, finalScore, rank, tagOf };
})(typeof window !== 'undefined' ? window : globalThis);
