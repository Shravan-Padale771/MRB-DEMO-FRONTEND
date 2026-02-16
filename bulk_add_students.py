import requests
import json
import os
import random

// do not run tbhis script
BASE_URL = "http://localhost:8080"
SCHOOLS_FILE = r"c:\Users\SUMIT\Desktop\mrb\MRB-DEMO-FRONTEND\output_data\schools.json"

# Indian first names
FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharv", "Advik", "Pranav", "Reyansh", "Aadhya", "Ananya", "Pari", "Anika", "Navya",
    "Diya", "Saanvi", "Myra", "Sara", "Ira", "Kiara", "Riya", "Shanaya", "Prisha", "Kavya",
    "Aryan", "Rohan", "Karan", "Rahul", "Amit", "Raj", "Nikhil", "Varun", "Yash", "Harsh",
    "Priya", "Neha", "Pooja", "Sneha", "Anjali", "Divya", "Shruti", "Simran", "Tanvi", "Ishita"
]

LAST_NAMES = [
    "Sharma", "Patel", "Kumar", "Singh", "Reddy", "Gupta", "Joshi", "Desai", "Mehta", "Nair",
    "Iyer", "Rao", "Kulkarni", "Jain", "Shah", "Agarwal", "Verma", "Chopra", "Malhotra", "Kapoor",
    "Pandey", "Mishra", "Tiwari", "Dubey", "Shukla", "Yadav", "Chauhan", "Rajput", "Thakur", "Bhat"
]

def generate_student_data(index, school_name):
    """Generate realistic student data"""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    
    # Generate unique username
    username = f"{first_name.lower()}.{last_name.lower()}{index}"
    
    # Generate contact (10 digit number starting with 7, 8, or 9)
    contact = f"{random.choice([7, 8, 9])}{random.randint(100000000, 999999999)}"
    
    # Generate email
    email = f"{first_name.lower()}.{last_name.lower()}{index}@student.edu"
    
    # Age between 14-18 for high school students
    age = random.randint(14, 18)
    
    # Mother tongue
    mother_tongue = random.choice(["Hindi", "Marathi"])
    
    # Simple password
    password = f"student{index}123"
    
    return {
        "firstName": first_name,
        "lastName": last_name,
        "contact": contact,
        "email": email,
        "age": age,
        "motherTongue": mother_tongue,
        "password": password
    }

def bulk_add_students():
    if not os.path.exists(SCHOOLS_FILE):
        print("Error: schools.json not found. Run fetch.py first.")
        return

    # Read all schools (need to handle pagination)
    all_schools = []
    page = 0
    
    print("Fetching all schools from API...")
    while True:
        try:
            response = requests.get(f"{BASE_URL}/schools?page={page}&size=100")
            if response.status_code == 200:
                data = response.json()
                schools = data.get("content", [])
                if not schools:
                    break
                all_schools.extend(schools)
                print(f"  Fetched page {page + 1}, total schools so far: {len(all_schools)}")
                if data.get("last", True):
                    break
                page += 1
            else:
                print(f"Failed to fetch schools: {response.status_code}")
                break
        except Exception as e:
            print(f"Error fetching schools: {str(e)}")
            break
    
    print(f"\nTotal schools found: {len(all_schools)}")
    print(f"Will add 10 students per school = {len(all_schools) * 10} total students\n")
    
    total_added = 0
    total_failed = 0
    
    for school in all_schools:
        school_id = school["schoolId"]
        school_name = school["schoolName"]
        print(f"Adding students for: {school_name} (ID: {school_id})")
        
        for i in range(1, 11):  # 10 students per school
            student_data = generate_student_data(i, school_name)
            
            try:
                url = f"{BASE_URL}/addStudent?schoolId={school_id}"
                response = requests.post(url, json=student_data)
                
                if response.status_code == 200 or response.status_code == 201:
                    print(f"  [SUCCESS] Added: {student_data['firstName']} {student_data['lastName']}")
                    total_added += 1
                else:
                    print(f"  [FAILED] {student_data['firstName']} - Status: {response.status_code}")
                    total_failed += 1
            except Exception as e:
                print(f"  [ERROR] {student_data['firstName']}: {str(e)}")
                total_failed += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"  Total Students Added: {total_added}")
    print(f"  Total Failed: {total_failed}")
    print(f"  Total Schools Processed: {len(all_schools)}")
    print(f"{'='*60}")

if __name__ == "__main__":
    bulk_add_students()
