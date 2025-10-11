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