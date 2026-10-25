# FoxiOra v12.32 → v12.33

This changes-only patch adds the first custom FoxiOra symbol network, trained on the user's roster archive. Replace the included files over v12.32. The generated app.js is included; style.css is unchanged. There are no deletions or database migrations.

The model runs locally and checks the existing scanner. It supports D, E, N, M/م, DE, DN/ND and off marks. Existing controls/OCR handle other codes. Independent agreement can resolve a pending reading; disagreements and unmatched new proposals remain reviewable. Blank cells stay unknown unless their meaning is explicitly configured. Human-confirmed examples retain priority.

The scanner's offline preparation also caches the new roughly 203 KiB model. If that optional model cannot load, the original OCR remains usable. Saved scan corrections now have an export action for confirmed symbol features, without names, workplace identities, photo previews or full rosters. Those examples can support supervised model updates. Network weights do not automatically retrain on the phone or upload data.

All 368 automated tests and sixteen browser layout/touch cases pass. See MODEL-CARD.md and QA-REPORT.md for the comparison and limitations. The optional training kit contains research code/data and should not be uploaded as application files. Nothing has been deployed.
