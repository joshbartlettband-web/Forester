# UI menu for Gemini Neon: one screen, no scrolling

The goal: on a phone, every screen of Halsey, Nebraska fits in the window. Nothing scrolls, up and down or sideways. When there's more than fits (a deck of 20 stories, the credits), it goes on **pages** you flip with a tap or a swipe that snaps. It never free-scrolls.

Each piece below is independent and comes back as its own file. Claude wires them into the game. The rules in `docs/neon-menu.md` still apply: plain ES2020, no libraries, offline, seeded, reduced motion respected, the shared palette, CC0 or MIT.

## Status: a first pass is in the game

Claude built a working first pass of the phone layout in `prototypes/sitting/sitting.html`. Every screen fits at 360 × 640, 390 × 844 and 412 × 915, checked by playing a whole run, from Halsey through the ending, with an automated fit check on each screen.

| Piece | First pass, built here | What's still wanted from Neon |
|---|---|---|
| U1 fit checker | A Playwright script (outside the repo for now) | The in-browser `frames.html` and `fitCheck()`, so the designer can check on their own |
| U2 mini card | The full card, restyled with CSS to 104 × 160 | A purpose-built face with better art cropping; a title that reads better when overlapped |
| U3 hand fan | Overlaps and arcs to fit; tap to pick | Drag into the tray; a smoother re-flow when a card leaves |
| U4 card zoom | Hold a card (phone) or point at it (computer) and it grows out of its place: above the finger on a phone, slide along the hand to read the next, let go to put it back; the background dims; keyboard focus shows it too | Card tilt toward the finger; an action under the big card (Tell, Give) that doesn't fight the hold-and-release |
| U5 pager | ‹ ›, swipe, "2 of 4"; items scale down if even one won't fit | Snap animation; page dots |
| U6 sheets | Every dialog is a full-screen sheet on a phone; the map uses a short bottom sheet | Rise and fall motion; focus polish |
| U7 teller header | Scene, inset portrait, intent plate, chips; tap for the full teller | Better portrait framing; a clearer intent icon set |
| U8 tray | Slots, formula, link chips, Tell and End on one row | A formula that counts up in place; link chips that never clip |
| U9 top strip | Standing pips, score, keepsakes, ☰ menu | Standing that reads more like health |
| U10 compact map | All 8 rows fit; tap a place for a peek and Go | Labels that never collide; a clearer "you are here" |
| U11 toasts | Notes appear as a toast on a phone | The queue for fast plays |
| U12 landscape | Not started | All of it |

The measurements below are from **before** this pass.

## Where it stood

Measured in the current build (`prototypes/sitting/sitting.html`):

| Screen | iPhone (390 × 844) | Small Android (360 × 740) |
|---|---|---|
| The map | 1,504 px tall | 1,544 px tall |
| A sitting | 1,564 px tall | 1,572 px tall |
| The trade | 1,774 px tall | 1,808 px tall |

On the iPhone, a sitting breaks down like this:

| Part | Height |
|---|---|
| Top bar | 97 |
| Scene | 137 |
| Teller (portrait, line, chips, intent) | 364 |
| Credibility meter | 60 |
| Telling (slots, formula, buttons) | 242 |
| Note | 42 |
| Hand | 360 (one row of 212 × 340 cards) |
| Footer | 83 |

## The screen budget

Design for the **smallest target: 360 × 640**, after the browser bar. It must also look right at 390 × 844 and 412 × 915. Use `100dvh` and the safe-area insets. Extra height goes to the hand and the scene, never to empty space.

```
┌──────────────────────────────┐
│ Standing ▮▮▮▮▮▮  Score  ☰    │  top strip ............ 44
├──────────────────────────────┤
│  scene band, with the        │
│  portrait set into its       │  teller header ........ 170
│  lower-left; name + intent   │
├──────────────────────────────┤
│ ███████░░░░░░  48 / 120      │  credibility .......... 24
├──────────────────────────────┤
│ [story] [story] [story]      │
│ 12 × 2 = 24        Tell  End │  telling tray ......... 112
├──────────────────────────────┤
│   ╭───╮╭───╮╭───╮╭───╮╭───╮  │
│   │   ││   ││   ││   ││   │  │  hand ................. 260
│   ╰───╯╰───╯╰───╯╰───╯╰───╯  │
└──────────────────────────────┘
                          total   610 of 640 (30 for gaps)
```

The note line, the teller's quote and their reservation, the footer links and the full card text all move behind a tap: the top-strip menu, the teller header, or a card's inspect view.

## Rules for every UI piece

- **No scrolling inside it.** If the content doesn't fit, page it (see U5). Test at 360 × 640.
- **Touch first.** Tap targets are at least 44 × 44 px. Nothing depends on hover. Long-press does the same as the inspect button.
- **Readable.** Rules text is at least 14 px, nothing anywhere is under 12 px, and contrast meets WCAG AA. Rules and numbers are in Atkinson Hyperlegible; names and quotes are in Halsey Hand. Never put rules text over a photo.
- **Views only.** A piece takes plain data (card objects shaped like `prototypes/sitting/cards.json`) plus callbacks. It never reads or changes game state itself.
- **Weight.** Follow `docs/ui-weight.md`: 3 px ink keylines, a hard lip under every object, press into the lip, values on raised pills or in sunk wells, color only as a label.
- **Accessible.** Real buttons, ARIA labels, keyboard focus that moves sensibly, Escape closes things. Under reduced motion, animations become cuts.
- **A demo page for each piece,** like pack 1's `demo.html`, loading `cards.json` and showing the piece at 360 × 640 and 390 × 844.

