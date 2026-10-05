# FoxiOra v12.2 — verification notes

## v12.2 supplied-photo verification

The rerun against IMG_6179.jpeg scored the first three rows (90 cells): **86/90 correct**, **21/21 D**, **23/26 off-day dashes**. Four errors were all empty predictions and all flagged for review: row 1/day 4 (leave), row 1/day 23 (off), row 1/day 28 (off), row 3/day 25 (off). Seven cells were flagged in total. Table detection found 23 rows and did not guess dates. This is a known-photo development benchmark, not full-sheet or independent accuracy validation. Persian names and the glare-covered center were not scored.

The new fix rejects a spurious appended table dash such as E- unless explicitly defined as a custom workplace code. Colleague scans retain uncertainty for guessed dates, unreadable cells, and preserved older values. Cover suggestions exclude uncertain availability and account for previous-night overlaps. Persian working-together wording and small-screen wrapping/input styles were adjusted.

All **19 regression tests pass** in Asia/Tehran. The installed QA dependencies were supplied through NODE_PATH. Syntax and whitespace checks pass. Tests exercise DOM rendering, not visual browser layout. A local headless browser launch failed because its Chromium executable is unavailable; phone layout, device performance, and real service-worker update/offline lifecycle remain unverified. Nothing has been pushed or deployed.

### Next priorities

1. Verify Today, Scan review, Team, themes, and Persian/Latin text on a real phone, then test update/reopen/offline behavior without clearing saved data.
2. Add photo-quality guidance for glare, missing table edges and insufficient resolution, plus a close-up retake flow. A second OCR engine cannot reconstruct obscured characters reliably.
3. Make uncertain cells and colleague dates easier to review beside enlarged source crops; keep unknown separate from off.
4. Test on independent roster photos and manually checked Persian names before claiming general learning accuracy. Current correction-memory evidence establishes exact-repeat recall only.
5. Optional later: backup reminders and an explicit offline-OCR readiness indicator.

## Earlier v12.1 preview benchmark

Ground truth: 90 manually transcribed shift cells in the first three rows of the 1331 × 896 preview of the user-supplied photo. Includes 21 `D` cells, 26 off-day dashes, and one Persian `م` interpreted as leave (`M`, consistent with the existing app mapping). Names and cells covered by the central glare were not scored.

The original app was taken from commit `614ebbbded86a45b81341ede1faa8c3bcf6a7aae`. Both runs used Tesseract.js 6.0.1, the repository's English and Persian trained-data files, and the real table/header/row detection code. The harness used Node canvas for image operations, not a mobile browser. English worker initialization matched the app's single-line mode. Correction memory was empty for every benchmark.

| Run | Correct cells | Correct D | Correct off |
|---|---:|---:|---:|
| Original app, original photo | 62/90 (68.9%) | 14/21 | 7/26 |
| Updated app, original photo | 87/90 (96.7%) | 20/21 | 25/26 |
| Updated app, Gaussian blur 0.65 px | 87/90 (96.7%) | 21/21 | 24/26 |
| Updated app, 75% width and height | 73/90 (81.1%) | 10/21 | 22/26 |
| Updated app, 50% width and height | 55/90 (61.1%) | 7/21 | 10/26 |

On the final original-photo run, all three remaining errors were flagged for review: first-row day 4 (`م`), first-row day 30 (`-`), and second-row day 29 (`D`). No wrong result escaped the review rules in the final tested variants. At half resolution the header dates were guessed, and every cell was marked for review.

These are development results on one known photo, not a promised general accuracy rate. Variants were generated with Lanczos downsampling and Pillow GaussianBlur, not additional independent camera photos. The same image guided implementation changes; more unseen rosters, fonts, names, camera angles, glare patterns, and phones are required to estimate real-world accuracy. The severe-glare region has intentionally not been assigned invented ground truth.

The result supports staged recognition and review. It does not establish that adding a second OCR vendor would guarantee better results, nor does it validate Persian-name accuracy. Memory matching is conservative and workplace-scoped; ambiguous matches abstain.

## Correction-memory follow-up

Three wrong cells in the original-photo result were manually corrected and saved. The memory was serialized, then loaded into fresh app contexts before recognition.

| Scan with saved corrections | Correct cells | Before saved corrections |
|---|---:|---:|
| Same original photo | 90/90 | 87/90 |
| Gaussian blur 0.65 px | 87/90 | 87/90 |
| 75% width and height | 73/90 | 73/90 |

The exact repeat demonstrates saved-example recall. No improvement was measured for the altered versions; the matcher deliberately abstains when appearance changes too much. These are not independent validation data, and future-month accuracy or name-learning accuracy has not been established.

Version 12.1 also preserves explicit `OFF` codes when filtering false dash readings. The original-photo benchmark was rerun after this compatibility fix and remained 87/90 without correction memory, with all three errors flagged.

## Automated checks

16 regression tests passed under Node.js in the Asia/Tehran timezone. Coverage includes Persian durations, day/month/year formatting, Jalali/Gregorian month boundaries, overnight shifts, weekend/holiday behavior, case-sensitive N/n, remembered names and glyphs, backup round-trips, old-state defaults, faint dashes, blank-cell review, off-day false positives, small-photo crop margins, and free-time exclusion of shifts/events.

Additional checks verify explicit `OFF` recognition, import preservation of unrelated and blank-covered shifts, no mutation after cancelled or invalid imports, and persistence of schedules and correction memory through IndexedDB into a fresh app context. IndexedDB was exercised using fake-indexeddb; this does not replace real-browser lifecycle testing.

All six main views rendered in the DOM in Persian and English. JavaScript syntax checks and `git diff --check` passed. The service worker is now syntactically valid. Browser/mobile appearance, service-worker lifecycle in a real browser, and performance on a phone remain unverified because the live browser preview stalled.

## Holiday provenance

The 1405 holiday date data were checked against the University of Tehran Calendar Center's published calendar, using its publicly readable text mirror when the primary PDF endpoint could not be fetched. Only holiday names and date facts are included.

- Official source: https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf
- Text mirror: https://www.scribd.com/document/990789768/Calendar-1405

No lunar dates are extrapolated to other years. Unexpected local closures and subsequently announced calendar amendments are not included.
