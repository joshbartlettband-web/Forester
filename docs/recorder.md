# The Recorder

The Survey's machine. It reads your testimony into the record in a flat computer voice, the kind an old desktop computer used to read text aloud with, and reads the whole record back at the end. The words are generated from what you actually told, so every run's record is different. The record is the generative layer on top of the written stories.

## What it says

| When | What | Example |
|---|---|---|
| A sitting opens | who, where, what you need | "Sitting opened. Teller: Ruth Ebersole. Place: Halsey. Threshold one hundred twenty." |
| You tell stories | an entry: an opener, your stories' own words, sometimes what the machine makes of them, the numbers | "Entry seven. Thousands of feet in the water, nobody flying. They were there first. Noted. Weight five. Vivid two. Entered: ten." |
| A sitting ends | the verdict | "Sitting closed. Marisol Ybarra. Believed. Credibility four hundred twelve of three hundred sixty." |
| The run ends | the record, printed on the last screen and read aloud | each sitting with the telling that counted most, three lines on the themes you told, your totals, your keepsakes, how you left, your rank, "End of record." |

The machine's own lines are short, official and slightly off: "The river moved. The record did not." "Cause unknown. Retained." "Somebody left. The chair was kept." There are three for each theme and one for each event. They're all in `LINES` in `prototypes/sitting/recorder.js`, so they're easy to rewrite.

## How it works

- **The grammar** (`recorder.js`) composes each line from the run: the stories told, their themes, places and eras, the numbers, a seeded choice of opener and gloss. The same run always produces the same record.
- **The voice** is eSpeak NG's Klatt formant synthesizer, held to a near monotone. `tools/render-voice.py` renders every clip the grammar can ask for (374 of them: every story's words, every name and place, numbers, the machine's lines) into one 2.5 MB file, `voice/recorder.mp3`, with an index, `voice/recorder.json`. Only the audio ships; eSpeak itself doesn't.
- **The player** strings clips together with Web Audio. The voice runs through its own channel, thin and close like a telephone with a short slap off a hard wall. The music and the land go quiet while it speaks. A new telling interrupts the last.
- **The readout** types the words out as they're spoken: a phosphor-green line on the scene, or the record sheet on the last screen, which turns its own pages as it reads. It works with the sound off too.
- **Changed words.** If you change a story's words in the card editor, the old recording no longer matches. The device's own voice says the new words instead, preferring an old robotic one (Fred, Ralph or Zarvox, where the device has them), until you run `python3 tools/render-voice.py` again.
- **Off switch:** in the menu (phone) or the footer (computer). The game remembers it.

## Checked

Generated entries, closes and a whole record were stitched together the way the player does it, then transcribed by Gemini to check they're understandable. They came back word for word, apart from a few names, which got respellings in `SAY` (for example "Ahbook" for Abuk and "Fahm" for Pham). Captions always show the real spelling.

## Where it could go next

- **More voices.** The grammar can say anything in its vocabulary. A second voice could answer it: the teller's line, or Imani at the bridge.
- **Longer generated passages.** Have a language model write many variations of the machine's lines offline, render them all, and let the grammar choose among them. That gives more variety without depending on a network while you play.
- **Your recordings** as a counterpoint: your own voice reading a few of the stories, with the machine reading the rest.
- **A setting for how much it talks:** everything, sittings and the record, or the record only.
