"""Render the Recorder's voice: every clip its grammar can ask for, in one sprite.

    python3 tools/render-voice.py            # writes prototypes/sitting/voice/recorder.mp3 and recorder.json

Needs node, eSpeak NG and ffmpeg (apt-get install espeak-ng ffmpeg). The clip list comes from
RECORDER.vocab() in prototypes/sitting/recorder.js, so the grammar and the voice can't drift apart.
Run it again after changing a card's words in the editor; until then the game says changed words with
the device's own voice.

The voice: eSpeak NG's Klatt formant synthesizer (variant klatt2), slowed a little and held to a near
monotone, like an old desktop computer reading aloud. Only the rendered audio ships with the game; eSpeak
itself does not.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "prototypes", "sitting")
OUT = os.path.join(GAME, "voice")
VOICE, SPEED, PITCH = os.environ.get("HALSEY_VOICE", "en-us+klatt2"), 148, 38
SR, GAP, LEAD = 22050, 0.16, 0.05   # silence between clips; margin played around each clip

def vocab():
    js = ("require(%r);require(%r);process.stdout.write(JSON.stringify(RECORDER.vocab(SITTING)))"
          % (os.path.join(GAME, "game.js"), os.path.join(GAME, "recorder.js")))
    return json.loads(subprocess.check_output(["node", "-e", js]))

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def render(text, path):
    ssml = f"<speak><prosody range='x-low'>{esc(text)}</prosody></speak>"
    subprocess.check_call(["espeak-ng", "-v", VOICE, "-s", str(SPEED), "-p", str(PITCH), "-m", "-w", path, ssml])
    sr, x = wavfile.read(path)
    assert sr == SR, sr
    loud = np.where(np.abs(x.astype(np.int32)) > 260)[0]
    if not len(loud): return np.zeros(int(SR * .1), np.int16)
    a, b = max(0, loud[0] - int(SR * .008)), min(len(x), loud[-1] + int(SR * .02))
    return x[a:b]

def main():
    os.makedirs(OUT, exist_ok=True)
    clips, parts, t = {}, [np.zeros(int(SR * GAP), np.int16)], GAP
    with tempfile.TemporaryDirectory() as tmp:
        for i, c in enumerate(vocab()):
            x = render(c["say"], os.path.join(tmp, "c.wav"))
            clips[c["id"]] = [round(t, 4), round(len(x) / SR, 4), c["text"]]
            parts += [x, np.zeros(int(SR * GAP), np.int16)]; t += len(x) / SR + GAP
        sprite = np.concatenate(parts)
        wav = os.path.join(tmp, "sprite.wav"); wavfile.write(wav, SR, sprite)
        mp3 = os.path.join(OUT, "recorder.mp3")
        subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-ar", str(SR), "-b:a", "32k", mp3])
        # check where the decoder puts the audio, so offsets can be corrected if it shifts
        back = os.path.join(tmp, "back.wav")
        subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), back])
        _, y = wavfile.read(back)
        n = SR * 4; a, b = sprite[:n].astype(float), y[:n].astype(float)
        corr = np.correlate(b, a[:SR * 2], mode="valid")[: SR // 5]
        shift = int(np.argmax(corr)) / SR
    json.dump({"voice": VOICE, "sr": SR, "lead": LEAD, "shift": round(shift, 4), "clips": clips}, open(os.path.join(OUT, "recorder.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(clips)} clips, {t:.0f}s, mp3 {os.path.getsize(mp3)//1024} KB, decoder shift {shift*1000:.0f} ms")

if __name__ == "__main__":
    main()
