# FoxiOra v12.6 verification

## Automated results

- 42/42 regression tests passed in Asia/Tehran timezone.
- 30 light/dark view/viewport checks passed at 320×568, 360×640 and 390×844: Today, Calendar, Shift swap, Settings and Digital roster. No horizontal page overflow or browser runtime errors.
- All nine dialog types: entry choice, workplace, new shift, existing shift, event, trip booking, colleague name, OCR memory and colleague cell. Actual close/cancel button clicks and native Escape were exercised; each dismissed its dialog.
- D→DE: an E colleague is suggested despite the approved D/E handover overlap. Conflicting previous nights, uncertain dates and disallowed combination rules are tested.
- Same-workplace DE/EN/En: no overlap warning; continuous combined-duty cards end at the final segment. Cross-workplace overlap remains detected.
- Preset shift editing: one entry remains for the chosen workplace/date. Moving a date/workplace removes the old entry.
- Symbol setup: hospital-specific aliases, custom hours, off equivalence, explicit conflicting definitions, custom asterisk duty and case sensitivity are tested. Midnight 24:00 displays as 00:00 in the browser time editor.
- Digital roster: search, seven-day paging, full month, name corrections, cell corrections and unknown markers are exercised. Reviewed colleague cells immediately influence cover results.
- v12.5→v12.6 service-worker update preserved state. Theme/switches, trip suggestion and booking, multi-day calendar markers and offline app-shell reopening passed.
- Fox SVG: traced from the exact FoxiMed alpha mask. Browser rendering agrees with 99.526% silhouette intersection-over-union at 512 pixels. Contains vector paths with no embedded raster.

## OCR sample

The first three rows of the supplied IMG_6179.jpeg contain 90 labeled cells. v12.6 matched 90/90: D 21/21 and off 26/26. One Persian leave reading remains flagged for review. Layout found 23 rows and read dates without guessing.

This reuses the earlier supplied photo, not an unseen hospital roster. Names and glare-covered cells were not scored. The previous v12.5 resized/blurred benchmarks are not claimed as new v12.6 measurements.

## Limits

- Expanded settings, long cover results and many colleague rows still scroll vertically. Seven-day roster pages fit the width; full-month mode intentionally scrolls inside the table.
- Preview schedules are seeded demonstration data, not the user's real roster.
- OCR/model performance on real phones, offline OCR, iOS/Android keyboard behavior, enlarged text and production-host update timing remain unverified.
- Cover suggestions represent saved roster facts and configured combinations. They do not approve, arrange or record a reciprocal swap automatically.
