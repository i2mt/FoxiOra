# FoxiOra v12.13 design decisions

Keep the existing calm visual direction. This pass reduces noise and improves reliability rather than adding another main page.

**Calendar:** an empty visual cell outside imported coverage does not mean off. The detail view and free-time engine preserve unknown status. Each workplace has independent coverage; the default calendar continues to combine their shifts. Larger weekday labels and neutral shift cells keep accent color focused on today and selected dates.

**Undo:** Today keeps the header simpler. Immediately after an edit, the confirmation offers Undo. A persistent action remains where schedules are edited and in Settings.

**Scanner:** offline preparation belongs beside scan memory, in Settings. It is explicit so installing the app does not require downloading all OCR assets. Readiness means all six exact assets have been validated and saved locally, not merely requested successfully. Browser storage may be cleared or evicted; check readiness again before going offline.

**Text size:** useful secondary text is generally at least 12 px at default browser settings. Small decorative markers remain smaller. Relative typography supports larger browser text. At 200% text size, vertical scrolling is appropriate; text is not shrunk to force it into one screen. Calendars, tabs and navigation adapt within the viewport.

**What to learn next:** observe nurses importing several real rosters on their phones; record unclear symbols and corrections. Address repeated failures from that evidence before introducing new scanner modes or wider feature scope. Any future scanner asset change must update the embedded checksum manifest and be tested with the exact shipped files.
