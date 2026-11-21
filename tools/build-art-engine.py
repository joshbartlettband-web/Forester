"""Extract the drawing engine from the look book into a script other prototypes can load.

    python3 tools/build-art-engine.py

The look book stays the single source of truth. This copies everything from the
type sets through the barn quilt section (scene generation, all looks, the print
engine, Meridian, plates, quilts) into prototypes/survey/halsey-art.js, and copies
the sketch library and font next to it. Pages that load the engine must define a
global `state` (edition, paper, light, camera, texture, hand, mix, seed).
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "prototypes", "look-book", "look-book.html")
OUT_DIR = os.path.join(ROOT, "prototypes", "survey")
START = "/* ================= type sets"
END = "/* ================= looks + copy"

html = open(SRC, encoding="utf-8").read()
script = html.split("<script>", 1)[1].split("</script>", 1)[0]
body = script[script.index(START):script.index(END)]
with open(os.path.join(OUT_DIR, "halsey-art.js"), "w", encoding="utf-8") as f:
    f.write("/* Halsey drawing engine. GENERATED from prototypes/look-book/look-book.html by\n"
            "   tools/build-art-engine.py. Edit the look book, then rebuild. */\n\"use strict\";\n" + body)
for sub in ("sketches", "fonts"):
    src, dst = os.path.join(ROOT, "prototypes", "look-book", sub), os.path.join(OUT_DIR, sub)
    shutil.copytree(src, dst, dirs_exist_ok=True)
shutil.copytree(os.path.join(ROOT, "art", "icons"), os.path.join(OUT_DIR, "icons"), dirs_exist_ok=True)
print("wrote", os.path.join(OUT_DIR, "halsey-art.js"), len(body) // 1024, "KB")
