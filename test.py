import requests
import time
import json
import os

BASE_URL = "http://100.53.20.30:8080"

def log_performance(endpoint, method, status, duration):
    with open("performance.txt", "a") as f:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{timestamp}] {method} {endpoint} | Status: {status} | Duration: {duration:.4f}s\n")

def save_output(data, method, path):
    os.makedirs("output_json", exist_ok=True)
    # Sanitize path: remove leading slash, replace remaining slashes/special chars
    clean_path = path.strip("/").replace("/", "_").replace("?", "_").replace("&", "_").replace("=", "_")
    if not clean_path: clean_path = "root"
    
    filename = f"{method}_{clean_path}.json"
    filepath = os.path.join("output_json", filename)
    
    with open(filepath, "w") as f:
        json.dump(data, f, indent=4)
    print(f"\nResult saved to {filepath}")

def make_request(method, path, params=None, body=None):
    url = f"{BASE_URL}{path}"
    print(f"\nMaking {method} request to {url}...")
    
    start_time = time.time()
    try:
        if method == "GET":
            response = requests.get(url, params=params)
        elif method == "POST":
            response = requests.post(url, json=body, params=params)
        elif method == "PUT":
            response = requests.put(url, json=body, params=params)
        elif method == "DELETE":
            response = requests.delete(url, params=params)
        else:
            print("Unsupported method")
            return

        end_time = time.time()
        duration = end_time - start_time
        
        status = response.status_code
        log_performance(path, method, status, duration)
        
        print(f"Status Code: {status}")
        print(f"Time Taken: {duration:.4f}s")
        
        try:
            result = response.json()
            save_output(result, method, path)
            return result
        except:
            print("Response is not JSON")
            clean_path = path.strip("/").replace("/", "_")
            filepath = os.path.join("output_json", f"{method}_{clean_path}.txt")
            with open(filepath, "w") as f:
                f.write(response.text)
            print(f"Result saved to {filepath}")
            return response.text
            
    except Exception as e:
        print(f"Error: {e}")

def get_input(prompt, default=None):
    val = input(f"{prompt} [{default}]: " if default else f"{prompt}: ")
    return val if val else default

def get_pagination_params():
    return {
        "page": get_input("Page", "0"),
        "size": get_input("Size", "20"),
        "sort": get_input("Sort (e.g. id,desc) (optional)")
    }

def test_student_endpoints():
    print("\n--- Student Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Get All Students (/getAllStudents)")
    print("  2. Add Student (/addStudent)")
    print("  3. Get Student By ID (/getStudent)")
    print("New/RESTful:")
    print("  4. Get Students (Paginated) (/students)")
    choice = input("Select: ")
    
    if choice == "1":
        make_request("GET", "/getAllStudents")
    elif choice == "2":
        school_id = get_input("School ID", "1")
        student_data = {
            "firstName": get_input("First Name"),
            "lastName": get_input("Last Name"),
            "email": get_input("Email"),
            "dob": get_input("DOB (YYYY-MM-DD)")
        }
        make_request("POST", "/addStudent", params={"schoolId": school_id}, body=student_data)
    elif choice == "3":
        s_id = get_input("Student ID")
        make_request("GET", "/getStudent", params={"id": s_id})
    elif choice == "4":
        params = get_pagination_params()
        params["firstName"] = get_input("First Name Filter (optional)")
        params["lastName"] = get_input("Last Name Filter (optional)")
        make_request("GET", "/students", params={k: v for k, v in params.items() if v})

