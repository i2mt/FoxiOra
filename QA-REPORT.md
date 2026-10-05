# v12.5 verification

## Regression and browser checks

32/32 regression tests pass, TZ=Asia/Tehran. Coverage includes existing OCR/parser safeguards, bilingual views, calendar boundaries, persistence, switches, shift editing, continuous free periods, trip proposals and unknown/uncertain/multiple-workplace exclusions.

Chromium rendered 320×568, 360×640 and 390×844 viewports. No horizontal overflow or page errors were found in tested views. In the tested fixtures, Today and the initial shift picker fit above bottom navigation at 320×568. Expanded settings, long lists and secondary trip alternatives intentionally scroll.

Browser interactions passed: changing time format while retaining the open section; theme selection; shift editing without duplicate records; finding cover candidates; finding a four-day break through a proposed one-shift handover; booking a two-day trip and marking its calendar dates; retaining data through a v12.4 → v12.5 service-worker update; and reopening the saved app shell offline. English/dark settings were also checked for horizontal overflow.

## OCR benchmark

The same first 90 labelled cells were scored before/after, using the original uploaded photo and generated variants. No correction-memory training was added for these runs.

| Input | v12.4 | v12.5 | Results flagged for review in v12.5 |
|---|---:|---:|---:|
| Original 2048×1378 photo | 86/90 | 90/90 | 1 |
| 75% dimensions | 85/90 | 88/90 | 7 |
| Gaussian blur radius 0.7 | 84/90 | 90/90 | 3 |

Original: all 21 D cells and all 26 off-day cells matched. The Persian leave-marker suggestion matches but remains uncertain and requires review. Both errors in the resized image remain flagged. Names and glare-covered cells were not scored. Results on transformed copies of the same roster do not establish generalization to unseen schedules.

## Limits

This is controlled Chromium/Node verification. Actual phone keyboard behavior, enlarged text, production hosting updates, offline OCR and battery/performance under long scans require device verification.

Trip suggestions are conditional one-shift handovers, not completed reciprocal swaps. Missing/unreviewed days are blocked, results stop at roster coverage, personal events and all included workplaces are considered, and suggested colleagues must meet the configured minimum break according to the saved data. A returned shift inside the break would invalidate it.
