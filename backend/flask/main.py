"""
Flask API for deal Image Upload and Processing
Accepts image uploads from frontend, processes with Gemini Vision, uploads to Firebase
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_uploader import FirebaseUploader
from geoapify import search_restaurants
import os
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

app.config["UPLOAD_FOLDER"] = "/tmp"  # has to be "/tmp"
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
            "service": "deal-parser-api",
            "timestamp": datetime.utcnow().isoformat(),
        }
    ), 200


@app.route("/upload-deal", methods=["POST"])
def upload_deal():
    """
    Upload deal image, process with Gemini Vision, and upload to Firebase

    Request:
        - image: Image file (multipart/form-data)
        - collection: Optional Firestore collection name
        - venue_name: Optional venue name (form data)
        - venue_address: Optional venue address JSON string (form data)

    Response:
        {
      "success": true,
            "document_id": "abc123",
            "data": { extracted deal data },
            "message": "deal uploaded successfully"
        }
    """
    print(f"[DEBUG] Received upload request")
    print(f"[DEBUG] request.files: {request.files}")
    print(f"[DEBUG] request.form: {request.form}")

    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    # Check if image is in request
    if "image" not in request.files:
        print(
            f"[ERROR] No image in request.files. Available keys: {list(request.files.keys())}"
        )
        return jsonify({"success": False, "error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        print(f"[ERROR] Empty filename")
        return jsonify({"success": False, "error": "No selected file"}), 400

    if not allowed_file(file.filename):
        print(f"[ERROR] Invalid file type: {file.filename}")
        return jsonify(
            {
                "success": False,
                "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            }
        ), 400

    # Get collection parameter
    collection = request.form.get("collection", "final_schema")

    # Get venue information from form data
    venue_name = request.form.get("venue_name")
    venue_address = request.form.get("venue_address")  # Expecting JSON string

    # Save file temporarily
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], f"{timestamp}_{filename}")

    try:
        file.save(filepath)
        print(f"[OK] Saved image to: {filepath}")

        # Process and upload to Firebase with Gemini Vision
        doc_id = uploader.upload_deal(filepath, collection=collection)

        # If venue information is provided, update the document
        if venue_name or venue_address:
            import json

            venue_updates = {}

            if venue_name:
                venue_updates["venue_name"] = venue_name

            if venue_address:
                try:
                    address_data = json.loads(venue_address)
                    venue_updates["address"] = address_data
                except json.JSONDecodeError:
                    print("[WARNING] Invalid venue_address JSON, skipping")

            if venue_updates:
                uploader.update_deal(doc_id, venue_updates, collection=collection)
                print(f"[OK] Updated venue information for {doc_id}")

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
                "message": "Deals uploaded and processed successfully",
            }
        ), 200

    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(filepath):
            os.remove(filepath)

        print(f"[ERROR] Upload failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 422


@app.route("/update-deal/<doc_id>", methods=["PUT"])
def update_deal(doc_id):
    """
    Update existing deal data in Firebase

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

        uploader.update_deal(doc_id, updates, collection=collection)

        return jsonify(
            {
                "success": True,
                "document_id": doc_id,
                "message": "deal updated successfully",
            }
        ), 200

    except Exception as e:
        print(f"[ERROR] Update failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/update-venue/<doc_id>", methods=["PUT"])
def update_venue(doc_id):
    """
    Update venue information for an existing document

    Request body (JSON):
        {
            "venue_name": "The Bar",
            "address": {
                "street": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94102"
            }
        }
    """
    if not uploader:
        return jsonify(
            {"success": False, "error": "Firebase uploader not initialized"}
        ), 500

    try:
        venue_data = request.json
        collection = request.args.get("collection", "final_schema")

        # Validate required fields
        if "venue_name" not in venue_data and "address" not in venue_data:
            return jsonify(
                {"success": False, "error": "Must provide venue_name or address"}
            ), 400

        uploader.update_deal(doc_id, venue_data, collection=collection)

        # Get updated data
        updated_data = uploader.get_restaurant(doc_id, collection=collection)

        return jsonify(
            {
                "success": True,
                "document_id": doc_id,
                "data": updated_data,
                "message": "Venue information updated successfully",
            }
        ), 200

    except Exception as e:
        print(f"[ERROR] Venue update failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/get-deal/<doc_id>", methods=["GET"])
