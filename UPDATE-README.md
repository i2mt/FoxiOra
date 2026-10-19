# FoxiOra v12.22 — changes-only update from v12.21

This patch updates the intro, startup installation reminder and app-update behavior. It is not deployed.

- Animated depth-logo welcome with Mohammad Mahdi Taghavi's designer/developer credit.
- Seven short tutorial stops, including an interactive sample shift swap.
- Page transitions, focused highlights, dimming/blur and reduced-motion support.
- Settings intro/install actions moved to the bottom. Personalization covers calendar, language, clock, alerts and appearance.
- Natural «کیا شیفتن؟» wording and Latin version labels in both languages.
- Larger startup logo: approximately 265 px on a 390 px phone, versus 152 px previously.
- Startup install offer: Install, remind after seven days, or never remind again.
- New-version popup; restart requires a click. Another open tab also waits for its own restart.
- Open drafts/imports block an update restart. A file preview can be closed without saving.

## Apply

Use the accompanying changes-only ZIP on a repository already at v12.21. Copy the contents of its `repo-files/` folder into the repository root, preserving paths and replacing the matching files. Upload those changed files/folders, not the wrapper folder. Production bundles are already built; running a build is optional. No asset or vendor uploads are required.

Before updating, export a backup from Settings. For this first transition from v12.21, open online, allow the download, then close all FoxiOra tabs/app windows and reopen. Check **v12.22** at the bottom of Settings. Future releases use the new update popup.

`READ-ME-FIRST.md` in the patch explains GitHub website uploading and Windows Explorer/CMD with Git. `INSTALLATION-NOTES.md` documents behavior, formats and limits; `QA-REPORT.md` records validation. Scanner models, artwork and schedule data formats are retained.
