# FoxiOra Glyph v1

A supervised, task-specific convolutional network trained for shift symbols. It is a new model trained for this project, not a language model or a wrapper around a paid API. Static weights run locally in JavaScript; no new machine-learning runtime or WebGPU requirement is added.

## Data and evaluation

30 user-supplied image files, including 11 HEIC originals, were inspected. They mainly cover one hospital's roster styles. 1,680 candidate crops were manually labelled: off mark, D, DE, DN, E, M, N, or X (not suitable for a shift assignment: artifacts, non-shift text, numerals and unclear fragments). The user explicitly confirmed that printed ND means the same combined shift as DN.

Potentially related photo/page variants were kept together in nine conservative families. Fifteen photos (840 crops) were used for training, five (280 crops) for validation/calibration, and ten (560 crops) for testing. Grouping is conservative and manually assessed; it is not a guarantee that all repeated document content has been identified. There are 417 legible shift-code examples and 143 rejection examples in the test subset. These are candidate-crop results, not complete-roster or multi-hospital accuracy.

## Comparison on the fixed test crops

| Method | Correct code proposals / 417 legible examples | Accepted assignments | Wrong accepted assignments |
| --- | ---: | ---: | ---: |
| Existing v12.32 hybrid OCR | 321 (77.0%) | 242 | 7 |
| Larger Tesseract best English/Persian trial | 333 (79.9%) | 125 | 0 |
| Custom MLP, app features | 406 (97.4%) | 318 | 4 |
| Custom CNN, app features | 405 (97.1%) | 150 | 2 |
| Custom SVM, app features | 404 (96.9%) | 264 | 2 |

The three custom-model accepted-assignment counts above use scalar thresholds calibrated on validation only, before integration. Their raw proposal accuracy must not be interpreted as automatic-save accuracy. Neural probabilities are not a guarantee of correctness. The CNN's overall top-label accuracy including rejection examples was 91.4%; rejection is a separate challenge from recognising a legible code.

The CNN was selected by validation performance (95.0% overall, versus 92.5% MLP and 91.8% SVM), model size and portable inference. Later class thresholds are also derived only from validation; they are used as additional evidence in the guarded integration, not as standalone permission to assign shifts. Classes with too few clean validation examples are disabled for neural acceptance. The SVM's higher overall test score is retained in the research results and warrants further comparison with more hospitals.

## App integration

The network checks the existing OCR result. Strong disagreement or rejection evidence sends a cell back to review. It resolves a pending proposal only when independent OCR already agrees and the existing low-resolution caution is clear. A new proposal has a stricter threshold and remains pending. Genuine blank detections, exact human-confirmed examples, untrained short-night symbols and custom workplace codes keep their existing handling. The network never treats its own predictions as training confirmations.

In the integrated 560-crop replay, 242 assignments were accepted with 5 wrong accepted assignments, compared with 242 / 7 before integration. Two pending correct assignments were resolved and two wrong accepted assignments were flagged. This modest change is reported separately from standalone recognition performance. The integration replay informed development of the safeguards; it is not a new blind test or an estimate of production accuracy. A fresh set of rosters is needed for that evaluation.

## Model and runtime

Two convolutional layers (1→8→16, 3×3), ReLU and 2×2 pooling, a 64-unit dense layer, and eight outputs. Input: a 24×24 ink feature plus aspect ratio. 38,760 parameters. The model file is approximately 203 KiB. All inference occurs on the device; the model is checksum-verified and cached. The existing OCR remains available if the optional model cannot load.

PyTorch CPU training and browser JavaScript inference matched across all nonempty comparison features to within 0.00001 probability. Empty features abstain. The desktop Chromium check processed 100 inferences in about 135 ms; this is not a physical-phone performance measurement.

## Learning and limits

Confirmed corrections continue to enter personal example memory. Exact examples can be reused; approximate matches stay reviewable. A symbol-only export is available from saved scan corrections for supervised model development. It excludes names, workplace identities, photo previews and full roster images. Network weights do not silently retrain on the phone. New exported examples need source grouping and validation before inclusion in a new shared model.

S, n, EN/En and other custom symbols are not newly learned classes in this version; the existing OCR/edit controls handle them. Empty cells do not become off automatically. Perspective, curvature, wrong row/column boundaries and clipped strokes can still cause problems before classification. Additional fonts, other hospitals, rare combined shifts and handwriting are needed before making broader reliability claims.

The training kit contains code, feature vectors, labels, split records, model weights and detailed comparison outputs. Original rosters are excluded from the application patch and training kit. Do not upload the training kit as application source files.

## Reference models

The larger comparison used the official Tesseract tessdata_best English and Persian models, downloaded for the experiment only. They are not shipped by this update. https://tesseract-ocr.github.io/tessdoc/Data-Files
