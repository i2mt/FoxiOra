# FoxiOra v12.11 verification

## Results

111 Node regression tests passed: the retained 89 tests plus 22 preference/inline cases. All included browser-result JSON files report no runtime errors. No deployment or repository push was performed.

## Matching and preferences

Unit tests cover all-suggestion exclusion; accepted complete codes including the D versus DE distinction; no-combined duty; merged handover duration; custom long atomic shifts; sufficient reviewed evidence; default suggestion-only behavior; uncertain and mixed data; combination-only and stale-pattern rejection; manual overrides; aliases; explicit empty/all choices; workplace scope; persistence; Undo; and rejection of an exchange preview after preferences change.

The browser uses actual switches, buttons and selects to confirm a D-only pattern, enable automatic filtering, override an E-only pattern, choose all accepted shifts, exclude/reinclude via Undo, disallow DE and set an eight-hour limit. Reload retains the saved preferences. Eligible result counts respond to each change, with readable exclusion reasons. Search and comparison remain functional.

Twelve colleague-settings layouts passed: Persian/English, light/dark and 320×568, 360×640, 390×844. No horizontal overflow or out-of-bounds controls. Preference cards preserve expanded state after saving. There are still three main navigation destinations.

## Inline editing and continuity

Draft values and folded state survive same-page renders. Starting another tool leaves only one active inline editor. Navigation discards the unsaved tool. Save/cancel removes it. Escape folds a focused inline tool. Editors attached within a collapsed section are moved outside the collapsed parent. Preference Undo retains selected shifts that still exist, and clears stale results.

Real browser checks verify inline request-draft folding/resumption, manual shift editing and Undo. The routine editor’s preset keys and Save actions fit above navigation at 320×568; date/workplace/deletion fields are folded under shift details. Exchange preview/cancel/save, both-roster persistence, stale-proposal rejection and request copying behavior retain their earlier contract. Eighteen exchange-filter layouts passed at the three phone sizes and both themes. Complex workplace dialogs still close with the actual Close button or Escape.

Thirty main-view layouts passed. Actual cancellation/folding or modal dismissal covered nine action types: schedule choice, workplace, shift, shift edit, event, trip, name, OCR memory and colleague cell. Digital roster editing/search/full-month display, code aliases, D→DE cover and readable dark settings passed.

The v12.10 → v12.11 service-worker update preserved stored schedules/settings. Theme switches, manual edit, cover calculation, travel suggestion/booking and offline app-shell reopening passed. Guided setup/manual entry/resume at three sizes passed.

## Calendar, result visibility and OCR

Twenty-four focused month layouts (five/six rows, one/two workplaces, three sizes, both themes) passed. Single-workplace grids fit the smallest tested screen. A further 24 current-month layouts show one through four workplaces without clipped standard codes or horizontal overflow. All eligible shift-change/free-time/trip results remain rendered directly without show-more controls.

Undo continues to restore manual changes, both exchanged rosters, reviewed imports, colleague corrections and trips through actual clicks/reloads. Public occasions remain independent of working duty: Nurse Day can contain D and Eid can contain N. Lunar mappings remain 1405 only.

The supplied original photograph again reached the 23-name picker and 30-date review. All 30 expected dates matched and were imported, after confirming the review item. A simulated OCR-worker failure recovered through retry without reupload. OCR recognizer and calendar-data files are unchanged from v12.10; this release does not claim improved accuracy across unseen photos.

## Limits

Pattern recognition establishes an observed schedule, not a person's willingness, qualifications or permanent assignment. Automatic filtering starts off; rules/preferences can override it. Date-specific exceptions, weekday availability and role matching are not implemented. Inline editors and long lists may scroll, particularly with multiple workplaces. Only local Chromium was tested; real mobile devices, enlarged text and offline OCR-model availability were not tested. Travel optimization still does not include reciprocal return shifts. Screenshot rosters are demonstration data.
