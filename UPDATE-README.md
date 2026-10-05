# FoxiOra v12.4 update

1. Export a backup in Settings → Backup & data (پشتیبان و اطلاعات).
2. Extract this ZIP. Upload these six files to the existing repository root, replacing the same filenames:
   app.js, style.css, index.html, sw.js, calendar-data.js, ocr-memory.js.
3. Keep all existing vendor files, fonts, OCR assets, manifest and icons. This is an update, not a complete standalone app.
4. Commit together, wait for deployment, open online, then close and reopen. Settings → Backup & data shows v12.4.
5. Do not clear site data. Existing schedules and correction memory remain in the same database.

Changes: three bottom tabs; Settings in the header; scan/manual entry under Add schedule; compact Today with nearest free time; secondary settings and colleague controls in expandable sections; smaller calendar rows; paged OCR review starts with uncertain cells and supports all dates; long swap lists expand; English palette names Fox, Siren, Forest, Hedo (purple).

The review still supports every existing shift code. Confirming an uncertain symbol advances the filtered review as that item leaves the uncertain list. Show all dates to revisit any item. Estimated dates keep every date in review. Import confirmation safeguards remain.

Verification: 25 automated regression tests pass. Small-phone visual appearance, keyboard behavior, real-device performance and offline installation/update are not verified. Compact layouts reduce scrolling but do not guarantee an entire screen fits for long names, accessibility text sizes or custom code lists. No new OCR accuracy claims are made by this update.

QA-REPORT.md and tests are documentation/development files; do not upload them for hosting.
