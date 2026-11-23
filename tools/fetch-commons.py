"""Fetch images from Wikimedia Commons for card art, keeping only what the file's own license record allows.

    python3 tools/fetch-commons.py pd_silo_mclean="McLean,_Nebraska_grain_elevator_from_E.JPG" \
                                   pd_dome_rock="SCBL2202.jpg"

Each argument is id=Commons file name. One API call reads every file's license metadata; only
public domain and CC0 files are downloaded (as 1280 px thumbnails, one of Commons' standard sizes,
which its rate limits treat kindly). Writes art/public/<id>.jpg and adds each to art/public/credits.json
with title, date, maker, license and the file page. Commons throttles bursts (HTTP 429), so this waits
and retries, and it never reuses an earlier image's bytes when a download fails.
"""
import io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "art", "public")
UA = {"User-Agent": "HalseyCardArt/1.0 (one-off download for a game prototype)"}
FREE = re.compile(r"public domain|cc0|no known copyright", re.I)


def get(url, tries=8, wait=30):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except Exception as e:
            print(f"  retry {k + 1}: {e}", flush=True); time.sleep(wait * (k + 1))
    return None


def main(pairs):
    os.makedirs(OUT, exist_ok=True)
    cp = os.path.join(OUT, "credits.json"); credits = json.load(open(cp)) if os.path.exists(cp) else {}
    want = dict(p.split("=", 1) for p in pairs)
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "extmetadata|url", "iiurlwidth": "1280",
                                "titles": "|".join("File:" + f.replace("_", " ") for f in want.values())})
    raw = get("https://commons.wikimedia.org/w/api.php?" + q)
    if raw is None: sys.exit("Commons did not answer; try again later")
    pages = {p["title"][5:]: p for p in json.loads(raw)["query"]["pages"].values()}
    for iid, f in want.items():
        p = pages.get(f.replace("_", " "))
        if not p or "missing" in p: print("missing", iid, f); continue
        ii = p["imageinfo"][0]; m = ii["extmetadata"]; g = lambda k: re.sub("<[^>]+>", "", m.get(k, {}).get("value", "") or "").strip()
        lic = g("LicenseShortName")
        if not FREE.search(lic): print(f"skip {iid}: license is {lic!r}"); continue
        data = get(ii.get("thumburl") or ii["url"])
        if data is None: print("FAILED", iid); continue
        im = Image.open(io.BytesIO(data)).convert("RGB"); im.thumbnail((1600, 1600)); im.save(os.path.join(OUT, iid + ".jpg"), quality=88)
        credits[iid] = {"title": g("ObjectName") or f, "date": g("DateTimeOriginal")[:40], "by": g("Artist")[:120], "rights": lic, "link": ii["descriptionurl"], "source": "Wikimedia Commons"}
        print("ok", iid, lic, flush=True); time.sleep(3)
    json.dump(credits, open(cp, "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main(sys.argv[1:])