def test_exam_endpoints():
    print("\n--- Exam Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Get All Exams (/getAllExams)")
    print("  2. Add Exam (/addExam)")
    print("  3. Update Exam (/updateExam)")
    print("  4. Delete Exam (/deleteExam)")
    print("New/RESTful:")
    print("  5. Get Exams (Paginated) (/exams)")
    choice = input("Select: ")
    
    if choice == "1":
        make_request("GET", "/getAllExams")
    elif choice == "2":
        exam_data = {
            "examName": get_input("Exam Name"),
            "examCode": get_input("Exam Code"),
            "status": get_input("Status (e.g. OPEN)", "OPEN")
        }
        make_request("POST", "/addExam", body=exam_data)
    elif choice == "3":
        e_no = get_input("Exam No")
        exam_data = {
            "examName": get_input("New Exam Name"),
            "examCode": get_input("New Exam Code")
        }
        make_request("PUT", "/updateExam", params={"exam_no": e_no}, body=exam_data)
    elif choice == "4":
        e_id = get_input("Exam ID to delete")
        make_request("DELETE", "/deleteExam", params={"id": e_id})
    elif choice == "5":
        params = get_pagination_params()
        params["examName"] = get_input("Exam Name Filter (optional)")
        make_request("GET", "/exams", params={k: v for k, v in params.items() if v})

def test_region_endpoints():
    print("\n--- Region Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Get All Regions (/getRegions)")
    print("  2. Add Region (/addregion)")
    print("New/RESTful:")
    print("  3. Get Regions (Paginated) (/regions)")
    choice = input("Select: ")
    if choice == "1":
        make_request("GET", "/getRegions")
    elif choice == "2":
        name = get_input("Region Name")
        make_request("POST", "/addregion", body={"regionName": name})
    elif choice == "3":
        params = get_pagination_params()
        params["regionName"] = get_input("Region Name Filter (optional)")
        make_request("GET", "/regions", params={k: v for k, v in params.items() if v})

def test_centre_endpoints():
    print("\n--- Exam Centre Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Get All Centres (/getAllExamCentres)")
    print("  2. Add Centre (/addExamCentre)")
    print("New/RESTful:")
    print("  3. Get Centres (Paginated) (/exam-centres)")
    choice = input("Select: ")
    if choice == "1":
        make_request("GET", "/getAllExamCentres")
    elif choice == "2":
        r_id = get_input("Region ID")
        centre_data = {
            "centreName": get_input("Centre Name"),
            "centreCode": get_input("Centre Code")
        }
        make_request("POST", "/addExamCentre", params={"regionId": r_id}, body=centre_data)
    elif choice == "3":
        params = get_pagination_params()
        params["centreName"] = get_input("Centre Name Filter (optional)")
        make_request("GET", "/exam-centres", params={k: v for k, v in params.items() if v})

def test_school_endpoints():
    print("\n--- School Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Get All Schools (/getAllSchools)")
    print("  2. Add School (/addSchool)")
    print("New/RESTful:")
    print("  3. Get Schools (Paginated) (/schools)")
    choice = input("Select: ")
    if choice == "1":
        make_request("GET", "/getAllSchools")
    elif choice == "2":
        c_id = get_input("Centre ID")
        school_data = {
            "schoolName": get_input("School Name")
        }
        make_request("POST", "/addSchool", params={"centreId": c_id}, body=school_data)
    elif choice == "3":
        params = get_pagination_params()
        params["schoolName"] = get_input("School Name Filter (optional)")
        make_request("GET", "/schools", params={k: v for k, v in params.items() if v})

def test_application_endpoints():
    print("\n--- Application Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Apply For Exam (/fill-form)")
    print("  2. Get Application Status (/get-form)")
    print("  3. Get All Applications (/getAllApplications)")
    print("New/RESTful:")
    print("  4. Get Applications (Paginated) (/exam-applications)")
    choice = input("Select: ")
    if choice == "1":
        s_id = get_input("Student ID")
        e_no = get_input("Exam No")
        data = {
            "student": {"studentId": int(s_id)},
            "exam": {"examNo": int(e_no)},
            "formData": get_input("Form Data (string)", "{}"),
            "status": "PENDING"
        }
        make_request("POST", "/fill-form", body=data)
    elif choice == "2":
        app_id = get_input("Application ID")
        exam_no = get_input("Exam No")
        make_request("GET", "/get-form", params={"applicationId": app_id, "examNo": exam_no})
    elif choice == "3":
        make_request("GET", "/getAllApplications")
    elif choice == "4":
        params = get_pagination_params()
        params["status"] = get_input("Status Filter (optional)")
        params["studentId"] = get_input("Student ID Filter (optional)")
        make_request("GET", "/exam-applications", params={k: v for k, v in params.items() if v})

