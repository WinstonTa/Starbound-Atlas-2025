import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
import json
from models import MenuParsing

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def parse_menu_image(image_path: str) -> MenuParsing:
    image = Image.open(image_path)

    model = genai.GenerativeModel('gemini-1.5-flash')
    
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
        "special_conditions": "any restrictions like 'dine-in only' or null"
    }
    
    Return ONLY valid JSON, no markdown, no extra text.
    """
    
    # send image and prompt to Gemini
    response = model.generate_content([prompt, image])

    json_text = response.text.strip()
    parse_data = json.loads(json_text)
    
    return MenuParsing(**parse_data)