# FoxiOra v12.14 design decisions

The target is one useful import, with questions only where a decision needs uncertain evidence. Correcting 100 nurses one by one is not an acceptable primary workflow.

**Page purpose:** personal schedules and colleague-only pages are explicit choices within the existing scan flow. The digital roster has a direct entry for adding colleague pages. The app does not require the user's name to appear on each page.

**Review:** a compact whole-month grid replaces a short paginated list. Selecting a date reveals its source crop and preset codes. Larger text can scroll vertically instead of shrinking into an unreadable calendar.

**Dates and symbols:** date uncertainty is checked once for the page and remains distinct from symbol confidence. Unknown cells never become off simply because a nurse saved the page. Blank meaning is a workplace convention, not a global OCR guess.

**After import:** valid dates remain usable; pending dates retain visual evidence. Group correction and Undo reduce repeated work, but are fallback tools. They are not a substitute for better recognition.

**Identity:** names are corrected from the photo and can learn explicit aliases locally. Duplicate OCR text cannot safely prove two nurse rows are the same person. Whole-roster manual name confirmation is not required.

**Experiments:** a trained model and a curved-table mesh were tested, then kept out of production because cross-photo recognition and alignment were insufficient. Lowering confidence thresholds to remove prompts would make the app seem easier while worsening its schedule data.

**Next priority:** reliable page geometry, cross-photo symbol/name evaluation and original digital roster import. More main tabs or explanatory notes would add complexity without solving the ER workload.
