"""Render place plates with Gemini image models.

    python3 tools/gemini-render.py prompts.json      # writes art/rendered/<name>.jpg

prompts.json maps names to a prompt, or [prompt, aspect, reference image or list of them].
Existing outputs are skipped unless HALSEY_REDO=1. Each image gets the shared STYLE suffix
unless the prompt starts with '!'. Uses the GEMINI key the environment injects.
"""
import base64, json, os, sys, urllib.request, concurrent.futures as cf

MODEL = os.environ.get("HALSEY_IMAGE_MODEL", "gemini-3-pro-image")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "art", "rendered")
STYLE = (" Large-format color photograph, 8x10 view camera, overcast or low raking light, quiet and empty,"
         " no people unless stated, no text, no logos, muted natural color, fine grain. Far future: roads"
         " gone soft, buildings kept carefully but unused, nature returning. Eerie but hopeful.")

def render(name, prompt, aspect="3:2", ref=None):
    if prompt.startswith("!"): prompt = prompt[1:]
    else: prompt += STYLE
    parts = [{"text": prompt}]
    refs = ref if isinstance(ref, list) else ([ref] if ref else [])
    for r in reversed(refs):  # reference images go first, in order: [prompt, aspect, ["a.png", "b.jpg"]]
        from PIL import Image
        import io
        im = Image.open(os.path.join(os.path.dirname(OUT), "..", r))
        if im.mode in ("RGBA", "LA"):
            flat = Image.new("RGB", im.size, "white"); flat.paste(im, mask=im.getchannel("A"))
        else:
            flat = im.convert("RGB")
        flat.thumbnail((1536, 1536))
        buf = io.BytesIO(); flat.save(buf, "JPEG", quality=90)
        parts.insert(0, {"inlineData": {"mimeType": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}})
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "injected"})
    d = json.load(urllib.request.urlopen(req, timeout=300))
    for part in d["candidates"][0]["content"]["parts"]:
        if "inlineData" in part:
            from PIL import Image
            import io
            path = os.path.join(OUT, name + ".jpg")   # renders are photographs: high-quality JPEG keeps the repo small
            Image.open(io.BytesIO(base64.b64decode(part["inlineData"]["data"]))).convert("RGB").save(path, quality=93, optimize=True)
            return path
    raise RuntimeError(f"{name}: no image ({json.dumps(d)[:300]})")

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    jobs = json.load(open(sys.argv[1]))
    with cf.ThreadPoolExecutor(int(os.environ.get('HALSEY_JOBS', 6))) as ex:
        todo = {k: v for k, v in jobs.items() if os.environ.get("HALSEY_REDO") or not any(os.path.exists(os.path.join(OUT, k + e)) for e in (".jpg", ".png"))}
        futs = {ex.submit(render, k, *(v if isinstance(v, list) else [v])): k for k, v in todo.items()}
        for f in cf.as_completed(futs):
            try: print("ok", f.result())
            except Exception as e: print("FAIL", futs[f], e)
