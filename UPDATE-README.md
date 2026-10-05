# FoxiOra v12.6 manual update

This is a cumulative update package for the existing FoxiOra repository. It includes v12.5's continuous free-time/trip planner and OCR improvements.

## Upload

1. Export a backup in Settings → Backup & data (پشتیبان و اطلاعات).
2. Replace these **nine files** at the existing repository root:
   - app.js
   - style.css
   - index.html
   - sw.js
   - calendar-data.js
   - ocr-memory.js
   - manifest.json
   - fox-mark.svg (new)
   - icon.svg
3. Keep existing vendor files, fonts, OCR language models.
4. Commit the nine files together. After deployment, open the app online, then close and reopen it. Settings should show v12.6.
5. Do not clear browser/site data. The existing database identity is retained so saved schedules, colleagues and correction memory survive the update.

Only the nine app files are needed for hosting. Reports, tests, package files, screenshots and verification data are for review.

## What changed

- Monthly calendar: neutral cells, small shift markers and restrained shift colors. Today keeps its filled circle; selected dates have a separate outline. Fox no longer paints every calendar shift orange.
- Settings: neutral, readable headings and icons in dark mode, bright theme accents for actions, compact groups, and an explicit FoxiOra version badge.
- Credits: Mohammad Mahdi Taghavi and direct Telegram contact at https://t.me/i_2mt.
- FoxiMed identity: fox-mark.svg is a vector trace of the exact FoxiMed fox silhouette from icons/fox-mark-clean-mask.png. The FoxiMed repository currently contains PNG masks, not an original SVG. The new SVG contains paths, not an embedded bitmap, and is used by the loading screen, settings, and app icon. Loading phrases are written for FoxiOra; the screen disappears when stored data is ready, without a forced wait.
- App name: browser title and install manifest now use FoxiOra. The internal database name stays unchanged to preserve existing data.
- Shift editing: tap a shift or choose ثبت / تغییر شیفت. Preset keys replace the current code, including combined shifts, with explicit Save, Cancel and Delete actions.
- Symbol setup: Settings → Workplaces → Define symbols & hours. Each symbol has a meaning, kind, hours and optional aliases. Equivalent off codes appear once. Legacy OFF, * and − off entries share the same meaning; explicit hospital definitions take priority. Saved shift times stay unchanged when definitions are edited.
- Scanner: symbol setup is available before taking a photo and during review. Aliases participate in OCR whitelists and parsing. Manually confirmed scan corrections still teach device-local memory. Blank/unknown cells remain separate from off days.
- Shift cover: month selection is the default; toggle to an uncapped list. D cover includes E colleagues when DE is allowed, including the expected handover overlap. Results distinguish colleagues who are off from those whose duty can extend to a combined shift. Previous-night conflicts and uncertain dates are excluded. New workplace defaults include DE, EN and En; existing explicitly configured combination rules are respected.
- Conflict rules: overlap at the same workplace is not a double-booking warning, including DE, EN and En. Overlap between different workplaces remains detectable. Short rest between separate duties is still shown. Today merges continuous parts of one combined duty and counts down to its final end.
- Digital roster: Calendar → جدول, or Shift swap → برنامهٔ دیجیتال. Names and saved shifts appear in a readable table. Seven-day pages fit the phone; Whole month enables scrolling inside the table. Search names, correct names, edit colleague cells, and distinguish uncertain cells from missing data. Your row stays at the top. Read colleagues during scan import to fill their rows; the table reflects saved data and does not invent missing entries.
- Dialogs: close/cancel actions use an explicit dialog handler instead of the browser window-close function. Close has a circular control; cancel has a neutral outlined shape. All nine dialog types were exercised in Chromium.

## Free time and trips

Free periods continue through nights and across dates; the old 08:00–22:00 restriction remains removed. Trip planning searches for 1–14 days of continuous free time, within known saved roster coverage and at most 60 days ahead. Missing or unreviewed dates are excluded.

Colleague recommendations can include approved combined-duty options. Suggestions require agreement and do not change shifts automatically. A return shift must remain outside the proposed trip; workplace approval and appropriate rest still need to be checked. Exclude a former workplace from travel calculations in its options without deleting its history.

## Validation

42 regression tests pass. Chromium exercised phone layouts at 320×568, 360×640 and 390×844 in light/dark mode, with no horizontal page overflow or runtime errors. Actual button clicks verified close/cancel/Escape behavior, preset editing, symbol setup, roster search/corrections and D→DE cover suggestions. A v12.5→v12.6 service-worker update preserved state and reopened offline.

OCR: the first three rows of the supplied photo still match 90/90 labeled cells, with one Persian leave reading flagged for review. Names and the glare-covered area were not scored. This is one photo, not a general accuracy guarantee. Real iOS/Android keyboard behavior, enlarged-text accessibility, production update timing and offline OCR have not been verified.
