# FoxiOra v12.29 — DN and direct scan corrections

DN now appears in shared shift choices for manual own/colleague edits, photo correction, saved batch correction, colleague shift choices, presence lookup and file-symbol mapping, provided D and N are defined working symbols. New workplaces include DN in default combined shifts. The former default DE/EN/En list gains DN in suggestions without mutating stored records. Different custom combination lists still restrict suggestions; DN remains available when correcting a real duty. Colleague exclusions, accepted full codes, hours limits and no-combined restrictions continue to apply.

In saved scan corrections, “Edit shift” now opens the actual own/colleague shift editor. Batch controls only appear after selecting cells, and no longer stick over rows on short screens. Saves and Undo keep their existing behavior. The OCR engine is unchanged.

The accompanying USABILITY-REVIEW.md in the update ZIP describes the whole-app review and prioritizes further changes. Those broader redesign recommendations have not been implemented in this patch.

Apply after v12.28. Copy only the contents of repo-files into the repository root, preserving subfolders. Generated app.js and style.css are included. No deletions or new runtime dependencies. Prepared for manual upload; not deployed.
