# FoxiOra v12.8 verification

## Reciprocal scenario

The supplied D,N,−,− versus D,−,N,− case produces one reciprocal proposal. Simple direct N cover is excluded because the colleague would then have consecutive nights. The accepted exchange yields:

- Own schedule: D,−,N,−.
- Colleague: D,N,−,−.

Both rosters retain an off date after each resulting N. Preview is read-only; saving updates exactly two own entries and two colleague cells. Other own dates, entry IDs and other colleagues remain unchanged. Local reload preserves the result. A stale preview after a manual edit is rejected before any update.

## Automated coverage

- **67 regression tests passed**: 45 retained tests plus 22 exchange/rule tests. New cases cover the exact scenario, save/preview behavior, next-day working shifts without a time overlap, previous-night recovery, missing and unreviewed cells, combined multi-date changes, aliases/custom overnight codes, short n versus N, rule override, other workplaces, personal events, stale proposals, same-code restrictions, month/year boundaries and local request preparation.
- **18 exchange-result layout checks**: All/Cover/Reciprocal in light/dark mode at 320×568, 360×640 and 390×844. No horizontal page overflow, no content outside the viewport, and no runtime errors. The four-day preview fits the 320-pixel phone width without table scrolling.
- Actual clicks verified preview Close, Cancel and Escape; saving both rosters; persisted reload; stale-proposal rejection; local request draft; English display; and workplace night-rule editing.
- A CSS collision between the weekly `.off` overlay and shift-marker `.off` was found by actual Cancel clicks and fixed by scoping the weekly selector. Off markers in the preview now have static positioning and cannot cover the buttons.
- The five-row monthly picker and Find action fit above fixed navigation at 320×568. Longer months and expanded result lists may still scroll.
- **30 retained main-view checks**: Today, Calendar, Shift swap, Settings, Digital roster in light/dark mode at the three phone sizes. No horizontal page overflow or runtime errors. Existing preset editing, hospital aliases, roster search/edit/full month, D→DE cover and nine earlier dialog types passed.
- **v12.7 → v12.8 upgrade** preserved saved state. Settings switch/theme, shift edit, cover, four-day trip suggestion, two-day trip booking and offline app-shell reopening passed.
- First setup, manual entry, resume without duplicate workplace, and photo-button visibility at all three sizes passed. The new startup screen remained present after 550 ms; startup-to-removal was measured around 2.5 seconds in local Chromium. The fill midpoint and real OCR progress attributes were also checked.

## OCR regression

The OCR recognizer file is byte-identical to v12.7. A new real-browser run with supplied IMG_6179.jpeg completed guided setup, photo reading, a 23-name picker, the first-row 30-date review, simulated worker interruption and recovery, manual confirmation, and import of all 30 shifts. All 30 codes matched the expected row. One Persian leave cell remained flagged before confirmation. No runtime errors.

The earlier v12.7 three-row 90/90 result is retained as prior evidence, not claimed as a new v12.8 benchmark. Names and glare-covered areas were not scored.

## Scope

Same-code exchanges within 31 days are searched. No different-code trades, chains involving three people, automatic approval, or external roster synchronization are implemented. Reciprocal return shifts are not yet incorporated into trip optimization. Request drafts are not sent automatically. Colleague shifts at other workplaces are unknown unless included in their stored roster; only the user's saved other workplaces are checked.

Real iOS/Android devices, enlarged text, production update timing and offline OCR models were not tested. The cached app shell reopening offline does not establish offline model availability. No deployment or repository push was performed.
