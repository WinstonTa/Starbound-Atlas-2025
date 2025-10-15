from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
from pathlib import Path
from gemini import parse_menu_image
from models import MenuParsing
import os

app = FastAPI(
    title="Happy Hour Deal Parser API",
    description="Upload menu images to extract happy hour deals using AI",
    version="1.0.0"
)

#temporary directory to upload
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    """Root endpoint - API status check"""
    return {
        "message": "Happy Hour Deal Parser API is running!",
        "docs": "/docs",
        "endpoints": {
            "parse_menu": "/parse-menu (POST)"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/parse-menu", response_model=MenuParsing)
async def parse_menu(file: UploadFile = File(...)):
    """
    Upload a happy hour menu image and get structured deal data.
    
    Args:
        file: Image file (jpg, png, etc.)
        
    Returns:
        MenuParsing object with extracted deals and time windows
    """
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save uploaded file temporarily
    temp_file_path = UPLOAD_DIR / file.filename
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse the image with Gemini
        result = parse_menu_image(str(temp_file_path))
        
        return result
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR DETAILS: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
    
    finally:
        # Clean up: delete temporary file
        if temp_file_path.exists():
            os.remove(temp_file_path)