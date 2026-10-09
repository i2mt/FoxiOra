# FoxiOra v12.14 — manual update

This cumulative update includes the app, exact scanner assets, editable source, build scripts and regression tests. It has not been pushed or deployed.

## Install

1. Export a backup from Settings.
2. Copy all root hosting files together: `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, `icon.svg`.
3. Copy the complete included `vendor/` folder, preserving its subfolders. The inherited English model was damaged in an earlier release; the included assets match the scanner's checksum manifest.
4. Reopen online and check that Settings shows **v12.14**. Existing schedules, preferences and local corrections use the same database.
5. To scan offline, open Settings → اسکن و یادآوری → آماده‌سازی اسکن آفلاین. Wait for the ready message before disconnecting. About 11 MB of scanner assets are verified and cached.

The app can be hosted directly without building. Duplicate root `eng.traineddata.gz` and `fas.traineddata.gz` files are unused; preserve `vendor/lang/`.

## Changes in this update

- **Colleague pages without your own row:** choose فقط برنامهٔ همکاران, or use افزودن صفحات همکاران in the digital roster. Select multiple photos together. Every detected nurse row is imported; selecting your own name is unnecessary. Your own shifts are retained.
- **A whole-month review:** see every scanned date together, tap a date and use the preset shift keys. No two-row preview, pagination or Show more.
- **Dates checked once per page:** uncertain column/date mapping no longer marks every otherwise clear symbol doubtful. A date preview asks for day 1 and direction before saving an uncertain mapping.
- **Corrections after import:** the digital roster keeps source crops for pending cells. Select matching crops and correct the group with one preset. Selection alone never confirms a shift. Undo restores the previous values and learning.
- **Blank conventions:** an empty cell remains unknown by default. A workplace can explicitly define genuinely blank cells as off. Failed OCR is not treated as off.
- **Local learning:** explicit corrections retain bounded symbol/name crops on the device and in backups. Unconfirmed OCR names are not learned automatically. This is conservative example matching, not automatic retraining of Tesseract.
- **Scanner reliability:** short crops cannot allocate a negative typed array; date crops use adaptive margins; name crops use the wider edge interval; orientation no longer assumes the roster has fewer nurse rows than dates. Interrupted personal-row recognition returns to name selection and can be retried.
- **Rescans:** unique colleague identities are updated while previous months are kept. Identical OCR names in separate rows are not silently merged. Unreadable new cells remain pending rather than preserving an old off value as current.

Previously implemented calendar styling, multi-workplace shifts, national/religious calendar data, reciprocal night exchanges, same-workplace combined shifts, colleague preferences, trip planning, Undo, theme names and fox loading animation remain included.

## Development

Commit `src/`, `tests/`, `build.py`, `build-manifest.json`, `package.json` and `package-lock.json` with the hosting files so the repository is reproducible.

- `npm ci`
- `npm test` — 161 regression tests
- `python3 build.py` — rebuild generated JS/CSS
- `python3 build.py --check` — check source/output consistency

`verification/`, `QA-REPORT.md` and `DESIGN-NOTES.md` are review evidence, not hosting dependencies. Full schedule photographs and staff names are excluded.

## OCR limits

All 20 supplied photos were loaded and benchmarked. The negative-array failures were fixed, but several tables still have missing or misplaced rows/columns. A runtime success is not a correct roster. This update does **not** yet establish reliable automatic import of six pages / 100+ nurses.

A small model trained on labelled symbols performed well on another row of the same photo but still made errors on a different roster and a leave marker. It is not installed in the app. See the separate OCR experiment files and `QA-REPORT.md` for exact results.
