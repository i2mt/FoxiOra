# FoxiOra v12.16 — design decisions

Presence belongs beside the roster, where date and shift context already exists. A small inline section answers **کیا شیفتن؟**; there is no separate feature page, main button, modal or navigation tab. Date headings are selectable, and the month date selector keeps the visible week aligned.

The same wording works for a nurse who is on duty, off, on leave or checking somebody else's shift. Staff with combined duties carry their actual code as a small badge. The lookup includes everyone in imported pages for the chosen workplace, even when roster search or shift-change preferences exclude them elsewhere.

Accepted names and uncertain entries have distinct visual groups. Every result is shown. Names wrap naturally; enlarged text or unusually large teams can scroll instead of shrinking. The result is a saved-schedule lookup, so missing evidence cannot become a confident absence or presence claim.

Date/shift selections are view state only. Existing cells remain directly editable. Saved corrections and Undo refresh the names automatically. There are no AI calls or new scanner dependencies; the feature runs locally from saved schedules.

The trained OCR model and v12.15 review/shift-change improvements remain intact. Table geometry, Persian names and more diverse independently labelled hospital examples remain the next OCR priorities.
