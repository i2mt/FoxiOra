# FoxiOra v12.19 — verification

## Changes

Full Persian weekday names in Today and month calendars, native Persian welcome/loading copy, an inline Calendar roster, simpler colleague controls and consistent FoxiOra display branding. Monthly hours, below-grid editing and visible trip access from v12.18 remain included.

## Automated checks

215 checks pass: the existing 213 plus behavior checks for separate Calendar/roster drafts and preserving unrelated restrictions when using the simplified shift selector. Rendering expectations reflect inline roster navigation and clearer preference wording. Other coverage includes scanner checksums, missing/unclear roster cells, accounting, save failures, edits, swaps, Undo, identity matching and escaped names/IDs.

Generated bundles match source. App, service worker and optional verification scripts pass syntax checks. Runtime assets and the trained OCR model are unchanged.

## Browser checks

Chromium in Asia/Tehran tested 32 combinations of 320/390 px, Persian/English, light/dark, 100%/200% text size and Gregorian/Jalali calendars. Calendar, Today and expanded colleague settings have no page-level horizontal overflow. Enlarged native date inputs wrap into full-width rows. Eight focused checks confirm full weekday labels are not clipped in Today or the month header at both text scales.

Interactive checks cover visible trip entry/search/return, grid/totals/editor order, monthly edit/save/Undo, all 121 hour-person choices, custom symbol rules and an offline reload. Clicking Table keeps the Calendar header/navigation active. Personal roster-cell corrections and Undo work in the inline view. Custom colleague chips remain editable after selecting just one or no symbols. Welcome continues to setup successfully; the page title is FoxiOra.

Screenshots are internal QA using synthetic names and schedules and are not included as deliverables. These are browser viewport checks, not physical-phone testing. No new OCR accuracy claim or deployment is made.
