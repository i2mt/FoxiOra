# FoxiOra v12.17 — manual update

This cumulative release adds monthly work hours and بهره‌وری for you and any saved colleague. It includes the complete app, the v12.16 کیا شیفتن؟ lookup and the trained OCR model from v12.15. It has not been deployed.

## Install

1. Export a backup from Settings.
2. Extract the manual-update ZIP and copy its hosting files and complete `vendor/` folder into your repository/hosting, preserving paths.
3. Reopen online and check v12.17 in Settings. Existing schedules, local corrections and backups use the same database.
4. For offline scanning, prepare the scanner from Settings before disconnecting. The seven scanner assets and their checksums are unchanged.

**Only the manual-update ZIP is needed.** The separate OCR-training archive is for training/evaluation, not hosting.

## Monthly hours

Calendar → Month shows **ساعت حضور** and **با بهره‌وری**. Tap the summary for a breakdown. The workplace filter applies to both the calendar and total; All workplaces includes every workplace, including those excluded from trip planning. Actual presence counts simultaneous/overlapping saved duty minutes once. بهره‌وری is credited separately for each workplace and component.

Calendar → جدول has an inline **ساعت کار این ماه** summary. Expand it and choose yourself or any imported colleague, across all pages. The person selector is independent of roster search, swap exclusions and the کیا شیفتن؟ selection.

| Duty | Regular day | Friday or official public holiday |
| --- | --- | --- |
| D / E | 1× | 1.5× |
| N / short n | 1.5× | 1.5× |
| مرخصی | One D shift at 1× | One D shift at 1.5× |
| off / − / OFF / * | 0 | 0 |

DE, EN and other combinations credit each component separately. A Friday that is also a public holiday still uses 1.5×. Full night duties belong to the month of their roster/start date, including the last night of the month. Leave adds credited hours, not physical presence.

Duration comes from workplace hours. Existing personal duties use their saved time segments; changing symbol hours does not rewrite them. Colleague durations and the D reference for leave use current workplace definitions. Duplicate copies of the same duty do not inflate totals.

Settings → workplace → **ساعت کار و بهره‌وری** lets you choose the D reference for leave. Under Symbol meanings, each symbol can use automatic/day/night/leave/no-hours rules as appropriate. Sick leave has no invented default credit: assign its rule if required by your workplace. Custom symbols and aliases are supported.

Totals recalculate from saved records after corrections, swaps, deletions and Undo. Confirmed OCR entries are counted immediately; no whole-roster confirmation is required. Missing/unclear cells are excluded with a visible incomplete status and count. Holiday credit applies even when calendar occasions are hidden; the display weekend choice does not change Friday credit.

Lunar public-holiday data currently covers Jalali 1405. Relevant calculations for other years are marked as estimates, with the missing year explained in the breakdown. Fixed solar public holidays and Fridays still apply. Monthly required hours, overtime pay and individual weekly reductions are not calculated.

## Included features

The کیا شیفتن؟ lookup, OCR specialist/general hybrid, local correction reuse, unclear-date navigation, group corrections/Undo, colleague-only multi-page import and simplified swap screen remain included. No new OCR training or accuracy measurement is claimed. The original model license/provenance and `verification/v12.15-OCR-report.md` are preserved.

## Development

Root runtime files are already built. Keep `src/`, `tests/`, `build.py`, `build-manifest.json`, `package.json` and `package-lock.json` in your source repository.

- `npm ci`
- `npm test` — 213 automated checks
- `python3 build.py`
- `python3 build.py --check`

`verification/` and Markdown documents are review evidence, not runtime dependencies. No private staff photos or training crops are included.
