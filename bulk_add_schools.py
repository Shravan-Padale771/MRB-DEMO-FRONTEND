import requests
import json
import os

BASE_URL = "http://localhost:8080"
CENTRES_FILE = r"c:\Users\SUMIT\Desktop\mrb\MRB-DEMO-FRONTEND\output_data\exam_centres.json"

def bulk_add_schools():
    if not os.path.exists(CENTRES_FILE):
        print("Error: exam_centres.json not found. Run fetch.py first.")
        return

    with open(CENTRES_FILE, "r") as f:
        data = json.load(f)
        centres = data.get("content", [])

    school_types = ["Public School", "Academy", "International School", "High School", "Convent"]

    for centre in centres:
        centre_id = centre["centreId"]
        centre_name = centre["centreName"]
        print(f"Adding schools for Centre: {centre_name} (ID: {centre_id})")
        
        for i in range(1, 6):
            school_suffix = school_types[(i-1) % len(school_types)]
            school_name = f"{centre_name} {school_suffix} {i}"
            payload = {
                "schoolName": school_name
            }
            
            try:
                url = f"{BASE_URL}/addSchool?centreId={centre_id}"
                response = requests.post(url, json=payload)
                if response.status_code == 200 or response.status_code == 201:
                    print(f"  [SUCCESS] Added: {school_name}")
                else:
                    print(f"  [FAILED] {school_name} - Status: {response.status_code}")
            except Exception as e:
                print(f"  [ERROR] {school_name}: {str(e)}")

if __name__ == "__main__":
    bulk_add_schools()
