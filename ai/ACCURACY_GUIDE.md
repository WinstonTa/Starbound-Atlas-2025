# OCR Accuracy Improvement Guide

## Quick Start - High Accuracy Mode

Use the enhanced accurate OCR:

```bash
python accurate_ocr.py happy_hour.png
```

This uses:
- **Full models** instead of lite (better accuracy)
- **Advanced image preprocessing** (upscaling, sharpening, denoising)
- **Higher confidence threshold** (filters out low-quality detections)

## Methods to Improve Accuracy

### 1. Use Full Models Instead of Lite

**Current (Lite):**
```python
ocr = HandwritingOCR(use_lite=True)  # Faster but less accurate
```

**Better (Full Models):**
```python
ocr = HandwritingOCR(use_lite=False)  # Slower but more accurate
```

### 2. Use GPU Acceleration

GPU provides better accuracy AND faster performance:

```python
ocr = HandwritingOCR(use_gpu=True)
```

**To enable GPU support:**
```bash
# Uninstall CPU version
pip uninstall paddlepaddle

# Install GPU version (requires CUDA)
pip install paddlepaddle-gpu
```

### 3. Adjust Detection Thresholds

Lower thresholds = detect more text (including harder-to-read text)

**Edit paddle_ocr.py line 67-70:**
```python
optional_params = {
    'det_db_thresh': 0.2,        # Lower = more sensitive (default: 0.3)
    'det_db_box_thresh': 0.4,    # Lower = accept more boxes (default: 0.5)
    'det_db_unclip_ratio': 2.0,  # Higher = larger boxes (default: 1.6)
    'rec_batch_num': 6,
}
```

### 4. Improve Image Quality

**Before OCR, ensure your images:**
- Are at least 1000px on the smallest side
- Have good contrast between text and background
- Are not blurry or pixelated
- Have even lighting

**Upscale small images:**
```python
img = cv2.imread('image.jpg')
height, width = img.shape[:2]
if height < 1000:
    scale = 1000 / height
    img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
```

### 5. Use Language-Specific Models

**For handwriting, try different models:**

```bash
# Download handwriting model (if available)
# Check: https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_en/models_list_en.md

# Example for Chinese handwriting
ocr = HandwritingOCR(lang='ch')

# For mixed languages
ocr = HandwritingOCR(lang='ch')  # Then manually switch as needed
```

### 6. Preprocessing Strategies

**For different image types:**

#### Printed Text (Books, Documents)
```python
results = ocr.recognize_text_simple(
    image,
    preprocess=True,
    enhance_contrast=True,
    denoise=False,          # Usually not needed
    binarize=True,          # Works well for clean printed text
    min_confidence=0.7      # Can be higher
)
```

#### Handwriting
```python
results = ocr.recognize_text_simple(
    image,
    preprocess=True,
    enhance_contrast=True,
    denoise=True,           # Remove noise from paper texture
    binarize=False,         # May hurt handwriting
    min_confidence=0.3      # Lower threshold
)
```

#### Photos with Complex Backgrounds
```python
results = ocr.recognize_text_simple(
    image,
    preprocess=True,
    enhance_contrast=True,
    denoise=True,
    binarize=False,
    min_confidence=0.4
)
```

#### Low Quality/Blurry Images
Use the accurate_ocr.py script which includes:
- Upscaling
- Bilateral filtering (edge-preserving denoise)
- Sharpening
- Morphological operations

### 7. Confidence Threshold Tuning

**Trade-off:**
- **Higher confidence (0.6-0.9)**: Fewer results but more accurate
- **Lower confidence (0.2-0.4)**: More results but some may be wrong

```python
# Conservative (high accuracy, may miss some text)
results = ocr.recognize_text_simple(image, min_confidence=0.7)

# Aggressive (catch everything, may have errors)
results = ocr.recognize_text_simple(image, min_confidence=0.2)

# Balanced
results = ocr.recognize_text_simple(image, min_confidence=0.5)
```

