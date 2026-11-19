# Sketch intake

Turns Kobo notebook exports into game art.

1. **Intake.** Number the pages and make gridded contact sheets:

   ```
   python3 intake.py "Tasks.pdf" --out /tmp/inbox/tasks
   ```

   The input can be a PDF, a `.zip` of page images (Kobo's cloud export) or a folder. Keep the inbox outside the repo, because notebook pages carry work notes.
2. **Cut.** Read a drawing's position off the contact sheet (each grid square is 10% of the page) and cut it into the library:

   ```
   python3 cut.py /tmp/inbox/tasks/page-047.png .05 .705 .99 .905 mainstreet \
       --kind landmark --habitat prairie town --source "Tasks" --erase .22 .76 1 1
   ```

   The crop tightens to the ink automatically. `--erase` blanks stray writing, using fractions of the crop.
3. **Use.** `cut.py` writes the archive copy to `art/sketches/` and an alpha copy to `prototypes/look-book/sketches/`, and updates both `manifest.json` files. The look book reads the manifest, so new portraits join the card rotation automatically. Creatures, landmarks and emblems need a placement rule in the scene code the first time a new habitat is used.

Kinds: portrait, creature, character, landmark, emblem, plate.
