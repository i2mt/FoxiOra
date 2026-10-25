# FoxiOra v12.34 → v12.35

Apply this patch over v12.34. The generated app.js and style.css are included. No deployment has been performed.

Shift suggestions now use the original cropped name from the roster instead of a generated colleague number or an unconfirmed name guess. The same identity appears in exchange and handover previews, request recipients, common-cover summaries, review/conflict options, colleague preferences, comparison and merge selectors, roster cells, shift presence and monthly-hours person choices. Tap the photo/pencil to enter a clean name. The source crop and colleague ID stay saved; Undo restores the previous name. Request drafts use a neutral greeting until a name is supplied. Legacy generated numbers are hidden without changing person IDs or schedules. Text names imported from files and human-confirmed names remain visible.

The shift-change calendar now has a complete month grid with full weekday labels, today/weekend/holiday marks, saved work and off symbols, clear selection borders and a separate selected-shifts area. Only future saved work shifts can be selected. Browse months without losing the selection, remove a selected duty, clear the selection, or enable several shifts. The optional list view remains available. Rename dialogs preserve the open swap preview.

All 400 automated tests pass. Chromium touch checks pass in sixteen screen configurations and two Jalali configurations, including 320 px width. Offline selection passes. These checks are browser emulation, not physical iPhone/Safari testing. The shift recognizer and duplicate-import safeguards are unchanged. Source photos, private name crops and QA screenshots are not included.
