# FoxiOra v12.7 verification

## Major OCR failure

Before: the actual browser scan found 23 names, then failed after selecting a row with `parsed?.every is not a function`. The failure was reproduced against v12.6 using the supplied photo.

After: fresh setup → photo → 23-row name picker → first-row selection → 30-date review → manual confirmation of the marked leave cell → 30 imported shifts. All first-row codes matched the expected labels. No runtime errors. The selected name was saved when the optional name field was empty.

An injected worker interruption returned to the same picker, retained the photo, saved no partial shifts, and successfully recreated the worker and read the row on retry. A separate regression verifies optional Persian-model failure yields an uncertain blank instead of aborting or inventing off days.

## Automated checks

- 45/45 Node regression tests passed, including empty OCR readings, optional-model failure, failed-row recovery, first setup, existing off/alias handling, case sensitivity, overnight duties, conflict rules, trips and roster corrections.
- 30 main-view/theme/viewport checks in Chromium: Today, Calendar, Shift swap, Settings, Digital roster; light and dark at 320×568, 360×640 and 390×844. No horizontal page overflow or runtime errors.
- First setup at those three viewport sizes: workspace → photo directly; returning home and resuming creates no duplicate workspace. Photo actions remain above bottom navigation at every size. The optional name field is collapsed during guided setup.
- Manual first-shift entry finishes setup. Existing schedules retain the normal home screen.
- Fox mask midpoint and OCR progress updates were checked in the browser. Both the fill and ARIA progress values update together.
- Nine dialog types were closed through actual close/cancel clicks and native Escape: entry choice, workplace, new shift, existing shift, event, trip, colleague name, OCR memory, colleague cell.
- Existing preset editing, hospital aliases, roster search/edit/full month and D→DE colleague cover passed.
- v12.6 → v12.7 service-worker upgrade retained saved state. Settings switch/theme changes, shift edit, cover result, four-day trip suggestion, two-day trip booking and reopening the cached app shell offline passed.

## OCR sample benchmark

First three rows of supplied `IMG_6179.jpeg`: **90/90 checked cells matched**, including 21/21 D and 26/26 off cells. One Persian leave reading remained flagged for review. Layout found 23 rows and read dates without guessing.

This is one previously supplied hospital roster. Names, glare-covered areas and arbitrary hospitals were not scored. The browser checks use local copies of the existing OCR engines and validated English/Persian models; vendor assets are not replaced by this update.

## Scope and limits

Preview calendar data is a seeded demonstration. The static loading preview shows a known midpoint of the actual CSS mask effect. Calendar shift codes are larger; the full month for one workplace fits above navigation at 320×568. Details below it can require scrolling. Multiple workplaces, six-row months, larger system text and long lists can also require scrolling.

Real-device OCR performance, iOS/Android keyboards, enlarged-text accessibility, production deployment timing and offline OCR were not tested. Offline-shell reopening does not establish offline model availability. No deployment or repository push was performed.
