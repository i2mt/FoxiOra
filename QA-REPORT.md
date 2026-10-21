# FoxiOra v12.30 verification

## Automated behavior

328 checks passed in the complete suite. A subsequent focused run passed 47 checks against final draft/handover guards, including two additional regressions: 330 distinct automated checks passed in total. The final usability.cjs contains 30 tests and is included in npm test. Final focused reruns and browser smoke checks covered the completed recovery paths.

New behavior checks cover same-page drafts retaining original shift identities; own/colleague/event draft isolation; multiple-workplace editing; table-first ordering; stale review exit; the three input methods; exact workplace/date recovery; explicit handover agreement, combined DN, revalidation, uncertain recovery, failed storage rollback and Undo; separated colleague controls; explicit combination exclusions; file preview next-step feedback; isolated interactive photo/file/manual tutorials; restored drafts on tutorial exit; notices deferred during unfinished work; pending-file workplace protection; file/scan cancellation; folded lookup activation; whole-roster recovery; a valid swap lesson after practicing DN; manual entry returning to the correct calendar date/workplace; selecting the missing workplace when adding a duty; opening an existing duty for manual correction; refusing an undefined or unclear own shift in a handover; and safely handling a colleague removed while a draft was parked.

Existing schedule/conflict, OCR/layout/learning, scan correction, file import, monthly-hours, settings, availability, tutorial, launch-animation, undo and service-worker checks passed. Test expectations were updated where the intended interaction changed: optional multiple selection, method choice, direct missing-workplace editing and the tutorial's new input/correction stops.

Generated bundles match source. app.js and sw.js syntax checks pass. No new runtime dependency or vendor/model file.

## Browser interaction

Actual Chromium clicks passed across 12 phone configurations: widths 320, 375 and 430 at height 548, Persian/English, light/dark. Exercised Today Edit → DN → Save → Undo; roster colleague edit → DN → Save → Undo; horizontal-overflow checks; and the table's position near the top of the screen.

Additional actual-click workflows passed: two own shift drafts on one calendar page, resuming/saving the correct record; agreed handover Save/Undo; missing second-workplace recovery into the correct editor; disabling DN in workplace suggestion combinations and saving the exclusion; CSV upload → choose own row → save; all three tutorial input methods through sample save, interactive exchange, theme preview and completion with real schedules restored. No page errors. Request drafts were inspected; nothing was sent to another person.

Responsive layout checks passed across 24 configurations: 320×548, 375×548, 375×667, 430×800, 667×375 and 1280×800, in both languages and light/dark. Checked 168 normal-view states and 144 non-welcome intro states. No horizontal page overflow. Planner time fields stayed inside the viewport; guide and app panes did not overlap or leave the screen. Main settings disclosures stayed mutually exclusive.

These are Chromium viewport/emulation checks, not physical iPhone/Safari verification. Screenshots and automation are internal QA, excluded from the patch. The UI no longer relies on a claim that all settings fit without scrolling: it keeps one item per row and allows natural scrolling on short screens.

## Scope and limits

This release refines navigation and task completion. It does not introduce a new OCR engine or claim a new recognition-accuracy improvement. Photo review/tutorial data and CSV input in this pass were synthetic. The previous scanner safeguards, original-photo fallback, offline assets and no-paid-API behavior remain. No new real hospital-photo benchmark, independent nurse usability study or deployment was performed.

For a real-user check, ask someone unfamiliar with FoxiOra to add their own roster, correct a wrong shift, edit a second workplace, find and record an agreed swap/handover, and resolve an incomplete roster result. Observe first taps, help requests, whether they know the change was saved, and whether they can return without losing work. Those observations should guide the next pass; browser checks cannot establish real-user completion rates.
