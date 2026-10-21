# FoxiOra v12.28 — scanner reliability update from v12.27

The scanner now locates a consistent date sequence across several possible header rows and independently validates candidate names columns with sampled name text. It no longer picks a column solely by which table edge it occupies. Shift codes, row numbers and table headings are rejected as OCR name suggestions. Ambiguous names columns open a visual column choice instead of automatically choosing a nurse.

Weaker row borders are recovered when supported by the table spacing. Irregular row heights are retained. When a separator or the lower borders are absent, independent name/shift ink can recover otherwise missing rows. Every detected name-photo row is built before name recognition, so an OCR failure cannot truncate the available list.

Names are read with the script suggested by the sampled text, with a grayscale/binary retry. A single general OCR worker switches languages rather than maintaining separate English and Persian workers for layout and names. Header recognition is reused after orientation selection, and decoded source bitmaps are released after resizing. The existing trained shift-symbol recognizer and conservative uncertainty review remain.

The row picker shows the photo alongside each label. If needed, users can correct the names column or choose their name directly from the full photo, including below the automatically detected rows. That fallback reads the selected row and does not divert the user into importing colleagues. Correcting an existing row does not duplicate it. Date confirmation previews the actual detected header, and date mappings remain separate between pages. Visual selection drafts block an approved-update restart until the user finishes or closes them.

No API key, paid OCR service or new dependency is used. Photos stay on the device. The scanner works offline after its existing initial scanner download. No new vendor/model assets are required by this patch.

The controlled tests reproduce and fix missing rows and a title/header mix-up. Name OCR is still imperfect; the full photo remains available when a label cannot be read. The exact failing phone/photo combination has not yet been supplied for validation. See QA-REPORT.md for measured results and limits.

Apply after v12.27. Copy only the contents of `repo-files` into the repository root, preserving subfolders. Generated app.js and style.css are included. No deletions. This package is prepared for manual upload and has not been deployed.
