# FoxiOra v12.27 — verification

75 distinct focused automated checks passed across preferences, tutorial/import, refinements, availability, startup and service-worker activation. They include sample-data isolation, preserved preferences and draft handling, returning to Today after completion, closing sample settings when skipping, and opening setup for an empty first-time account. A final 19-check refinement/startup run and worker activation check passed. Generated bundles match source; app and service-worker syntax checks pass.

Chromium mobile checks:

- 24 planner layouts: 320×480, 375×548, 375×667, 390×844, 667×320 and 1024×768, with Persian/English and Jalali/Gregorian. No horizontal overflow; every input and selector stays inside the card, keeps at least 44 px height and 16 px text.
- 16 expanded-settings layouts across narrow portrait and landscape, both languages and light/dark. Action text is smaller than group titles; selectors fit their cards.
- All six live tutorial steps across five viewport sizes, two languages and two themes. 120 initial step checks plus nine swap/planner/settings interaction checks passed. Guide and content rectangles do not overlap; highlighted controls are visible within the app pane; guide navigation stays on screen.
- Additional SE-sized checks covered calendar selection, rotation while a tutorial is active, theme/language changes, 200% text and working controls after rerender. The focused extension passed 42 step checks, eight planner layouts and four settings layouts.
- Support title/Telegram row passed 16 width/language/theme cases after its final styling change.
- A sample swap was previewed and completed by tapping the actual controls. Planner time entry survived searching. Completion returned to Today and reopening Settings showed no expanded sample groups. No JavaScript errors.

The SE-sized 375×548 guide, normal planner and expanded Settings were visually inspected. The 375×667 screen size was also checked. These are Chromium viewport simulations; physical iPhone/Safari rendering and the iOS keyboard were not directly tested.

Changes-only archive integrity and a virtual overlay onto v12.26 are checked against every resulting repository file. Per-file base/replacement SHA-256 values are included in the patch manifest. No artwork, vendor assets or dependencies changed.
