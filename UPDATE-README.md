# FoxiOra v12.12 manual update

Cumulative update. Replace the same nine hosting files together. No deployment or repository push is performed.

## Install

1. Export a backup from Settings → اطلاعات و پشتیبان.
2. Replace `app.js`, `style.css`, `index.html`, `sw.js`, `calendar-data.js`, `ocr-memory.js`, `manifest.json`, `fox-mark.svg`, and `icon.svg` at your existing repository root.
3. Keep your existing `vendor/` folder, fonts and OCR models.
4. Reopen the app online. Settings should show **v12.12**. The existing database identity is retained.

Only these nine files are needed for hosting. The source, tests, reports and preview are included for review/development.

## Clear status and calendar

Missing/unreviewed dates show **؟** rather than looking like off. Explicit hospital off symbols, مرخصی and استعلاجی remain separate. Today shows the saved roster horizon. An active workplace with no roster blocks free-time/travel suggestions; it can be excluded through its existing workplace setting.

The monthly view defaults to **همهٔ محل‌های کار** and has a workplace filter. Numbered workplace markers retain combined visibility. Tap a date to reveal its details within the calendar; the detail heading clears the sticky header. Fold it to return to the compact grid. Full details no longer load below every month by default. Official occasions never determine a person's duty status.

## Everyday editing and continuity

Tap a personal event to edit its title, type, start/end dates and times. Multi-day trips keep their duration and record identity. Deletion is a separate action. Changes are undoable.

An unfinished inline tool remains in its original page when you navigate. A **پیش‌نویس ذخیره نشده** shortcut returns you to it. Values and folded state survive re-renders. Each page/subview has at most one draft; opening a different editor in that same view replaces the old one. Save/Cancel clears that draft. Drafts last during the current open session, not a reload or browser close.

Routine actions stay within their page. Detailed workplace/symbol and OCR-memory configuration retain focused dialogs. Escape folds a focused inline editor. Requests are drafts for the user to copy/send; the app sends nothing.

## Colleague controls and clearer results

Quick presets: **منعطف، فقط D، فقط E، بدون ترکیبی، کنار گذاشته**. D/E presets appear only when those workplace symbols are recognized. Detailed controls are under **تنظیمات بیشتر**:

- Accepted complete duty codes; D permission alone never permits DE.
- No combined duty and maximum actual duty duration.
- Available weekdays.
- An inclusive temporary exclusion period. Limits outside that period remain as configured.
- Explicit identity linking when OCR has read an existing colleague's name differently.

Linking keeps the chosen existing record's preferences, combines dates and remembers name aliases. New scanned cells take priority on overlapping dates; unreviewed status is preserved. This is undoable. Automatic matching requires a unique normalized name/alias; ambiguous names are never silently merged. Name correction also remembers the previous name.

Observed single-code patterns remain suggestions by default; automatic filtering is opt-in. Manual rules take priority. The app does not infer health, age, skills or willingness from a roster.

Shift-change choices are grouped by colleague within their type. Every eligible option is rendered; there are no show-more caps. Repeated warnings of the same type are grouped. Large result lists remain scrollable.

## Smarter travel planning

The planner now includes supported reciprocal same-code exchanges as well as direct cover. It removes the outgoing shift AND includes the return shift when measuring the new continuous break. Shared matching checks recovery, configured breaks, preferences, other workplaces and personal plans. Each suggestion names the return date and leads to the exchange preview. Nothing is changed until the user confirms agreement.

Matching/window calculations are reused within a search to avoid duplicate work. Searches still cover at most 60 days within saved roster coverage; this is single-shift optimization, not a multi-person or multi-shift optimizer.

## OCR review and durable saving

Preset codes, **خالی**, and **علامت دیگر** are visually separate. Empty cells are never automatically treated as off. Imports retain the review cells until storage succeeds. Failed schedule/event/preference writes restore the prior data/history and retain the editor for retry; success feedback follows transaction completion. Settings, first setup, backup restore and Undo handle failed writes too.

The supplied photo still passes all 30 expected dates, including retry after an interrupted worker. The recognition engine is unchanged: this release does not claim higher accuracy across other hospital formats or unseen photos.

## Development

`src/` contains ordered JavaScript and CSS sections. Run `python3 build.py` (or `npm run build`) to generate `app.js` and `style.css`. `python3 build.py --check` verifies that bundles match source. No additional hosting files or build dependency is required. Shared browser globals are retained for compatibility.

124 identical superseded CSS declarations were removed; conditional rules, differing declarations and fallbacks were preserved. Six viewport comparisons were pixel-identical before/after this cleanup. Run `npm ci` and `npm test` for the 132 Node tests. Browser evidence and screenshots are in `verification/`.
