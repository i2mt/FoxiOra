# FoxiOra v12.22 — verification

242 distinct automated checks pass. The full 240-test suite passed after implementation. The final 27-test onboarding/import/refinement run also passed after adding month-boundary navigation and focused Settings cases, and adjusting the welcome's short-screen bounds. Build consistency and JavaScript syntax checks pass.

New coverage verifies settings action order, Latin version labels, all seven tour stops, designer credit, natural Persian lookup wording, sample swap suggestions/preview/execution, isolated demo state, broader personalization, install snooze/never/installed behavior, failed preference saves, explicit update approval, no automatic controller-change reload, draft protection, worker activation messages and month-boundary sample dates.

Chromium 138 browser checks passed with no JavaScript errors:

- Large startup logo (265.1875 px at 390 px viewport).
- Animated branded welcome, seven live app stops and an interactive sample reciprocal swap, without sample writes to IndexedDB.
- Settings actions below all settings groups, with Latin version labels.
- Startup installation offer and persistent Never preference.
- A real service-worker update from v12.22 to a simulated v12.23 waits, shows its version, can be deferred and only restarts on approval.
- A second open tab retains its current version until its own restart approval.
- Unsaved import data prevents restarting.
- Existing preferences survive an offline reload; declined installation prompts stay hidden.
- 49 responsive tour views: 320×568, 390×844 and 844×390 in light/dark modes, plus 320 px at 200% base font size. No horizontal page overflow; normal-size panels stay inside the viewport.
- Reduced-motion mode disables intro animations.

Settled welcome, Settings and swap-preview screens were visually inspected. QA screenshots remain local and are not part of the update. Existing OCR, import readers and approved depth artwork are unchanged. Native installation on a physical iPhone/Android device was not performed; device detection and guide logic are covered by the existing tests and linked primary documentation.

The old v12.21 client cannot show UI that it did not contain. Its first transition to this release requires closing all app windows once after the worker downloads. New workers no longer force activation or a page reload. Later updates use the new controlled flow.
