# FoxiOra v12.37 → v12.38

Apply over v12.37. Built app.js and style.css are included. No deployment was performed.

- Monthly date selection gently scrolls to the correct editor. A «برگشت به تقویم» action returns to the same selected date and month without discarding the editor. Reduced-motion preferences are respected. The competing automatic toggle scroll was removed.
- The roster has one bounded scroll region for both axes. Names stay pinned at the starting edge; dates stay pinned at the top; their shared corner stays above both. Name crops remain tappable to rename, without a separate pencil line or an extra self-row caption. Scrolling position survives edits and name dialogs. Weekdays use full names.
- Import stages are labelled: choose roster → check shifts → save roster. The current stage updates without rebuilding correction controls.
- Photo reviews and file previews are checkpointed locally. Reopening offers continuation with the selected row, crops, corrections, Undo, import scope, file mappings and month. Photo review resumes without rerunning OCR. Pending drafts do not trigger installation/update interruptions or get silently overwritten by new input.
- Drafts are stored separately from saved shifts. Successful import saves the roster and deletes its checkpoint in one transaction. Failed saves retain the review. Cancel/discard removes its checkpoint; clearing data or restoring a backup clears old import checkpoints. Tutorial samples cannot write over them.
- Successful photo, colleague and file imports open the imported month and workplace in monthly view, with a month-specific save message and Undo.
- Generic duplicated More menus were replaced with purpose-labelled controls. Swap multi-selection and request-copy actions are direct. Colleague limits and roster navigation are direct links. Roster management separates adding colleague schedules from symbol/hour and colleague settings. Photo review separates source/identity/date repairs from checking other days. Calendar legend, file table preview and planning controls retain specific labels.

The OCR model and confidence thresholds are unchanged. The app still asks about uncertain cells and permits reviewing all days. USABILITY-TEST.md provides real-phone tasks and an OCR confidence audit; these are not completed participant sessions or a new accuracy measurement.

Recovery uses the last completed on-device checkpoint. Closing before a checkpoint completes, before table layout is ready, browser storage eviction, private-mode restrictions or clearing site data can prevent recovery. In-progress OCR computation is not resumed mid-operation; a saved row-selection checkpoint can be read again. Unconfirmed geometry edits return to the last completed checkpoint. Storage errors are shown instead of claiming the draft was saved. These checkpoints do not transfer to another phone or origin.