def test_result_endpoints():
    print("\n--- Result Endpoints ---")
    print("Legacy/Explicit:")
    print("  1. Add Result (/addExamResult)")
    print("  2. Get Result by Application (/getExamResult)")
    print("  3. Get All Results (/getAllResults)")
    print("  4. Get Student Results (/getStudentResults)")
    print("New/RESTful:")
    print("  5. Get Results (Paginated) (/exam-results)")
    choice = input("Select: ")
    if choice == "1":
        app_id = get_input("Application ID")
        data = {
            "application": {"applicationId": int(app_id)},
            "resultData": get_input("Result (e.g. Passed)", "Passed"),
            "publishedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        make_request("POST", "/addExamResult", body=data)
    elif choice == "2":
        app_id = get_input("Application ID")
        make_request("GET", "/getExamResult", params={"applicationId": app_id})
    elif choice == "3":
        make_request("GET", "/getAllResults")
    elif choice == "4":
        s_id = get_input("Student ID")
        make_request("GET", "/getStudentResults", params={"studentId": s_id})
    elif choice == "5":
        params = get_pagination_params()
        params["studentId"] = get_input("Student ID Filter (optional)")
        params["examId"] = get_input("Exam ID Filter (optional)")
        make_request("GET", "/exam-results", params={k: v for k, v in params.items() if v})

def test_all_endpoints():
    print("\n--- Running All List Endpoints ---")
    
    endpoints = [
        ("GET", "/getAllStudents"),
        ("GET", "/students"),
        ("GET", "/getAllExams"),
        ("GET", "/exams"),
        ("GET", "/getRegions"),
        ("GET", "/regions"),
        ("GET", "/getAllExamCentres"),
        ("GET", "/exam-centres"),
        ("GET", "/getAllSchools"),
        ("GET", "/schools"),
        ("GET", "/getAllApplications"),
        ("GET", "/exam-applications"),
        ("GET", "/getAllResults"),
        ("GET", "/exam-results"),
    ]
    
    # Use default pagination for New/RESTful endpoints
    params = {"page": "0", "size": "20"}
    
    for method, path in endpoints:
        p = params if path.startswith(("/", "/students", "/exams", "/regions", "/exam-centres", "/schools", "/exam-applications", "/exam-results")) and not path.startswith("/get") else None
        make_request(method, path, params=p)
        time.sleep(0.5)  # Small delay between requests

def main():
    while True:
        print("\n==============================")
        print("   API TESTING INTERFACE      ")
        print(" (Legacy vs New Categorized)  ")
        print("==============================")
        print("1. Student Endpoints")
        print("2. Exam Endpoints")
        print("3. Region Endpoints")
        print("4. Exam Centre Endpoints")
        print("5. School Endpoints")
        print("6. Application Endpoints")
        print("7. Result Endpoints")
        print("0. Test All (List Endpoints)")
        print("q. Quit")
        
        main_choice = input("\nSelect Category: ").lower()
        
        if main_choice == "0":
            test_all_endpoints()
        elif main_choice == "1":
            test_student_endpoints()
        elif main_choice == "2":
            test_exam_endpoints()
        elif main_choice == "3":
            test_region_endpoints()
        elif main_choice == "4":
            test_centre_endpoints()
        elif main_choice == "5":
            test_school_endpoints()
        elif main_choice == "6":
            test_application_endpoints()
        elif main_choice == "7":
            test_result_endpoints()
        elif main_choice == "q":
            break
        else:
            print("Invalid selection.")

if __name__ == "__main__":
    main()
