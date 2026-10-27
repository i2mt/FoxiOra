# FoxiOra v12.38 verification

424 automated tests passed, zero failures. Generated bundles match source. app.js and sw.js syntax checks passed.

Eleven new tests cover import-stage transitions, durable photo crops/row/scope/correction/Undo checkpoints, file-row/mapping recovery without loading its reader, atomic successful save and checkpoint deletion, failed-save retention, explicit discard, tutorial isolation, visible storage failure, pending-draft/update protection, specific adjustment groups and gentle/reduced-motion editor navigation. Existing assertions were updated for the labelled import stages, direct swap controls and asynchronous draft deletion; no behavioral test was removed.

Chromium touch-browser checks passed 16 normal-text configurations: 320×548, 375×548, 430×800 and 667×375, each in Persian/English and light/dark themes. Checks include correction completion, actual horizontal and vertical roster scrolling with pinned name/date/corner coordinates, and page width for Today, swaps, planning, settings and workplaces. Selected Persian layouts were visually inspected.

Another eight checks passed at 150% and 200% root text size on 320×548 and 375×548, in Persian/English. Controls remained reachable by scrolling; pages did not overflow horizontally. This is browser text scaling, not a substitute for iOS Dynamic Type testing.

A separate browser journey closed the page, disabled the network, reopened the cached app and resumed a photo review without OCR. It verified original canvas dimensions/date mapping, selected row, confirmed correction, remaining-day focus and Undo. Saving opened the imported monthly calendar with month-specific feedback and deleted the checkpoint. The journey repeated offline for a file preview, retained its own-row selection and symbol mapping, imported into the correct month and undid the import. Date-editor travel used smooth scrolling normally and an immediate transition with reduced motion. No page errors occurred in the final journeys.

The OCR model and review threshold are unchanged. No real-nurse usability sessions, physical iPhone/Safari testing, new recognition accuracy rate, model retraining or deployment is claimed. USABILITY-TEST.md provides participant tasks, interruption/accessibility checks and a held-out real-phone confidence audit. Recovery requires a completed checkpoint and retained browser storage; it does not resume unfinished OCR computation or unconfirmed geometry edits.
