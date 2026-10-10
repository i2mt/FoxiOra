# Verification evidence — FoxiOra v12.17

`unit.log`: 213 passing automated checks. Run them with `npm ci` and `npm test`.

`hours-results.json` and `presence-results.json`: passing Chromium browser checks. Each suite exercises 32 phone layout combinations, interactive corrections and offline reload. Test data uses synthetic names and schedules.

To rerun the optional browser suites, install Playwright 1.51.1 separately (`npm install --no-save playwright@1.51.1`), install its Chromium browser (`npx playwright install chromium`), then run `node verification/hours-browser.cjs` and `node verification/presence-browser.cjs`. The scripts serve the app on local ports 8802/8803 and create screenshots/results beside themselves. Production runtime and normal unit tests do not require Playwright.

`v12.15-OCR-report.md`: preserved prior model benchmark and limitations. This release did not train or reevaluate OCR. Scanner model/license notices remain in `vendor/`.
