# FoxiOra v12.26 — changes-only update from v12.25

The launch logo now stays empty while the saved app and artwork become ready. Its clockwise color fill starts after two visible animation frames, runs for approximately 1.2 seconds, then briefly holds before revealing the app. Hidden-tab time does not consume the animation. Reduced-motion mode shows the complete mark without the sweep. Missing artwork has a bounded fallback, and startup errors retain the retry action.

Settings uses one full-width button per row at every viewport size, including landscape and desktop. Tutorial, install and available-update actions also have their own rows. Menu spacing and text are more comfortable. Short screens scroll naturally. The support row, footer order, title highlighting and approved artwork remain.

Apply the accompanying patch to v12.25. Only files inside `repo-files` belong in the repository. Copy those contents into the repository root and preserve their `src` and `tests` folders. Do not upload the wrapper directory or the patch manifest. No repository files need deletion. Build outputs are included; no build step is needed for manual hosting.

Existing installations keep the user-controlled update prompt. The app does not automatically restart when this version becomes available.

Validation details are in QA-REPORT.md. Not deployed by this package.
