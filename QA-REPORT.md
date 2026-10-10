# FoxiOra v12.17 — monthly hours verification

Prepared 10 October 2026. This release adds monthly presence and بهره‌وری totals. It has not been deployed. No OCR weights or scanner assets changed.

## Accounting

Confirmed D/E duties use 1× on regular days and 1.5× on Fridays/official holidays. N/n always use 1.5×; Friday/public-holiday coincidence does not double the factor. مرخصی credits the workplace's D reference and follows the same date factor. Off credits zero. The user explicitly chose to sum each combined-shift component for بهره‌وری and apply the D holiday factor to leave. Overlapping actual presence counts once. Full overnight shifts belong to their starting month.

Totals derive from current saved records and definitions, without a stored balance or migration. Personal work entries retain saved segments; colleague durations and leave reference use current definitions. All workplaces can be aggregated or filtered, independently of trip inclusion. Same-duty duplicate segments and duplicate leave records are not counted twice.

Only determined shifts contribute. Partial months, pending OCR cells, missing/invalid segments, unmapped symbols and missing leave references are visible as incomplete totals. No whole-roster manual confirmation is introduced. Sick leave is unresolved until a workplace rule is chosen, or explicitly excluded. Missing lunar-year data produces an estimate label and explanation. Holiday visibility and the display weekend setting do not affect calculations.

## Automated checks

**213 checks passed**: the previous 188 checks plus 25 monthly-accounting checks. New checks cover exact minute totals, regular/Friday/solar/lunar days, coinciding holidays, short n, DE/EN/En, leave and sick-leave configuration, off, custom aliases, Jalali boundaries, complete last-day nights, saved times after definition changes, duplicates, multiple workplaces, unknown/pending/missing entries, missing lunar years, 120 colleagues across six synthetic pages, live edits/deletion/serialization/Undo, within-month D swaps and cross-month N swaps, escaped names/IDs and workplace rule persistence.

Build/source consistency and JavaScript syntax checks passed. App and service-worker version are v12.17; IndexedDB and verified OCR cache remain compatible.

## Browser checks

Playwright Chromium, timezone Asia/Tehran, tested **32 combinations** of 320/390 px, Persian/English, light/dark, 100%/200% text size and Gregorian/Jalali calendars. Personal summaries, expanded breakdowns and expanded colleague summaries had no page-level horizontal overflow. Enlarged text and expanded details may scroll vertically.

At 390 × 844 with normal text, the complete month grid and compact totals fit above bottom navigation. Interactive tests exercised expansion, ordinary shift-key editing/save/Undo, all 121 person options (self + 120 colleagues), saving a sick-leave rule, and an offline reload with identical totals. No page errors occurred.

The v12.16 presence suite was rerun: 32 combinations, off/no-personal-roster lookup, all 120 names, workplace isolation, search independence, unclear cells, combined duties, date/week synchronization, correction/Undo and offline reload passed. This is synthetic roster/persistence validation, not unattended OCR validation on six actual staff pages.

Screenshots use synthetic demonstration identities. Private uploaded schedules are excluded.

## Scope and limits

This feature reports roster hours and specified productivity credit. It does not calculate pay, monthly required hours or individual reductions. Lunar holiday data covers 1405; calculations needing other years are estimates. Missing pages/unreadable cells cannot contribute confirmed hours. Original OCR weights and their v12.15 benchmark/limitations remain unchanged.
