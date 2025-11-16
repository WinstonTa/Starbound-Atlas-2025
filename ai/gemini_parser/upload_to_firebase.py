"""
Example script to parse menu images and upload deals to Firebase
"""
import sys
import os

# Add parent directories to path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'paddle_ocr'))

from gemini import parse_menu_image
from firebase_uploader import FirebaseUploader


def upload_menu_to_firebase(image_path: str, collection: str = 'final_schema', venue_info: dict = None):
    """
    Parse a menu image and upload the deals to Firebase

    Args:
        image_path: Path to the menu image
        collection: Firestore collection name (default: 'final_schema')
        venue_info: Optional venue information dict

    Returns:
        str: Document ID of the uploaded data
    """
    print(f"Processing image: {image_path}")

    # Parse the menu image with Gemini
    print("\nParsing menu with Gemini AI...")
    menu_data = parse_menu_image(image_path)

    # Initialize Firebase uploader (use_ocr=False since we're using Gemini parser)
    print("\nInitializing Firebase connection...")
    uploader = FirebaseUploader(use_ocr=False)

    # Upload deals to Firebase
    doc_id = uploader.upload_deals(menu_data, collection=collection, venue_info=venue_info)

    return doc_id


def main():
    """Command-line interface"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Parse menu images with Gemini and upload deals to Firebase'
    )
    parser.add_argument('image', help='Path to menu image')
    parser.add_argument(
        '--collection',
        default='final_schema',
        help='Firestore collection name (default: final_schema)'
    )

    args = parser.parse_args()

    # Check if image exists
    if not os.path.exists(args.image):
        print(f"Error: Image file not found: {args.image}")
        sys.exit(1)

    # Upload to Firebase
    try:
        doc_id = upload_menu_to_firebase(args.image, args.collection)
        print(f"\n{'='*70}")
        print(f"SUCCESS! Document ID: {doc_id}")
        print(f"{'='*70}")
    except Exception as e:
        print(f"\n{'='*70}")
        print(f"ERROR: {e}")
        print(f"{'='*70}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
