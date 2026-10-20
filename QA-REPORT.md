# FoxiOra v12.26 — verification

Focused automated checks: 40 passed (34 preferences/tutorial/install/update checks, one service-worker cache activation check, and five startup checks). Startup tests cover status updates before paint, two empty frames, complete visible-time filling, background/resume timing, cleanup after removal, and parsing the entire generated bundle. App and worker syntax checks and generated-bundle consistency passed.

Chromium checks cover fast light/dark startup, delayed artwork, delayed saved-state restoration, initially hidden startup, hiding during the fill, reduced motion, failed artwork and storage failure/retry. Visibility transitions are simulated through the document visibility API. The normal sweep contains empty, early, middle and complete frames and lasts at least 1.1 seconds between its first colored frame and completion. Reduced-motion mode has no partial-fill frames. An offline reload from the installed service-worker cache also opens successfully without JavaScript errors.

Settings passed 20 viewport/language/theme cases: 320×480, 360×640, 390×844, 600×400 and 1024×768, each in Persian/English and light/dark. Every menu, support, tutorial, install and available-update action occupies its own row at full width. No horizontal page overflow. Appearance opens by clicking its summary. The Persian light layout was visually inspected. Short screens intentionally scroll rather than compressing actions into columns.

The patch overlay is checked byte-for-byte against the v12.26 release; base and replacement SHA-256 values are included in PATCH-MANIFEST.json. No vendor/artwork changes or deletions. Chromium coverage is local; physical iOS/Android devices were not tested in this update.
