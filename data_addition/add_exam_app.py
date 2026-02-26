import json
import requests
import os

# Configuration
API_URL = "http://localhost:8080/fill-form"
PROJECT_ROOT = "c:/Users/SUMIT/Desktop/mrb/MRB-DEMO-FRONTEND"
STUDENTS_FILE = os.path.join(PROJECT_ROOT, "output_data/get_all_students_legacy.json")
EXAMS_FILE = os.path.join(PROJECT_ROOT, "output_data/get_all_exams_legacy.json")

def get_eligibility(age):
    """
    Determines eligibility based on age ranges:
    - Prathamik: 10-13 years
    - Prabodh: 14-15 years
    - Pravin: 16+ years
    """
    if age < 14:
        return 'prathamik'
    elif 14 <= age <= 15:
        return 'prabodh'
    else:
        return 'pravin'

def main():
    print("Starting Exam Application Auto-Generator...")
    
    # 1. Load Student Data
    if not os.path.exists(STUDENTS_FILE):
        print(f"Error: {STUDENTS_FILE} not found.")
        return
    
    with open(STUDENTS_FILE, "r") as f:
        students = json.load(f)
    print(f"Loaded {len(students)} students.")

    # 2. Load Exam Data
    if not os.path.exists(EXAMS_FILE):
        print(f"Error: {EXAMS_FILE} not found.")
        return
        
    with open(EXAMS_FILE, "r") as f:
        exams = json.load(f)
    
    # 3. Map Exams
    exam_map = {}
    for e in exams:
        name = e['exam_name'].lower()
        if 'prathamik' in name:
            exam_map['prathamik'] = e
        elif 'pravin' in name:
            exam_map['pravin'] = e
        elif 'prabodh' in name:
            exam_map['prabodh'] = e
    
    if not exam_map:
        print("Error: Could not find required exams (Prathamik, Prabodh, Pravin) in the exam list.")
        return
    
    print(f"Available Exams: {', '.join(exam_map.keys())}")

    # 4. Generate Applications
    success_count = 0
    fail_count = 0

    for student in students:
        age = student.get('age', 0)
        exam_key = get_eligibility(age)
        
        if exam_key in exam_map:
            exam = exam_map[exam_key]
            
            # Construct Payload matching fill-form expectations
            payload = {
                "student": {"studentId": student['studentId']},
                "exam": {"examNo": exam['examNo']},
                "formData": json.dumps({
                    "applicationType": "Auto-Generated",
                    "remarks": f"Eligible for {exam_key.capitalize()} based on age {age}",
                    "submissionDate": "2026-02-26"
                }),
                "status": "PENDING"
            }
            
            try:
                print(f"Applying for {student['firstName']} {student['lastName']} (Age {age}) -> {exam['exam_name']}...", end=" ")
                response = requests.post(API_URL, json=payload, timeout=5)
                
                if response.status_code in [200, 201]:
                    print("SUCCESS")
                    success_count += 1
                else:
                    print(f"FAILED ({response.status_code})")
                    print(f"  Response: {response.text[:100]}")
                    fail_count += 1
            except requests.exceptions.ConnectionError:
                print("FAILED (Could not connect to server at http://localhost:8080)")
                print("Please ensure the backend server is running.")
                return
            except Exception as e:
                print(f"ERROR: {str(e)}")
                fail_count += 1

    print("\nProcessing Complete!")
    print(f"Total Students: {len(students)}")
    print(f"Successfully Applied: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    main()
