# FoxiOra v12.23 — verification

242 existing automated checks pass. Generated bundles match their editable sources; app and service-worker syntax checks pass.

Focused Chromium browser checks passed with no JavaScript errors:

- A fresh empty installation automatically opens the tutorial. Skipping persists, suppresses it after reload, and Settings replay still works.
- The revised sample instruction is parenthesized as requested. The live sample swap still produces suggestions.
- Theme buttons appear physically left to right as Fox, Hedo, Forest, Siren in Persian and English. Theme selection saves.
- The support card has the requested Persian label, links to Telegram, and retains the exact Latin handle @i_2MT.
- Calendar has exactly two mode controls, Month and Roster. Trip planning sits on a separate row, opens its planner, and does not squeeze either mode label.
- Legacy Week/List modes fall back to Month. Day selection and its editing controls remain available.
- 24 Settings and 48 Calendar/Roster layout cases cover 320, 390 and 430 px, Persian/English, light/dark, and 100%/200% base text size. No horizontal page overflow; mode labels are not clipped and the trip target is at least 44 px high.
- Reloading offline preserves schedules and the new Calendar layout without reopening the completed intro.

Calendar, theme and support screenshots were inspected locally. Screenshots are not included in the patch. Testing used a desktop Chromium mobile viewport, not physical phone hardware. This release retains the previously verified manual update and install-prompt behavior. Schedules, OCR readers, approved artwork and storage formats are unchanged.

The changes-only ZIP is verified against v12.22: every changed repository file is included, unchanged assets/vendor files are omitted, and per-file old/new hashes are listed in PATCH-MANIFEST.json. No repository files need deleting.
