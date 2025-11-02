# PaddleOCR Mobile/Lite Models + Gemini AI for Menu Recognition

Cross-platform text and handwriting recognition using PaddleOCR with mobile/lite models, enhanced with Gemini 2.5 Flash AI for intelligent menu extraction and validation.

## Features

- **Hybrid OCR + AI**: Combines PaddleOCR with Gemini 2.5 Flash for maximum accuracy
- **Intelligent Menu Extraction**: Automatically extracts restaurant deals, prices, time frames, and conditions
- **Three Processing Methods**: OCR+Gemini validation, Vision-only, or Hybrid (both combined)
- **Structured JSON Output**: Clean, consistent JSON format for AI applications
- **Mobile/Lite Models**: Optimized lightweight models for fast inference
- **Handwriting Recognition**: Specifically tuned for handwriting with lower thresholds and better preprocessing
- **Cross-Platform**: Works on Windows, Linux, macOS, and mobile platforms
- **Image Preprocessing**: CLAHE contrast enhancement, denoising, and adaptive thresholding
- **Multiple Languages**: Support for English, Chinese, Korean, Japanese, and 80+ languages
- **Batch Processing**: Process multiple images efficiently
- **Visualization**: Annotate images with detected text and confidence scores

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. GPU Support (Optional)

For GPU acceleration, replace `paddlepaddle` with GPU version:

```bash
pip uninstall paddlepaddle
pip install paddlepaddle-gpu
```

### 3. NCNN Support (Advanced - for Mobile Deployment)

For mobile deployment with NCNN runtime:

```bash
# Clone and build ncnn
git clone https://github.com/Tencent/ncnn.git
cd ncnn
mkdir build && cd build
cmake ..
make -j4
make install

# Install ncnn-python
pip install ncnn
```

## Quick Start - Hybrid OCR + Gemini AI (Recommended for AI Projects)

### Menu Extraction with AI Validation

The **hybrid method** combines PaddleOCR text extraction with Gemini 2.5 Flash AI for intelligent structuring and validation.

**Step 1: Set up your API key**

Create a `.env` file in the parent directory:
```bash
GEMINI_API_KEY="your_gemini_api_key_here"
```

**Step 2: Run the hybrid extraction**

```bash
# Hybrid method (OCR + Gemini Vision) - RECOMMENDED
python happy_hour_gemini.py your_menu_image.png hybrid
```

**Output:** Structured JSON with restaurant deals, prices, time frames, and conditions:
```json
{
    "restaurant_name": "Restaurant Name",
    "deals": [
        {
            "name": "Item name",
            "price": "$19.99",
            "description": "Details about the deal"
        }
    ],
    "time_frame": [
        {
            "start_time": "9:00 PM",
            "end_time": "Close",
            "days": ["Sunday", "Monday", "Tuesday"]
        }
    ],
    "special_conditions": ["Condition 1", "Condition 2"]
}
```

### Three Available Methods

**1. Hybrid (OCR + Vision) - Best for AI projects:**
```bash
python happy_hour_gemini.py menu.png hybrid
```
- Uses both PaddleOCR and Gemini Vision
- Maximum accuracy
- ~10-20 seconds per image

**2. Gemini Validation (OCR + AI structuring):**
```bash
python happy_hour_gemini.py menu.png gemini_validation
# or simply:
python happy_hour_gemini.py menu.png
```
- PaddleOCR extracts text, Gemini structures it
- Good balance of speed and accuracy

**3. Vision Only (Gemini analyzes image directly):**
```bash
python happy_hour_gemini.py menu.png vision
```
- Gemini Vision analyzes the image without OCR
- Fastest method
- Good for clear, high-quality images

### Using in Your Code

```python
from happy_hour_gemini import HappyHourGeminiOCR

# Initialize (only once, reuse for multiple images)
extractor = HappyHourGeminiOCR(use_gpu=False)

# Extract with hybrid method (best for AI projects)
result = extractor.extract_hybrid('menu_image.png')

# Access structured data
print(result['restaurant_name'])
print(result['deals'])
print(result['time_frame'])
print(result['special_conditions'])

# Or get as JSON string
json_output = extractor.extract_to_json_string(
    'menu_image.png',
    method='hybrid',
    pretty=True
)
print(json_output)
```

