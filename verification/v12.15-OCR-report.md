# FoxiOra v12.15 — OCR training and release verification

Prepared 10 October 2026 (Asia/Tehran). This update is ready for manual upload; it has not been deployed or pushed.

## What is now implemented

A trained shift-symbol model supplements the existing general English/Persian OCR. It reads original cell crops while the existing recognizer reads processed glyphs. A high-confidence specialist result needs a second agreeing read before resolving a pending cell; competing clear readings remain pending. Visible-dash guards protect off recognition. Custom hospital codes continue through the general recognizer. Worker/model failure retains the general result. Model guesses do not become human-confirmed learning.

Exact matches to a previously confirmed local glyph feature can be reused without asking again. Approximate matches stay suggestions. This is bounded local example matching; the app does not retrain neural weights each time a nurse scans a photo. New globally trained models require labelled examples, evaluation and a release.

The page detector now removes false half-cell boundaries when surrounding date columns establish a regular spacing. Transparent pixels outside a crop are treated as white instead of ink. These repair a known photo-13 mapping defect and cropped-image edge behaviour, rather than promising all-table geometry.

An optional staff-name list in workplace settings helps propose names with conservative distance/margin limits. Verified corrections and explicit staff lists are workplace-specific; ambiguous near-identical names remain unresolved. Persian name OCR itself is not retrained in this release.

Unclear dates are explicitly listed immediately after a personal scan. Their photo and preset editing keys appear above the month grid, with previous/next unclear buttons. Every date remains editable. Saved unclear results offer single-cell or grouped correction; shared editing controls appear before the list and Undo restores changes. No Show more is used.

Shift change opens on one selection flow. The duplicate mode tab row and All/Exchange/Cover filters were removed. All eligible options are shown under two clear sections; colleague preferences and the digital roster remain direct links.

## Labelled data and training

615 real symbol cells were visually transcribed. The labels are assistant annotations, not user-reviewed ground truth. Blank/metadata/uncertain crops were excluded. Photos and personal name crops are not distributed.

| Split | Whole source photos | Real cells |
| --- | --- | ---: |
| Training | 03, 04, 05, 09, 10, 15, 17 | 435 |
| Validation | 02 | 62 |
| Test / regression | 13, 20, original photograph | 118 |

Training uses 1,860 controlled real-image variants and 330 synthetic standard symbols (2,190 examples total). Rare M/DE/DN examples are weighted with more variants. Real training counts are off 138, E 103, D 100, N 79, M 9, DE 3, DN 3. n/S/EN/En have synthetic supplementation only; real-photo generalization for them remains unproven.

The model starts from the official English `tessdata_best` float model and is fine-tuned locally with Tesseract 5.3.4, learning rate 0.0001, seed 1515 and 2,000 iterations. It is exported as an integer model for Tesseract.js. A validation list was supplied, but no independent checkpoint-selection score is claimed. Training error is not reported as test accuracy.

## Fixed-crop recognition results

All 180 evaluation cells come from photographs excluded from this model's gradient training. The following browser test places manually located crops inside a white page canvas, then calls the actual app recognition function. This avoids an earlier harness error where out-of-canvas transparent pixels looked like ink. The comparison uses corrected labels, identical crops and identical browser settings.

| Browser pipeline | Exact outputs | Flagged for review | Accepted | Wrong accepted |
| --- | ---: | ---: | ---: | ---: |
| v12.14 | 170/180 (94.4%) | 12 | 168 | 0 |
| v12.15 | 172/180 (95.6%) | 8 | 172 | 0 |

| Source photo | Cells | v12.15 exact | Pending |
| --- | ---: | ---: | ---: |
| 02 | 62 | 60 | 2 |
| 13 | 30 | 30 | 0 |
| 20 | 58 | 53 | 5 |
| Original regression | 30 | 29 | 1 |

