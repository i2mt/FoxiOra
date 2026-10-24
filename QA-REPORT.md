# FoxiOra v12.31 verification

## Reproduction

In v12.30, with photo width 1000 and detected vertical lines [200,400,600,800], taps at x=50 and x=950 both left the selection at [400,600]. Those taps were outside the detected grid but inside the original photo. The new picker selects [0,200] and [800,1000], respectively.

## Automated checks

All 343 checks passed in the complete npm test suite. scanner-layout.cjs now has 36 tests, including 13 additions for this release: missing left/right borders; image-versus-frame coordinate mapping; joining falsely split columns without re-rendering; clamped non-crossing edges; automatic outside-grid candidates; free selection without inner borders; sorted/unique/in-bounds candidates; preserved separate page/date mappings; not masking dates for an outside names area; visible crop preview and labelled native sliders; selected-page progress photos; and clearing stale failure messages.

Generated bundles match source, and app.js/sw.js syntax checks pass.

## Browser and OCR checks

The actual bundled OCR workers processed two generated Persian roster images with 6 people and 31 dates. One has names on the right with its outside vertical border omitted; the other has names on the left with the same omission and dates in the opposite direction. Automatic detection chose the names area in both, with all 6 photo rows retained. Automatic OCR labels were usable for 5 of 6 names in each generated image; the unreadable name remained a photo row. These fixtures do not establish real-world name-reading accuracy.

Actual touch events selected the names area beyond the detected lines on either side. Applying the selection retained 6 selectable rows. Reading a selected row on the right-side fixture produced 31 distinct dates; selecting names did not shift or remove the date columns. Precise controls changed both edges and updated a valid crop preview.

16 viewport/language/theme combinations passed: 320×548, 375×548, 430×800 and 667×375, each in Persian/English and light/dark. No horizontal page overflow, no page errors, and both native sliders and the confirmation action remained usable. With the browser offline and the previous OCR worker terminated, accepting the column started a fresh worker using cached scanner assets and retained all 6 photo rows.

These are Chromium mobile/touch emulation checks, not tests on the two reported physical phones. The user's original failing image was not supplied in this turn; its exact layout has not been verified. OCR models are unchanged. QA screenshots, generated images, browser runtime and automation scripts are excluded from the repository patch.
