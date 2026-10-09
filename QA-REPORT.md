# FoxiOra v12.13 verification

## Automated results

- 144 Node regression tests, including roster coverage, safe text/identifier rendering, imports/Undo, asset hashes, corrupt downloads and cache cleanup.
- Build consistency and JavaScript syntax checks.
- Browser layouts at 320, 360 and 390 CSS pixels; light/dark Fox and Persian/English flows. Monthly previews retain all workplaces, readable duty codes and distinctive today styling.
- 200% browser root text size across Today, Calendar, shift change, Settings and digital roster at 320 pixels, in both languages. No document horizontal overflow; navigation clearance grows with text size. Vertical scrolling increases at large text sizes.
- Actual close/cancel flows for everyday editors, workplace dialog and scan memory. Persistent and toast Undo, reload preservation, event editing, failed-save rollback and draft recovery.
- Existing reciprocal `D,N,-,- ↔ D,-,N,-` exchange, DE cover suggestions, colleague preferences and travel calculations remain covered.
- Real service-worker update from v12.11 to v12.13 preserved schedules/settings and worked offline. A cache-lifecycle regression additionally checks preservation of the verified OCR cache and removal of legacy shell caches.

## OCR and offline checks

The inherited local English vendor model failed gzip decompression. The intact English model now shipped is 2,952,873 compressed bytes; both shipped language models decompress and match the browser checksum manifest. No test substitutes a separate model directory for the release files.

Using the supplied roster photograph, the browser identified 23 name rows. Choosing the first row read all 30 dates with this expected sequence:

`N,-,E,M,E,-,E,N,-,D,E,D,E,-,N,-,D,E,-,E,D,N,-,E,E,D,E,-,N,-`

One M cell required review. Confirmation/import saved all 30 shifts. An interrupted worker returned to row selection and a retry succeeded.

A separate browser check prepared the scanner before loading Tesseract, then disconnected the browser, reloaded, selected the photograph and completed recognition, review and import offline. A deliberately damaged English model was rejected during preparation; restoring the correct server file allowed retry to complete. Assets are verified before the ready message.

## Limits and next field test

These are desktop Chromium checks with mobile-sized viewports, not physical iPhone/Android validation. OCR evidence covers one supplied photograph and its first selected nurse row; it does not establish broad accuracy across other rosters, lighting, handwriting or phone cameras.

Ask several nurses to perform these tasks on their own phones without coaching:

1. First setup, choose a photo and find their row; review a doubtful code and save.
2. Find today's shift and edit one changed duty; Undo it.
3. Find a reciprocal exchange and understand both resulting schedules.
4. Prepare the scanner online, switch off connectivity and import a new photograph.
5. Increase system/browser text size and check readability and reachable controls.

Record time, wrong selections, requests for help, OCR corrections and whether users correctly distinguish unknown, off, leave and public holidays. Prioritize repeated blockers from this evidence.

Recorded browser JSON and screenshots are included in `verification/`.
