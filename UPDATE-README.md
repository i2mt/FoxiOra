# FoxiOra v12.7 manual update

Cumulative update for the existing FoxiOra repository. Includes the earlier trip planner, digital roster, symbol editor, quick shift editing and combined-duty cover suggestions.

## Install

1. Export a backup from Settings → Backup & data.
2. Replace these **nine files together** at the repository root: `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, `icon.svg`.
3. Keep the existing `vendor/` folder, fonts and OCR models.
4. Commit the files and open the deployed app online. Close and reopen it; Settings should show **v12.7**. Existing saved data uses the same database identity.

Only those nine files are needed for hosting. Package files, tests, reports, preview and verification results are for review. This package does not publish anything automatically.

## This update

- **OCR crash fixed:** empty Tesseract output was represented as an empty string, then treated as an array by `parsed?.every(...)`. Empty output now produces a null parse and safely proceeds to alternative readings or review.
- **Retry without another upload:** a failed row read returns to the existing name picker, preserves the photo, discards partial cells, and recreates the English OCR worker on retry. Duplicate row clicks are ignored while reading.
- **Optional model failure:** failure of the secondary Persian leave reader no longer aborts the whole Latin shift row. Unreadable cells remain flagged for checking; the app does not turn them into off days.
- **Shift-first calendar:** larger, heavier shift codes with subtle semantic tints. Date numbers are smaller; today has a filled circle and the selected date an outline. The today shortcut shares the month header, saving a separate row. Multiple-workplace cells grow when needed.
- **Fox-fill loading:** the FoxiMed fox silhouette fills from the bottom using two SVG masks. Startup follows database/render milestones, then allows a 450 ms finishing transition. The same effect follows actual OCR stage progress; the progress bar now updates correctly. Reduced motion is respected by CSS.
- **One first-run flow:** Start → workplace/name → roster photo → review → calendar. Workplace creation leads directly to photo entry. The name is optional; it can be selected from the photo. Symbol/hour configuration remains accessible. Manual entry is available too.
- **Resume unfinished setup:** after returning home, one clear “Add my schedule” action resumes the existing workplace without creating another one. Saving the first scan or manual shift finishes onboarding. Existing populated schedules are not interrupted.
- **Friendlier Persian:** clearer empty states, row-selection instructions, review prompts and recoverable errors. Error details remain available in a collapsed panel.

## Retained features

FoxiOra branding, Mohammad Mahdi Taghavi credit, Telegram contact `https://t.me/i_2mt`, English Fox / Siren / Forest / Hedo theme names, contrast improvements, settings switches and explicit dialog close/cancel controls remain included.

Off aliases `OFF`, `*`, and `-` share the configured off meaning; explicit hospital definitions take priority. Blank or unknown cells remain unknown. Case-sensitive `N` and `n` are preserved. D cover can include an E colleague as DE when that combination is allowed. Same-workplace DE / EN / En handover overlaps are not double booking; cross-workplace overlaps remain detectable.

Free-time windows cross nights and continue beyond 22:00. Trips use known reviewed roster coverage and can suggest eligible colleagues for a shift that would extend time off. Suggestions do not change shifts automatically. The digital roster and individual shift preset editor remain available.

## Validation

See `QA-REPORT.md` and `verification/`. 45 regression tests pass. Real Chromium tested the supplied roster through first setup, upload, name selection, review, retry and import. A separate three-row OCR benchmark matched 90/90 checked cells on that photo; one Persian leave cell remains flagged for review. Phone layout, dialogs, editing, cover, trips, saved-data upgrade and offline-shell reopening were checked.

OCR results describe this photo, not general accuracy on other rosters. Expanded settings, long name/results lists and multiple workplaces may still require scrolling.
