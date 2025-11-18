"""
Flask API for Menu Image Upload and Processing
Accepts image uploads from frontend, processes with Gemini Vision, uploads to Firebase
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_uploader import FirebaseUploader
import os
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

app.config["UPLOAD_FOLDER"] = "temp_uploads"
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Initialize Firebase uploader
try:
    uploader = FirebaseUploader()
    print("[OK] Firebase uploader initialized")
except Exception as e:
    print(f"[ERROR] Failed to initialize Firebase uploader: {e}")
    uploader = None


def allowed_file(filename):
    """Check if file extension is allowed"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "menu-parser-api",
            "timestamp": datetime.utcnow().isoformat(),
        }
    ), 200


@app.route("/upload-menu", methods=["POST"])
def upload_menu():
    """
    Upload menu image, process with Gemini Vision, and upload to Firebase

    Request:
        - image: Image file (multipart/form-data)
        - collection: Optional Firestore collection name

    Response:
        {
            "success": true,
            "document_id": "abc123",
            "data": { extracted menu data },
            "message": "Menu uploaded successfully"
        }
    """
    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    # Check if image is in request
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify(
            {
                "success": False,
                "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            }
        ), 400

    # Get collection parameter
    collection = request.form.get('collection', 'final_schema')

    # Save file temporarily
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], f"{timestamp}_{filename}")

    try:
        file.save(filepath)
        print(f"[OK] Saved image to: {filepath}")

        # Process and upload to Firebase with Gemini Vision
        doc_id = uploader.upload_menu(filepath, collection=collection)

        # Get the uploaded data
        uploaded_data = uploader.get_restaurant(doc_id, collection=collection)

        # Clean up temp file
        os.remove(filepath)
        print(f"[OK] Cleaned up temp file: {filepath}")

        return jsonify(
            {
                "success": True,
                "document_id": doc_id,
                "data": uploaded_data,
                "message": "Menu uploaded and processed successfully",
            }
        ), 200

    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(filepath):
            os.remove(filepath)

        print(f"[ERROR] Upload failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 422


@app.route("/update-menu/<doc_id>", methods=["PUT"])
def update_menu(doc_id):
    """
    Update existing menu data in Firebase

    Request body (JSON):
        {
            "restaurant_name": "Updated Name",
            "deals": [...],
            "time_frame": [...],
            "special_conditions": [...]
        }
    """
    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    try:
        updates = request.json
        collection = request.args.get("collection", "final_schema")

        uploader.update_menu(doc_id, updates, collection=collection)

        return jsonify(
            {
                "success": True,
                "document_id": doc_id,
                "message": "Menu updated successfully",
            }
        ), 200

    except Exception as e:
        print(f"[ERROR] Update failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/get-menu/<doc_id>", methods=["GET"])
def get_menu(doc_id):
    """
    Get menu data by document ID
    """
    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    try:
        collection = request.args.get("collection", "final_schema")
        data = uploader.get_restaurant(doc_id, collection=collection)

        if data:
            return jsonify({"success": True, "data": data}), 200
        else:
            return jsonify({"success": False, "error": "Menu not found"}), 404

    except Exception as e:
        print(f"[ERROR] Get failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/get-all-menus", methods=["GET"])
def get_all_menus():
    """
    Get all menus from Firebase

    Query params:
        - collection: Collection name (default: final_schema)
        - limit: Max number of results
    """
    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    try:
        collection = request.args.get("collection", "final_schema")
        limit = request.args.get("limit", type=int)

        data = uploader.get_all_restaurants(collection=collection, limit=limit)

        return jsonify({"success": True, "count": len(data), "data": data}), 200

    except Exception as e:
        print(f"[ERROR] Get all failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 70)
    print("Menu Parser API Server")
    print("=" * 70)
    print("Endpoints:")
    print("  GET  /health              - Health check")
    print("  POST /upload-menu         - Upload and process menu image")
    print("  PUT  /update-menu/<id>    - Update menu data")
    print("  GET  /get-menu/<id>       - Get menu by ID")
    print("  GET  /get-all-menus       - Get all menus")
    print("=" * 70)
    print("Starting server on http://0.0.0.0:5000")
    print("=" * 70)

    app.run(host="0.0.0.0", port=5000, debug=True)