### 8. Post-Processing and Validation

**Filter results by confidence:**
```python
# Get all results
all_results = ocr.recognize_text_simple(image, min_confidence=0.1)

# Separate by confidence levels
high_confidence = [r for r in all_results if r['confidence'] > 0.8]
medium_confidence = [r for r in all_results if 0.5 <= r['confidence'] <= 0.8]
low_confidence = [r for r in all_results if r['confidence'] < 0.5]

# Use high confidence directly, review medium/low manually
```

### 9. Use Server Models

The models being downloaded include server models which are more accurate:

```
PP-OCRv5_server_det  # Server detection model (more accurate)
en_PP-OCRv5_mobile_rec  # Mobile recognition (you can upgrade this)
```

**To force server models, download manually and specify paths:**
```python
ocr = HandwritingOCR(
    det_model_dir='path/to/server_det_model',
    rec_model_dir='path/to/server_rec_model'
)
```

### 10. Multiple Pass Strategy

**Try multiple configurations and merge results:**
```python
# Pass 1: Conservative
results1 = ocr.recognize_text_simple(image, min_confidence=0.7, binarize=True)

# Pass 2: Aggressive
results2 = ocr.recognize_text_simple(image, min_confidence=0.3, binarize=False)

# Merge (deduplicate based on position)
all_results = merge_results(results1, results2)
```

## Recommended Settings by Use Case

### Best Overall Accuracy (Slower)
```python
from accurate_ocr import AccurateOCR

ocr = AccurateOCR(lang='en', use_gpu=True)
results = ocr.recognize_accurate(
    image,
    enhance_quality=True,
    min_confidence=0.6
)
```

### Best Speed (Lower Accuracy)
```python
ocr = HandwritingOCR(use_lite=True, use_gpu=True)
results = ocr.recognize_text_simple(
    image,
    preprocess=False,
    min_confidence=0.5
)
```

### Handwriting Optimized
```python
ocr = HandwritingOCR(use_lite=False, use_gpu=True)
results = ocr.recognize_text_simple(
    image,
    preprocess=True,
    enhance_contrast=True,
    denoise=True,
    binarize=False,
    min_confidence=0.3
)
```

### Production/API Use
```python
# Load once at startup
ocr = HandwritingOCR(use_lite=False, use_gpu=True)

# For each request
results = ocr.recognize_text_simple(
    image,
    preprocess=True,
    min_confidence=0.5
)
```

## Comparison Example

Run all three approaches on your image:

```bash
# 1. Lite/Fast
python test_ocr.py happy_hour.png

# 2. Accurate/Slow
python accurate_ocr.py happy_hour.png

# 3. Custom tuning
python diagnose.py happy_hour.png  # See which settings work best
```

## Advanced: Training Custom Models

For maximum accuracy on your specific use case, consider fine-tuning PaddleOCR:

1. Collect 1000+ labeled images of your text style
2. Follow PaddleOCR training guide: https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_en/training_en.md
3. Use your custom model:

```python
ocr = HandwritingOCR(
    det_model_dir='path/to/your/custom_det_model',
    rec_model_dir='path/to/your/custom_rec_model'
)
```

## Quick Wins

**Try these in order:**

1. ✅ Use `accurate_ocr.py` instead of `test_ocr.py`
2. ✅ Set `use_lite=False` for full models
3. ✅ Enable GPU with `use_gpu=True`
4. ✅ Lower `min_confidence` to 0.3-0.4 for handwriting
5. ✅ Increase image resolution to 1000px minimum
6. ✅ Adjust `det_db_thresh` to 0.2 for more detections

**Expected improvements:**
- Lite → Full models: +5-10% accuracy
- CPU → GPU: +2-5% accuracy, 5-10x speed
- Better preprocessing: +10-20% accuracy
- Lower confidence: +20-30% recall (but may add false positives)
