"""
Firebase Uploader for Menu Extraction
Extracts menu information using Gemini Vision and uploads to Firestore
"""

import os
import json
import base64
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from vision_parser import VisionMenuParser


class FirebaseUploader:
    """Handles Vision parsing and Firebase Firestore uploads"""

    def __init__(self):
        """
        Initialize Firebase connection and Vision parser.

        Expected environment variable:
          - FIREBASE_SERVICE_ACCOUNT_JSON : raw JSON or base64-encoded JSON string
        """
        # Load .env locally; Vercel uses environment variables directly
        load_dotenv()

        raw = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if not raw:
            raise ValueError("Missing FIREBASE_SERVICE_ACCOUNT in environment.")

        # Support both raw JSON and base64-encoded JSON
        try:
            sa_dict = json.loads(raw)
        except json.JSONDecodeError:
            try:
                sa_dict = json.loads(base64.b64decode(raw).decode("utf-8"))
            except Exception as e:
                raise ValueError(
                    "FIREBASE_SERVICE_ACCOUNT must be valid JSON or base64 of that JSON."
                ) from e

        cred = credentials.Certificate(sa_dict)

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized")
        else:
            print("[OK] Using existing Firebase connection")

        self.db = firestore.client()
        print("[OK] Connected to Firestore")

        # Initialize Vision parser
        self.parser = VisionMenuParser()

    def upload_menu(self, image_path, collection="final_schema"):
        """Extract menu data via Gemini and upload to Firestore."""
        print(f"\n{'=' * 70}")
        print(f"Processing: {image_path}")
        print(f"{'=' * 70}\n")

        data = self.parser.parse_menu(image_path)
        data["metadata"] = {
            "uploaded_at": datetime.utcnow().isoformat(),
            "image_filename": os.path.basename(image_path),
            "extraction_method": "gemini_vision",
        }

        print(f"\n{'=' * 70}")
        print("Uploading to Firestore...")
        print(f"{'=' * 70}\n")

        doc_ref = self.db.collection(collection).add(data)
        doc_id = doc_ref[1].id

        print(f"[OK] Uploaded to Firestore: {collection}/{doc_id}")
        print(f"{'=' * 70}\n")

        return doc_id

    def update_menu(self, doc_id, updates, collection="final_schema"):
        """Update existing restaurant data in Firestore."""
        if "metadata" not in updates:
            updates["metadata"] = {}
        updates["metadata"]["updated_at"] = datetime.utcnow().isoformat()

        self.db.collection(collection).document(doc_id).update(updates)
        print(f"[OK] Updated {collection}/{doc_id}")

    def get_restaurant(self, doc_id, collection="final_schema"):
        """Get a single restaurant by document ID."""
        doc = self.db.collection(collection).document(doc_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return None

    def get_all_restaurants(self, collection="final_schema", limit=None):
        """Get all restaurants from Firestore."""
        query = self.db.collection(collection)
        if limit:
            query = query.limit(limit)
        docs = query.stream()
        return [{"id": doc.id, **doc.to_dict()} for doc in docs]

    def batch_upload(self, image_paths, collection="final_schema"):
        """Upload multiple menu images to Firestore."""
        results = []
        for i, image_path in enumerate(image_paths, 1):
            print(f"\n[{i}/{len(image_paths)}] Processing {image_path}...")
            try:
                doc_id = self.upload_menu(image_path, collection)
                results.append({"image": image_path, "id": doc_id, "status": "success"})
            except Exception as e:
                print(f"[ERROR] Failed to process {image_path}: {e}")
                results.append(
                    {"image": image_path, "error": str(e), "status": "failed"}
                )
        return results


def main():
    """Example CLI usage"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract menu data and upload to Firestore"
    )
    parser.add_argument("image", help="Path to menu image")
    parser.add_argument(
        "--collection",
        default="final_schema",
        help="Firestore collection name (default: final_schema)",
    )

    args = parser.parse_args()

    uploader = FirebaseUploader()
    doc_id = uploader.upload_menu(args.image, collection=args.collection)

    print(f"\n{'=' * 70}")
    print(f"SUCCESS! Document ID: {doc_id}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
