# Starbound - Happy Hour Menu Parser

AI-powered happy hour menu parser that extracts deal information from images and uploads to Firebase.

## Project Structure

```
starbound/
├── ai/
│   └── gemini_parser/          # Gemini AI-based menu parser
│       ├── gemini.py           # Gemini AI integration
│       ├── models.py           # Pydantic data models
│       ├── main.py             # FastAPI server
│       ├── upload_to_firebase.py  # Firebase upload script
│       ├── requirements.txt    # Python dependencies
│       └── .env                # API keys (not in git)
│
├── paddle_ocr/                 # PaddleOCR-based parser (alternative)
│   ├── firebase_uploader.py   # Shared Firebase uploader
│   ├── paddle_ocr.py           # PaddleOCR implementation
│   ├── happy_hour_service_account.json  # Firebase credentials (not in git)
│   └── requirements.txt        # Python dependencies
│
├── venv/                       # Python virtual environment
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Features

- **AI Menu Parsing**: Uses Google Gemini AI to extract deal information from menu images
- **Firebase Integration**: Automatically uploads parsed deals to Firestore
- **Structured Data**: Extracts deals with pricing, descriptions, time windows, and conditions
- **FastAPI Server**: RESTful API for menu parsing

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
```

### 2. Install Dependencies

```bash
cd ai/gemini_parser
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `ai/gemini_parser/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT=../../paddle_ocr/happy_hour_service_account.json
```

### 4. Add Firebase Service Account

Place your Firebase service account JSON file at:
`paddle_ocr/happy_hour_service_account.json`

## Usage

### Parse and Upload Menu

```bash
cd ai/gemini_parser
python upload_to_firebase.py ../../paddle_ocr/happy_hour.png
```

### Run FastAPI Server

```bash
cd ai/gemini_parser
uvicorn main:app --reload
```

Then visit `http://localhost:8000/docs` for the API documentation.

### Upload with Venue Information (Programmatic)

```python
from upload_to_firebase import upload_menu_to_firebase

venue_info = {
    "venue_id": 1234,
    "venue_name": "Restaurant Name",
    "latitude": 33.785421,
    "longitude": -118.149881,
    "address": {
        "street": "123 Main St",
        "city": "City",
        "state": "CA",
        "zip": "12345"
    }
}

doc_id = upload_menu_to_firebase(
    "path/to/image.jpg",
    venue_info=venue_info
)
```

## Data Schema

Uploaded documents follow this structure:

```json
{
  "venue_id": null,
  "venue_name": null,
  "latitude": null,
  "longitude": null,
  "address": {},
  "deals": [
    {
      "name": "Deal Name",
      "price": "$10",
      "description": "Deal description",
      "start_time": "4:00 PM",
      "end_time": "7:00 PM",
      "days": ["Monday", "Tuesday", "Wednesday"],
      "special_conditions": ["Condition 1", "Condition 2"]
    }
  ]
}
```

## Technologies

- **Google Gemini AI**: Advanced vision model for menu parsing
- **Firebase/Firestore**: Cloud database for storing deals
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation and settings management
- **Python-dotenv**: Environment variable management

## Development

### Project Requirements

- Python 3.9+
- Google Gemini API key
- Firebase project with Firestore enabled

### Git Workflow

The project uses git for version control. Sensitive files are excluded via `.gitignore`:
- `.env` files (API keys)
- `venv/` (virtual environment)
- Firebase service account JSON files
- `__pycache__/` directories

## License

Private project