No incorrect result was accepted as certain in this limited crop test. It does not prove zero errors on future scans. These are manual cell locations, not end-to-end page accuracy. The pipeline thresholds were developed against this evaluation set; a fresh external benchmark is still needed. The photographs may share ward styles and are not a verified hospital-independent sample.

Single-pass local Tesseract on the same raw crops (PSM 13, whitelist DENnMS-) gives 120/180 for the existing English model and 177/180 for the trained model: respectively 44/62 vs 62/62 on 02, 17/30 vs 29/30 on 13, 41/58 vs 57/58 on 20, and 18/30 vs 29/30 on the original. These are isolated model scores; they must not be substituted for app accuracy. The hybrid retains more safeguards and uses a different processing route.

## Annotation corrections

The earlier v12.14 cross-photo score of 21/30 paired several misplaced scanner crops with intended date labels. Photo-13 cells were re-extracted from original boundaries and visually checked; the corrected trial score was 29/30. Those corrected crops are used here. One photo-02 provisional E label (p02-055) was also visually corrected to a dash. The final dataset and all reported results use the corrected label. Neither correction is evidence of model improvement by itself.

## App verification

- 175 automated regression checks passed, including reciprocal night swaps, same-workplace combined shifts, uncertain data, storage failure/Undo, escaping, custom codes, specialist failure/disagreement and local learning.
- Source/build consistency and JavaScript syntax checks passed.
- Browser review/navigation tests passed at 320 and 390 px, Persian and English, 100% and 200% text size (16 combinations). All month dates and option sections remain accessible with no horizontal page overflow. Vertical scrolling is allowed for readable enlarged text.
- A real personal photograph was read as 30/30 expected shift codes, imported successfully and recovered after an interrupted worker. Its initial single pending marker was explicitly corrected before import.
- Colleague-only import read 23 detected rows / 690 date cells without selecting a personal row or changing existing personal shifts. 65 cells remained pending. These counts are workflow diagnostics; all colleague names and 690 codes have not been independently gold-checked.
- A fresh scanner preparation verified all seven assets. A deliberately damaged English model was rejected. The browser then disconnected, reloaded the installed shell and scanned/imported the 30-day photograph offline, including the trained model.
- The optional staff list saved and Undo restored it. Similar-name ambiguity, workplace boundaries, single-cell correction, grouped correction and cancel/return navigation passed.

## Remaining accuracy work

End-to-end automatic imports of six pages / 100+ nurses are not established yet. Several supplied photographs still have incomplete or misplaced rows/columns. In the eight-photo diagnostic run, photo 02 yielded 19 date cells in the first row, photo 04 yielded 28, photo 20 yielded 28, and photo 03 found 21 nurse rows rather than the expected 23. Four-corner straightening did not fully solve photo 03. Unclear cells and dates must remain distinguishable from off.

A seven-name Persian test gave 1/7 exact normalized names with the existing model and 2/7 with the larger official Persian best model. That alternative was not shipped; this tiny test does not establish broad name accuracy. Full roster identities should next be evaluated using verified, disambiguated names, original digital lists and varied hospital formats.

The most useful next samples are original-quality photos/PDFs from other hospitals, different templates, handwriting and rare combined/leave symbols. Preserve some entire hospitals/templates/months as an untouched test set, label their table geometry and symbols, and validate names separately. Ask the owner only about ambiguous annotations rather than asking nurses to confirm every imported cell. More same-template photos alone cannot establish generalization.

A RapidOCR/ONNX secondary-engine evaluation remains excluded. Automatic approval review previously rejected continuation after an unexpected Microsoft telemetry endpoint with unknown payload was detected. It was not resumed; no completed score or integration is claimed.

## Distribution

The app ZIP includes exact scanner assets, editable source, tests, build scripts and count-only verification evidence. The training ZIP includes 615 symbol crops, labels/splits, reproduction scripts, trained/general shift models and evaluation results. Neither contains full private roster photographs or staff-name crops. The derived model's Apache-2.0 license and provenance are included. Scanner preparation is about 14 MB; the new compressed model adds about 2.94 MB.
