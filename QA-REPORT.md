# FoxiOra v12.29 verification

All 300 automated checks pass in the complete suite. Ten new checks cover DN in new/legacy/custom configurations, explicit custom suggestion restrictions, atomic hospital-defined DN, correction selectors, photo confirmation, two disjoint duty segments with an overnight end, colleague limits, DN combined-cover suggestions, individual saved corrections and Undo. Existing scheduling, OCR, imports, navigation, settings, availability, tutorial, startup and service-worker checks pass.

Generated bundles match source; app.js and sw.js syntax checks pass.

Actual Chromium interactions passed at 320/375/430 × 548 CSS pixels, in both Persian/English and light/dark themes (12 combinations). Each exercised an individual colleague correction to DN, Save, Undo, selected-row batch correction to DN, Undo, own pending-shift correction to DN, Save including any conflict confirmation, and Undo. No page errors or horizontal page overflow. Rows and edit actions were reachable after removing the obstructing sticky batch controls. This is viewport emulation, not physical iPhone/Safari verification.

Whole-app expert walkthrough: 52 captured browser states, primarily 375 × 548, including first setup, own/colleague editing, calendar, roster, saved corrections, photo review, synthetic CSV preview, swap suggestions/request draft/exchange preview/save/Undo, colleague preferences, planner results, all settings groups, workplace/symbol definitions, correction memory, personal event save/Undo, backup controls, installation instructions, update prompt and all seven intro stops. No horizontal page overflow in those states. Inspected UI and source together; this is not a usability study with new participants. See the ZIP's USABILITY-REVIEW.md for findings and proposed work.

No new real-photo recognition benchmark, physical-device test or external deployment was performed. Photo review used synthetic state and file import used synthetic CSV. No vendor/model assets changed. Browser automation and screenshots are internal QA files, excluded from the repository patch.
