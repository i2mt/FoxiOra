# FoxiOra v12.11 design decisions

The user's proposed pattern recognition is useful when observed habits and confirmed preferences have different authority. A single D-only month may reflect a temporary assignment; it is insufficient evidence of a permanent prohibition. Therefore the app detects patterns automatically, offers one-click confirmation, and makes automatic exclusion an opt-in workplace setting. A manual override remains available per colleague.

## Matching approach

| Information | Effect |
| --- | --- |
| Exclude colleague | Skip every cover/exchange/trip-cover option; keep the roster visible |
| Accepted complete shifts | Offer only those resulting codes |
| No combined duties | Reject combinations such as DE/EN/DN when defined at the workplace |
| Maximum duration | Check the complete resulting duty using its real configured times |
| Clear observed single-code pattern | Show evidence; filter only if automatic filtering is enabled |
| Manual accepted shifts / ignore-pattern override | Take priority over inference |
| Missing/unreviewed data | Keep it unknown; do not infer off or a preference from it |

The pattern detector is deterministic and runs locally. It requires at least 20 reviewed dates and eight working entries of a single atomic code. For a requested date it examines the range from 62 days before to 31 days after; older distant patterns do not restrict that date. The manager summarizes the most recent available reviewed roster. Mixed-code and combination-only rosters do not establish a single atomic-code pattern.

Manual rules are checked against the colleague's final duty. Someone allowed to take D can cover a standalone D; taking D while already on E would need DE permission and must pass any duration/combination limit. Reciprocal exchange previews recheck rules before saving. Shared multi-date cover and travel-cover suggestions use the same engine.

## Navigation and overlays

| Task | Presentation | Reason |
| --- | --- | --- |
| Own shift / colleague cell edit | Inline editor near calendar/table | Retain schedule context |
| Name correction | Inline editor near the colleague | Preserve the list |
| Exchange preview / request draft | Inline editor beside the proposal | Compare alternatives without a backdrop |
| Personal event / save trip | Inline editor | Keep the date or travel result in view |
| Colleague preferences | Searchable expandable cards in the team tab | Immediate saved controls, undo, no extra page |
| Schedule comparison | Foldable section in the colleague tab | Secondary task without another navigation destination |
| Detailed workplace/symbol configuration | Existing focused dialog | Longer configuration task |
| OCR memory | Existing focused dialog | Occasional maintenance |
| Scan / travel search | Dedicated pages | Multi-step workflows |
| Deletion confirmation | Confirmation | Deliberate destructive action |

Inline tools can be folded without losing their draft. Same-page re-renders preserve input state; save/cancel dismisses the tool. Changing destinations discards an unsaved draft. Inline content still needs vertical space, especially on small screens; progressive disclosure avoids shrinking controls.

## Worth considering next

Date-limited availability and allowed weekdays would handle temporary assignments and fixed weekly commitments. Explicit ward/role permissions could improve suitability if the user supplies them; a roster alone cannot establish clinical qualifications. These are not implemented in this release. Avoid inferring age or health from names or schedules.
