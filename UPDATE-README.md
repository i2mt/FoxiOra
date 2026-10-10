# FoxiOra v12.16 — manual update

This cumulative update adds **کیا شیفتن؟** directly to the digital roster. It includes the complete app and the trained OCR model from v12.15. It has not been deployed.

## Install

1. Export a backup from Settings.
2. Extract the manual-update ZIP and copy its hosting files and complete `vendor/` folder into your repository/hosting, preserving paths.
3. Reopen online and check v12.16 in Settings. Existing schedules, local corrections and backups use the same database.
4. For offline scanning, prepare the scanner from Settings before disconnecting. The seven scanner assets and their checksums are unchanged from v12.15.

**Only the manual-update ZIP is needed.** The separate OCR-training archive from v12.15 is for future training/evaluation and is not a hosting dependency.

## Who is on shift?

Open Calendar → جدول (digital roster). A compact **کیا شیفتن؟** section appears above the table. Choose a date and shift; names update immediately. Tapping a date heading in the table selects that date too. The date selector covers the whole month and keeps the seven-day table preview in sync.

- The lookup uses every imported colleague row for the selected workplace, across all pages.
- It works while you are off, on leave, or have no personal schedule. If you work the selected duty, you appear once with a small شما label.
- Combined duties count: DE appears under D and E; EN appears under E and N. Custom workplace definitions and aliases are supported. A brief handover overlap is insufficient by itself; a time-based match must cover the requested duty.
- Unknown/uncertain entries are listed separately. Off/leave entries are not asserted as working. Presence is based on saved schedules rather than real-time attendance.
- Shift-swap restrictions and roster name search do not hide staff from this lookup. People with similar names remain distinct rows.
- All matching names are visible, with no Show more, extra main tab or feature-opening button. Selecting a date/shift does not edit saved schedules.
- Roster corrections, swaps and Undo refresh the lookup automatically. It works offline with saved data.

## Included from v12.15

The trained/general hybrid OCR, explicit unclear-date list, previous/next review controls, local correction reuse, group correction/Undo, colleague-only multi-page import and simplified shift-change screen remain included. The OCR model was not retrained in this release. `verification/v12.15-OCR-report.md` preserves the prior measured results and remaining page-geometry/Persian-name limits.

## Development

The root app files are already built. Keep `src/`, `tests/`, `build.py`, `build-manifest.json`, `package.json` and `package-lock.json` in your source repository.

- `npm ci`
- `npm test` — 188 automated regression checks
- `python3 build.py`
- `python3 build.py --check`

`verification/` and the Markdown documents are review evidence, not runtime dependencies. No private staff rosters or training crops are included in the app ZIP.
