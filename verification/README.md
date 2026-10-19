# Verification — FoxiOra v12.20

`unit.log`: 215 passing checks. Run `npm ci`, then `npm test` (sequential to bound canvas memory).

`brand-results.json`: light/dark depth artwork, clockwise progress snapshots and direction checks, reduced motion, eight phone/text combinations, scanner progress, system/manual appearance, and offline brand-asset reload.

`asset-results.json`: exact production-file mapping, opaque white app icons and maskable safe-area checks.

To rerun optional browser verification, install Playwright separately (`npm install --no-save playwright`), install Chromium (`npx playwright install chromium`), then run `node verification/brand-browser.cjs`. It uses local port 8810 and writes internal QA images/results beside itself. Screenshots are not release deliverables.

Other browser scripts and version-prefixed JSON files retain historical evidence and were not rerun for this artwork update. `v12.15-OCR-report.md` retains the original model benchmark; no new training or OCR accuracy measurement was performed.
