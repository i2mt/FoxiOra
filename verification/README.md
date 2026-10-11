# Verification — FoxiOra v12.19

`unit.log`: 215 passing checks. Run `npm ci`, then `npm test`.

`layout-results.json`: 32 current layout combinations, inline roster navigation, shift selector interactions, hours/rules/save/Undo and offline persistence.

`interaction-results.json`: eight focused weekday-clipping checks, personal corrections/Undo in the inline roster, welcome-to-setup navigation and FoxiOra title.

Optional browser verification: install Playwright 1.51.1 (`npm install --no-save playwright@1.51.1`), install Chromium (`npx playwright install chromium`), then run `node verification/layout-browser.cjs` and `node verification/interaction-browser.cjs` individually. They serve ports 8804/8805 and generate internal QA screenshots and results. Browser screenshots are not release deliverables; all example identities are synthetic. Runtime and normal unit tests do not require Playwright.

`v12.17-*-results.json`, `v12.18-layout-results.json`, `hours-browser.cjs` and `presence-browser.cjs` retain historical evidence; these older scripts were not rerun for v12.19.

`v12.15-OCR-report.md` retains the original model benchmark and limitations. No model retraining or new accuracy assessment occurred.
