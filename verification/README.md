# Verification — FoxiOra v12.18

`unit.log`: 213 passing automated checks. Run `npm ci`, then `npm test`.

`layout-results.json`: this release’s passing Chromium checks, including calendar order, visible trip access, edit/save/Undo, 32 layout combinations, colleague totals, custom rules and offline reload. Screenshots use synthetic schedules.

To rerun the optional browser check, install Playwright 1.51.1 (`npm install --no-save playwright@1.51.1`), install Chromium (`npx playwright install chromium`), and run `node verification/layout-browser.cjs`. It serves the app on port 8803 and writes its screenshots and results here. Runtime and unit tests do not require Playwright.

`hours-browser.cjs`, `presence-browser.cjs` and `v12.17-*-results.json` preserve previous-release browser evidence; those older results were not rerun in v12.18. Run browser scripts individually so their local servers do not conflict.

`v12.15-OCR-report.md` preserves the prior model benchmark and limitations. No new OCR accuracy claim is made. Scanner notices remain in `vendor/`.
