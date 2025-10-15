# Happy Hour Deal Parser API

An AI-powered API that extracts structured deal information from happy hour menu images using Google Gemini AI.

## Prerequisites

- Python 3.10 or higher
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the API

Start the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Usage

### Upload a menu image

**POST** `/parse-menu`

```bash
curl -X POST "http://localhost:8000/parse-menu" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@menu.jpg"
```

### Response Example

```json
{
  "restaurant_name": "Joe's Bar",
  "deals": [
    {
      "name": "Margarita",
      "price": "$5",
      "description": "Classic lime margarita"
    }
  ],
  "time_frame": [
    {
      "start_time": "4:00 PM",
      "end_time": "7:00 PM",
      "days": ["Monday", "Tuesday", "Wednesday"]
    }
  ],
  "special_conditions": ["Dine-in only", "Max 2 per person"]
}
```

## Project Structure

```
starbound/
├── .env                # API keys
├── requirements.txt    # Dependencies
├── models.py          # Data models
├── gemini.py          # AI service
└── main.py            # FastAPI app
```