## The menu

Listed in the order they'll help most.

| # | Piece | What it's for | Hand back | Done when |
|---|---|---|---|---|
| U1 | **Phone frames and fit checker** | Seeing every screen at every phone size at once, and catching overflow | `frames.html`, which shows the game in side-by-side iframes at 360×640, 390×844, 412×915 and 844×390 (landscape). Plus `fitCheck(root) → [{el, problem}]`, which flags anything past the viewport edge, any scrolling container, text under 12 px and tap targets under 44 px | Flags the current build's problems correctly, and comes back clean on a page that fits |
| U2 | **Mini card** | A hand that fits: a small card face that still reads at a glance | `miniCard(card, {cost, selected, disabled}) → HTMLElement` at about 104 × 160: cost, title (2 lines, then an ellipsis), art, event icon and name, and Weight × Vivid in big numbers. The theme color is on the header band, as in the full card | Five fit side by side in 360 px with a little overlap; title, cost and numbers readable on a real phone |
| U3 | **Hand fan** | Laying out a hand of 3 to 10 cards in a fixed width | `layoutFan(container, elements, {width, cardW, maxOverlap})`. It overlaps and gently arcs cards to fit; the selected card lifts; tapping picks; dragging up into the tray also picks. It returns a `destroy()` | 10 cards fit in 344 px with every card's cost and title still showing; no layout jump when a card leaves |
| U4 | **Card inspect** | Reading a whole card without making the hand big | `inspect(card, fromEl, {actions: [{label, value}]}) → Promise<value>`. The full card grows from the mini card to fill most of the screen, with action buttons under it (Tell, Give, Close) | Opens on tap or long-press, closes on Escape, tapping outside or Close; focus returns to the card |
| U5 | **Pager** | Content that doesn't fit, without scrolling | `makePager(container, items, {perPage, dots: true})`. Snap paging with arrow buttons, swipe and the arrow keys; page dots; "3 of 5" read out to screen readers | Pages a 20-card deck at 360 × 640 with no scrollbar anywhere |
| U6 | **Bottom sheet** | Replaces the tall dialogs (trade, road, arch, courthouse, ending, keepsakes) | `openSheet({title, body, actions}) → {close, update}`. It rises from the bottom, caps at the screen height under the top strip, traps focus and uses the pager for overflow | The trade (3 offers, the whole deck to give from, and a keepsake choice) fits at 360 × 640 using pages |
| U7 | **Teller header** | The scene, portrait and intent in 170 px | `tellerHeader(el, {name, placeName, intent, want, reservation, line})`. The scene canvas fills the box, with the portrait inset at the lower left (about 72 × 96) and name and intent chip over a solid plate, never on the photo. Tapping opens their line, want and reservation | Reads at 360 px; the intent (Asks / Doubt 14 / Tells one of theirs / Quiet) is clear from across a room |
| U8 | **Telling tray** | Slots, formula and buttons in 112 px | `tellingTray(el, {slots, formula, canTell, trust, day}, {onTell, onEnd, onRemove})`. Three slots showing mini titles, the live `Weight × Vivid = credibility` line with link chips, trust pips and Day 2 of 4, and Tell and End on the same row | All of it at 360 px with the numbers at least 18 px; the formula updates without the layout moving |
| U9 | **Top strip and menu** | Everything that isn't play, in 44 px | `topStrip(el, {standing, maxStanding, score, keepsakes}, {onMenu})` and a menu sheet (built on U6) holding Sound, Your deck, How it works, Image credits, Card editor and New run | Standing reads as health at a glance; keepsakes show as tiny quilt squares; nothing wraps at 360 px |
| U10 | **Compact map** | The whole route on one screen | `layoutMap(el, map, {visited, at, reachable}, {onPick})`. All 8 rows fit the height (about 64 px a row at 640), with nodes as 44 px circles. Labels show only on the places you can reach; tapping any node opens a peek (who, the place, what they want, or what the road holds) with a Go button | Fits at 360 × 640 with the rivers and paths still drawn; a walked path stays easy to see |
| U11 | **Floating numbers and toasts** | `+34 credibility`, `−1 standing` and notes that never leave the screen or hide the buttons | `float(text, {from, to, kind})` and `toast(text, {ms})`, clamped inside the safe area, with a queue so they don't stack on top of each other | Five fast tellings in a row stay readable |
| U12 | **Landscape** | Phones held sideways and small tablets | A CSS layout (or `landscape.css`): scene and teller on the left, tray and hand on the right, still without scrolling | Works at 844 × 390 and 1024 × 768 |

## Not needed from Neon

- **Wiring the pieces into the game, the rules, or saving a run.** Claude does these.
- **New art for the cards.** Use the art paths already in `cards.json`.

## How it comes together

As pieces arrive, Claude swaps them into the sitting screen first (U2, U3, U7, U8, U9). Next come the sheets and pages (U4, U5, U6), then the map (U10). U1 runs on each build to check nothing scrolls, and the goal stays fixed: every screen fits at 360 × 640.
