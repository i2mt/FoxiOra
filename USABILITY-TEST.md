# FoxiOra: short real-phone usability check

Use 3–5 nurses who have not been coached through the current app. Include an iPhone SE-sized screen and Android; use Safari and the installed app where available. Use a test roster with permission and a test copy of app data. These sessions have not been conducted as part of this release.

Say: «داریم خود برنامه رو امتحان می‌کنیم، نه شما رو. هر جا چیزی نامفهوم بود، همون رو بگو.» Give one task at a time. Do not name buttons or explain the route. Note where a person pauses, backtracks, taps the wrong thing, asks for help, or believes something saved when it has not.

| Task to say | What to observe |
| --- | --- |
| «این برنامهٔ ماهت رو اضافه کن.» | Finds Add, picks input method and own row, understands the month and import scope, reaches the saved monthly calendar |
| «این یکی شیفت اشتباه خونده شده؛ درستش کن.» | Can compare the crop, choose D/م/–/DN as appropriate, understand the next unclear day, and undo a mistake |
| «برنامه رو ببند؛ بعد برگرد و کارت رو ادامه بده.» | After a completed checkpoint, reopening offers continuation with the same row and corrections |
| «شیفت این روز رو در تقویم عوض کن، بعد برگرد به ماه.» | Gentle transition explains the destination; return link is found; selected month/date and draft remain understandable |
| «ببین فلانی در این روز چه شیفتیه.» | Finds the table, swipes both axes, keeps names and dates visible, understands photo names and can rename one |
| «برای این شیفت یه جایگزین پیدا کن.» | Finds selection and suggestions; discovers colleague limits when needed; understands confirmation requires agreement |
| «دو روز وقت آزاد می‌خوام، از پنجشنبه عصر.» | Finds duration and the specifically labelled start-date/time control, understands unknown coverage and conflicts |

For every task record: independent / helped / not completed; elapsed time; the first hesitation and the phrase used by the participant. Ask «فکر می‌کنی الان چی ثبت شده؟» after import. A roster shown on screen is not proof that the participant understood it. Fix repeated blockers before adding features. Avoid treating a small sample as a statistically measured success rate.

## Interruptions and accessibility

After a correction has checkpointed, switch apps for a minute, lock/unlock, close/reopen, and repeat with airplane mode after the app has cached. Try one interruption while OCR is busy: expect either the last complete row-selection/review checkpoint or a fresh reading step, never partially saved roster data. Try a full-storage/private-browsing scenario and verify the visible warning. Check Safari normal mode and installed mode separately. Browser storage retention is not guaranteed.

Use larger phone text / browser text scaling. Main actions must remain reachable by scrolling; content must not clip horizontally. Check VoiceOver/TalkBack names on cells and controls. With Reduce Motion enabled, date editing should avoid animated travel. Scroll a roster with many names diagonally and to each edge; check the pinned corner, date row, name column and rename dialog return position.

## Audit OCR confidence before reducing review questions

Keep the current model and review threshold until real-phone evidence supports a change. Use new photos from several hospitals, fonts, devices and lighting conditions. Do not train on the audit set. Include D vs م, – vs blank, DN, tilted/curved sheets, faint print, non-roster photos and incorrect date/row choices.

For each photo, manually verify the complete selected row and dates, including cells the app calls clear. Record wrong clear cells separately from uncertain cells. Report per-photo results and the worst photos, not only a pooled symbol percentage. Track wrong clear shifts, wrong date/row assignments, number of questions, time to correct and abandoned imports. Never count a deferred unknown as correctly read or off. Investigate any confidently wrong cell before allowing confidence to skip more questions. Never upload identifiable roster photos as telemetry without explicit consent.
