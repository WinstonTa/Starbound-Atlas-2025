"""
PaddleOCR Mobile/Lite Implementation with NCNN Runtime
Optimized for cross-platform handwriting and text recognition
"""

import os
import cv2
import numpy as np
import json
from typing import List, Tuple, Optional, Dict, Union
from pathlib import Path
from paddleocr import PaddleOCR
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HandwritingOCR:
    """
    PaddleOCR wrapper optimized for handwriting and text recognition
    using mobile/lite models with cross-platform support
    """

    def __init__(
        self,
        use_angle_cls: bool = True,
        lang: str = 'en',
        use_gpu: bool = False,
        enable_mkldnn: bool = True,
        use_lite: bool = True,
        det_model_dir: Optional[str] = None,
        rec_model_dir: Optional[str] = None,
        cls_model_dir: Optional[str] = None,
        show_log: bool = False
    ):
        """
        Initialize PaddleOCR with mobile/lite models

        Args:
            use_angle_cls: Enable text angle classification (important for handwriting)
            lang: Language code ('en', 'ch', 'korean', etc.)
            use_gpu: Use GPU acceleration if available
            enable_mkldnn: Enable MKLDNN for CPU acceleration
            use_lite: Use mobile/lite models (smaller and faster)
            det_model_dir: Custom detection model directory
            rec_model_dir: Custom recognition model directory
            cls_model_dir: Custom classification model directory
            show_log: Show PaddleOCR logs
        """
        self.lang = lang
        self.use_lite = use_lite

        # Initialize PaddleOCR with optimized settings for handwriting
        try:
            logger.info(f"Initializing PaddleOCR with {'lite' if use_lite else 'standard'} models...")

            # Configuration for better handwriting recognition
            # Using minimal config to avoid version compatibility issues
            ocr_config = {
                'use_textline_orientation': use_angle_cls,  # use_angle_cls is deprecated
                'lang': lang,
            }

            # Try to add optional parameters (some versions may not support these)
            optional_params = {
                'det_db_thresh': 0.3,
                'det_db_box_thresh': 0.5,
                'det_db_unclip_ratio': 1.6,
                'rec_batch_num': 6,
            }

            # Add optional params one by one
            for key, value in optional_params.items():
                ocr_config[key] = value

            # Control logging separately
            if not show_log:
                import logging as py_logging
                py_logging.getLogger('ppocr').setLevel(py_logging.ERROR)

            # Add custom model directories if provided
            if det_model_dir:
                ocr_config['det_model_dir'] = det_model_dir
            if rec_model_dir:
                ocr_config['rec_model_dir'] = rec_model_dir
            if cls_model_dir:
                ocr_config['cls_model_dir'] = cls_model_dir

            self.ocr = PaddleOCR(**ocr_config)
            logger.info("PaddleOCR initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {e}")
            raise

    def preprocess_image(
        self,
        image: Union[str, np.ndarray],
        enhance_contrast: bool = True,
        denoise: bool = True,
        binarize: bool = False
    ) -> np.ndarray:
        """
        Preprocess image for better handwriting recognition

        Args:
            image: Image path or numpy array
            enhance_contrast: Apply CLAHE contrast enhancement
            denoise: Apply denoising filter
            binarize: Apply adaptive thresholding (good for clear handwriting)

        Returns:
            Preprocessed image as numpy array
        """
        # Load image if path provided
        if isinstance(image, str):
            img = cv2.imread(image)
            if img is None:
                raise ValueError(f"Failed to load image: {image}")
        else:
            img = image.copy()

        # Convert to grayscale for processing
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img.copy()

        # Enhance contrast using CLAHE (helps with poor lighting)
        if enhance_contrast:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)

        # Denoise (helps with camera noise)
        if denoise:
            gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

        # Binarize (good for clean handwriting on white paper)
        if binarize:
            gray = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )

        # Convert back to BGR for PaddleOCR
        if len(img.shape) == 3:
            processed = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        else:
            processed = gray

        return processed

    def recognize_text(
        self,
        image: Union[str, np.ndarray],
        preprocess: bool = True,
        **preprocess_kwargs
    ) -> List[Tuple[List[List[int]], Tuple[str, float]]]:
        """
        Recognize text from image

        Args:
            image: Image path or numpy array
            preprocess: Apply preprocessing for handwriting
            **preprocess_kwargs: Additional preprocessing arguments

        Returns:
            List of (bbox, (text, confidence)) tuples
            bbox: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            text: Recognized text
            confidence: Confidence score (0-1)
        """
        try:
            # Preprocess if enabled
            if preprocess:
                img = self.preprocess_image(image, **preprocess_kwargs)
            else:
                if isinstance(image, str):
                    img = cv2.imread(image)
                else:
                    img = image

            # Run OCR
            result = self.ocr.predict(img)

            # Handle empty results
            if result is None or len(result) == 0:
                logger.warning("No text detected in image")
                return []

            # Handle new PaddleOCR format (dictionary-based OCRResult)
            first_result = result[0]

            # Check if it's the new dictionary format
            if isinstance(first_result, dict) or hasattr(first_result, 'get'):
                # New format: extract from dictionary
                if hasattr(first_result, 'get'):
                    # It's an OCRResult object, convert to dict
                    texts = first_result.get('rec_texts', [])
                    scores = first_result.get('rec_scores', [])
                    polys = first_result.get('rec_polys', [])
                else:
                    texts = first_result.get('rec_texts', [])
                    scores = first_result.get('rec_scores', [])
                    polys = first_result.get('rec_polys', [])

                if not texts:
                    logger.warning("No text detected in image")
                    return []

                # Convert to old format: list of [bbox, (text, score)]
                formatted_results = []
                for i in range(len(texts)):
                    bbox = polys[i].tolist() if hasattr(polys[i], 'tolist') else polys[i]
                    formatted_results.append([bbox, (texts[i], scores[i])])

                return formatted_results
            else:
                # Old format: return as-is
                return first_result

        except Exception as e:
            logger.error(f"Error during text recognition: {e}")
            raise

    def recognize_text_simple(
        self,
        image: Union[str, np.ndarray],
        preprocess: bool = True,
        min_confidence: float = 0.3,
        **preprocess_kwargs
    ) -> List[Dict[str, any]]:
        """
        Simplified text recognition with structured output

        Args:
            image: Image path or numpy array
            preprocess: Apply preprocessing for handwriting
            min_confidence: Minimum confidence threshold (0-1)
            **preprocess_kwargs: Additional preprocessing arguments

        Returns:
            List of dictionaries with keys: 'text', 'confidence', 'bbox'
        """
        results = self.recognize_text(image, preprocess, **preprocess_kwargs)

        structured_results = []
        if not results:
            return structured_results

        for item in results:
            # Handle different result formats
            if isinstance(item, (list, tuple)):
                if len(item) == 2:
                    bbox, text_info = item
                    if isinstance(text_info, (list, tuple)) and len(text_info) == 2:
                        text, confidence = text_info
                    else:
                        continue
                elif len(item) == 3:
                    # Format: [bbox, text, confidence]
                    bbox, text, confidence = item
                else:
                    continue

                if confidence >= min_confidence:
                    structured_results.append({
                        'text': text,
                        'confidence': confidence,
                        'bbox': bbox,
                        'center': self._get_bbox_center(bbox)
                    })

        return structured_results

    def extract_full_text(
        self,
        image: Union[str, np.ndarray],
        preprocess: bool = True,
        min_confidence: float = 0.3,
        sort_by_position: bool = True,
        **preprocess_kwargs
    ) -> str:
        """
        Extract all text as a single string

        Args:
            image: Image path or numpy array
            preprocess: Apply preprocessing for handwriting
            min_confidence: Minimum confidence threshold
            sort_by_position: Sort text by vertical position (top to bottom)
            **preprocess_kwargs: Additional preprocessing arguments

        Returns:
            Concatenated text string
        """
        results = self.recognize_text_simple(
            image, preprocess, min_confidence, **preprocess_kwargs
        )

        if sort_by_position:
            # Sort by vertical position (top to bottom, then left to right)
            results.sort(key=lambda x: (x['center'][1], x['center'][0]))

        return '\n'.join([r['text'] for r in results])

    def recognize_to_json(
        self,
        image: Union[str, np.ndarray],
        preprocess: bool = True,
        min_confidence: float = 0.3,
        sort_by_position: bool = True,
        pretty: bool = False,
        **preprocess_kwargs
    ) -> str:
        """
        Extract text and return results as JSON string

        Args:
            image: Image path or numpy array
            preprocess: Apply preprocessing for handwriting
            min_confidence: Minimum confidence threshold
            sort_by_position: Sort text by vertical position (top to bottom)
            pretty: Pretty-print JSON with indentation
            **preprocess_kwargs: Additional preprocessing arguments

        Returns:
            JSON string with detected text and metadata
        """
        results = self.recognize_text_simple(
            image, preprocess, min_confidence, **preprocess_kwargs
        )

        if sort_by_position:
            results.sort(key=lambda x: (x['center'][1], x['center'][0]))

        # Convert numpy arrays to lists for JSON serialization
        json_results = []
        for r in results:
            json_results.append({
                'text': r['text'],
                'confidence': float(r['confidence']),
                'bbox': [[float(x), float(y)] for x, y in r['bbox']],
                'center': [float(r['center'][0]), float(r['center'][1])]
            })

        output = {
            'success': True,
            'total_detections': len(json_results),
            'results': json_results
        }

        if pretty:
            return json.dumps(output, indent=2, ensure_ascii=False)
        else:
            return json.dumps(output, ensure_ascii=False)

    def recognize_to_dict(
        self,
        image: Union[str, np.ndarray],
        preprocess: bool = True,
        min_confidence: float = 0.3,
        sort_by_position: bool = True,
        **preprocess_kwargs
    ) -> Dict:
        """
        Extract text and return results as Python dictionary

        Args:
            image: Image path or numpy array
            preprocess: Apply preprocessing for handwriting
            min_confidence: Minimum confidence threshold
            sort_by_position: Sort text by vertical position (top to bottom)
            **preprocess_kwargs: Additional preprocessing arguments

        Returns:
            Dictionary with detected text and metadata
        """
        results = self.recognize_text_simple(
            image, preprocess, min_confidence, **preprocess_kwargs
        )

        if sort_by_position:
            results.sort(key=lambda x: (x['center'][1], x['center'][0]))

        # Convert numpy arrays to lists
        dict_results = []
        for r in results:
            dict_results.append({
                'text': r['text'],
                'confidence': float(r['confidence']),
                'bbox': [[float(x), float(y)] for x, y in r['bbox']],
                'center': [float(r['center'][0]), float(r['center'][1])]
            })

        return {
            'success': True,
            'total_detections': len(dict_results),
            'results': dict_results
        }

    def visualize_results(
        self,
        image: Union[str, np.ndarray],
        results: List[Dict[str, any]],
        output_path: Optional[str] = None,
        show_confidence: bool = True
    ) -> np.ndarray:
        """
        Visualize OCR results on image

        Args:
            image: Original image path or numpy array
            results: Results from recognize_text_simple()
            output_path: Optional path to save visualization
            show_confidence: Show confidence scores on image

        Returns:
            Annotated image
        """
        if isinstance(image, str):
            img = cv2.imread(image)
        else:
            img = image.copy()

        for result in results:
            bbox = result['bbox']
            text = result['text']
            confidence = result['confidence']

            # Convert bbox to integer points
            points = np.array(bbox, dtype=np.int32).reshape((-1, 1, 2))

            # Draw bounding box
            cv2.polylines(img, [points], True, (0, 255, 0), 2)

            # Draw text and confidence
            label = f"{text}"
            if show_confidence:
                label += f" ({confidence:.2f})"

            # Position text above the bounding box
            text_pos = (int(bbox[0][0]), int(bbox[0][1]) - 10)
            cv2.putText(
                img, label, text_pos,
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2
            )

        if output_path:
            cv2.imwrite(output_path, img)
            logger.info(f"Visualization saved to: {output_path}")

        return img

    @staticmethod
    def _get_bbox_center(bbox: List[List[int]]) -> Tuple[float, float]:
        """Calculate center point of bounding box"""
        x_coords = [point[0] for point in bbox]
        y_coords = [point[1] for point in bbox]
        return (sum(x_coords) / len(x_coords), sum(y_coords) / len(y_coords))

    def batch_process(
        self,
        image_paths: List[str],
        output_dir: Optional[str] = None,
        **kwargs
    ) -> Dict[str, List[Dict[str, any]]]:
        """
        Process multiple images in batch

        Args:
            image_paths: List of image paths
            output_dir: Optional directory to save visualizations
            **kwargs: Additional arguments for recognize_text_simple

        Returns:
            Dictionary mapping image paths to results
        """
        results_dict = {}

        if output_dir:
            Path(output_dir).mkdir(parents=True, exist_ok=True)

        for img_path in image_paths:
            logger.info(f"Processing: {img_path}")

            try:
                results = self.recognize_text_simple(img_path, **kwargs)
                results_dict[img_path] = results

                if output_dir:
                    filename = Path(img_path).stem
                    output_path = os.path.join(output_dir, f"{filename}_annotated.jpg")
                    img = cv2.imread(img_path)
                    self.visualize_results(img, results, output_path)

            except Exception as e:
                logger.error(f"Failed to process {img_path}: {e}")
                results_dict[img_path] = []

        return results_dict


