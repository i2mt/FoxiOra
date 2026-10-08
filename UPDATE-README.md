# FoxiOra v12.11 manual update

Cumulative update for the existing FoxiOra app. No deployment is performed by this package.

## Install

1. Export a backup from Settings → Backup & data.
2. Replace these **nine files together** at the repository root: `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, `icon.svg`.
3. Keep your existing `vendor/` folder, fonts and OCR models.
4. Commit the files, open the deployed app online, then close and reopen it. Settings should show **v12.11**. Schedules and settings retain the same database identity.

Only the nine app files are needed for hosting. Reports, tests, package files and previews are for review.

## v12.11: colleague-specific suggestions

Open Shift change → **همکاران**, or use “تنظیمات همکاران” from results or the digital roster. There are still three main navigation destinations. Search names, expand a colleague and set:

- **در پیشنهادها باشد**: switch off to exclude the colleague from cover, reciprocal exchanges and trip-cover suggestions.
- **شیفت‌های قابل‌قبول**: select complete duties such as D, E or DE. D alone does not authorize adding D to an existing E to make DE.
- **بدون شیفت ترکیبی**: reject combinations for that person.
- **حداکثر مدت شیفت**: limit the actual resulting duty duration, using the workplace's configured times and merging handover overlaps.

A reviewed D-only or E-only roster can show an observed-pattern card with its date range and evidence count. “فقط همین شیفت‌ها” confirms that pattern as explicit accepted shifts. Detection is recalculated from saved cells; unreadable or uncertain cells are excluded. A pattern needs at least 20 reviewed dates and eight duties, all of one atomic working code, in a bounded window near the requested date. It does not infer age, health, seniority, skills or willingness.

**Automatic filtering starts off.** “فیلتر خودکار الگوهای روشن” enables it for that workplace. Confirmed/manual choices take priority. “همه” in accepted shifts explicitly ignores automatic pattern filtering while preserving independent length/combination limits. “برنامهٔ منعطف” clears the manual limits and ignores automatic patterns for that colleague. The ignore-pattern switch can re-enable pattern use when there is no explicit accepted-shift list.

Excluded colleagues stay in the digital roster and remain editable. Suggestions explain preference-related exclusions separately. Preferences persist across reopening, backups and matched colleague-roster updates; they are specific to the colleague record and workplace. They are undoable. Automatic heuristics are not proof of eligibility; use explicit colleague preferences where known.

## v12.11: everyday tools within the page

Routine shift edits keep the date, workplace and deletion controls under “مشخصات شیفت”, so preset keys and Save remain easy to reach.

Manual shift edits, colleague-cell edits, name corrections, exchange previews, request drafts, personal events, trip booking and the add-schedule choice now expand within the current page. The background remains usable, and the navigation remains available. The tools can be folded and resumed without discarding a draft. Same-page re-renders preserve their fields. Save/cancel removes the tool; navigating to another destination discards an unsaved draft. Only one inline tool is open at a time. Escape folds it when focus is inside.

Detailed workplace/symbol configuration and OCR-memory management remain focused dialogs; their Close/Cancel/Escape behavior is retained. Native deletion confirmations remain confirmations. Scanning and travel planning remain dedicated pages because they are longer workflows. Comparison now lives under a foldable section in **همکاران**, alongside the preferences rather than as another top-level tab.

Editors are placed beside the relevant schedule or proposal, or outside a folded section so they stay visible. Undo keeps selected shift IDs that still exist and clears stale calculated results. Inline forms and long lists may require scrolling; they do not cover the page with a backdrop.

## Clearer language and simpler results

Personal roster statuses are **off، مرخصی، استعلاجی**. Public holidays are separate calendar information and never imply that a person is off. Existing off-code labels are normalized; hospital symbols and aliases remain configurable. Blank or unreadable roster cells are still unknown, not off.

The selection instruction is “شیفت یا شیفت‌های مورد نظر خود برای تعویض را انتخاب کنید.” Proposal cards and previews use “برنامهٔ شما” and “برنامهٔ همکار”, with your outcome first. Direct cover keeps “off میشی”. Repeated rule-success notes and implementation explanations have been removed from results; useful reasons remain when someone cannot be suggested. Night recovery, overlaps and minimum-break validation remain active.

Scan selection, roster correction, colleague import, request drafts and trip copy are shorter. Personal-event fields now have visible labels. All eligible shift-change and trip results remain visible without show-more controls. Longer lists scroll normally.

## One calendar for all workplaces

Every shift from every workplace appears in the month cell. A small numbered color marker matches the workplace key above the grid; the number also distinguishes workplaces without relying on color. There is no two-shift cap or hidden extra-shift counter. Selecting a day shows its full shift details and occasion names.

Neutral backgrounds and strong codes remain. Five- and six-row single-workplace months fit the tested 320×568 viewport. Multiple-workplace months grow vertically to keep every code legible; those months and selected-day details may require scrolling.

## National and religious occasions

The calendar includes selected national, cultural, religious and health-profession occasions, including Nurse Day and Physician Day. Public holidays have a separate tag in the selected-day detail. Occasions do not change schedules or free-time calculations.

Religious dates are explicitly mapped for **1405 only**, using the University of Tehran Calendar Center's official calendar. No lunar dates are guessed for later years. Fixed solar occasions recur by Jalali date; international health occasions recur by Gregorian date. This is a selected occasion set, not every observance in the official calendar.

Source: https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf/64228cbb-f4de-dc32-4d2b-57db3c8e322f?t=1761972997587

## Undo

After a saved change, use “برگرداندن” in the feedback message, the header undo button, or Settings → Backup & data. Undo remains available after reopening the app.

Up to 20 recent changes are retained, with an overall size limit that may discard older records sooner for large imports. Supported changes include manual shift edits/deletions, saved exchanges (both rosters together), roster imports, colleague corrections, workplace changes, and personal events/trips. Related scan learning is restored when undoing an import or colleague-name correction. Ordinary edits use small field patches instead of duplicating stored roster photos.

Undo preserves unrelated settings. It refuses to overwrite data that no longer matches the recorded change. There is no redo. It does not reconstruct a history for changes made before this release. Clear-all-data and backup restoration are not undo operations; export a backup before using them.

## Retained behavior

- Reciprocal N swaps support D,N,−,− versus D,−,N,−, checking both resulting schedules.
- Same-workplace DE/EN/En combinations are allowed; cross-workplace conflicts remain detectable.
- Direct cover can include E → DE where configured; reciprocal swaps remain one-for-one within the existing date/code rules.
- Guided setup, original-photo import/retry, editable code meanings, digital roster, continuous free-time windows, FoxiMed fox loading animation, Fox/Siren/Forest/Hedo themes, developer credit/contact and version indicator remain included.
- The trip planner still evaluates one-way cover; it does not optimize reciprocal return shifts for travel.

## Verification

111 regression tests passed. Real Chromium checks covered the three phone sizes, light/dark modes, dialog closing, full result visibility, multiple workplaces, undo through clicks and reloads, upgrade and offline shell. The supplied-photo scan imported all 30 expected dates, including recovery after a simulated OCR-worker failure. No new OCR accuracy benchmark is claimed.

See `QA-REPORT.md` and `verification/`. Run `npm ci` then `npm test` on a supported Node installation. Browser screenshots use demonstration data. Real iOS/Android devices, enlarged system text and offline OCR-model availability were not tested.
