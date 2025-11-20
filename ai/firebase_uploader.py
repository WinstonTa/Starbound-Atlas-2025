"""
Firebase Uploader for Menu Extraction
Extracts menu information using Gemini Vision and uploads to Firestore
"""

import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
from vision_parser import VisionMenuParser
import uuid


class FirebaseUploader:
    """Handles Vision parsing and Firebase Firestore uploads"""

    def __init__(self, service_account_path=None):
        """
        Initialize Firebase connection and Vision parser

        Args:
            service_account_path: Path to Firebase service account JSON file
                                 If None, reads from FIREBASE_SERVICE_ACCOUNT env variable
        """
        load_dotenv()

        if service_account_path is None:
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")

        if not service_account_path:
            raise ValueError(
                "Firebase service account path not provided. "
                "Set FIREBASE_SERVICE_ACCOUNT in .env or pass service_account_path."
            )
        if not os.path.exists(service_account_path):
            raise ValueError(f"Service account file not found: {service_account_path}")

        cred = credentials.Certificate(service_account_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'happy-hour-mvp.firebasestorage.app'
            })
            print("[OK] Firebase initialized")
        else:
            print("[OK] Using existing Firebase connection")

        self.db = firestore.client()
        print("[OK] Connected to Firestore")

        self.bucket = storage.bucket()
        print("[OK] Connected to Firebase Storage")

        # Initialize Vision parser
        self.parser = VisionMenuParser()

    def upload_image_to_storage(self, image_path):
        """
        Upload image to Firebase Storage

        Args:
            image_path: Path to the image file

        Returns:
            str: Public URL of the uploaded image
        """
        # Generate unique filename
        file_extension = os.path.splitext(image_path)[1]
        unique_filename = f"menu_images/{uuid.uuid4()}{file_extension}"

        # Upload to Firebase Storage
        blob = self.bucket.blob(unique_filename)
        blob.upload_from_filename(image_path, content_type=f'image/{file_extension[1:]}')

        # Make the blob publicly accessible
        blob.make_public()

        print(f"[OK] Image uploaded to Storage: {unique_filename}")

        # Return the public URL
        return f"https://storage.googleapis.com/{self.bucket.name}/{unique_filename}"

    def upload_menu(self, image_path, collection='final_schema'):
        """
        Extract menu data from image via Gemini and upload to Firestore.

        Args:
            image_path: Path to menu image
            collection: Firestore collection name (default: 'final_schema')

        Returns:
            str: Document ID of uploaded data
        """
        print(f"\n{'=' * 70}")
        print(f"Processing: {image_path}")
        print(f"{'='*70}\n")

        # Upload image to Firebase Storage first
        image_url = self.upload_image_to_storage(image_path)

        # Extract menu data with Gemini Vision
        data = self.parser.parse_menu(image_path)

        # Add image URL to the data
        data['image_url'] = image_url

        # Add metadata
        data['metadata'] = {
            'uploaded_at': datetime.utcnow().isoformat(),
            'image_filename': os.path.basename(image_path),
            'extraction_method': 'gemini_vision'
        }

        # Display extracted info
        print(f"\n{'='*70}")
        print("Uploading to Firestore...")
        print(f"{'=' * 70}\n")

        # Upload to Firestore
        doc_ref = self.db.collection(collection).add(data)
        doc_id = doc_ref[1].id

        print(f"[OK] Uploaded to Firestore: {collection}/{doc_id}")
        print(f"{'=' * 70}\n")

        return doc_id

    def update_menu(self, doc_id, updates, collection='final_schema'):
        """
        Update existing restaurant data in Firestore

        Args:
            doc_id: Document ID to update
            updates: Dictionary of fields to update
            collection: Firestore collection name (default: 'final_schema')
        """
        # Add update timestamp
        if 'metadata' not in updates:
            updates['metadata'] = {}
        updates['metadata']['updated_at'] = datetime.utcnow().isoformat()

        # Update document
        self.db.collection(collection).document(doc_id).update(updates)
        print(f"[OK] Updated {collection}/{doc_id}")

    def get_restaurant(self, doc_id, collection='final_schema'):
        """
        Get a single restaurant by document ID

        Args:
            doc_id: Document ID
            collection: Firestore collection name

        Returns:
            dict: Restaurant data or None if not found
        """
        doc = self.db.collection(collection).document(doc_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return None

    def get_all_restaurants(self, collection='final_schema', limit=None):
        """
        Get all restaurants from Firestore

        Args:
            collection: Firestore collection name
            limit: Maximum number of documents to retrieve (optional)

        Returns:
            list: List of restaurant data dictionaries
        """
        query = self.db.collection(collection)
        if limit:
            query = query.limit(limit)
        docs = query.stream()
        return [{"id": doc.id, **doc.to_dict()} for doc in docs]

    def batch_upload(self, image_paths, collection='final_schema'):
        """
        Upload multiple menu images to Firestore

        Args:
            image_paths: List of image file paths
            collection: Firestore collection name

        Returns:
            list: List of results with document IDs or errors
        """
        results = []
        for i, image_path in enumerate(image_paths, 1):
            print(f"\n[{i}/{len(image_paths)}] Processing {image_path}...")
            try:
                doc_id = self.upload_menu(image_path, collection)
                results.append({
                    'image': image_path,
                    'id': doc_id,
                    'status': 'success'
                })
            except Exception as e:
                print(f"[ERROR] Failed to process {image_path}: {e}")
                results.append(
                    {"image": image_path, "error": str(e), "status": "failed"}
                )
        return results


def main():
    """Example CLI usage"""
    import argparse

    parser = argparse.ArgumentParser(description='Extract menu data and upload to Firestore')
    parser.add_argument('image', help='Path to menu image')
    parser.add_argument('--collection', default='final_schema',
                        help='Firestore collection name (default: final_schema)')

    args = parser.parse_args()

    uploader = FirebaseUploader()

    # Upload menu
    doc_id = uploader.upload_menu(args.image, collection=args.collection)

    print(f"\n{'=' * 70}")
    print(f"SUCCESS! Document ID: {doc_id}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
