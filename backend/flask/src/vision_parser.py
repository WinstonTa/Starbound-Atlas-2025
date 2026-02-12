"""
Nexa AI Vision Menu Parser
Nexa AI VLM-based menu extraction without OCR
"""
import os
import json
import base64
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class VisionMenuParser:
    """Nexa AI Vision menu parser"""

    def __init__(self, api_url=None):
        """
        Initialize Nexa AI Vision parser

        Args:
            api_url: Nexa API server URL (optional, reads from NEXA_API_URL env var)
        """
        self.api_url = api_url or os.getenv('NEXA_API_URL', 'http://127.0.0.1:18181')
        self.model_name = os.getenv('NEXA_MODEL', 'NexaAI/Qwen3-VL-4B-Instruct-GGUF')
        print(f"[OK] Nexa AI Vision initialized (server: {self.api_url})")

    def parse_menu(self, image_path):
        """
        Parse menu image and extract structured data

        Args:
            image_path: Path to menu image

        Returns:
            dict: Structured menu data with restaurant_name, deals, time_frame, special_conditions
        """
        print(f"\n{'='*70}")
        print(f"Processing: {image_path}")
        print(f"{'='*70}\n")

        try:
            # Prepare image path for Nexa API
            print(f"Loading image: {image_path}")
            # Convert to absolute path
            abs_image_path = os.path.abspath(image_path)
            print(f"[OK] Image ready: {abs_image_path}")

            # Create prompt
            prompt = """Analyze this restaurant menu/happy hour deal image.

Extract the information in this EXACT JSON structure:
{
    "restaurant_name": "name if visible, otherwise null",
    "deals": [
        {
            "name": "item name",
            "price": "price as string (e.g., '$19.99', 'Free')",
            "description": "details about the deal or null"
        }
    ],
    "time_frame": [
        {
            "start_time": "e.g., '4:00 PM'",
            "end_time": "e.g., '7:00 PM'",
            "days": ["Monday", "Tuesday"] or null if not shown
        }
    ],
    "special_conditions": ["condition 1", "condition 2"] or null
}

Important:
- Extract ALL deals/items visible
- Use full day names (Monday, not Mon)
- Correct any OCR-like errors in text
- Include all restrictions/conditions
- Return ONLY valid JSON, no markdown formatting"""

            # Call Nexa AI Vision
            print("Analyzing image with Nexa AI Vision...")
            payload = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": abs_image_path}}
                        ]
                    }
                ],
                "max_tokens": 2048
            }
            response = requests.post(
                f"{self.api_url}/v1/chat/completions",
                json=payload
            )
            response.raise_for_status()
            response_text = response.json()["choices"][0]["message"]["content"].strip()

            print(f"[DEBUG] Raw Nexa response length: {len(response_text)} characters")
            print(f"[DEBUG] First 200 chars: {response_text[:200]}")
            print(f"[DEBUG] Full response:\n{response_text}\n")

            # Clean response (remove markdown if present)
            if response_text.startswith('```'):
                print("[DEBUG] Response has markdown formatting, cleaning...")
                json_text = response_text.split('```')[1]
                if json_text.startswith('json'):
                    json_text = json_text[4:]
                response_text = json_text.strip()
                print(f"[DEBUG] Cleaned response:\n{response_text}\n")

            # Parse JSON
            print("[DEBUG] Attempting to parse JSON...")
            data = json.loads(response_text)
            print(f"[DEBUG] JSON parsed successfully!")
            print(f"[DEBUG] Parsed data type: {type(data)}")
            print(f"[DEBUG] Parsed data keys: {data.keys() if isinstance(data, dict) else 'Not a dict'}")

            print(f"[OK] Extracted data:")
            print(f"  Restaurant: {data.get('restaurant_name')}")
            deals = data.get('deals', [])
            print(f"  Deals: {len(deals) if deals else 0} items")
            time_frame = data.get('time_frame', [])
            print(f"  Time Frames: {len(time_frame) if time_frame else 0} slots")
            conditions = data.get('special_conditions', [])
            print(f"  Conditions: {len(conditions) if conditions else 0} items")

            return data

        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse JSON response: {e}")
            print(f"Response was: {response_text}")
            return {
                "restaurant_name": None,
                "deals": None,
                "time_frame": None,
                "special_conditions": None,
                "error": f"JSON parsing error: {str(e)}"
            }

        except Exception as e:
            print(f"[ERROR] Vision parsing failed: {e}")
            return {
                "restaurant_name": None,
                "deals": None,
                "time_frame": None,
                "special_conditions": None,
                "error": str(e)
            }

    def parse_to_json(self, image_path, pretty=True):
        """
        Parse menu and return as JSON string

        Args:
            image_path: Path to menu image
            pretty: Pretty print JSON (default: True)

        Returns:
            str: JSON string
        """
        data = self.parse_menu(image_path)
        return json.dumps(data, indent=2 if pretty else None)


def main():
    """Example usage"""
    import argparse

    parser = argparse.ArgumentParser(description='Parse menu image with Nexa AI Vision')
    parser.add_argument('image', help='Path to menu image')
    parser.add_argument('--output', '-o', help='Output JSON file (optional)')

    args = parser.parse_args()

    # Initialize parser
    parser = VisionMenuParser()

    # Parse menu
    data = parser.parse_menu(args.image)

    # Print result
    print(f"\n{'='*70}")
    print("EXTRACTED DATA:")
    print(f"{'='*70}")
    print(json.dumps(data, indent=2))

    # Save to file if specified
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"\n[OK] Saved to: {args.output}")


if __name__ == "__main__":
    main()
