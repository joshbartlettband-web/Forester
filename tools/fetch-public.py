"""Fetch public-domain photographs from the Library of Congress for card art, with their credits.

    python3 tools/fetch-public.py "solomon butcher custer county" --max 16
    python3 tools/fetch-public.py "nebraska sandhills" --max 8 --tag sandhills

Only items whose rights field says "No known restrictions" (or public domain) are kept.
Writes art/public/<id>.jpg (1200 px max) and adds each to art/public/credits.json with
title, date, photographer, rights statement and the loc.gov link. Anything else is skipped
and reported, so nothing with unclear rights reaches the game.
"""
import argparse, io, json, os, re, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "art", "public")
UA = {"User-Agent": "halsey-card-art/1.0"}
FREE = re.compile(r"no known restrictions|public domain|no known copyright", re.I)


def get(url, raw=False, tries=5):
    """loc.gov rate-limits bursts with 429/503: back off and retry."""
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            return data if raw else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504, 520, 522) or k == tries - 1:
                raise
            time.sleep(4 * (k + 1))


def rights_of(item):
    r = item.get("rights_advisory") or item.get("rights") or ""
    return " ".join(r) if isinstance(r, list) else str(r)


def best_jpeg(d):
    urls = []
    for res in d.get("resources", []):
        for f in (res.get("files") or [[]])[0]:
            if isinstance(f, dict) and f.get("mimetype") == "image/jpeg" and f.get("url"):
                urls.append((f.get("width") or 0, f["url"]))
    urls += [(0, u) for u in d.get("item", {}).get("image_url", []) if ".jpg" in u]
    urls.sort(key=lambda x: x[0])
    good = [u for w, u in urls if 600 <= w <= 3000] or [u for w, u in urls]
    return good[-1] if good else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query"); ap.add_argument("--max", type=int, default=12); ap.add_argument("--tag", default="")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    credits_path = os.path.join(OUT, "credits.json")
    credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}
    q = urllib.parse.quote_plus(a.query)
    results = get(f"https://www.loc.gov/photos/?q={q}&fo=json&c={min(25, a.max * 2)}")["results"]
    kept = skipped = 0
    for r in results:
        if kept >= a.max:
            break
        link = r.get("id") or r.get("url")
        if not link or "/item/" not in link:
            continue
        iid = link.rstrip("/").split("/")[-1]
        if f"loc-{iid}" in credits:
            continue
        try:
            d = get(link.rstrip("/") + "/?fo=json")
        except Exception as e:
            print("skip (fetch)", iid, e); continue
        item = d.get("item", {}); rights = rights_of(item)
        if not FREE.search(rights):
            skipped += 1; print("skip (rights unclear)", iid, rights[:60]); continue
        url = best_jpeg(d)
        if not url:
            print("skip (no image)", iid); continue
        url = url if url.startswith("http") else "https:" + url
        try:
            im = Image.open(io.BytesIO(get(url, raw=True))).convert("RGB"); im.thumbnail((1200, 1200))
        except Exception as e:
            print("skip (image)", iid, e); continue
        name = f"loc-{iid}"
        im.save(os.path.join(OUT, name + ".jpg"), quality=88, optimize=True)
        credits[name] = {"title": item.get("title", ""), "date": item.get("date", ""),
                         "by": ", ".join(item.get("contributor_names", []) or item.get("creators", []) or []) if isinstance(item.get("contributor_names", []), list) else "",
                         "rights": rights, "link": link, "source": "Library of Congress", "tag": a.tag}
        kept += 1; print("ok", name, item.get("title", "")[:70])
        time.sleep(1.5)
    json.dump(credits, open(credits_path, "w"), indent=1, ensure_ascii=False)
    print(f"{kept} kept, {skipped} skipped for rights, {len(credits)} in credits.json")


if __name__ == "__main__":
    main()
