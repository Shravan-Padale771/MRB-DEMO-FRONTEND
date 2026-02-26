# -*- coding: utf-8 -*-
"""
Insert Students Script
======================
Inserts 20 students across all available schools via the Student Registration
API endpoint: POST /addStudent?schoolId={schoolId}

This mirrors the StudentRegistration.jsx form which collects:
  - firstName, middleName, lastName
  - contact (10 digits)
  - email
  - age
  - motherTongue  (Hindi | Marathi)
  - password
  (schoolId is sent as query param)

Schools (from output_data/schools_page_0.json):
  - schoolId=1 : The Modern School of Science
  - schoolId=2 : SOP School of Varada

10 students per school → 20 total
"""

import requests
import time
import sys

BASE_URL = "http://localhost:8080"

# ─────────────────────────────────────────────────────────────────────────────
# 20 students: 10 for schoolId=1, 10 for schoolId=2
# Fields match StudentRegistration.jsx exactly
# ─────────────────────────────────────────────────────────────────────────────
STUDENTS = [
    # ── School 1 : The Modern School of Science (schoolId = 1) ──────────────
    {
        "schoolId": 1,
        "firstName": "Aarav",
        "middleName": "Ramesh",
        "lastName": "Sharma",
        "contact": "9876543201",
        "email": "aarav.sharma@modernschool.edu",
        "age": 14,
        "motherTongue": "Hindi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Priya",
        "middleName": "Suresh",
        "lastName": "Patil",
        "contact": "9876543202",
        "email": "priya.patil@modernschool.edu",
        "age": 15,
        "motherTongue": "Marathi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Rohan",
        "middleName": "Vijay",
        "lastName": "Deshmukh",
        "contact": "9876543203",
        "email": "rohan.deshmukh@modernschool.edu",
        "age": 13,
        "motherTongue": "Marathi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Sneha",
        "middleName": "Anil",
        "lastName": "Kulkarni",
        "contact": "9876543204",
        "email": "sneha.kulkarni@modernschool.edu",
        "age": 16,
        "motherTongue": "Marathi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Arjun",
        "middleName": "Deepak",
        "lastName": "Mehta",
        "contact": "9876543205",
        "email": "arjun.mehta@modernschool.edu",
        "age": 14,
        "motherTongue": "Hindi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Kavya",
        "middleName": "Manoj",
        "lastName": "Joshi",
        "contact": "9876543206",
        "email": "kavya.joshi@modernschool.edu",
        "age": 15,
        "motherTongue": "Marathi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Vikram",
        "middleName": "Ganesh",
        "lastName": "Rao",
        "contact": "9876543207",
        "email": "vikram.rao@modernschool.edu",
        "age": 17,
        "motherTongue": "Hindi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Ananya",
        "middleName": "Prakash",
        "lastName": "Iyer",
        "contact": "9876543208",
        "email": "ananya.iyer@modernschool.edu",
        "age": 13,
        "motherTongue": "Hindi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Sahil",
        "middleName": "Rajan",
        "lastName": "Verma",
        "contact": "9876543209",
        "email": "sahil.verma@modernschool.edu",
        "age": 16,
        "motherTongue": "Hindi",
        "password": "Pass@1234",
    },
    {
        "schoolId": 1,
        "firstName": "Pooja",
        "middleName": "Santosh",
        "lastName": "Naik",
        "contact": "9876543210",
        "email": "pooja.naik@modernschool.edu",
        "age": 14,
        "motherTongue": "Marathi",
        "password": "Pass@1234",
    },
    # ── School 2 : SOP School of Varada (schoolId = 2) ──────────────────────
    {
        "schoolId": 2,
        "firstName": "Rahul",
        "middleName": "Shyam",
        "lastName": "Gupta",
        "contact": "9123456781",
        "email": "rahul.gupta@sopvarada.edu",
        "age": 15,
        "motherTongue": "Hindi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Swati",
        "middleName": "Prakash",
        "lastName": "More",
        "contact": "9123456782",
        "email": "swati.more@sopvarada.edu",
        "age": 13,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Omkar",
        "middleName": "Dilip",
        "lastName": "Jadhav",
        "contact": "9123456783",
        "email": "omkar.jadhav@sopvarada.edu",
        "age": 14,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Dipika",
        "middleName": "Nitin",
        "lastName": "Pawar",
        "contact": "9123456784",
        "email": "dipika.pawar@sopvarada.edu",
        "age": 16,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Kunal",
        "middleName": "Rajesh",
        "lastName": "Singh",
        "contact": "9123456785",
        "email": "kunal.singh@sopvarada.edu",
        "age": 17,
        "motherTongue": "Hindi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Aishwarya",
        "middleName": "Mohan",
        "lastName": "Shinde",
        "contact": "9123456786",
        "email": "aishwarya.shinde@sopvarada.edu",
        "age": 15,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Tejas",
        "middleName": "Sunil",
        "lastName": "Mane",
        "contact": "9123456787",
        "email": "tejas.mane@sopvarada.edu",
        "age": 14,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Rutuja",
        "middleName": "Umesh",
        "lastName": "Kamble",
        "contact": "9123456788",
        "email": "rutuja.kamble@sopvarada.edu",
        "age": 13,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Nikhil",
        "middleName": "Ashok",
        "lastName": "Bhosale",
        "contact": "9123456789",
        "email": "nikhil.bhosale@sopvarada.edu",
        "age": 16,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
    {
        "schoolId": 2,
        "firstName": "Shruti",
        "middleName": "Hemant",
        "lastName": "Gaikwad",
        "contact": "9123456790",
        "email": "shruti.gaikwad@sopvarada.edu",
        "age": 15,
        "motherTongue": "Marathi",
        "password": "Pass@5678",
    },
]

SCHOOL_NAMES = {
    1: "The Modern School of Science",
    2: "SOP School of Varada",
}


def insert_student(student: dict) -> dict | None:
    """
    Calls POST /addStudent?schoolId={schoolId}
    Body mirrors StudentRegistration.jsx (excludes confirmPassword and schoolId).
    """
    school_id = student["schoolId"]
    url = f"{BASE_URL}/addStudent?schoolId={school_id}"

    # Body fields only (no schoolId, no confirmPassword)
    body = {
        "firstName":    student["firstName"],
        "middleName":   student["middleName"],
        "lastName":     student["lastName"],
        "contact":      student["contact"],
        "email":        student["email"],
        "age":          student["age"],
        "motherTongue": student["motherTongue"],
        "password":     student["password"],
    }

    try:
        resp = requests.post(url, json=body, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        print(f"  [FAIL] CONNECTION REFUSED - is the backend running at {BASE_URL}?")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [FAIL] HTTP {resp.status_code}: {resp.text[:200]}")
        return None
    except Exception as e:
        print(f"  [FAIL] Unexpected error: {e}")
        return None


def main():
    print("=" * 65)
    print(" MRB Student Bulk Insert - Student Registration API")
    print("=" * 65)
    print(f" Base URL : {BASE_URL}")
    print(f" Endpoint : POST /addStudent?schoolId={{id}}")
    print(f" Students : {len(STUDENTS)} total  (10 per school)")
    print("=" * 65)

    success = 0
    failed  = 0

    for idx, student in enumerate(STUDENTS, start=1):
        school_id   = student["schoolId"]
        school_name = SCHOOL_NAMES.get(school_id, f"School #{school_id}")
        full_name   = f"{student['firstName']} {student['middleName']} {student['lastName']}"

        print(f"\n[{idx:02d}/20] {full_name}")
        print(f"       School  : {school_name} (ID={school_id})")
        print(f"       Email   : {student['email']}")
        print(f"       Contact : {student['contact']}  |  Age: {student['age']}  |  Mother Tongue: {student['motherTongue']}")
        print(f"       Sending -> POST /addStudent?schoolId={school_id} ...", end=" ", flush=True)

        result = insert_student(student)

        if result is not None:
            student_id = result.get("studentId", "N/A")
            print(f"[OK] Created  (studentId={student_id})")
            success += 1
        else:
            failed += 1

        # Small delay to avoid overwhelming the server
        time.sleep(0.3)

    print("\n" + "=" * 65)
    print(f" Done! {success} inserted successfully, {failed} failed.")
    print("=" * 65)

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
