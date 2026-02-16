import requests
import json

BASE_URL = "http://localhost:8080"

def test_add_school():
    url = f"{BASE_URL}/addSchool?centreId=1"
    payload = {"schoolName": f"Test School {json.dumps(str(requests.__version__))}"} # Just to make it unique
    response = requests.post(url, json={"schoolName": "Manual Test School"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_add_school()
