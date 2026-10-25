# FoxiOra v12.34 verification

386 automated tests pass: all 368 earlier tests, updated for explicit overwrite confirmation, and eighteen import/clarity tests. Build and app/service-worker syntax checks pass. The shift-symbol model and verified scanner assets are unchanged.

New checks cover mounted correction drafts and scope/name controls; source-photo preview/zoom; folded row repairs; duplicate unnamed scans; confirmed identity preservation; workplace/date limits; other months; cancellation/OCR failure without partial combined imports; storage rollback and Undo; Gregorian/Jalali month retargeting; impossible days; multi-month file protection; duplicate pages in one upload; explicit extra-page merges; stale approval invalidation; direct name edits; exact confirmed-name ambiguity/workplace/learning guards.

Two Chromium touch/layout flows pass across 320×548, 375×548, 430×800 and 667×375, in Persian/English and light/dark. Correction controls remain mounted and keep page position. Scope retains the name draft; photo zoom stays inside its scroll area; table names are editable; whole-month display and import/month dialogs have no horizontal page overflow. Offline correction and scope/name editing pass. These are sixteen screen configurations per flow, not physical iPhone/Safari tests.

Name experiments processed 30 originals into 770 proposed crops before human column confirmation. Pretrained Persian and Arabic/Persian OCR, native-resolution text detection and known-staff matching were compared. Results use 130 provisional visual transcriptions / 64 names on nine photos; they are not user-verified ground truth. General name guesses remain disabled. See NAME-RECOGNITION-PILOT.md.

Exact repeated photo bytes are fingerprinted. Source/row features or identical name photos associate a repeated scan with a colleague only when unique. New photographs/recompressed copies may differ; existing-date confirmation is the fallback. Legacy duplicate identities are not guessed or merged: replacement clears imported-date entries and the table hides people without entries in its selected month, preserving other months and person settings.

Original photos, name crops, private screenshots and research weights/data are excluded from the repository patch. No deployment was performed.
