# FoxiOra v12.12 design decisions

The visual direction stays: neutral month surfaces, dominant shift codes, a seven-day strip, numbered workplace markers, restrained Fox accents and three main destinations. The changes focus on meaning, continuity and fewer decisions per task.

## Status

| Display | Meaning |
| --- | --- |
| Hospital off symbol | Confirmed off |
| M or workplace leave code | مرخصی |
| S or workplace sick-leave code | استعلاجی |
| ؟ | Missing or unreviewed roster information |
| Blank confirmed cell | Blank information; never automatically converted to off |
| Occasion dot/public-holiday label | Calendar information, independent of working duty |

Today states coverage. Travel requires coverage across all active workplaces. The default calendar shows every workplace; the filter is optional. Tapping a date reveals details within the page, with the full month kept underneath. Folding details returns space to the grid.

## Actions and disclosure

Routine editing stays inline. Navigation retains the detached live form in its original view; a draft shortcut returns to it. Save/Cancel are explicit endings. One draft per view avoids multiple copies of input IDs. Focus returns to the resumed tool and Escape folds it.

Personal-event taps edit rather than delete. Multi-day events have explicit end dates. A successful save returns attention to the selected date. Only complex configuration keeps a dialog.

Colleague cards expose common presets first. Evidence and uncommon limits are optional disclosure. Each colleague's accordions retain their own state. Weekday availability and date-limited absence are explicit preferences, not inferred personal characteristics.

Identity reconciliation requires a user's deliberate choice. Unique exact normalized names/aliases can match automatically; fuzzy spelling never automatically merges two staff members. The chosen existing record supplies its preferences, with newly scanned cells supplying the new dates.

Every eligible shift-change and travel option remains visible. Grouped colleague headings and warning types reduce repeated text. Long lists can scroll; shrinking controls or hiding eligible options would be a worse tradeoff.

## Reliable local behavior

Success means the IndexedDB transaction completed. Failed core writes roll back the related state/history, leaving editable input available. Settings and setup also recover their previous saved values. Undo stays persisted and focused on the last eligible change.

Reciprocal travel suggestions are measured from the actual proposed personal schedule, including the return duty, all workplace duties and personal events. Matching remains deterministic and local. Within-search caches reuse equivalent matching/window results without dropping options.

## Source and next work

Ordered source sections build into the existing two bundles. Browser globals and cascade order remain compatible. CSS cleanup removes only identical superseded declarations, verified by viewport image equality. Deeper module isolation can follow without changing the nine-file hosting contract.

The next useful evidence is a varied OCR photo corpus and real-device/usability checks, including larger text and screen readers. Explicit ward/role permissions and multi-shift travel optimization are later product work; this release does not infer clinical suitability.
