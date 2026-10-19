# FoxiOra artwork

All production PNGs come unchanged from the corrected user-supplied `FoxiOra-Depth-Asset-Pack (2).zip`. Installation uses the recommended white PNGs and supplied maskable exports. Light in-app marks use the transparent depth PNG; dark marks use dark-transparent artwork with shaded white ears/nose and a dark centre.

`icon.svg` and `fox-mark.svg` are appearance-preserving SVG containers embedding the supplied 512 px production PNG once. They are not claimed to be pure vector. The genuine vector masters remain available in the user’s original pack; no simplified-gradient redraw is used.

The orange-only mask is copied from the supplied progress SVG. The app uses the production PNGs and the same clockwise reveal geometry, avoiding repeated megabytes of inline embedded images. Ears, face and symmetrical white tip stay visible. Progress updates drive the reveal; reduced-motion mode shows complete artwork. App Light/Dark/System modes select matching marks. Offline caching includes both variants.

The earlier FoxiMed silhouette is replaced. Existing schedules, OCR weights and verified scanner cache are preserved. No new AI artwork was generated.

## Schedule file readers (v12.21)

SheetJS CE 0.20.3 is vendored at `vendor/file-import/xlsx.full.min.js`, with its Apache 2.0 license beside it. PDF.js 4.10.38 legacy modules, worker, CMaps and standard fonts are in `vendor/file-import/pdf/`. Apache, Foxit and Liberation notices are retained in that folder. These readers run locally and are precached for offline use. Source URLs and supported formats are in INSTALLATION-NOTES.md.
