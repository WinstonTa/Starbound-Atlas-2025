"""
Extract happy hour deals using OCR + Gemini AI validation
Combines PaddleOCR text extraction with Gemini for intelligent structuring
"""

from paddle_ocr import HandwritingOCR
import google.generativeai as genai
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class HappyHourGeminiOCR:
    """Extract and validate happy hour deals using OCR + Gemini"""

    def __init__(self, gemini_api_key=None, use_gpu=False):
        """
        Initialize OCR and Gemini

        Args:
            gemini_api_key: Google Gemini API key (or set GEMINI_API_KEY env var)
            use_gpu: Use GPU for OCR
        """
        # Initialize OCR
        self.ocr = HandwritingOCR(
            use_lite=False,  # Use full models for better accuracy
            lang='en',
            use_gpu=use_gpu,
            show_log=False
        )

        # Initialize Gemini
        api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError(
                "Gemini API key required. Set GEMINI_API_KEY environment variable "
                "or pass gemini_api_key parameter"
            )

        genai.configure(api_key=api_key)
        # Use Gemini 2.5 Flash for both text and vision tasks
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')

    def extract_with_ocr_only(self, image_path, min_confidence=0.3):
        """Extract raw OCR text from image"""
        results = self.ocr.recognize_text_simple(
            image_path,
            preprocess=True,
            enhance_contrast=True,
            denoise=True,
            min_confidence=min_confidence
        )

        # Sort by position (top to bottom, left to right)
        results.sort(key=lambda x: (x['center'][1], x['center'][0]))

        return results

    def extract_with_gemini_validation(self, image_path, min_confidence=0.3):
        """
        Extract happy hour info using OCR + Gemini validation

        Returns JSON with exact structure:
        {
            "restaurant_name": "name if visible, otherwise null",
            "deals": [
                {
                    "name": "item name",
                    "price": "happy hour price as string",
                    "description": "optional details or null"
                }
            ],
            "time_frame": [
                {
                    "start_time": "e.g., 4:00 PM",
                    "end_time": "e.g., 7:00 PM",
                    "days": ["Monday", "Tuesday"] or null if not shown
                }
            ],
            "special_conditions": ["restriction 1", "restriction 2"] or null
        }
        """

        print("Step 1: Running OCR to extract text...")

        # Get OCR results
        ocr_results = self.extract_with_ocr_only(image_path, min_confidence)

        # Extract text with confidence scores
        ocr_text_data = []
        for r in ocr_results:
            ocr_text_data.append({
                'text': r['text'],
                'confidence': round(r['confidence'], 2)
            })

        print(f"  [OK] Extracted {len(ocr_text_data)} text regions")

        # Create structured text for Gemini
        ocr_text_list = [f"- {item['text']} (confidence: {item['confidence']})"
                         for item in ocr_text_data]
        ocr_text_string = '\n'.join(ocr_text_list)

        print("\nStep 2: Sending to Gemini for validation and structuring...")

        # Create prompt for Gemini
        prompt = f"""You are analyzing text extracted from a restaurant happy hour menu image using OCR.

The OCR extracted the following text (with confidence scores):

{ocr_text_string}

Based on this OCR text, extract and structure the happy hour deal information.

Return a JSON object with this EXACT structure:
{{
    "restaurant_name": "name if visible, otherwise null",
    "deals": [
        {{
            "name": "item name",
            "price": "happy hour price as string",
            "description": "optional details or null"
        }}
    ],
    "time_frame": [
        {{
            "start_time": "e.g., 4:00 PM",
            "end_time": "e.g., 7:00 PM",
            "days": ["Monday", "Tuesday"] or null if not shown
        }}
    ],
    "special_conditions": ["restriction 1", "restriction 2"] or null
}}

Important instructions:
1. Use ONLY the text provided by OCR - do not make up information
2. Correct obvious OCR errors (e.g., "HURSDAY" should be "Thursday", "M9PM" should be "9PM")
3. Format times consistently (e.g., "9PM" as "9:00 PM")
4. Expand abbreviated days to full names
5. Group related information logically
6. If price is per person, per child, etc., put that in the description
7. Return ONLY valid JSON, no markdown formatting, no explanation text

OCR text to structure:
{ocr_text_string}"""

        try:
            # Call Gemini
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '', 1)
            if response_text.startswith('```'):
                response_text = response_text.replace('```', '', 1)
            if response_text.endswith('```'):
                response_text = response_text.rsplit('```', 1)[0]

            response_text = response_text.strip()

            # Parse JSON
            structured_data = json.loads(response_text)

            print("  [OK] Gemini validation complete")

            return structured_data

        except json.JSONDecodeError as e:
            print(f"  [ERROR] Error parsing Gemini response: {e}")
            print(f"  Response was: {response_text}")
            # Return fallback structure
            return {
                "restaurant_name": None,
                "deals": None,
                "time_frame": None,
                "special_conditions": None,
                "error": "Failed to parse Gemini response",
                "raw_response": response_text
            }

        except Exception as e:
            print(f"  [ERROR] Error calling Gemini: {e}")
            return {
                "restaurant_name": None,
                "deals": None,
                "time_frame": None,
                "special_conditions": None,
                "error": str(e)
            }

    def extract_with_image_analysis(self, image_path):
        """
        Use Gemini Vision to analyze the image directly (alternative approach)
        This can be more accurate but doesn't use OCR
        """

        print("Analyzing image with Gemini Vision...")

        try:
            # Upload image
            import PIL.Image
            img = PIL.Image.open(image_path)

            prompt = """Analyze this restaurant happy hour menu image.

Extract and return a JSON object with this EXACT structure:
{
    "restaurant_name": "name if visible, otherwise null",
    "deals": [
        {
            "name": "item name",
            "price": "happy hour price as string",
            "description": "optional details or null"
        }
    ],
    "time_frame": [
        {
            "start_time": "e.g., 4:00 PM",
            "end_time": "e.g., 7:00 PM",
            "days": ["Monday", "Tuesday"] or null if not shown
        }
    ],
    "special_conditions": ["restriction 1", "restriction 2"] or null
}

Important:
- Extract ALL visible deals with prices
- Format times consistently (e.g., "9:00 PM")
- Use full day names
- Include any restrictions or conditions
- Return ONLY valid JSON, no markdown formatting"""

            # Call Gemini Vision (1.5 Flash supports multimodal input)
            response = self.model.generate_content([prompt, img])
            response_text = response.text.strip()

            # Clean response
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '', 1)
            if response_text.startswith('```'):
                response_text = response_text.replace('```', '', 1)
            if response_text.endswith('```'):
                response_text = response_text.rsplit('```', 1)[0]

            response_text = response_text.strip()

            # Parse JSON
            structured_data = json.loads(response_text)

            print("  [OK] Vision analysis complete")

            return structured_data

        except Exception as e:
            print(f"  [ERROR] Error: {e}")
            return {
                "restaurant_name": None,
                "deals": None,
                "time_frame": None,
                "special_conditions": None,
                "error": str(e)
            }

    def extract_hybrid(self, image_path, min_confidence=0.3):
        """
        Hybrid approach: Use both OCR+Gemini and pure Vision, then merge
        This gives the best accuracy
        """

        print("Using hybrid approach (OCR + Vision)...")
        print("=" * 70)

        # Method 1: OCR + Gemini validation
        ocr_result = self.extract_with_gemini_validation(image_path, min_confidence)

        print()

        # Method 2: Gemini Vision direct analysis
        vision_result = self.extract_with_image_analysis(image_path)

        print("\n" + "=" * 70)
        print("Merging results...")

        # Use vision result as primary, fill gaps with OCR result
        merged = {
            "restaurant_name": vision_result.get("restaurant_name") or ocr_result.get("restaurant_name"),
            "deals": vision_result.get("deals") or ocr_result.get("deals"),
            "time_frame": vision_result.get("time_frame") or ocr_result.get("time_frame"),
            "special_conditions": vision_result.get("special_conditions") or ocr_result.get("special_conditions")
        }

        return merged

    def extract_to_json_string(self, image_path, method='gemini_validation', pretty=True):
        """
        Extract and return as JSON string

        Args:
            image_path: Path to image
            method: 'gemini_validation' (OCR+Gemini), 'vision' (Gemini Vision only),
                   or 'hybrid' (both)
            pretty: Pretty print JSON
        """

        if method == 'vision':
            data = self.extract_with_image_analysis(image_path)
        elif method == 'hybrid':
            data = self.extract_hybrid(image_path)
        else:  # gemini_validation
            data = self.extract_with_gemini_validation(image_path)

        if pretty:
            return json.dumps(data, indent=4, ensure_ascii=False)
        else:
            return json.dumps(data, ensure_ascii=False)


