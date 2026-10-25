# FoxiOra v12.35 verification

400 automated tests pass with zero failures: the previous 386 tests and fourteen new identity/calendar tests. Build consistency and app/service-worker syntax checks pass.

New tests cover photographed identities across suggestions, previews, roster and hours choices; neutral request greetings; manual names with crop/ID retention and Undo; canceling rename without losing an open preview; photo comparison/merge targets; safe escaping of imported IDs, names and image URLs; legacy generated-number handling; confirmed numeric names; complete month weeks and visible off duties; future/workplace selection restrictions; selections across month navigation; six-week Jalali months; explicit duplicate merges retaining a confirmed name and both source histories with Undo.

Existing monthly-hours tests now assert photo-choice person IDs rather than native-select options. The dynamic-ID merge test targets the explicit merge action. The roster-search fixture uses an actual text name because generated placeholder numbers are deliberately no longer searchable. Service-worker checks cover v12.35 and old-cache cleanup. Other existing test assertions remain in place.

Chromium touch/layout checks pass across 320×548, 375×548, 430×800 and 667×375, in Persian/English and light/dark: sixteen configurations. Two additional Persian Jalali light/dark configurations verify a six-week month. They cover work-shift selection, multiple shifts, month browsing, individual removal, result cards, exchange preview, in-place name editing while retaining the same draft, named/unnamed request drafts, preference and merge choices, and no horizontal page overflow. Offline calendar selection passes. No browser page errors were observed. A Persian 375 px calendar screenshot was visually reviewed privately.

These are local Chromium checks, not physical iPhone/Safari tests. Rendering cannot repair an incorrectly selected source row or an unclear original crop. No general name OCR is enabled by this release. The symbol recognizer, saved shift validation, multi-workplace conflicts and repeated-import safeguards remain active. No model retraining or recognition-accuracy claim is part of this UI update.

No deployment was performed. The patch excludes original photos, private name crops, browser screenshots, node_modules and research data.
