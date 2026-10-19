# FoxiOra v12.24 — verification

46 existing focused checks pass: 34 preferences/refinement checks and 12 UI/service-worker checks. Generated bundles match source, and app/service-worker syntax checks pass.

Chromium browser checks verified 64 Settings layout combinations: 320/390 px widths, Persian/English, light/dark mode, all four color themes, and 100%/200% text size. There is no horizontal page overflow.

Verified behavior:

- Support card immediately precedes tutorial/install actions; the footer follows those actions.
- Footer is stacked as logo and FoxiOra, Latin v12.24, and the designer/developer credit with the exact name Mohammad Mahdi Taghavi.
- Telegram label, destination and Latin @i_2MT are retained.
- Clicking an expanded section colors the title with the theme's readable accent and applies a subtle tinted background.
- Theme selection still saves and keeps the section expanded.
- Offline reload retains preferences and the new order, with no browser JavaScript errors.

Light/dark Settings screenshots were inspected locally and are not included in the patch. Browser checks use Chromium mobile viewports, not physical phones. No new OCR, calendar, import or schedule-storage behavior is introduced.

The changes-only patch is verified against v12.23 and contains every changed repository file. Unchanged artwork, fonts, models and vendor files are omitted. No deletions are required.
