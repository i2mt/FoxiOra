# OCR model provenance

`lang/ora.traineddata.gz` is a modified Tesseract model for FoxiOra v12.15. It is derived from the official English `tessdata_best` model, under Apache License 2.0. The upstream license is included in `TESSERACT-LICENSE.txt`.

Upstream: https://github.com/tesseract-ocr/tessdata_best
Base `eng.traineddata` SHA-256: `8280aed0782fe27257a68ea10fe7ef324ca0f8d85bd2fd145d1c2b560bcb66ba`

Modified in October 2026 by fine-tuning with Tesseract 5.3.4, learning rate 0.0001, 2,000 iterations, seed 1515. Training used 435 manually transcribed real shift cells from seven photographs, controlled augmentations and synthetic standard symbols (2,190 examples total). Validation/test photographs were excluded from gradient training. Labels are assistant visual transcriptions and have not been reviewed by the user.

Exported integer `ora.traineddata`: 5,199,098 bytes; SHA-256 `a47e0205471ab587fee9b1842cf8005829921cae4daa128a7dea71c33bc7cb5e`.

It supplements the general English and Persian recognizers for supported standard shift symbols. It does not replace date/name OCR and is not a general-purpose English model. User photographs and staff names are not distributed with the app. Evaluation and remaining limits are in `QA-REPORT.md`; labelled symbol crops and reproduction scripts are in the separate training archive.

The existing runtime assets are Tesseract.js and Tesseract.js Core, distributed by the Tesseract.js project under Apache License 2.0: https://github.com/naptha/tesseract.js and https://github.com/naptha/tesseract.js-core. English/Persian general language assets are the existing app models.