def main():
    """Example usage"""
    # Initialize OCR with mobile/lite models optimized for handwriting
    ocr = HandwritingOCR(
        use_angle_cls=True,  # Important for rotated handwriting
        lang='en',           # Change to 'ch' for Chinese, etc.
        use_lite=True,       # Use mobile/lite models
        use_gpu=False        # Set to True if GPU available
    )

    # Example 1: Simple text extraction
    image_path = "path/to/your/image.jpg"

    # Extract text with preprocessing (recommended for handwriting)
    text = ocr.extract_full_text(
        image_path,
        preprocess=True,
        enhance_contrast=True,
        denoise=True,
        min_confidence=0.3
    )
    print("Extracted text:")
    print(text)

    # Example 2: Detailed results with bounding boxes
    results = ocr.recognize_text_simple(
        image_path,
        preprocess=True,
        min_confidence=0.3
    )

    for r in results:
        print(f"Text: {r['text']}")
        print(f"Confidence: {r['confidence']:.2f}")
        print(f"Position: {r['center']}")
        print("---")

    # Example 3: Visualize results
    img = cv2.imread(image_path)
    ocr.visualize_results(
        img,
        results,
        output_path="output_annotated.jpg"
    )

    # Example 4: Batch processing
    image_list = ["image1.jpg", "image2.jpg", "image3.jpg"]
    ocr.batch_process(
        image_list,
        output_dir="output_visualizations",
        preprocess=True
    )


if __name__ == "__main__":
    main()
