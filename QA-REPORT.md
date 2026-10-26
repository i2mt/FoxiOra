# FoxiOra v12.36 verification

406 automated tests passed with zero failures. Build consistency and app/service-worker syntax checks passed.

The regression suite covers saved shifts, imports, duplicate protection, Undo, OCR, grid geometry, month navigation, shift swapping, settings, onboarding and update behavior. Six new recovery tests exercise cancellation with late results, timeout without saved-roster mutation, non-table rejection before OCR, straightening controls outside collapsed details, direct date editing with preserved drafts, save-and-select-another-date, and inert tutorial previews with restoration.

Chromium checks cover eight screen/language configurations (320×548, 375×548, 430×800 and 667×375; Persian and English), all seven tutorial steps: 56 step layouts. Next remains visible, portrait instructions do not overlap the preview, page width stays within the viewport, and finishing restores interaction. A Persian phone layout was visually inspected. Browser checks also cover actual blank-image grid detection in a Web Worker, failure-to-straightening recovery, cancellation, and saving a calendar edit followed by opening another date. No browser page errors were observed.

These checks use Chromium emulation, not physical iPhone/Safari. No new whole-roster accuracy benchmark was conducted. Existing perspective-correction geometry tests remain in place; automatic curved-paper correction is not implemented. Private photos and QA screenshots are excluded from this patch. No deployment was performed.
