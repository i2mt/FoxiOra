# FoxiOra v12.31 — names-column selection

The names-column picker previously searched only intervals between detected vertical lines. When the date grid was detected but the outside border of the names area was missing, tapping that area returned no interval and left the selection unchanged. This failure reproduced on both sides of a table.

The picker now covers the full photo, including areas before the first and after the last detected line. Automatic name-column candidates also consider those outside areas. A selected-column crop preview makes the result visible before reading. Optional native edge sliders allow selection across false internal lines or part of a merged column without relying on line detection. Slider updates preserve the active control rather than rebuilding the page during adjustment.

Accepting a column preserves each page's date mapping and row-selection flow. A selected names area outside the date grid does not consume a date cell. Switching pages now uses that page's progress photo. A successful column correction clears a previous failure message.

This fixes column geometry and selection; it does not promise perfect OCR labels. Unreadable labels remain available through their photo rows. No new model, paid API, dependency or vendor download is introduced. Existing offline scanner assets remain valid.

Apply over v12.30. Copy only repo-files contents into the repository root, preserving subfolders. Generated app.js/style.css are included. No deletions. Prepared for manual upload; not deployed.
