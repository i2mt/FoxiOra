# FoxiOra v12.8 manual update

Cumulative update for the existing FoxiOra repository. Includes v12.7's OCR crash fix, retry, larger calendar labels, guided setup and FoxiMed fox vector.

## Install

1. Export a backup from Settings → Backup & data.
2. Replace these **nine files together** at the repository root: `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, `icon.svg`.
3. Keep the existing `vendor/` folder, fonts and OCR models.
4. Commit the files, open the deployed app online, then close and reopen it. Settings should show **v12.8**. Saved schedules and settings use the same database identity.

Only the nine app files are needed for hosting. Reports, tests, package files, preview and verification results are for review. This package does not publish anything automatically.

## Reciprocal shift changes

Select your shift in Shift swap. The app finds two distinct options:

- **Someone takes your shift:** you have no return shift. The colleague is off, or can add your shift to an allowed combination such as E → DE. A specific request draft can be prepared and copied; nothing is sent automatically.
- **You exchange two shifts:** the colleague takes yours on one date, and you take theirs on another. Preview both resulting schedules, then choose “توافق کردیم · ثبت تعویض” after arranging agreement. Both local rosters are updated together.

Your example is supported:

| Person | Original | After exchanging the N shifts |
| --- | --- | --- |
| You | D, N, −, − | D, −, N, − |
| Colleague | D, −, N, − | D, N, −, − |

Directly taking your N without giving up the next N is rejected under the day-off rule. The reciprocal move is accepted because both resulting night shifts are followed by an off roster date.

### Rules

- One-for-one exchanges use the same canonical shift code at the same workplace, on different dates within 31 calendar days. Return dates must be today or later. Both receiving dates must have an explicitly recorded, reviewed off symbol. A blank cell is not off.
- The resulting schedules for both people are checked together. Night recovery, overlaps and the configured minimum break are checked. Your other workplaces and overlapping personal events are considered too.
- A full night is an N code or a working segment that continues into the next day after midnight. Aliases and custom overnight codes work. The default short `n` ending at 24:00 remains distinct from full `N`.
- By default, the **next roster date after a night duty must be off**. This matches the supplied overnight N convention: N is written on its start date and ends the following morning; the following roster date has no new duty. It does not mean another 24-hour period starting from the night shift's end.
- Settings → Workplaces → edit workplace → Other workplace options has “یک روز تعطیل پس از شیفت شب”. It defaults on for existing and new workplaces and can be changed for a hospital with another rule. Leave remains distinct from an explicit off day.
- Missing or unreviewed dates needed to validate an exchange are excluded, with an explanation under roster review. Daytime direct-cover cards retain neighboring-shift information and disclose missing context; they do not certify an unknown previous day.
- Multi-shift common cover is checked as a combined change. Two nights on consecutive roster dates are not approved merely because each would be possible individually.
- Preview is read-only. Saving rechecks the live roster, so a later edit cannot be overwritten by a stale proposal. The two own entries retain their IDs, their times are updated, and the colleague's two stored cells change. The last 50 local exchanges retain before/after data in backups.

## Simpler results

Results use explicit “they take / you take” lines with dates and codes. Filters show All, Reciprocal, and Cover. Reciprocal choices come first. Combined cover appears within the cover group instead of another competing section. Nearby-shift detail, unavailable options and incomplete-data explanations stay collapsed. More than three choices expand on demand. Each proposal is an individual exchange; several selected shifts do not imply simultaneous reciprocal swaps.

The main selector and Find button fit above navigation for the tested five-row month at 320×568. Longer lists, six-row months and multiple workplaces can still scroll. Preview dates use short month/day headings with full dates available as accessible labels, while the two exchanged dates are shown in full above the table.

## Loading and friendlier wording

Startup now keeps the fox visible for roughly two seconds after JavaScript starts, with slower fill transitions, then fades away. OCR loading still follows real scan progress. Reduced-motion preferences disable transitions. The loading slogan and first setup welcome, workplace step, photo step and resume text have been rewritten in warmer Persian.

A legacy global `.off` style is now scoped to the weekly timeline. Off markers no longer stretch across an exchange dialog and intercept Cancel; they also stay in place in calendars and digital tables.

## Retained features

The OCR empty-reading fix and retry without reupload remain included. A real supplied-photo scan still reaches name selection, review and import. Larger neutral calendar labels, settings switches and readable Fox dark styling, Fox / Siren / Forest / Hedo palettes, Mohammad Mahdi Taghavi credit, Telegram contact, digital roster, quick editing, continuous free-time windows and the earlier trip planner remain included.

The trip planner retains its existing one-shift-cover logic; it does not yet optimize travel using reciprocal return shifts. Reciprocal proposals are currently in Shift swap. Same-workplace DE / EN / En handovers are not double booking; cross-workplace overlaps remain detectable.

## Validation

See `QA-REPORT.md` and `verification/`. Run regression tests with `npm ci` followed by `npm test` on a supported Node installation. Browser screenshots are seeded demonstration data. Only local Chromium was tested; hospital agreement and the actual shared roster remain outside this app.
