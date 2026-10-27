# FoxiOra v12.39 verification

429 automated tests passed, zero failures or skipped tests. Build consistency and app/service-worker syntax checks passed.

Five new colleague-loading tests cover a 160-person manager without eager controls/pickers, lazy controls with preserved exclusions/weekdays/accepted duties and Undo, invalid old date ranges in both calendars without silent rule changes, independent duplicate-name sections across rerender, and safe handling of non-text legacy shift entries. Existing tests now explicitly open the identity or person section whose controls they inspect; their escaping, identity, rule and Undo checks remain.

Chromium touch-browser checks passed 16 configurations: 320×548, 375×548, 430×800 and 667×375, in Persian/English and light/dark themes. Unlike the prior internal-scroll-only check, the journey scrolls the outer page before changing the roster scroll position. It verifies visible name hit targets, decoded source images, pinning while moving both axes, date-header position, page width and retained scroll position after closing a name dialog. It sampled 686 visible name cells across the journey; this is UI verification, not an OCR accuracy metric. A phone-sized screenshot with source-name crops was visually inspected.

A separate browser journey entered colleague limits through its actual button with 180 colleagues. It verified zero eager person controls or duplicate pickers, loaded one person's controls, repaired presentation of an invalid stored date range, saved an accepted-shift choice while retaining exclusion, and opened one 179-choice duplicate picker. No page errors occurred in the final browser journeys.

The user's exact disappearing-name symptom has not been reproduced on a physical iPhone here. The patch removes the legacy/isolated clipped scroll-layer combination and gives the small frozen cells independent paint layers. Chromium visibility checks pass; confirmation on the affected phone/Safari version is still needed. No deployment or OCR model change is included.
