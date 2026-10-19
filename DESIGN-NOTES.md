# FoxiOra v12.20 — depth artwork integration

Use the production artwork recommended in the corrected user-supplied pack. Installed icons retain the white background. In-app marks use the light transparent or dark-transparent depth PNG so they sit naturally on the current surface. The dark mark keeps both its outside and centre dark, making the white ears and nose visible. The approved orange shading and symmetrical white tip are preserved.

A shared theme variable selects artwork for the welcome card, setup, settings footer, startup and scan progress. Light/Dark/System choices continue to work. The startup canvas also follows the selected appearance.

The supplied loader’s orange-only geometry is reused as a small SVG mask. Layered production PNGs retain the real image shading while the colour reveal starts at 12 o’clock and moves clockwise. Progress remains tied to existing startup/scanner values; reduced motion shows the finished artwork. This avoids duplicating megabytes of embedded image data in every rendered loader.

PWA, Apple touch, favicon and maskable assets are supplied production exports. Compatibility SVG paths embed the same production images. Brand assets are cached offline along with the app shell. Database identity, saved schedules and OCR weights remain unchanged.
