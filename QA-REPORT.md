# FoxiOra v12.21 — verification

230 distinct automated checks pass: 215 existing regression checks and 15 onboarding/import checks. The complete 227-test suite passed after implementation; the three additional import tests passed in the final 15-test import run. Build consistency and JavaScript syntax checks pass.

New coverage includes strict Gregorian/Jalali dates, invalid dates, month confirmation, Excel 1900/1904 serial dates, wide/long roster layouts, duplicate/conflicting entries, unknown symbols, UTF-8/UTF-16 Persian text, escaped file values, personal/colleague-only import, preserved colleague preferences, Undo, repeated import, failed-save rollback, tour isolation, preference persistence, and install-platform detection.

Chromium browser checks verified:

- Empty installation automatically opens the five real app views in the tour.
- Sample state never enters IndexedDB; selected theme settings persist after completion.
- Tour completion opens setup; replay and skip restore existing schedules and an unsaved file preview.
- Real XLSX, legacy XLS and CSV files import through the visible UI; repeated imports retain one colleague.
- CSV invalid dates remain invalid, Persian text is retained, and unknown shift symbols can be mapped.
- Excel import works after an offline reload, using the precached parser.
- A two-page PDF renders locally while offline and hands two PNG pages to the scanner boundary. This test isolates PDF rendering; OCR accuracy is covered by the existing scanner tests and still requires user review.
- 20 tour layout combinations at 320/390 px, light/dark themes, have no horizontal page overflow.
- No browser JavaScript errors.

QA screenshots were inspected locally and are not included in this package. Browser scripts and text results are in `verification/`. Actual iPhone/Android native installation was not performed; the device guidance follows the linked Apple/MDN documentation, and platform detection is unit-tested.

The service-worker activation check preserves the existing OCR cache while replacing older app-shell caches. The seven OCR vendor assets remain unchanged. The approved v12.20 artwork is retained unchanged. All new file readers are vendored, licensed and cached for offline use; PDF OCR still needs scanner preparation in Settings.
