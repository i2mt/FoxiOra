# FoxiOra v12.18 — verification

The month grid precedes monthly hours and selected-day controls. Shift editing opens beneath the selected day, and trip planning is reachable directly beside the calendar view controls. Repeated instructional paragraphs were trimmed across planning, hours, roster, swaps, scanning and settings.

## Automated checks

All 213 existing checks pass. Calendar placement expectations and cache-upgrade fixtures were updated for the requested arrangement and v12.18. Coverage includes accounting, edits, swaps, Undo, retained drafts, failed saves, scan review, imported-text escaping and verified OCR asset checksums. Generated bundles match source; app and service-worker syntax checks pass.

## Browser checks

Chromium in Asia/Tehran tested 32 combinations of 320/390 px, Persian/English, light/dark, 100%/200% text size and Gregorian/Jalali calendars. No page-level horizontal overflow or page errors occurred. The visible trip shortcut opens the planner with one click, search runs, and Back returns to Calendar. The grid is above totals and selected-day controls. Tapping a date, opening its editor, saving an N correction and Undo update both data and the displayed hours. The editor is mounted below the selected date.

The suite also checks expanded breakdowns, 121 person choices (self + 120 synthetic colleagues), custom symbol-rule saves and an offline reload with unchanged totals. The normal 390 × 844 view fits the whole month grid; selected-day details and larger text can scroll vertically.

## Scope

This is a layout and copy update. No OCR models, training data, accounting factors or swap/trip eligibility rules changed. The seven scanner assets are included unchanged. The preserved v12.15 OCR report describes model limits. Browser viewport checks are not physical-phone testing. No deployment was performed. Screenshots use synthetic names and schedules.
