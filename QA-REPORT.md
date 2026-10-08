# FoxiOra v12.12 verification

## Result

132 Node tests passed: 111 retained regression cases, updated to await durable writes, plus 21 new cases for the review changes. The included browser JSON reports contain no page runtime errors. Generated bundles match their ordered source files. No deployment or repository push was performed.

## New behavior

Tests cover unknown versus explicit off/leave, missing second-workplace data, calendar filters and selected-day placement, editable multi-day events, invalid event dates, cross-page drafts and independent editing context, delayed/failed durable storage, import retry without partial changes, settings/setup failure, retained roster context, quick full-code presets, temporary/weekday limits, identity linking and Undo, ambiguous aliases, independent accordion state, all grouped eligible options, reciprocal travel return duty, and missing active-workplace coverage.

A real Chromium browser uses the visible buttons/fields to navigate and restore a draft, edit a multi-day trip, filter all workplaces, select colleague presets, set/clear a temporary exclusion, change weekday availability, link two scanned identities, Undo that link, reuse the canonical digital roster, recover from a rejected save and retry, preview a reciprocal travel exchange, and choose 12-hour time. Reduced motion is enabled in this run. Twelve Persian/English, light/dark phone layouts passed at 320×568, 360×640 and 390×844.

The benchmark uses 25 colleagues and a 60-date roster, without a result cap. The included review-results.json records wall-clock search timing and proposal count from the local test browser. This is not a measurement on real phones.

## Retained flows

Thirty main-view layouts, eighteen exchange layouts, twelve colleague-settings layouts, twenty-four focused five/six-row month layouts and twenty-four one-to-four-workplace month layouts were checked. The routine shift editor's preset/save actions fit above navigation at 320×568. All standard codes remain visible and main pages have no horizontal overflow. Larger rosters and selected-date details may scroll.

Actual close/cancel/fold actions cover schedule entry, workplace configuration, own/colleague shift edits, event, trip, name and OCR-memory tools. Digital table editing, search, whole-month mode, symbol aliases, D→DE cover, both-roster exchange saving, stale-proposal rejection, Undo persistence, comparison, guided setup/manual entry/resume and offline app-shell reopening passed. The real v12.11 → v12.12 service-worker upgrade retains existing schedules/settings.

The original supplied photograph reaches 23 detected names and the 30-date review. All 30 expected codes match and import after confirming the review item. An interrupted OCR worker recovers without reupload. The recognizer logic and calendar mappings are retained. The OCR-memory file changes only its removal action's durable-save handling.

124 duplicate CSS declarations were removed. All six before/after preview images were pixel-identical. Build verification checks source/bundle agreement; ZIP verification checks bytes and integrity.

## Limits

Only local Chromium was tested. Real iOS/Android devices, assistive technology, enlarged-text workflows and offline OCR-model availability were not tested. The OCR check uses the supplied photograph, not a representative multi-hospital corpus. Clinical role eligibility requires explicit information; schedule patterns do not establish it. Drafts persist through in-session navigation, not reload. One draft per view can be replaced by a new editor. Travel supports single same-code reciprocal exchanges and direct cover; it does not optimize multi-shift chains.