**Output files:**
- `happy_hour_hybrid.json` - Hybrid method output
- `happy_hour_vision.json` - Vision method output
- `happy_hour_gemini_validation.json` - Validation method output

---

## Basic OCR Usage (Without AI)

### Basic Usage

```python
from paddle_ocr import HandwritingOCR

# Initialize OCR
ocr = HandwritingOCR(
    use_angle_cls=True,  # Handle rotated text
    lang='en',           # Language
    use_lite=True,       # Use mobile/lite models
    use_gpu=False        # CPU mode
)

# Extract text from image
text = ocr.extract_full_text(
    "your_image.jpg",
    preprocess=True,      # Apply preprocessing
    enhance_contrast=True,
    denoise=True,
    min_confidence=0.3
)

print(text)
```

### Handwriting Recognition

```python
# Optimized settings for handwriting
ocr = HandwritingOCR(
    use_angle_cls=True,
    lang='en',
    use_lite=True
)

# Process handwritten image
results = ocr.recognize_text_simple(
    "handwriting.jpg",
    preprocess=True,
    enhance_contrast=True,
    denoise=True,
    binarize=False,      # Set True for clean handwriting on white paper
    min_confidence=0.2   # Lower threshold for handwriting
)

for r in results:
    print(f"{r['text']} (confidence: {r['confidence']:.2%})")
```

### Detailed Results with Bounding Boxes

```python
results = ocr.recognize_text_simple("image.jpg", preprocess=True)

for r in results:
    print(f"Text: {r['text']}")
    print(f"Confidence: {r['confidence']}")
    print(f"Bounding Box: {r['bbox']}")
    print(f"Center: {r['center']}")
```

### Visualization

```python
import cv2

# Get results
results = ocr.recognize_text_simple("image.jpg", preprocess=True)

# Visualize on image
img = cv2.imread("image.jpg")
ocr.visualize_results(
    img,
    results,
    output_path="output_annotated.jpg",
    show_confidence=True
)
```

### Batch Processing

```python
# Process multiple images
image_list = ["image1.jpg", "image2.jpg", "image3.jpg"]

results = ocr.batch_process(
    image_list,
    output_dir="output_visualizations",
    preprocess=True,
    min_confidence=0.3
)
```

## Preprocessing Options

The preprocessing significantly improves handwriting recognition:

### 1. Contrast Enhancement (CLAHE)
```python
enhance_contrast=True  # Recommended for all cases
```
- Improves text visibility in poor lighting
- Handles uneven illumination

### 2. Denoising
```python
denoise=True  # Recommended for camera photos
```
- Removes camera noise
- Improves recognition accuracy

### 3. Binarization
```python
binarize=True  # Use for clean handwriting on white paper
```
- Converts to black text on white background
- Best for scanned documents or clear handwriting
- May hurt performance on photos

### Recommended Settings by Use Case

**Camera Photos of Handwriting:**
```python
preprocess=True
enhance_contrast=True
denoise=True
binarize=False
min_confidence=0.2
```

**Scanned Documents:**
```python
preprocess=True
enhance_contrast=True
denoise=False
binarize=True
min_confidence=0.3
```

**High-Quality Images:**
```python
preprocess=False
min_confidence=0.5
```

## Model Configuration

### Using Custom Models

```python
ocr = HandwritingOCR(
    det_model_dir="path/to/detection/model",
    rec_model_dir="path/to/recognition/model",
    cls_model_dir="path/to/classification/model"
)
```

### Download Custom Models

PaddleOCR automatically downloads models on first use. For manual download:

```bash
# English mobile models
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/english/en_PP-OCRv4_det_infer.tar
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/english/en_PP-OCRv4_rec_infer.tar

# Chinese mobile models
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_mobile_infer.tar
wget https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_mobile_infer.tar

# Extract
tar -xf en_PP-OCRv4_det_infer.tar
tar -xf en_PP-OCRv4_rec_infer.tar
```

## Supported Languages

The following languages are supported with mobile models:

- `en` - English
- `ch` - Chinese (Simplified)
- `chinese_cht` - Chinese (Traditional)
- `korean` - Korean
- `japan` - Japanese
- `ta` - Tamil
- `te` - Telugu
- `ka` - Kannada
- `latin` - Latin
- `arabic` - Arabic
- `cyrillic` - Cyrillic
- `devanagari` - Devanagari

And 70+ more languages!

```python
# Use different language
ocr = HandwritingOCR(lang='ch')  # Chinese
ocr = HandwritingOCR(lang='korean')  # Korean
```

## Advanced Features

### Adjusting Detection Parameters

For better handwriting detection, adjust these parameters:

```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    det_db_thresh=0.3,        # Lower = more sensitive (default: 0.3)
    det_db_box_thresh=0.5,    # Box threshold (default: 0.5)
    det_db_unclip_ratio=1.6,  # Expand boxes (default: 1.6, higher = larger boxes)
    drop_score=0.2,           # Minimum confidence (default: 0.5, lower for handwriting)
    use_angle_cls=True,       # Enable rotation detection
    lang='en'
)
```

### Processing from Camera/Video

```python
import cv2

# Capture from camera
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run OCR on frame
    results = ocr.recognize_text_simple(
        frame,
        preprocess=True,
        min_confidence=0.3
    )

    # Visualize
    annotated = ocr.visualize_results(frame, results)
    cv2.imshow('OCR', annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Performance Tips

1. **Use Lite Models**: Set `use_lite=True` for faster inference
2. **Enable MKLDNN**: Set `enable_mkldnn=True` for CPU acceleration
3. **Use GPU**: Set `use_gpu=True` if GPU available
4. **Batch Processing**: Process multiple images together for better throughput
5. **Preprocessing**: Only apply necessary preprocessing steps
6. **Lower Confidence**: For handwriting, use `min_confidence=0.2-0.3`

## Troubleshooting

### Issue: No text detected

**Solutions:**
- Lower `min_confidence` threshold (try 0.2)
- Enable preprocessing: `preprocess=True`
- Try different preprocessing combinations
- Check if image is too blurry or low resolution

### Issue: Poor handwriting recognition

**Solutions:**
- Use `use_angle_cls=True` for rotated text
- Lower `det_db_thresh=0.2` for more sensitive detection
- Increase `det_db_unclip_ratio=2.0` to expand bounding boxes
- Use preprocessing with `enhance_contrast=True`
- Ensure good lighting and image quality

### Issue: Text detected but incorrect

**Solutions:**
- Try different language models
- Improve image quality
- Use binarization for clear handwriting: `binarize=True`
- Check if correct language is selected

### Issue: Slow performance

**Solutions:**
- Use `use_lite=True` for mobile models
- Enable GPU: `use_gpu=True`
- Reduce image size before processing
- Enable MKLDNN: `enable_mkldnn=True`

## Examples

**Hybrid OCR + AI Example:**
```bash
python happy_hour_gemini.py happy_hour.png hybrid
```

**Basic OCR Example:**
```python
from paddle_ocr import HandwritingOCR

ocr = HandwritingOCR(use_lite=True, lang='en')
results = ocr.recognize_text_simple("image.jpg", preprocess=True)

for r in results:
    print(f"{r['text']} (confidence: {r['confidence']:.2%})")
```

## NCNN Deployment (Mobile/Embedded)

For mobile or embedded deployment, convert PaddleOCR models to NCNN format:

```bash
# Install paddle2onnx
pip install paddle2onnx

# Convert PaddlePaddle model to ONNX
paddle2onnx --model_dir inference_model \
            --model_filename model.pdmodel \
            --params_filename model.pdiparams \
            --save_file model.onnx

# Convert ONNX to NCNN
./ncnn/build/tools/onnx2ncnn model.onnx model.param model.bin
```

## References

- [PaddleOCR Documentation](https://github.com/PaddlePaddle/PaddleOCR)
- [NCNN Framework](https://github.com/Tencent/ncnn)
- [Model Zoo](https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_en/models_list_en.md)

## License

This project uses PaddleOCR which is licensed under Apache License 2.0.
