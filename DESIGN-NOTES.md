# FoxiOra v12.19 — design decisions

Full weekday names use two lines where necessary instead of abbreviations. This preserves legibility in seven columns while allowing enlarged text to grow. Welcome copy uses short, natural Persian with one clear action.

The digital roster is a Calendar view. Its month, workplace, search, date and person selections remain available; Month/Week/List/Roster and trip planning stay visible. Month and roster editors retain separate drafts so switching views does not insert the wrong correction form. The existing roster renderer remains usable for backward-compatible entry points.

Colleague settings start with two decisions: whether to suggest the person, and which shifts they accept. A single selector replaces the preset button row. Custom chips remain open when the selection shrinks to one or zero codes. Selecting a shift mode preserves exclusion, duration, weekday and temporary-date restrictions; Undo still restores the previous rules.

Occasional limits share one disclosure with flat fields. Name linking no longer adds a nested disclosure. Active day/date limits appear in each person’s summary. Optional inference from a clear single-shift roster is described in ordinary words, not as automatic patterns, and stays out of the main flow.

User-visible branding is FoxiOra across startup, welcome, installation, icons, settings, backups, private package metadata and documentation. Existing database/cache compatibility identifiers remain so upgrades retain saved data and prepared scanner assets. No OCR weights or accounting rules changed.
