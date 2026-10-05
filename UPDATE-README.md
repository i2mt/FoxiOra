# FoxiOra v12.2 — manual update

Prepared against repository commit `614ebbbded86a45b81341ede1faa8c3bcf6a7aae`.
The repository has not been pushed or deployed.

## Install

1. In the existing app, use **Settings → Export backup** first.
2. Extract this ZIP. At the root of your existing repository, replace `app.js`, `style.css`, `index.html`, and `sw.js`; add `calendar-data.js` and `ocr-memory.js` beside them.
3. Keep the existing `vendor/`, trained-data files, icons, and manifest. Do not replace the entire repository with this small update archive.
4. Commit the six runtime files together and wait for your existing hosting deployment to finish. Open the app online, then close and reopen it. The new service worker uses cache `shiftfox-v12.2`.
5. Settings should display **v12.2**. If an older version remains, reload the website. Do not clear site data: your schedules and correction memory are stored there.

The tests, package files, this guide, and QA report are developer extras; they are not needed for hosting. No npm build is needed to run the app.

## Latest v12.2 fixes

- Reject accidental E- readings caused by table lines unless E- is an explicit custom code.
- Preserve uncertainty in colleague scans and exclude uncertain availability from cover suggestions.
- Check previous-night shifts when calculating cover availability.
- Refine Persian working-together wording and narrow-screen wrapping/input styles.
- Supplied-photo rerun: 86/90 cells correct; all four errors flagged. All 19 regression tests pass.

## What changed

- Table detection, Persian name OCR, and English shift OCR remain separate stages. Difficult cells now use alternate crops, segmentation modes, and a lightly smoothed candidate.
- Thin dash detection no longer relies on ink covering 5% of a cell. `-` is accepted as off even in older workplace definitions.
- Explicit custom off codes such as `OFF` remain valid; the false-dash safeguard does not reject them.
- Import preserves other workplaces, dates outside the scan, and existing shifts under blank scan cells. Cancelling an import saves neither shifts nor correction examples.
- Crop margins scale down for smaller photos instead of cutting away most of each letter.
- An OCR `*` or dash in a letter-shaped cell cannot become a confidently accepted off day. Empty, tiny, contradictory, and guessed-date results require review.
- Correction memory is local to this device and scoped to each workplace. It is included in JSON backups. It matches confirmed examples; it does not retrain Tesseract or upload photos.
- In Scan review, tap the correct code or type it, then **Import** to save that confirmed example. Tap `∅` to confirm an actually blank cell. Blank cells are skipped during import and preserve any existing shift on that date; they do not delete it. A remembered suggestion still needs checking. An unchanged prediction is not automatically added as training data.
- In Team, tap a colleague's name to correct it. Both the OCR alias and visual name sample can help future scans. Two different names are no longer automatically merged just because their edit distance is small.
- Settings → Scan memory lets you disable learning or delete individual saved examples.
- Today has a redesigned shift card, full Persian time units, a repaired seven-day strip, and clearer statistics. Latin codes and numeric dates/times use isolated directionality in Persian text.
- Theme accents now cover workplace colors by default. Turn off “Use theme colors for workplaces” to retain custom workplace colors.
- The Calendar tab opens in month view. Friday is the default weekend; settings also offer Thursday/Friday and Saturday/Sunday.
- Full Iranian public-holiday dates are bundled for **1405 only**. Other years show fixed solar holidays and a notice that lunar holidays are not loaded. Holidays do not remove scheduled shifts.
- Free time is grouped by weekday with explicit day/month/year dates, for example `12/7/1405`, start/end times, and full duration words. Availability still means the next seven days between 08:00 and 22:00, minus saved shifts and events.
- The existing service-worker syntax error is fixed; its caches are scoped to this app.

## Limits

Recognition still needs review. Saving three manual corrections improved an exact repeat of the sample from 87/90 to 90/90 cells, but did not improve its smaller or blurred variants. This verifies recall of similar examples, not learning that reliably generalizes to a new month. The supplied photo was used during development, so its results are not an independent validation set. Names and the glare-covered middle of the sheet do not have validated accuracy measurements. Missing image detail cannot be recovered reliably by changing OCR engines.

Use original photos where possible. Include all table edges and the date header, avoid reflections, and take a closer second photo if a name or symbol is obscured. Corrected names help only on the same browser/device unless you transfer a backup.

See `QA-REPORT.md` for measured results and test coverage. Live browser visual testing was blocked by the preview environment; DOM rendering and logic tests passed, but a final mobile visual check is still needed after installation.

## Run developer tests

Requires Node.js 20 or newer:

```sh
npm ci
npm test
```

The runtime app has no new remote service or production npm dependency.
