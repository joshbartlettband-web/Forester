# The Recorder

The Survey's machine. It reads your testimony into the record in a calm, level voice, like someone who has read ten thousand entries aloud, and reads the whole record back at the end. The words are generated from what you actually told, so every run's record is different. The record is the generative layer on top of the written stories.

## What it says

| When | What | Example |
|---|---|---|
| A sitting opens | who, where, what you need | "Sitting opened. Teller: Ruth Ebersole. Place: Halsey. Threshold one hundred twenty." |
| You tell stories | an entry: an opener, your stories' own words, sometimes what the machine makes of them, the numbers | "Entry seven. Thousands of feet in the water, nobody flying. They were there first. Noted. Weight five. Vivid two. Entered: ten." |
| A sitting ends | the verdict | "Sitting closed. Marisol Ybarra. Believed. Credibility: four hundred twelve, of three hundred sixty." |
| The run ends | the record, printed on the last screen and read aloud | each sitting with the telling that counted most, three lines on the themes you told, your totals, your keepsakes, how you left, your rank, "End of record." |

The machine's own lines are short, official and slightly off: "The river moved. The record did not." "Cause unknown. Retained." "Somebody left. The chair was kept." There are three for each theme and one for each event. They're all in `LINES` in `prototypes/sitting/recorder.js`, so they're easy to rewrite.

## How it works

- **The grammar** (`recorder.js`) composes each line from the run: the stories told, their themes, places and eras, the numbers, a seeded choice of opener and gloss. The same run always produces the same record.
- **The voice** is Kokoro, an open neural voice model (Apache 2.0), voice `am_michael`, reading at 90% speed. Its pitch movement is held to about 70% of a natural reading (resynthesized with WORLD), so it sounds like a person who has done this a long time: natural, level, a little uncanny. At 50% single words started to blur ("Entered" heard as "Answered"), so it stops at 70%.
- **Whole phrases, whole numbers.** The first version stitched every word, so "three hundred thirty-one" was three clips and sounded like a robot. Now every number from zero to 999 is its own clip, and the fixed phrases are rendered whole: each teller's opening ("Sitting opened. Teller: Ruth Ebersole. Place: Halsey."), each close ("Sitting closed. Ruth Ebersole. Believed."), each record line ("At Halsey, to Ruth."), "Entry seven.", "of three hundred ten." Stories and the machine's lines were already whole sentences.
- **The render.** `tools/render-voice.py` renders every clip the grammar can ask for and packs them into files of about 75 seconds each, `voice/recorder-NN.mp3`, the most-used clips first, with an index, `voice/recorder.json`. A phone fetches and decodes a file only when a line needs it, at the voice's own 16 kHz (about 5 MB a file), and keeps the last twelve. Decoding everything at once at the phone's own rate would take several hundred MB. Only the audio ships; the model and tools don't. Clips are cached, so after you change a card in the editor only that clip renders again. `HALSEY_VOICE=bm_lewis` (or any Kokoro voice) tries another reader.
- **The pace** (`pauseAfter` in `recorder.js`) is set like someone reading a ledger aloud: a label goes straight into its value (0.12 s), a sentence gets a breath (0.33 s), the machine's own lines and verdicts get 0.5 s, a story gets 0.7 s to land, and there's a breath before each story. In the end-of-run record each part is followed by a full second. Every pause varies a little, the same way every time, so it doesn't tick like a metronome.
- **The player** strings clips together with Web Audio. The voice runs through its own channel, a little thin and close, with a short slap off a hard wall. The music and the land go quiet while it speaks. A new telling interrupts the last.
- **The readout** types the words out as they're spoken: a phosphor-green line on the scene, or the record sheet on the last screen, which turns its own pages as it reads. It works with the sound off too.
- **Changed words.** If you change a story's words in the card editor, the old recording no longer matches. The device's own voice says the new words instead, preferring a calm American voice where the device has one, until you run `python3 tools/render-voice.py` again.
- **Off switch:** in the menu (phone) or the footer (computer). The game remembers it.

## Checked

Generated entries, closes and a whole record were stitched together the way the player does it, with its pauses, then transcribed by Gemini to check they're understandable. Names the voice gets wrong get respellings in `SAY` (for example "Ahbook" for Abuk and "Fahm" for Pham). Captions always show the real spelling.

The first version (eSpeak NG's Klatt voice, every word its own clip) was "a good start"; the note back was that it should be a little more naturalistic and paced. That's this version.

## Where it could go next

- **More voices.** The grammar can say anything in its vocabulary. A second voice could answer it: the teller's line, or Imani at the bridge.
- **Longer generated passages.** Have a language model write many variations of the machine's lines offline, render them all, and let the grammar choose among them. That gives more variety without depending on a network while you play.
- **Your recordings** as a counterpoint: your own voice reading a few of the stories, with the machine reading the rest.
- **A setting for how much it talks:** everything, sittings and the record, or the record only.
