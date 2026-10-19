# FoxiOra installation and file import

## Quick intro

An empty first installation automatically opens a five-stop tour: Today, Calendar, the colleague lookup in the roster, Trip planning, and Settings. It uses a clearly marked sample schedule. Explore dates, colleague shifts, trip duration and theme controls. Skip is always available. Appearance choices carry over; sample shifts, names and events never enter the database. Completing the tour opens workplace setup. Existing users can replay it in Settings → آشنایی با برنامه.

## Install help

Settings → نصب FoxiOra, also available at the last intro stop, chooses instructions for the current phone/browser. It supports iPhone/iPad Share → Add to Home Screen, Android browser-menu installation, desktop Chrome/Edge installation, and Safari Add to Dock on macOS. Embedded browsers get an open-in-browser/copy-link path. A native install prompt is used when the browser supplies one, and only after a button click. HTTPS hosting is required for installation and offline service workers. Local development can use localhost. Install into the same browser/profile that holds your schedule; different browser installations have separate local data.

Installation references checked 2026-10-18:

- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing
- https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios

## Schedule files

Add schedule → Import file; during initial setup choose the file button beside photo import. The digital roster also has an import-colleague-file action. Files stay on-device.

Supported direct formats: XLSX, XLS, CSV, TSV. Either use a wide table (`Name,2026-10-01,2026-10-02`) or long table (`Name,Date,Shift`). Persian header equivalents are accepted. Full Gregorian and Jalali dates are supported. Day-number headers require year/month confirmation using the selected calendar. Ambiguous date formats and invalid calendar dates are blocked. Excel serial dates use the workbook's 1900/1904 date system. CSV text preserves dates without coercion; UTF-8, BOM-marked UTF-16, and Windows-1256 Persian text are supported.

Choose the worksheet if needed, then your row (or Colleagues only). Review dates, names and a compact preview. Map unfamiliar shift symbols before saving. Empty cells stay unknown. Duplicate names/IDs in wide tables, conflicting shifts, repeated date columns and ambiguous existing colleague matches prevent saving. Non-tabular files may require their header row to be selected or the hospital file to be rearranged using the in-app CSV template.

Saving updates imported dates only, retains colleague preferences, and supports Undo. A failed save restores the previous data and keeps the preview for retry. Maximum input is 25 MB, 2,500 rows and 400 columns per sheet. Imported formulas are never executed; cached values are used where available. This avoids OCR transcription errors for structured data but does not guarantee the source file or its interpretation is error-free.

PDFs with up to 12 pages are rendered locally into the existing scanner and photo-review workflow. They do not get the direct structured-data accuracy guarantee. Password-protected PDFs must be unlocked before import. Prepare the OCR scanner in Settings for offline PDF scanning. The Excel/CSV reader and PDF renderer themselves are cached with the app shell.

## Vendored readers

- SheetJS CE 0.20.3, Apache 2.0; https://docs.sheetjs.com/docs/getting-started/installation/standalone/
- PDF.js 4.10.38 legacy distribution, Apache 2.0, with bundled font/CMap notices; https://mozilla.github.io/pdf.js/examples/

PDF JavaScript evaluation and XFA are disabled. No file parser uses a remote CDN at runtime. Include the entire `vendor/file-import/` folder when updating hosting. The host must serve `.mjs` as JavaScript.
