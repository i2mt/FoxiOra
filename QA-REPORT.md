# v12.4 verification

25/25 regression tests pass (TZ=Asia/Tehran, npm test).
Includes Persian/English views, Jalali boundaries, persisted state, shift parsing and conflicts, overnight cover exclusions, uncertain OCR safeguards, correction memory, three-tab routing, setup reachability, English theme labels, paged OCR source indices and long swap selections.

No browser renderer was available in this execution environment. Phone layout and overflow require actual browser verification; DOM tests do not prove visual fit. Offline update and performance remain unverified. Existing OCR recognition engine is retained.
