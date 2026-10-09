# FoxiOra v12.13 — manual update

This is a cumulative, self-contained update. It includes the corrected scanner files, fonts, editable source and tests. No repository push or deployment has been performed.

## Install the app files

1. Export a backup from Settings before updating.
2. Replace these nine root files together: `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, `icon.svg`.
3. **Also copy the included `vendor/` folder, preserving its subfolders.** This step is required: the English model in the inherited local vendor folder was truncated. This release validates the exact scanner assets; leaving different or damaged files will prevent scanning.
4. Reopen online. Settings should show **v12.13**. Existing schedules and preferences use the same database and are retained.
5. In Settings → **اسکن و یادآوری**, press **آماده‌سازی اسکن آفلاین** before scanning without internet. Wait for the ready message. Preparation downloads about 11 MB and validates every file. If it fails, reconnect and retry; saved schedules are unaffected.

The ZIP's `vendor/` contains both language models, the scanner library, worker, two embedded WASM cores and fonts. Root-level `eng.traineddata.gz` / `fas.traineddata.gz` are not used by the app. Existing duplicate root copies can be removed after the correct vendor files are uploaded. Do not remove `vendor/lang/`.

## Commit the development files too

For a repository others can rebuild and test, also commit `src/`, `tests/`, `build.py`, `build-manifest.json`, `package.json` and `package-lock.json`. Uploading only the hosting files leaves npm scripts without their source and tests.

- `npm ci` installs the pinned test dependencies.
- `npm test` runs 144 regression tests.
- `python3 build.py` regenerates `app.js` and `style.css` from ordered source sections.
- `python3 build.py --check` confirms generated files match source.

The app can still be hosted directly with no build step. `verification/` and the reports are review evidence rather than required hosting files.

## What changed

- Month cells outside imported roster coverage are quiet. Unknown cells within imported coverage still show **؟**. Tapping an uncovered day still says its shift is unknown; trip planning never treats it as off.
- Imports remember their exact date range separately for each workplace. Gaps between separate imports are not mistaken for covered periods. Existing imports use their stored dates until reimported.
- Today no longer carries a permanent Undo icon. Confirmation messages, Calendar/editing views and Settings retain Undo.
- Secondary text is larger; typography responds to browser text size. Enlarged layouts may scroll vertically, and bottom navigation has adequate content clearance.
- Imported names, labels, identifiers, image attributes and codes are rendered safely. Saved workplace colors are restricted to valid hexadecimal colors; backup images remain local raster data.
- Offline preparation checks all six scanner assets by SHA-256 before caching or declaring readiness. Its verified cache survives app-shell updates; old `shiftfox-` shell caches are removed.
- The damaged English language model has been replaced. Recognition logic is retained; this is an asset/reliability repair, not a claim of improved accuracy across unseen hospital photos.

Existing shift combinations, reciprocal exchanges, colleague preferences, multi-workplace calendars, events, local learning, Persian wording and fox loading animation remain available.

## Next real-world check

Try a complete scan → choose name → review → import on an iPhone and an Android phone, using several hospital formats. Ask nurses to complete it without coaching. Desktop browser checks and one supplied photo do not establish accuracy or usability on all phones. See `QA-REPORT.md` for measured results and the short field-test guide.
