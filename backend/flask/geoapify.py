import requests
import os
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv

load_dotenv()


def search_restaurants(
    resturant_name: str,
    categories: str,
    filter: str,
    lon: float,
    lat: float,
    radius: float,
    apiKey: str,
):
    """
    Search restaurant by name given the user's current location + radius
    """
    if not apiKey:
        raise ValueError("GEOAPIFY_API_KEY is missing (check your .env).")

    resturant_name = normalize_name(resturant_name)
    url = f"https://api.geoapify.com/v2/places?categories={categories}&name={resturant_name}&filter={filter}:{lon},{lat},{radius}&bias=proximity:{lon},{lat}&limit=20&apiKey={apiKey}"
    payload = {}
    headers = {}

    try:
        response = requests.request(
            "GET", url, headers=headers, data=payload, timeout=15
        )
        data = response.json()
        return data.get("features", [])  # extract features array
    except requests.exceptions.RequestException as e:
        print(f"[Error] API request failed: {e}")
        return []


# helper functions
def normalize_name(name):
    """Lower case and removes special characters in resturant names"""
    return name.lower().replace("'", "").replace("-", "").replace(" ", "")


if __name__ == "__main__":
    # URL search parameters
    apiKey = os.getenv("GEOAPIFY_API_KEY")
    categories = "catering"
    filter = "circle"
    lon, lat = (
        -118.189217,
        33.766988,
    )  # hardcoded for testing, replace with user's location
    radius = 5000

    # Test the functions
    name = input("Testing search_restaurants function:")

    results = search_restaurants(
        name, categories, filter, lon, lat, radius, str(apiKey)
    )
    print(f"Found {len(results)} restaurants")

    for feature in results:
        props = feature.get("properties", {})
        print(f"- {props.get('name')}")
        print(f"- {props.get('address_line1')}")
        print(f"- {props.get('city')}")
        print(f"- {props.get('state')}")
        print(f"- {props.get('postcode')}")
        print(f"- {props.get('lat')}")
        print(f"- {props.get('lon')}")
        print(f"- {props.get('formatted')}")
        print(f"- {props.get('distance')}")
        print()