def get_deal(doc_id):
    """
    Get deal data by document ID
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
            return jsonify({"success": False, "error": "deal not found"}), 404

    except Exception as e:
        print(f"[ERROR] Get failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/get-all-deals", methods=["GET"])
def get_all_deals():
    """
    Get all deals from Firebase

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


@app.route("/search-restaurants-by-name", methods=["GET"])
def search_restaurants_by_name():
    """
    Search for restaurants by name with user's location using Geoapify API

    Required Query Parameters:
        - name: Restaurant name to search for
        - lon: User's longitude
        - lat: User's latitude


    Optional Query Parameters:
        - radius: Search radius in meters (default: 5000)
        - limit: Maximum number of results (default: 20)
        - categories: Restaurant categories (default: "catering.restaurant")

    Returns:
        JSON response with restaurant data including names, addresses, and coordinates
    """
    try:
        # Get required parameters
        name = request.args.get("name")
        lon = request.args.get("lon", type=float)
        lat = request.args.get("lat", type=float)

        print("lat, lon:", lat, lon)

        # Validate required parameters
        if not name or lat is None or lon is None:
            return jsonify(
                {
                    "success": False,
                    "error": "Missing required parameters: name, lat, and lon are required",
                }
            ), 400

        # Get optional parameters with defaults
        radius = request.args.get("radius", 5000, type=int)
        limit = request.args.get("limit", 20, type=int)
        categories = request.args.get("categories", "catering")

        # Get API key
        api_key = os.getenv("GEOAPIFY_API_KEY")
        if not api_key:
            return jsonify({"success": False, "error": "API key not configured"}), 500

        # Search for restaurants
        features = search_restaurants(
            name, categories, "circle", lon, lat, radius, api_key
        )

        # add results as a directory, no repeating results
        results = []
        seen_ids = set()

        for feature in features:
            props = feature.get("properties", {})
            place_id = props.get("place_id")

            if not place_id or place_id in seen_ids:
                continue

            seen_ids.add(place_id)

            restaurant = {
                "venue_name": props.get("name"),
                "address": {
                    "street": props.get("address_line1"),
                    "city": props.get("city"),
                    "state": props.get("state"),
                    "zip": props.get("postcode"),
                },
                "formatted": props.get("formatted"),
                "coordinates": {
                    "lat": props.get("lat"),
                    "lon": props.get("lon"),
                },
                "distance_meters": props.get("distance"),
                "geoapify_place_id": place_id,
            }

            results.append(restaurant)

        return jsonify(
            {
                "success": True,
                "count": len(results),
                "query": {
                    "name": name,
                    "location": {"lat": lat, "lon": lon},
                    "radius": radius,
                    "categories": categories,
                },
                "data": results,
            },
        ), 200

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"[ERROR] Restaurant search failed: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    print("=" * 70)
    print("deal Parser API Server")
    print("=" * 70)
    print("Endpoints:")
    print("  GET  /health              - Health check")
    print("  POST /upload-deal         - Upload and process deal image")
    print("  PUT  /update-deal/<id>    - Update deal data")
    print("  PUT  /update-venue/<id>   - Update venue information")
    print("  GET  /get-deal/<id>       - Get deal by ID")
    print("  GET  /get-all-deals       - Get all deals")
    print("  GET  /search-restaurants-by-name - Search restaurants by name + location")
    print("=" * 70)
    # print("Starting server on http://0.0.0.0:5000")
    print("=" * 70)
    app.run()
