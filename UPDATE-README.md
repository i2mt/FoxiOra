# FoxiOra v12.15 — manual update

This cumulative update adds a trained shift recognizer, clearer scan editing and simpler shift-change navigation. It includes the running app, exact local scanner assets, editable source, build scripts and tests. It has not been deployed.

## Install

1. Export a backup from Settings.
2. Copy all root hosting files and the complete `vendor/` folder together, preserving paths. Do not upload training crops or private roster photos into the public site.
3. Reopen online and check v12.15 in Settings. Existing schedules and local corrections use the same database.
4. For offline scans, open Settings → اسکن و یادآوری → آماده‌سازی اسکن آفلاین. Wait for the ready message; all seven scanner assets (about 14 MB) are verified and cached.

The app is already built. `src/`, `tests/`, build files, package files and documentation are developer/review files, not hosting dependencies. Keep them in your repository so rebuilding and testing remain possible. Duplicate root language models are not needed; the app reads `vendor/lang/`.

## Main changes

- A trained symbol recognizer works alongside the existing English/Persian OCR. Conflicting readings remain pending; custom hospital symbols retain the general recognizer.
- Exact matches to confirmed local symbol features can be reused; approximate matches stay suggestions. Model guesses are not automatically learned as corrections.
- False half-column boundaries and transparent crop edges are handled more reliably.
- Unclear scan dates have a visible list, previous/next controls, the original crop and preset correction keys. The editor appears above the full month. Every date is editable.
- Saved unclear cells offer single-cell editing or group correction, with visible controls and Undo.
- Shift change has one main flow and shows all suggestions without extra mode/filter tabs. Colleague preferences and the digital roster remain accessible by links.
- An optional staff-name list in workplace settings assists conservative name suggestions. Similar names are not silently merged.

Colleague-only multi-page import, page-wide date checking, unknown/off distinction, reciprocal N exchange, workplace preferences, trip planning, all-workplace calendar, calendar events, fox loading animation and existing theme/settings polish remain included.

## Development

- `npm ci`
- `npm test` — 175 regression checks
- `python3 build.py`
- `python3 build.py --check`

## Accuracy status

On 180 fixed cells from photographs excluded from model training, the browser pipeline returned 172 exact codes and flagged eight for review. No wrong result was accepted as certain in that limited test. This does not measure full-page geometry or name accuracy. Several table layouts remain incomplete; reliable six-page / 100-nurse automatic import is not yet proven. See `QA-REPORT.md` for methods, corrected labels, actual workflow checks and remaining limits.

Training is a completed local release step, not automatic neural retraining with every scan. The separate training archive preserves audited crops, labels, photo-level splits and reproduction scripts.
