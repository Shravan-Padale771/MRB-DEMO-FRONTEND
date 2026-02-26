import json
import requests
import random
from datetime import datetime

API_BASE_URL = "http://localhost:8080"

def publish_results():
    print(f"Starting bulk result publication at {datetime.now()}")
    
    # Fetch all applications from API
    try:
        response = requests.get(f"{API_BASE_URL}/getAllApplications")
        if response.status_code == 200:
            applications = response.json()
            print(f"Fetched {len(applications)} applications from API")
        else:
            print(f"Error fetching applications: {response.status_code}")
            return
    except Exception as e:
        print(f"Error fetching applications: {e}")
        return

    # Load exams to get paper details
    try:
        with open('output_data/get_all_exams_legacy.json', 'r') as f:
            exams = json.load(f)
            exams_dict = {ex['examNo']: ex for ex in exams}
    except Exception as e:
        print(f"Error loading exams: {e}")
        return

    success_count = 0
    error_count = 0

    for app in applications:
        app_id = app['applicationId']
        exam_no = app['examNo']
        student_name = app['studentName']
        
        exam = exams_dict.get(exam_no)
        if not exam:
            print(f"Skipping App #{app_id}: Exam #{exam_no} not found")
            continue

        # Parse papers
        try:
            papers = json.loads(exam['papers']) if isinstance(exam['papers'], str) else exam['papers']
        except:
            papers = []

        paper_marks = {}
        total_obtained = 0
        total_max = 0

        for paper in papers:
            max_marks = paper.get('maxMarks', 100)
            # Generate random marks between 35% and 95%
            marks = random.randint(int(max_marks * 0.35), int(max_marks * 0.95))
            paper_marks[paper['name']] = marks
            total_obtained += marks
            total_max += max_marks

        # Calculate percentage
        percentage = (total_obtained / total_max * 100) if total_max > 0 else 0
        remarks = "Pass" if percentage >= 40 else "Fail"

        # Prepare payload
        result_data = {
            "score": f"{percentage:.2f}%",
            "remarks": remarks,
            "totalObtained": total_obtained,
            "totalMax": total_max,
            "breakdown": paper_marks
        }

        # Check for oral/project (mocking based on exam_details if needed)
        try:
            details = json.loads(exam['exam_details']) if isinstance(exam['exam_details'], str) else exam['exam_details']
            if details.get('structure', {}).get('hasOral'):
                oral_marks = random.randint(20, 48)
                result_data['oralMarks'] = oral_marks
                total_obtained += oral_marks
                total_max += 50
            if details.get('structure', {}).get('hasProject'):
                project_marks = random.randint(25, 49)
                result_data['projectMarks'] = project_marks
                total_obtained += project_marks
                total_max += 50
        except:
            pass

        # Recalculate with oral/project
        percentage = (total_obtained / total_max * 100) if total_max > 0 else 0
        result_data['score'] = f"{percentage:.2f}%"

        payload = {
            "application": {"applicationId": app_id},
            "totalMarks": float(round(total_max, 2)),
            "percentage": float(round(percentage, 2)),
            "resultData": json.dumps(result_data),
            "publishedAt": datetime.now().isoformat()
        }

        # Post to API
        try:
            response = requests.post(f"{API_BASE_URL}/addExamResult", json=payload)
            if response.status_code in [200, 201]:
                print(f"Successfully published result for App #{app_id} ({student_name}): {percentage:.2f}%")
                success_count += 1
            elif response.status_code == 500 and "Duplicate entry" in response.text:
                print(f"Skipping App #{app_id}: Result already exists")
            else:
                print(f"Error publishing App #{app_id}: {response.status_code} - {response.text}")
                error_count += 1
        except Exception as e:
            print(f"Request failed for App #{app_id}: {e}")
            error_count += 1

    print(f"\nPublication Complete!")
    print(f"Success: {success_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    publish_results()
