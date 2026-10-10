# FoxiOra v12.18 — design decisions

The month grid comes first. Monthly hours and selected-day controls sit beneath it; tapping a date reveals that area without moving the grid above or below an expanding editor. The editor mounts beneath the selected day, preserving unfinished edits across navigation. A separate trip shortcut stays visible next to the calendar view controls. A neutral, compact summary keeps actual presence and بهره‌وری distinct; a disclosure gives the arithmetic without adding a navigation tab or popup. The roster uses the same visual style with a person selector for any imported colleague. Both totals derive from live records so editing, swaps and Undo stay consistent. Unknown cells and unsupported calendar years remain visible as incomplete/estimated results.

Presence belongs beside the roster, where date and shift context already exists. A small inline section answers **کیا شیفتن؟**; there is no separate feature page, main button, modal or navigation tab. Date headings are selectable, and the month date selector keeps the visible week aligned.

The same wording works for a nurse who is on duty, off, on leave or checking somebody else's shift. Staff with combined duties carry their actual code as a small badge. The lookup includes everyone in imported pages for the chosen workplace, even when roster search or shift-change preferences exclude them elsewhere.

Accepted names and uncertain entries have distinct visual groups. Every result is shown. Names wrap naturally; enlarged text or unusually large teams can scroll instead of shrinking. The result is a saved-schedule lookup, so missing evidence cannot become a confident absence or presence claim.

Date/shift selections are view state only. Existing cells remain directly editable. Saved corrections and Undo refresh the names automatically. There are no AI calls or new scanner dependencies; the feature runs locally from saved schedules.

The trained OCR model and v12.15 review/shift-change improvements remain intact. Table geometry, Persian names and more diverse independently labelled hospital examples remain the next OCR priorities.

Repeated tutorials, calculation prose and duplicated swap subtitles have been removed from routine screens. Labels, actual values, incomplete/estimated results, recovery messages and the short instructions needed for date/photo alignment remain. Accounting and scan confidence logic are unchanged.
