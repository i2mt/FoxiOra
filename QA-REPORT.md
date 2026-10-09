# FoxiOra v12.14 verification

## Release checks

- 161 Node regression tests pass. New coverage includes colleague-only pages, page-wide date confirmation, unknown-versus-off handling, grouped corrections, local crops, Undo, failed-save rollback and ambiguous colleague identity handling.
- Generated source consistency and JavaScript syntax checks pass.
- Real Chromium scan → choose name → review → import on the original supplied photograph reads the independently checked 30-code sequence correctly. One leave marker is flagged for review. After confirming it, all 30 shifts save. A simulated interrupted worker returns to selection and a retry completes.
- Real Chromium colleague-only import of the same photograph imports all 23 detected nurse rows with no personal-row selection. Existing personal shifts and the saved personal name stay intact. This test does not establish that all colleague names/codes are correct.
- Review UI: all 31 days are visible; eight combinations of 320/390 CSS pixels, Persian/English and 100%/200% root text size have no document horizontal overflow. Group save/Undo and alignment Cancel work.
- All six shipped scanner files are checked against their exact byte lengths/SHA-256 manifest. Both compressed language models decompress.

These are desktop Chromium checks using mobile-sized viewports. They are not physical iPhone or Android tests. Earlier UI, exchange, cache and storage behavior remains covered by the cumulative regression suite; no new live deployment was tested.

## Twenty-photo benchmark

The scanner was run on all 20 newly supplied photos. Each run attempted table/name extraction and the first detected row. Gregorian January 2099 was used only as a fixed 31-day harness month, not as an assertion of each photo's real roster date.

| Diagnostic | v12.13 | v12.14 |
| --- | ---: | ---: |
| Photos attempted | 20 | 20 |
| Runtime failures | 4 | 0 |
| Automatic header fits reported by algorithm | 2 | 3 |
| Detected first-row cells | 464 | 533 |
| Cells flagged pending | 437 | 358 |

The cell counts differ because detected layouts differ. Pending counts are **not accuracy**: this update separates guessed date mapping from glyph uncertainty. Automatic header fits are algorithm diagnostics, not independently verified dates. Some inputs still produce very incomplete layouts, for example photo 06 yields only three first-row cells, and photo 11 only two detected rows. Curved paper, faint borders, perspective, handwritten tables and headers outside the grid remain problems. Do not treat the absence of a crash as a successful full import.

The final diagnostic combines the last orientation run for 17 affected photos with the unchanged strong-fit paths for photos 08, 13 and 20. The production build excludes the later table-mesh experiment. `verification/benchmark-summary.json` contains counts only, without staff names or full photos.

## Visually labelled symbol experiment

153 symbol crops were visually transcribed:

- 62 training cells from the first two nurse rows of photo 03.
- 31 held-out cells from a third row of the same photo.
- 30 cells from photo 13, excluded from training.
- 30 independently checked cells from the original regression photograph.

Labels were transcribed by the assistant and have not been user-reviewed. They cover a small set of printed symbols, not comprehensive names, combined duties or handwriting. Full pages and staff names are excluded from the separate symbol dataset.

An English `tessdata_best` model was fine-tuned for 400 iterations using only the 62 training crops. Evaluation used local Tesseract 5.3.4, fixed crops, PSM 13 and whitelist `DENnMS-`:

| Model | Training 62 | Same-photo test 31 | Other-photo test 30 | Original-photo test 30 |
| --- | ---: | ---: | ---: | ---: |
| App English model | 28 | 10 | 16 | 18 |
| English best model | 30 | 12 | 17 | 20 |
| Fine-tuning trial | 62 | 31 | 21 | 29 |

These are exact-code counts for a **single-pass crop experiment**, not the accuracy of the app's multipass scanner. The app reads the original selected row 30/30 with its established preprocessing and fallback pipeline. The trial's same-photo result does not demonstrate generalization. It still misses nine cells on photo 13 and a leave marker on the original photo, so it is **not shipped as the app model**.

## Table detection experiment

A local contour-based probe recovered hundreds of individual cell boundaries from curved tables. A JavaScript prototype recovered 23 rows from photo 03, but its column interpolation misaligned some lower-row cells. It was removed from the production build. Optional four-corner straightening is available as a recovery tool; it did not fully recover photo 03 in the recorded test. Neither experiment is presented as a validated accuracy improvement.

## Secondary OCR test

The RapidOCR / ONNX Runtime evaluation remains incomplete. Automatic approval review rejected continuation after an unexpected Microsoft telemetry endpoint was detected with an unknown payload. It was not resumed or included in the app. No completed secondary-engine score is claimed.

## Next accuracy work

The existing photos are enough to diagnose layout failures and begin labelled experiments. The most useful additional data is original Excel/PDF rosters matched to several photos, especially distinct table formats and handwriting; this supplies correct names and exact cells without asking a nurse to confirm thousands of items. Future tests should hold out entire photos and hospital layouts, measure wrong automatic accepts separately from abstentions, and time a full six-page import on real phones.

Only dates relevant to a requested shift exchange/trip should require unresolved evidence; a doubtful cell elsewhere must not disable the entire ward. Existing planner tests verify this boundary. General ER-scale accuracy and practical scan time remain unproven.
