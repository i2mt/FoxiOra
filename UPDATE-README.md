# FoxiOra v12.23 — changes-only update from v12.22

This patch refines Settings, tutorial wording and the Calendar toolbar. It has not been deployed.

- Theme buttons now read Fox, Hedo, Forest, Siren from left to right, in both languages.
- The sample swap instruction ends with «(برنامه برای نمونه قرار داده شده است.)».
- Settings has a redesigned Telegram support button labelled «ارتباط با سازنده و پشتیبانی», showing the exact Latin handle @i_2MT.
- Calendar has Month and Roster controls. Trip planning is a separate compact action below them, so it cannot squeeze their labels.
- Legacy Week/List navigation falls back to Month. Day selection, editing, hours and the digital roster remain available.
- First-run behavior remains automatic: a fresh empty installation opens the welcome/tutorial once. Finishing or skipping saves that choice; Settings can replay it later.

## Apply

Use the changes-only ZIP on a repository already at v12.22. Copy the contents of `repo-files/` into the repository root, preserving paths. Bundles are already built. No assets, fonts, OCR models or other vendor files need uploading, and nothing needs deleting.

After deployment, wait for the new-version popup and choose Open new version when ready. If it does not appear yet, reopen the app online and let it check. Saved schedules and previous intro/install choices stay in the same database. Version labels show v12.23 using Latin characters.

See READ-ME-FIRST.md in the patch for GitHub website and Windows Explorer/CMD instructions. The QA report records the checks performed.
