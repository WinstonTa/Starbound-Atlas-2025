"""
Firebase Uploader for Menu Extraction
Extracts menu information using OCR + Gemini and uploads to Firestore
Also supports standalone Gemini parser integration
"""
import os
import sys
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import Optional, Dict, Any

# Support both paddle_ocr and gemini_parser
# Add paddle_ocr to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'paddle_ocr'))
try:
    from happy_hour_gemini import HappyHourGeminiOCR
    PADDLE_OCR_AVAILABLE = True
except ImportError:
    PADDLE_OCR_AVAILABLE = False

# Add gemini_parser to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'gemini_parser'))
try:
    from models import MenuParsing
    GEMINI_PARSER_AVAILABLE = True
except ImportError:
    GEMINI_PARSER_AVAILABLE = False


class FirebaseUploader:
    """Handles OCR extraction and Firebase Firestore uploads"""

    def __init__(self, service_account_path=None, use_ocr=True):
        """
        Initialize Firebase connection and OCR extractor

        Args:
            service_account_path: Path to Firebase service account JSON file
                                 If None, reads from FIREBASE_SERVICE_ACCOUNT env variable
            use_ocr: Whether to initialize OCR extractor (default: True)
        """
        # Load environment variables
        load_dotenv()

        # Get service account path
        if service_account_path is None:
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT')

        # Validate service account file
        if not service_account_path:
            raise ValueError(
                "Firebase service account path not provided. "
                "Set FIREBASE_SERVICE_ACCOUNT in .env or pass service_account_path parameter"
            )

        if not os.path.exists(service_account_path):
            raise ValueError(f"Service account file not found: {service_account_path}")

        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(service_account_path)

        # Only initialize if not already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase initialized")
        else:
            print("[OK] Using existing Firebase connection")

        # Create Firestore client
        self.db = firestore.client()
        print("[OK] Connected to Firestore")

        # Initialize OCR extractor (optional)
        self.ocr = None
        if use_ocr:
            if PADDLE_OCR_AVAILABLE:
                self.ocr = HappyHourGeminiOCR(use_gpu=False)
                print("[OK] OCR + Gemini AI ready")
            else:
                print("[WARNING] OCR not available - happy_hour_gemini module not found")

    def upload_menu(self, image_path, collection='restaurants', method='hybrid'):
        """
        Extract menu data from image and upload to Firestore

        Args:
            image_path: Path to menu image
            collection: Firestore collection name (default: 'restaurants')
            method: Extraction method - 'hybrid', 'vision', or 'gemini_validation'

        Returns:
            str: Document ID of uploaded data
        """
        print(f"\n{'='*70}")
        print(f"Processing: {image_path}")
        print(f"Method: {method}")
        print(f"{'='*70}\n")

        # Extract menu data
        if method == 'hybrid':
            data = self.ocr.extract_hybrid(image_path)
        elif method == 'vision':
            data = self.ocr.extract_with_image_analysis(image_path)
        elif method == 'gemini_validation':
            data = self.ocr.extract_with_gemini_validation(image_path)
        else:
            raise ValueError(f"Unknown method: {method}. Use 'hybrid', 'vision', or 'gemini_validation'")

        # Add metadata
        data['metadata'] = {
            'uploaded_at': datetime.utcnow().isoformat(),
            'image_filename': os.path.basename(image_path),
            'extraction_method': method
        }

        # Display extracted info
        print(f"\n{'='*70}")
        print("Extracted Data:")
        print(f"{'='*70}")
        print(f"Restaurant: {data.get('restaurant_name')}")
        print(f"Deals: {len(data.get('deals', []))} items")
        print(f"Time Frames: {len(data.get('time_frame', []))} slots")
        print(f"Conditions: {len(data.get('special_conditions', []))} items")

        # Upload to Firestore
        print(f"\n{'='*70}")
        print("Uploading to Firestore...")
        print(f"{'='*70}\n")

        doc_ref = self.db.collection(collection).add(data)
        doc_id = doc_ref[1].id

        print(f"[OK] Uploaded to Firestore: {collection}/{doc_id}")
        print(f"{'='*70}\n")

        return doc_id

    def update_menu(self, doc_id, updates, collection='restaurants'):
        """
        Update existing restaurant data in Firestore

        Args:
            doc_id: Document ID to update
            updates: Dictionary of fields to update
            collection: Firestore collection name (default: 'restaurants')
        """
        # Add update timestamp
        if 'metadata' not in updates:
            updates['metadata'] = {}
        updates['metadata']['updated_at'] = datetime.utcnow().isoformat()

        # Update document
        self.db.collection(collection).document(doc_id).update(updates)
        print(f"[OK] Updated {collection}/{doc_id}")

    def get_restaurant(self, doc_id, collection='restaurants'):
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
            return {'id': doc.id, **doc.to_dict()}
        return None

    def get_all_restaurants(self, collection='restaurants', limit=None):
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
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]

    def batch_upload(self, image_paths, collection='restaurants', method='hybrid'):
        """
        Upload multiple menu images to Firestore

        Args:
            image_paths: List of image file paths
            collection: Firestore collection name
            method: Extraction method

        Returns:
            list: List of results with document IDs or errors
        """
        results = []

        for i, image_path in enumerate(image_paths, 1):
            print(f"\n[{i}/{len(image_paths)}] Processing {image_path}...")
            try:
                doc_id = self.upload_menu(image_path, collection, method)
                results.append({
                    'image': image_path,
                    'id': doc_id,
                    'status': 'success'
                })
            except Exception as e:
                print(f"[ERROR] Failed to process {image_path}: {e}")
                results.append({
                    'image': image_path,
                    'error': str(e),
                    'status': 'failed'
                })

        return results

    def upload_deals(
        self,
        menu_data: 'MenuParsing',
        collection: str = 'final_schema',
        venue_info: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Upload parsed deal data to Firestore (for Gemini parser)

        Args:
            menu_data: Parsed menu data from Gemini (MenuParsing object)
            collection: Firestore collection name (default: 'final_schema')
            venue_info: Optional venue information dict with:
                - venue_id: Unique identifier
                - venue_name: Name of the venue
                - latitude: Venue latitude
                - longitude: Venue longitude
                - address: Dict with street, city, state, zip

        Returns:
            str: Document ID of uploaded data
        """
        print(f"\n{'='*70}")
        print(f"Uploading deals from: {menu_data.restaurant_name or 'Unknown'}")
        print(f"{'='*70}\n")

        # Transform deals to match schema
        deals = []
        for deal in menu_data.deals:
            # Get time frame info (use first time window if available)
            time_info = {}
            if menu_data.time_frame and len(menu_data.time_frame) > 0:
                first_window = menu_data.time_frame[0]
                time_info = {
                    'start_time': first_window.start_time,
                    'end_time': first_window.end_time,
                    'days': first_window.days or []
                }

            deal_obj = {
                'name': deal.name,
                'price': deal.price,
                'description': deal.description,
                **time_info,
                'special_conditions': menu_data.special_conditions or []
            }
            deals.append(deal_obj)

        # Build the document structure matching your exact schema
        # Add venue information (null by default, can be overwritten later)
        document = {
            'venue_id': venue_info.get('venue_id') if venue_info else None,
            'venue_name': venue_info.get('venue_name') if venue_info else None,
            'latitude': venue_info.get('latitude') if venue_info else None,
            'longitude': venue_info.get('longitude') if venue_info else None,
            'address': venue_info.get('address', {}) if venue_info else {},
            'deals': deals
        }

        # Display extracted info
        print(f"Venue: {document.get('venue_name', 'Not specified')}")
        print(f"Deals: {len(deals)} items")
        for i, deal in enumerate(deals, 1):
            print(f"  {i}. {deal['name']} - {deal['price']}")

        # Upload to Firestore
        print(f"\n{'='*70}")
        print("Uploading to Firestore...")
        print(f"{'='*70}\n")

        doc_ref = self.db.collection(collection).add(document)
        doc_id = doc_ref[1].id

        print(f"[OK] Uploaded to Firestore: {collection}/{doc_id}")
        print(f"{'='*70}\n")

        return doc_id


def main():
    """Example usage"""
    import argparse

    parser = argparse.ArgumentParser(description='Extract menu data and upload to Firestore')
    parser.add_argument('image', help='Path to menu image')
    parser.add_argument('--method', default='hybrid',
                        choices=['hybrid', 'vision', 'gemini_validation'],
                        help='Extraction method (default: hybrid)')
    parser.add_argument('--collection', default='restaurants',
                        help='Firestore collection name (default: restaurants)')

    args = parser.parse_args()

    # Initialize uploader
    uploader = FirebaseUploader()

    # Upload menu
    doc_id = uploader.upload_menu(
        args.image,
        collection=args.collection,
        method=args.method
    )

    print(f"\n{'='*70}")
    print(f"SUCCESS! Document ID: {doc_id}")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
