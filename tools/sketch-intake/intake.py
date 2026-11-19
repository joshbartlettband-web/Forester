"""Turn a Kobo notebook export into numbered page images plus gridded contact sheets.

    python3 intake.py EXPORT.pdf|EXPORT.zip|FOLDER --out art/inbox/<name>

Each page is saved as page-NNN.png. contact-N.png shows up to 12 pages with a
10% grid and page numbers, so drawings can be located for cut.py as fractions
of the page (0 = left/top, 1 = right/bottom).
"""
import argparse
import io
import os
import zipfile

from PIL import Image, ImageDraw


def pages(src, dpi=150):
    if os.path.isdir(src):
        for f in sorted(os.listdir(src)):
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                yield Image.open(os.path.join(src, f)).convert("RGB")
    elif src.lower().endswith(".zip"):
        with zipfile.ZipFile(src) as z:
            for n in sorted(z.namelist()):
                if n.lower().endswith((".png", ".jpg", ".jpeg")) and not n.startswith(("/", "..")):
                    yield Image.open(io.BytesIO(z.read(n))).convert("RGB")
    else:
        import pymupdf
        for p in pymupdf.open(src):
            pix = p.get_pixmap(dpi=dpi)
            yield Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def contact(imgs, start, out, cols=4, w=300):
    h = int(w * imgs[0].height / imgs[0].width)
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * (h + 18)), "white")
    d = ImageDraw.Draw(sheet)
    for k, im in enumerate(imgs):
        x, y = (k % cols) * w, (k // cols) * (h + 18)
        sheet.paste(im.resize((w, h)), (x, y + 18))
        for i in range(1, 10):
            d.line([(x + w * i / 10, y + 18), (x + w * i / 10, y + 18 + h)], fill=(120, 170, 230), width=1)
            d.line([(x, y + 18 + h * i / 10), (x + w, y + 18 + h * i / 10)], fill=(120, 170, 230), width=1)
        d.rectangle([x, y + 18, x + w - 1, y + 17 + h], outline=(80, 80, 80))
        d.text((x + 4, y + 3), f"page {start + k:03d}", fill=(0, 0, 0))
    sheet.save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    imgs = []
    for n, im in enumerate(pages(a.src), 1):
        im.save(os.path.join(a.out, f"page-{n:03d}.png"))
        imgs.append(im)
    for s in range(0, len(imgs), 12):
        contact(imgs[s:s + 12], s + 1, os.path.join(a.out, f"contact-{s // 12 + 1}.png"))
    print(f"{len(imgs)} pages -> {a.out}")


if __name__ == "__main__":
    main()
