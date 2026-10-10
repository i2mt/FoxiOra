# FoxiOra v12.16 — shift presence verification

Prepared 10 October 2026. This release adds the inline **کیا شیفتن؟** lookup to the digital roster. No OCR weights or scanner assets changed. The app has not been deployed.

## Behaviour

One inline section uses a date selector and shift selector. Roster date headings provide the same date selection. It queries all imported colleague rows within the chosen workplace, regardless of the user's own schedule, colleague scan page, roster name filter or swap eligibility. Exact shift components and full-duty time coverage include combined/custom duties. Off/leave and small handover overlaps are excluded. Unclear/absent codes are separately visible. Self is included once when the saved duty matches. No guessing, extra main tab, Show more or data mutation is involved.

Changing workplaces retains the selected month/date and uses that workplace's definitions and people. Changing dates keeps the week preview in sync. Full-month selection and existing individual roster editing remain available. Edits and Undo re-render the results.

## Automated verification

**188 checks passed**, including the previous 175 regression checks and 13 presence checks:

- Off user and no personal roster; all colleague scan pages.
- D/E/N/n, DE/EN/En, combined queries and overnight boundaries.
- Custom aliases and dedicated long-duty definitions.
- Off/leave, stale off segments, partial handover and unknown codes.
- Pending entries separated from accepted working staff.
- Swap restrictions and roster name search do not filter presence.
- Workplace isolation and date/month preservation when switching.
- One self result across multiple duties; separate ranges for disjoint duties.
- 120 colleagues across six synthetic pages, all visible without truncation.
- Escaped names/IDs, read-only lookup and edit/Undo refresh.

Source/build consistency and JavaScript syntax checks passed. The complete package retains all seven verified OCR assets byte-for-byte from v12.15, including `ora.traineddata.gz`.

## Browser verification

Playwright Chromium checked **32 layout combinations**: 320/390 px, Persian/English, light/dark, 100%/200% text size and Gregorian/Jalali calendars. The page had no horizontal overflow and all presence results remained accessible. Normal-size phone previews display the presence section above the table; enlarged text and large lists may scroll vertically.

Interactive tests checked date-header taps, whole-month date selection, week synchronization, workplace switching, independence from name search, saved colleague correction/Undo and uncertainty display. Four accepted E-duty colleagues include DE, EN and En, while the user is off. Staff excluded from swap suggestions still appear.

A synthetic six-page / 120-row roster displays all 120 matching names with no personal schedule. After saving, the browser disconnected, reloaded the service-worker shell and still returned all 120 names from saved data. No page errors were recorded. This is a presence-lookup and persistence test, **not OCR validation on six real pages**.

Screenshots use synthetic demonstration identities. The private uploaded roster photographs are not included.

## Limits carried forward

Presence reflects saved schedule information, not physical attendance. It cannot recover unreadable shift codes or missing colleague pages by itself. Uncertain schedules are not presented as confirmed working staff. Persian name spelling remains dependent on saved/imported/corrected names.

The existing v12.15 OCR crop benchmark and limitations are preserved in `verification/v12.15-OCR-report.md`; this release does not claim new OCR accuracy or proven unattended import of 100+ nurses. The v12.15 trained model and its original license/provenance remain unchanged.
