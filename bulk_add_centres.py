import requests
import json

BASE_URL = "http://localhost:8080"

# Data for bulk insertion
regions = {
    1: ["Pune Central", "Kothrud Academy", "Hadinagar School of Excellence", "Baner Global Centre"],
    2: ["South Mumbai High", "Andheri Technical Institute", "Borivali Science Centre", "Navi Mumbai Hub"],
    3: ["Nashik Road High", "Panchavati Academy", "Gangapur Road Centre", "College Road Hub"]
}

def add_centres():
    for region_id, centre_names in regions.items():
        print(f"Adding centres for Region ID: {region_id}")
        for name in centre_names:
            code = name.replace(" ", "_").upper()[:10]
            payload = {
                "centreName": name,
                "centreCode": f"C_{code}"
            }
            try:
                # Based on api.js: /addExamCentre?regionId={regionId}
                url = f"{BASE_URL}/addExamCentre?regionId={region_id}"
                response = requests.post(url, json=payload)
                if response.status_code == 200 or response.status_code == 201:
                    print(f"  [SUCCESS] Added {name}")
                else:
                    print(f"  [FAILED] {name} - Status: {response.status_code}")
            except Exception as e:
                print(f"  [ERROR] {name}: {str(e)}")

if __name__ == "__main__":
    add_centres()
