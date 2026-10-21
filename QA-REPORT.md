# FoxiOra v12.28 — scanner verification

## Automated checks

290 distinct automated checks passed: the complete 286-check suite, followed by focused runs covering four additional regressions and the final source changes. The final scanner-layout file contains 23 tests. They cover weak lower borders, irregular row heights, independently supported separator recovery, genuine tall rows, content beyond a truncated grid, rejected shift-code/name candidates, Persian date digits, either date direction, complete photo lists after OCR failure, language switching, ambiguous columns, full-photo row selection without duplication, separate page date mappings, correct header previews, escaped OCR text and update guards for unsaved photo selection. Existing learning, shift recognition, review, import, scheduling, personalization and tutorial checks pass.

Generated bundles match source; app and service-worker syntax checks pass. No new package dependencies or vendor files.

## Actual OCR browser comparison

The bundled OCR engines ran on seven generated tables, using the same 12 synthetic Persian names, 31 day columns and source images for both releases. Cases include names on either side, an extra title row, damaged lower horizontal borders, variable-height rows, an erased separator and 90-degree rotation. These are controlled synthetic fixtures, not the user's failing photograph or independent hospital samples.

| Table | v12.27 selectable entries | v12.28 selectable entries | Actual nurses |
| --- | ---: | ---: | ---: |
| Clean | 12 | 12 | 12 |
| Names on the left | 12 | 12 | 12 |
| Extra title/header | 13 | 12 | 12 |
| Damaged lower borders | 5 | 12 | 12 |
| Variable row heights | 9 | 12 | 12 |
| Erased separator | 12 | 12 | 12 |
| Rotated 90 degrees | 12 | 12 | 12 |

The extra-title table previously produced a numeric non-name entry and an untrusted date mapping; v12.28 found the actual date header. The updated scanner kept all 84 intended nurse photo rows across these fixtures. Exact recognized name labels were 71/84 versus 63/84 previously; unreadable labels in the new list remain photo rows. No nonempty incorrect name labels were observed in this small generated fixture set. These figures are not a general OCR accuracy estimate, and repeated transformed copies of the same names are not independent real-world samples.

## Interaction and offline checks

Twelve row-picker layouts passed across widths 320, 375 and 430, Persian/English and light/dark. All 12 photo rows remained present and enabled; no horizontal overflow. The SE-sized row picker was visually inspected.

A real tap corrected the names column and rebuilt all 12 rows. Selecting a personal row then read 31 unique dates and recognized all 31 fixture symbols without pending cells. Selecting the bottom nurse from the full-column photo read 31 dates and replaced the existing row without duplication. This checks these fixture interactions; it does not claim comparable symbol accuracy on other photographs.

After worker termination and an offline page reload, a new worker read the same injected local photo from cached scanner files: 12 rows and a validated names column. No JavaScript errors. Browser tests used Chromium phone-sized viewports; physical iOS/Android hardware and the friend's original image were not tested.

## Further engine evaluation

The present update combines layout evidence, image evidence, language-specific name OCR and the existing trained symbol recognizer. No external photo-processing endpoint was added. A future independent recognizer should be compared on the actual failing photos and phone, including download size, peak memory, speed, false accepted names and full-row recall.

PaddleOCR documents Persian support in its Arabic PP-OCRv5 recognition model: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.en.md . That model is not bundled or enabled here; browser/mobile suitability remains to be evaluated for this app. Tesseract's documentation describes the accuracy/speed trade-off of its alternative best models: https://tesseract-ocr.github.io/tessdoc/Data-Files-in-tessdata_best.html . No unmeasured model replacement is represented as a tested improvement.

The changes-only archive is integrity checked. Overlaying its files onto v12.27 must reproduce every v12.28 repository file byte-for-byte; the patch manifest includes base/replacement SHA-256 values.
