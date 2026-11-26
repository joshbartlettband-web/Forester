"""Render the Recorder's voice: every clip its grammar can ask for, in one sprite.

    python3 tools/render-voice.py            # writes prototypes/sitting/voice/recorder-NN.mp3 and recorder.json

Needs node and ffmpeg, plus: pip install kokoro-onnx soundfile pyworld scipy
The first run downloads the Kokoro model (about 350 MB) into ~/.cache/halsey-voice. Rendered clips are
cached there too, so after you change a card's words in the editor only that clip is rendered again.
Until you re-run it, the game says changed words with the device's own voice.

The clip list comes from RECORDER.vocab() in prototypes/sitting/recorder.js, so the grammar and the
voice can't drift apart.

The voice: Kokoro, an open neural voice (Apache 2.0), reading at a measured pace, with its pitch
movement held to about two thirds of a person's (resynthesized with WORLD). Flatter than that and
single words start to blur. It sounds like someone reading
the record who has done it ten thousand times: natural, level, a little uncanny. Only the rendered
audio ships with the game; none of these tools do.

    HALSEY_VOICE=bm_lewis python3 tools/render-voice.py     # try another of Kokoro's voices
    HALSEY_LEVEL=0.3 ...                                     # flatter (0) to fully natural (1)
"""
import hashlib, json, os, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "prototypes", "sitting")
OUT = os.path.join(GAME, "voice")
CACHE = os.path.expanduser(os.environ.get("HALSEY_VOICE_CACHE", "~/.cache/halsey-voice"))
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
VOICE = os.environ.get("HALSEY_VOICE", "am_michael")
SPEED = float(os.environ.get("HALSEY_SPEED", "0.9"))      # a little slower than conversation
LEVEL = float(os.environ.get("HALSEY_LEVEL", "0.7"))      # how much of the natural pitch movement is kept
SR_IN, SR = 24000, 16000                                  # the voice channel in the game rolls off above 7 kHz
GAP, LEAD = 0.12, 0.03                                    # silence between clips in the sprite; margin played around each
CHUNK = 75                                                # seconds of speech per file

def vocab():
    js = ("require(%r);require(%r);process.stdout.write(JSON.stringify(RECORDER.vocab(SITTING)))"
          % (os.path.join(GAME, "game.js"), os.path.join(GAME, "recorder.js")))
    return json.loads(subprocess.check_output(["node", "-e", js]))

def model():
    os.makedirs(CACHE, exist_ok=True)
    for f in ("kokoro-v1.0.onnx", "voices-v1.0.bin"):
        p = os.path.join(CACHE, f)
        if not os.path.exists(p):
            print("downloading", f); urllib.request.urlretrieve(MODEL_URL + f, p + ".part"); os.rename(p + ".part", p)
    from kokoro_onnx import Kokoro
    return Kokoro(os.path.join(CACHE, "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices-v1.0.bin"))

