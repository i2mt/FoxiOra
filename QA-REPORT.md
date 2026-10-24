# FoxiOra v12.32 verification

## Release scope

Photo-based person selection, stable shift correction and stronger use of the existing recognition engines. No new neural model has been trained or shipped. No external OCR API, API key, paid service or new runtime dependency is introduced. The existing scanner models remain unchanged.

## Automated checks

The complete npm test suite passed: 356 tests, zero failures. Thirteen new correction tests cover mounted controls, executable updated click handlers, advancing through pending dates, skipping, completion and Undo, preserved original evidence, no premature roster/memory writes, checking uncertain dates before reading, preserving confirmations by physical photo column during date correction, isolation between people's rows, small-DN versus dash extraction, cleaned-crop validation, tentative specialist labels and blank-cell abstention. Names tests now explicitly require no name OCR or guessed labels.

Generated bundles match source. app.js and sw.js syntax checks pass.

## Supplied photo comparison

The actual bundled workers processed the user's latest 810×1080 photo in v12.31 and v12.32 using the same row and date-column mapping. This comparison uses 23 photographed rows and 30 valid dates (690 cells); the unused day-31 column is excluded. The benchmark sets the correct date-column mapping explicitly to isolate symbol recognition from layout.

Pending cells fell from 168 to 66. There were 102 newly resolved cells: 80 off marks, 18 D, 3 M and 1 E. No formerly clear cell became pending in this run. All 122 changed symbol/status crops were visually inspected; this includes tentative readings that remain pending. This is a one-photo regression comparison, not a general accuracy percentage. Unchanged confident outputs were not all independently labelled, so these results do not establish perfect overall correctness. OCR confidence is not a calibrated probability.

A separate complete UI flow on the same photo used the visible Aban 1405 month: all 23 name-photo rows were retained, with no guessed names; the date mapping was detected correctly for that month; the chosen second person's row produced 30 dates in order and 3 pending cells. Corrections and Undo worked, and review opened at the page top. Different reading order/worker state may produce different pending counts, so this single-row result is separate from the all-row comparison above.

## Synthetic controls

Thirty-two generated cells exercised D, Persian م, -, N, E, DN, unsupported O and empty cells in normal, small, faint and grid-border conditions. D/N/E/DN and off marks were read correctly in these fixtures. The small DN that previously became an off mark now remains DN. Unsupported O and actual empty cells remained unknown. Three Persian م variants proposed M for human confirmation; the smallest remained unknown. Persian readings still need review in many cases.

## Correction UI

Sixteen Chromium touch-emulation cases passed: 320×548, 375×548, 430×800 and 667×375, each in Persian/English and light/dark. Controls stay mounted and visible taps do not change page scroll or editor position. Automatic advance, final completion, direct DN editing, Undo, reachable Save and no horizontal page overflow were checked. Editing and Undo also worked with the browser offline. These are browser emulation checks, not tests on physical iPhones or Safari.

The single-line pending queue keeps a constant area as dates are resolved. All days remain available in the overview. Blank cells stay unknown unless the user explicitly defines their meaning. Name rows are selected from photographs; names can be entered manually. Colleague imports use editable neutral labels and name-photo crops.

Original roster photos, employee names, private crops, QA screenshots, browser binaries, local analysis scripts and downloaded unrelated candidate images are excluded from the update package.

## Dedicated recognizer dataset

Two distinct actual roster photos have currently been recovered: IMG_6179.jpeg and the latest 9b2d17bb-5426-4d87-a64f-1db8009b5d51.JPG. The set of approximately 20 photos mentioned by the user has not been located. A multi-photo model comparison/training run is pending recovery or upload of that dataset. Neither the current release nor this report claims that such a model has been trained.
