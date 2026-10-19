# FoxiOra v12.21 — manual update

This cumulative release adds a short interactive introduction, phone/browser-specific installation help, and local Excel/CSV/TSV schedule import. PDFs open in the existing photo-review workflow. It retains the corrected depth artwork and all previous roster, monthly hours, trip and OCR improvements. It has not been deployed.

Settings has **آشنایی با برنامه** (replay intro) and **نصب FoxiOra**. Initial schedule setup and Add schedule now offer a file alongside photos. Structured imports require row selection and validation of dates and unfamiliar shift symbols. See `INSTALLATION-NOTES.md` for formats and limits.

## Install

1. Export a backup from Settings.
2. Extract the manual-update ZIP and copy its hosting files and complete `assets/` and `vendor/` folders (including `vendor/file-import/`) into your repository/hosting, preserving paths.
3. Reopen online and check v12.21 in Settings. Existing schedules, local corrections and backups use the same database.
4. For offline scanning, prepare the scanner from Settings before disconnecting. The seven scanner assets and their checksums are unchanged.

**Only the manual-update ZIP is needed.** The separate OCR-training archive is for training/evaluation, not hosting.

## Monthly hours

Calendar → Month shows the grid first, then **ساعت حضور** / **با بهره‌وری** and the selected day’s shift controls. Tap a date, then its shift or **ثبت / تغییر شیفت**. Tap the hours summary for the breakdown. **برنامه‌ریزی سفر** is always visible beside Month/Week/List/Roster and opens the planner directly. The workplace filter applies to both the calendar and total; All workplaces includes every workplace, including those excluded from trip planning. Actual presence counts simultaneous/overlapping saved duty minutes once. بهره‌وری is credited separately for each workplace and component.

Calendar → جدول stays in Calendar, with Month/Week/List controls still visible. It has an inline **ساعت کار این ماه** summary. Expand it and choose yourself or any imported colleague, across all pages. The person selector is independent of roster search, swap exclusions and the کیا شیفتن؟ selection.

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
- `npm test` — 215 automated checks
- `python3 build.py`
- `python3 build.py --check`

`verification/` and Markdown documents are review evidence, not runtime dependencies. No private staff photos or training crops are included.

## Simpler colleague settings

Shift swap → Colleague preferences → tap a name. Use the inclusion switch and one shift selector: any shift, D/E/N only, single shifts only, or custom selections. Custom choices stay open while selecting several symbols. These choices preserve existing hour, weekday and temporary-date restrictions.

One additional section contains maximum hours, weekday availability and temporary absence; identity linking has a direct section rather than another submenu. Active day/date restrictions appear in the colleague summary. Optional suggestions from a clear single-shift roster and schedule comparison are grouped at the bottom, with explicit wording. Existing saved rules and Undo remain supported.

Full Persian weekdays wrap onto two lines in the Today strip and month headers. Larger text can scroll vertically. The welcome and loading text were written in conversational Persian. The title, installed app name, icon labels, backup filenames, private package metadata and these delivery files use **FoxiOra**. Compatibility identifiers preserve existing schedules and verified scanner assets.

## Depth artwork

The supplied `icons/white/` files are the installed app icon and Apple touch icon. The supplied maskable exports retain their safe area. Light screens use the production transparent depth PNG; dark screens use dark-transparent artwork with white ears and nose and a dark centre. Appearance follows Light/Dark/System settings.

The startup and scanner logos stay still while the orange body reveals clockwise from the top as progress advances. The ears, face and symmetrical white tail marking remain visible. Reduced motion displays the completed artwork. Both themes are cached with the app shell for offline use.

`ASSET-NOTICE.md` records exact file choices and the progress-mask source. This release uses the corrected pack (2); none of the earlier simplified-gradient exports are used. The 512 px PNGs preserve the approved shading. The compatibility SVG files embed these production PNGs and are not claimed to be pure vector.