def level(x):
    """Keep LEVEL of the voice's pitch movement around its median, then tidy the clip."""
    import pyworld as pw
    x = x.astype(np.float64)
    if LEVEL < 0.999:
        f0, t = pw.harvest(x, SR_IN, f0_floor=55, f0_ceil=420, frame_period=5)
        sp, ap = pw.cheaptrick(x, f0, t, SR_IN), pw.d4c(x, f0, t, SR_IN)
        v = f0 > 0
        if v.any():
            med = np.median(np.log(f0[v])); f0[v] = np.exp(med + (np.log(f0[v]) - med) * LEVEL)
        x = pw.synthesize(f0, sp, ap, SR_IN, frame_period=5)[: len(x)]
    # trim to the voice, with a short fade at each end so joins don't click
    env = np.convolve(np.abs(x), np.ones(240) / 240, mode="same")
    loud = np.where(env > 0.012 * env.max())[0]
    if not len(loud): return np.zeros(int(SR * .1), np.int16)
    a, b = max(0, loud[0] - int(SR_IN * .015)), min(len(x), loud[-1] + int(SR_IN * .045))
    x = x[a:b]
    f = min(len(x) // 4, int(SR_IN * .008)); ramp = np.linspace(0, 1, f)
    x[:f] *= ramp; x[len(x) - f:] *= ramp[::-1]
    x = resample_poly(x, SR, SR_IN)
    # even loudness from clip to clip: match the speech level, keep peaks under full scale
    speech = x[np.abs(x) > 0.02 * np.abs(x).max()]
    rms = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1
    x = x * (0.13 / rms); pk = np.abs(x).max()
    if pk > 0.92: x *= 0.92 / pk
    return (x * 32767).astype(np.int16)

def key(say): return hashlib.sha1(f"{VOICE}|{SPEED}|{LEVEL}|{say}".encode()).hexdigest()[:16]

def main():
    os.makedirs(OUT, exist_ok=True)
    words = vocab(); cdir = os.path.join(CACHE, "clips"); os.makedirs(cdir, exist_ok=True)
    todo = [c for c in words if not os.path.exists(os.path.join(cdir, key(c["say"]) + ".npy"))]
    print(f"{len(words)} clips, {len(todo)} to render with {VOICE}")
    if todo:
        k = model(); raw = []
        for i, c in enumerate(todo):
            a, sr = k.create(c["say"], voice=VOICE, speed=SPEED, lang="en-us"); assert sr == SR_IN
            raw.append(a)
            if i % 100 == 99: print(f"  voiced {i + 1}/{len(todo)}", flush=True)
        with ProcessPoolExecutor() as ex:
            for c, x in zip(todo, ex.map(level, raw, chunksize=8)): np.save(os.path.join(cdir, key(c["say"]) + ".npy"), x)
    # pack clips into files of about CHUNK seconds, the ones used most first, so a phone only ever
    # downloads and decodes the few files a line needs (decoded audio is large: a minute is about 4 MB)
    def rank(c):   # the machine's own lines and phrases, then everyday numbers, then the stories, then big numbers
        i = c["id"]
        if i.startswith("q."): return 2
        if i.startswith("n."): return 1 if int(i[2:]) < 200 else 3
        return 0
    order = sorted(words, key=rank)
    for f in os.listdir(OUT):
        if f.startswith("recorder") and f.endswith(".mp3"): os.remove(os.path.join(OUT, f))
    clips, files, shifts, cur, t = {}, [], [], [], GAP
    def flush():
        nonlocal cur, t
        if not cur: return
        name = f"recorder-{len(files):02d}.mp3"; files.append(name)
        sprite = np.concatenate([np.zeros(int(SR * GAP), np.int16)] + cur)
        shifts.append(encode(sprite, os.path.join(OUT, name)))
        cur, t = [], GAP
    for c in order:
        x = np.load(os.path.join(cdir, key(c["say"]) + ".npy"))
        if t + len(x) / SR > CHUNK and cur: flush()
        clips[c["id"]] = [len(files), round(t, 4), round(len(x) / SR, 4), c["text"]]
        cur += [x, np.zeros(int(SR * GAP), np.int16)]; t += len(x) / SR + GAP
    flush()
    total = sum(v[2] for v in clips.values()); size = sum(os.path.getsize(os.path.join(OUT, f)) for f in files)
    json.dump({"voice": f"kokoro:{VOICE}", "speed": SPEED, "level": LEVEL, "sr": SR, "lead": LEAD, "shift": round(max(shifts), 4), "files": files, "clips": clips},
              open(os.path.join(OUT, "recorder.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(clips)} clips, {total:.0f}s of speech in {len(files)} files, {size // 1024} KB, decoder shift {max(shifts) * 1000:.0f} ms")

def encode(sprite, mp3):
    """Write one file, and check where the decoder puts the audio, so offsets can be corrected if it shifts."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "s.wav"); wavfile.write(wav, SR, sprite)
        subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-ar", str(SR), "-b:a", "24k", mp3])
        back = os.path.join(tmp, "back.wav")
        subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), back])
        _, y = wavfile.read(back)
    n = min(len(sprite), len(y), SR * 6); a, b = sprite[:n].astype(float), y[:n].astype(float)
    corr = np.correlate(b, a[: n // 2], mode="valid")[: SR // 5]
    return int(np.argmax(corr)) / SR

if __name__ == "__main__":
    main()
