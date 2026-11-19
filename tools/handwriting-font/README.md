# Halsey handwriting font

Turns your handwriting into a real font (`.otf` for design apps and `.woff2` for the game). Your own handwriting belongs to you, so there are no license limits on shipping it.

## How it works

1. **Template.** `template.pdf` has 6 pages and 170 boxes:
   - lowercase letters three times each
   - capitals and digits twice each
   - common punctuation once each

   Each box has guide lines. Write on the solid blue baseline, keep small letters to the dotted line, and take capitals and tall letters to the top line.
2. **Write.** Open the PDF on the Kobo and fill one character per box with the stylus. Use a black pen at medium width. Write the repeats naturally rather than copying the first one. The differences are what make the font feel handwritten.
3. **Export.** Export the PDF *with your handwritten notes*. Kobo offers three routes:
   - **Google Drive (easiest for us).** Link Google Drive on the Kobo (Settings, then Google Drive; firmware 4.37 or newer, on Sage, Elipsa, Elipsa 2E and Libra Colour). Export the PDF there, and tell Claude the file name. Claude can read it through the Google Drive connector.
   - **Dropbox.** Export it there, then move the file into Google Drive, or upload it to the GitHub repo.
   - **USB cable.** Connect the Kobo to a computer and copy the exported PDF from the `KOBOeReader` drive (exported notebooks are in `Exported Notebooks`). Then upload it to Google Drive or to this repo on github.com (**Add file**, then **Upload files**, into `tools/handwriting-font/input/`).
4. **Build.** Claude runs:

   ```
   python3 build_font.py input/filled.pdf --name "Halsey Hand" --out dist
   ```

   It writes the font, a `specimen.png` and a `report.txt` that lists any empty or oversized boxes, so you can redo just those.

The builder also accepts a folder of page images or a `.zip`, which is how some Kobo cloud exports arrive. The black corner squares let it line pages up even when an export is scaled or cropped.

## Your existing notes

Free-form notebook pages are great reference for slant, size, connections and the letters you actually write. Slicing individual letters out of running notes is unreliable, though, so the template is what builds the font. Send a few pages of real notes as well; they help decide which of your variants feel most like you, and whether a connected (cursive) version is worth making.

## Files

| File | What it does |
|---|---|
| `template.pdf` | The page to write on (made by `make_template.py`) |
| `layout.py` | Box positions shared by the template and the builder |
| `build_font.py` | Reads a filled template and builds the font |
| `fake_fill.py` | Test helper that fills the template with a stand-in font |

Requirements: `pip install fonttools brotli potracer pymupdf reportlab pillow numpy`