def main():
    """Example usage"""
    if len(sys.argv) < 2:
        print("Usage: python happy_hour_gemini.py <image_path> [method]")
        print("\nMethods:")
        print("  gemini_validation - OCR + Gemini validation (default, balanced)")
        print("  vision            - Gemini Vision only (fast, accurate)")
        print("  hybrid            - Both methods combined (most accurate)")
        print("\nExample:")
        print("  python happy_hour_gemini.py happy_hour.png")
        print("  python happy_hour_gemini.py happy_hour.png vision")
        sys.exit(1)

    image_path = sys.argv[1]
    method = sys.argv[2] if len(sys.argv) > 2 else 'gemini_validation'

    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print("Error: GEMINI_API_KEY not found in .env file")
        print("\nMake sure you have a .env file with:")
        print('  GEMINI_API_KEY="your_api_key_here"')
        sys.exit(1)

    print(f"Method: {method}")
    print("=" * 70)
    print()

    # Initialize
    extractor = HappyHourGeminiOCR(use_gpu=False)

    # Extract
    json_output = extractor.extract_to_json_string(image_path, method=method, pretty=True)

    print("\n" + "=" * 70)
    print("FINAL STRUCTURED JSON:")
    print("=" * 70)
    print(json_output)

    # Save to file
    output_file = f'happy_hour_{method}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(json_output)

    print(f"\n[OK] Saved to: {output_file}")


if __name__ == "__main__":
    main()
