# FoxiOra v12.33 verification

368 automated app tests pass. The twelve added model tests cover independent PyTorch/JavaScript numerical parity, unsupported/empty features, malformed models, file checksums, exact human examples, blank handling, low-resolution caution, untrained codes, independent agreement, disagreement, rejection, optional-model failure, symbol-only export and the user-confirmed ND equivalence. Generated bundles and app/service-worker syntax checks pass.

The user-provided archive contains 30 image files, including 11 HEIC originals. 1,680 manually labelled symbol/rejection candidates were prepared. Fifteen photos / 840 crops train the models; five / 280 calibrate them; ten / 560 are held out for comparison. Potential page variants are grouped conservatively. See MODEL-CARD.md for counts, methods and limits.

Custom CNN and MLP networks were trained from scratch with PyTorch on CPU, alongside an SVM comparator. The existing hybrid OCR and larger official Tesseract best English/Persian models were tested on the same held-out candidates. The deployed CNN has 38,760 parameters and a roughly 203 KiB JSON weight file. No proprietary API or paid hosted model is used.

PyTorch and JavaScript inference agreed on all nonempty feature comparisons, with maximum probability difference under 0.00001. Empty features abstain. Model predictions were not saved as human training examples during scanning (the integrated replay left personal glyph memory empty).

The guarded integrated replay accepted 242 assignments with 5 wrong accepted assignments, compared with 242 / 7 in v12.32. These include deliberately sampled non-shift/rejection candidates; this is not a complete-roster accuracy figure. The model's raw correct-code count was 405/417 legible held-out examples, also distinct from automatic assignment accuracy. New unmatched proposals remain pending.

Sixteen Chromium touch/layout cases passed: 320×548, 375×548, 430×800 and 667×375 in Persian/English and light/dark. No horizontal page overflow; correction controls stay mounted and retain page position; Undo and Save remain reachable. Offline correction also passes.

The offline scanner preparation verifies eight assets, including the new network. With the browser offline and the model removed from memory, a fresh load from verified cache inferred D correctly. A browser download of confirmed-symbol examples succeeded and excluded the test user's name, colleague name, workplace identities and preview images.

A full scan/review flow on the previously supplied 810×1080 roster retained all 23 photographed name rows without guessed labels. The chosen second person's row produced 30 ordered dates with no pending cells in this run; corrections and Undo worked. This one-row result is a regression example, not a broad reliability claim.

These are Chromium emulation/CPU tests, not physical iPhone/Safari tests. Perspective, curvature and segmentation remain limitations. Different hospitals, additional fonts and rare/untrained codes need more data. No deployment was performed. Original photos, private crops, browser screenshots and research datasets are excluded from the repository patch.
