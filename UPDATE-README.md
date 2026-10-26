# FoxiOra v12.35 → v12.36

Apply over v12.35. Built app.js and style.css are included; no deployment was performed.

Photo scanning has visible stop/back and replacement-photo actions. Table geometry is checked before loading OCR. Grid detection runs in a disposable browser worker so a busy grid search does not block the page. Pending operations have deadlines; cancellation invalidates old reads, and late worker creation is terminated. A failed photo can be sent directly to four-corner straightening. The straightening confirmation controls are now outside the folded repair section.

The introduction is a guided preview. The explanation and Back/Next/Skip actions appear above the sample view on portrait phones. Sample controls are inert, so the user does not need to discover or complete tasks. Branding, developer credit, shift swapping, personalization, settings replay and restoration of the real schedule remain available.

Tapping a monthly calendar date opens its shift editor directly when there is one matching duty. For multiple workplaces/duties, the selected day's cards identify which one to edit. An empty date in a single workplace opens entry directly. Saved edits are followed by a fresh editor when another date is tapped. Unsaved changes are retained as drafts rather than silently being overwritten.

Four-corner correction handles perspective on a flat sheet; it does not automatically flatten curved/folded paper or recover unreadable symbols. This release does not claim a new recognition accuracy rate. Physical-phone testing is still valuable, particularly for highly distorted photos.
