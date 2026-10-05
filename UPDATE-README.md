# FoxiOra v12.5 update

1. Export a backup in Settings → Backup & data (پشتیبان و اطلاعات).
2. Extract this ZIP. Replace these six files in the existing repository root:
   app.js, style.css, index.html, sw.js, calendar-data.js, ocr-memory.js.
3. Keep all existing vendor files, fonts, OCR language models, manifest and icons.
4. Commit together, wait for deployment, open the app online, close and reopen. Settings shows v12.5.
5. Do not clear browser/site data. This is an update package, not the entire app.

## Layout and controls

- FoxiMed-inspired grouped settings, real switches and English theme buttons.
- Today has a filled date marker; the selected calendar date has a separate outline.
- Add schedule is in the header, so a fixed button no longer covers content.
- Shift cards open an editor. Deletion is a separate action.
- Scan review groups equivalent off-day symbols and offers one import action with an optional colleague-reading checkbox.
- Three bottom tabs remain. The trip planner is reached from Today or Calendar → Free time & trips.

## Free time and trips

The 08:00–22:00 restriction is removed. Free time now runs continuously through nights and across dates, subtracting all saved work and personal events.

Trip planner searches for 1–14 days of continuous free time. One day means 24 hours. It searches up to 60 days, within the saved roster period.

It shows existing breaks and longer breaks possible by handing over one future shift, with possible colleagues from the saved roster. Suggestions never change your shifts automatically. A return shift must stay outside the break; colleague agreement and any workplace approval are still needed.

Missing and unreviewed roster dates are excluded. A sparse manual schedule may need explicit off days before it can support trip planning. All workplaces with saved rosters are considered. To exclude a former/inactive workplace, use Settings → Workplaces → edit workplace → Shift hours & codes → Include in free time and trips. This preserves its history.

Existing breaks can be saved as multi-day personal trip events. Start and end dates are displayed and the event is marked on every occupied calendar date.

## OCR

Boundary-line cleanup recovers faint off-day dashes. If Latin OCR cannot read a symbol, the existing Persian model can suggest the Persian leave marker م as M. This fallback requires agreement from two passes and always stays flagged for review. No new OCR files are needed.

Measured on the first three rows (90 cells) of the supplied photo: 86/90 → 90/90, with one result still requiring review. At 75% image size: 85/90 → 88/90; with mild blur: 84/90 → 90/90. These are results on one roster and its variants, not a general accuracy guarantee. Names and the glare-covered area were not scored.

## Verification

32 regression tests pass. Chromium checks cover phone-sized layouts, switches, editing, swaps, trip suggestions/booking, state-preserving v12.4 → v12.5 updates, and reopening the app offline.

Real iOS/Android keyboard behavior, accessibility text enlargement, production update timing, offline OCR, battery use and general accuracy on unseen rosters are not certified.

Only upload the six app files. Documentation, tests, package files and previews are not required for hosting.
