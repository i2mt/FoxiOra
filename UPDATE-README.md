# FoxiOra v12.38 → v12.39

Apply over v12.38. Built app.js and style.css are included. No deployment was performed.

The roster's frozen names and date headers use small independent paint layers. The old momentum-scroller declaration and isolated rounded clipping on the scroll region were removed. Both scroll axes, pinned headers, original name crops, compact row heights and rename-position restoration remain available. The check now explicitly scrolls the outer page before touching the roster, rather than checking only internal table scrolling.

The colleague-limits page no longer creates every person's full controls and duplicate-name picker on entry. Each person's controls load when opened, and duplicate choices load when that specific identity section is opened. Identity sections have unique restoration keys so opening one cannot expand all the others after a save. This removes the quadratic duplication of photo pickers on large rosters. Existing rules, manual choices, original identity photos, saved schedules and Undo remain intact.

Malformed old availability dates show a repair prompt instead of being passed to date formatting and crashing the page. Opening the page does not silently change those saved restrictions. Re-enter or clear an invalid range explicitly. Legacy non-text roster values are safely rejected by shift parsing rather than throwing during display.

Verification is described in QA-REPORT.md. Chromium checks passed, including a 180-colleague manager. The exact disappearance reported on the user's phone was not reproduced on a physical iPhone here; this release hardens its pinned-cell rendering and needs confirmation on that device.
