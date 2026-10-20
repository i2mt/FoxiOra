# FoxiOra v12.25 — verification

260 distinct automated checks pass. The full 259-check suite passed; the final focused availability/exchange run also passed after adding one workplace/date review regression and making conflict descriptions more specific. Generated bundles match source and app/service-worker syntax checks pass.

New availability coverage includes hour/day equivalence, half-hour searches, all-workplace and event exclusion, excluded-workplace known duties, uncertain cells overriding old confirmation markers, useful hourly shift changes, missing second-job rosters, return-duty overlaps, short rests, stale preview/save prevention, manual warnings and cancellation, booking revalidation/Undo, escaped names, invalid-form retention and review navigation to the correct workplace/date.

Focused Chromium browser checks passed with no JavaScript errors:

- One hours/days planner opens from Calendar and Today; the duplicate Calendar free-time calculator is absent.
- Duration-unit changes preserve the date/time. Saving a selected two-hour period and undoing it work.
- Optional shift-change search remains in that planner and includes return duties.
- A real preview cannot save after another workplace gains a conflicting shift. The alert and blocked result identify that workplace.
- Manual edits display conflict details before save and can be declined.
- 32 planner layout cases cover 320/390 px, Persian/English, Jalali/Gregorian, light/dark and 100%/200% text. No horizontal overflow; input controls retain 44 px minimum height.
- Tutorial controls remain interactive at both 390×844 and 320×568.
- Offline reload retains schedules and permits a new availability search.
- Forty closed Settings layouts cover 320×480, 320×568, 360×640, 390×844 and 844×390; Persian/English; light/dark; with/without an available-update action. At normal text size, the complete overview fits above navigation without scrolling. Support title and handle share a row.
- All five Settings groups expand to full width; closing restores the compact overview. At 200% text, content wraps and scrolls naturally. Preferences, workplace navigation, installation help and tutorial replay work.

Light/dark Settings, planner and conflict screens were visually inspected locally. QA screenshots are not included. Testing uses Chromium mobile viewports, not physical phones. A synthetic 100-colleague dataset took about 3 ms for confirmed availability and 877 ms for optional shift proposals in the test runtime; phone performance varies.

The planner and swaps can check only recorded obligations. Missing active-workplace data blocks verified availability; explicit workplace exclusions retain their existing missing-data semantics, while known saved duties always remain busy. Colleague identities are not inferred across workplaces from names. Manual entry warns before accepting conflicts, allowing the actual assigned roster to be recorded.

The changes-only ZIP is verified against v12.24: every changed repository file is included, unchanged assets/vendor files are omitted, and per-file old/new hashes are provided. No deletions are required. This patch has not been deployed.
