import requests
import json
import os

def fetch_and_save(url, filename):
    output_dir = "output_data"
    output_file = os.path.join(output_dir, filename)

    # Create the directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        print(f"Sending request to {url}...")
        response = requests.get(url)
        
        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            
            # Save the output as JSON
            with open(output_file, "w") as f:
                json.dump(data, f, indent=4)
            
            print(f"Successfully saved data to {output_file}")
            count = len(data) if isinstance(data, list) else 1
            print(f"Total items fetched: {count}")
        else:
            print(f"Failed to fetch data from {url}. Status code: {response.status_code}")
            # print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    base_url = "http://localhost:8080"
    
    endpoints = [
        ("getAllStudents", "students.json"),
        ("getRegions", "regions.json"),
        ("getAllExams", "exams.json"),
        ("getAllExamCentres", "exam_centres.json"),
        ("getAllSchools", "schools.json"),
        ("getAllApplications", "applications.json"),
        ("getAllExam", "exam.json")
    ]
    
    for endpoint, filename in endpoints:
        fetch_and_save(f"{base_url}/{endpoint}", filename)
