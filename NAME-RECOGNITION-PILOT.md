# FoxiOra name-recognition pilot

General name guesses remain disabled. The tested methods are not reliable enough for automatic person assignment. v12.34 keeps photographed rows selectable and name editing visible. A saved human-confirmed name is reused only for an identical visual feature, the same workplace and one unambiguous label; it never automatically selects a person.

No new name-model weights were trained or deployed. The trained v12.33 shift network is unchanged. These experiments compare pretrained recognizers and extraction methods.

## Evidence

All 30 supplied image files passed through automatic app table/name-column proposal, producing 770 candidate row crops before human column confirmation. Twenty-nine requested column confirmation. That flag is not a failed scan: the normal app lets the user correct the column.

A separate experiment used manually positioned column bounds on ten prepared, deskewed photos, retaining the grid's candidate bands. Fixed columns still clipped names on curved/sloping tables. A reference subset contains 130 visually transcribed name appearances across nine photos / 64 distinct normalized names. These are provisional assistant transcriptions, not independently user-verified ground truth. Related photos and repeated people are present; this is not a blind production test. No training used these transcriptions.

| Recognizer on the fixed-column/grid-band experiment | Exact full names / 130 |
| --- | ---: |
| Bundled Tesseract Persian | 11 |
| Larger official tessdata_best Persian | 11 |
| PaddleOCR Arabic/Persian recognition | 17 |

These low scores include extraction failures. They are not the best achievable accuracy of Persian OCR. Replacing the recognizer alone does not repair clipped or mixed-column input. Yeh/kaf variants, alef variants, joining spaces and diacritics were normalized; other letter changes count as errors. A partly correct surname does not count as a correct full name.

A further trial used native-resolution name-area images, PP-OCRv5_mobile_det and arabic_PP-OCRv5_mobile_rec on nine photos. Portrait sources were manually oriented for this research trial. It recovered 38/130 complete reference strings somewhere in the name area. This is string-retrieval coverage, NOT correct-row assignment accuracy. It still combined job/contract text with names and changed letters in clear examples.

Confidence was insufficient for automatic naming. On the fixed-column crops, 18 Paddle readings scored at least 0.90; 12 disagreed with the provisional reference. Its two readings at or above 0.95 were both wrong against that reference. Those scores are not probabilities that a person's identity is correct.

## Known-staff matching

An optimistic closed-list trial supplied all 64 reference names as the hospital vocabulary. The existing normalized edit-distance limit of 0.22 and 0.12 margin over the next name suggested 50/130 names with bundled Tesseract, 56/130 with the larger Persian model, and 68/130 with PaddleOCR. No suggestions disagreed with the provisional reference in this small trial.

That is promising, not a zero-error claim. The vocabulary contains the test names, similar-name distractors are limited and references remain unverified. It is not an unseen-person or other-hospital test. General staff-list suggestions are not enabled.

## Next step

A verified typed staff list linked to its roster is more useful now than more unlabelled photos, particularly for IMG_5207, IMG_5208 and IMG_5597. We also need unfamiliar names, similar surnames and other hospitals/fonts. Extraction must preserve whole words before training or fine-tuning. Future evaluation should reserve new original photos, include every actual row, count missed/unknown names and wrong-person suggestions, and measure correction effort.

Local CPU versions: PaddlePaddle 3.3.1, PaddleOCR 3.7.0. No paid API was used. Desktop timing is not phone/browser performance. Reference models and research data are excluded from the app patch.

Official references: https://www.paddleocr.ai/main/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html ; https://huggingface.co/PaddlePaddle/arabic_PP-OCRv5_mobile_rec ; https://tesseract-ocr.github.io/tessdoc/Data-Files
