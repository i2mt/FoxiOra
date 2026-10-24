# FoxiOra v12.31 → v12.32

Replace the files in this patch over v12.31. app.js and style.css are already built. No file deletions, deployment or database migration is required.

- Person selection uses photographed name rows and neutral row numbers. Automatic name OCR and guessed name suggestions are removed. Manual naming remains available.
- Corrections stay in one editor with a larger photo crop, one-line pending-date queue, automatic next unclear date, Skip and Undo. The month overview keeps every day editable.
- Date checks happen before corrections when the date layout is uncertain. Later date adjustment preserves human confirmations by physical photo column.
- Smaller strokes survive extraction; off-mark detection separates small DN from thin marks. Strong symbol readings can be checked on a cleaned crop when raw segmentation fails. Weak suggestions stay pending, genuine blanks stay unknown, and only human corrections teach example memory.
- Colleagues without entered names receive neutral editable labels beside their name-photo crops.

All 356 automated checks passed. Sixteen browser layout/touch cases passed, including stable page position during corrections. On the supplied photo, pending results fell from 168 to 66 across 690 date cells in a controlled comparison. See QA-REPORT.md for the test scope and remaining limits.

This release retains the existing free local engines. It does not include a newly trained model. The approximately 20-photo dataset requested for that work has not yet been recovered; two actual roster photos are currently available.
