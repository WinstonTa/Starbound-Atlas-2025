import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import json
from models import MenuParsing

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def parse_menu_image(image_path: str) -> MenuParsing:
    # Load and immediately close the image file to avoid file locks on Windows
    image = Image.open(image_path)
    image.load()  # Load image data into memory

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = """
    Analyze this happy hour menu image and extract deal information in JSON format.

    Return a JSON object with this exact structure:
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

    For special_conditions, extract each restriction as a separate bullet point in an array.
    Examples: ["Dine-in only", "Max 2 per person", "Not valid on holidays"]

    Return ONLY valid JSON, no markdown, no extra text.
    """
    
    # send image and prompt to Gemini
    response = model.generate_content([prompt, image])

    json_text = response.text.strip()

    # Remove markdown code blocks if present (```json ... ```)
    if json_text.startswith('```'):
        # Find the actual JSON content between code blocks
        json_text = json_text.split('```')[1]
        if json_text.startswith('json'):
            json_text = json_text[4:]  # Remove 'json' language identifier
        json_text = json_text.strip()

    print(f"DEBUG - Gemini response: {json_text}")  # Debug output

    parse_data = json.loads(json_text)

    return MenuParsing(**parse_data)