# -*- coding: utf-8 -*-
"""
Add Exams Script
================
Sends exam data to POST /addExam endpoint.

IMPORTANT: The backend (and AdminDashboard.jsx handleCreateExam) expects
  - `papers`       as a JSON STRING  (JSON.stringify of the array)
  - `exam_details` as a JSON STRING  (JSON.stringify of the object)
All other top-level fields are sent normally.

Endpoint : POST http://localhost:8080/addExam
Content  : application/json
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8080"

# ---------------------------------------------------------------------------
# Raw exam definitions  (papers & exam_details kept as dicts here;
# they will be json.dumps'd before sending, mirroring JS JSON.stringify)
# ---------------------------------------------------------------------------
EXAMS = [
    {
        "exam_name": "Rashtrabhasha Prathamik Pariksha (May 2026)",
        "exam_code": "PRATHAMIK_MAY_2026",
        "status": "DRAFT",
        "no_of_papers": 1,
        "exam_fees": 400,
        "application_start_date": "2026-02-15",
        "application_end_date": "2026-04-15",
        "exam_start_date": "2026-05-10",
        "exam_end_date": "2026-05-10",
        "papers": [
            {"name": "Prashnpatra", "maxMarks": 100}
        ],
        "exam_details": {
            "identity": {
                "examFullTitle": "Rashtrabhasha Prathamik Pariksha",
                "conductingBody": "Maharashtra Rashtrabhasha Sabha, Pune",
                "board": "Rashtrabhasha Sabha",
                "examLevel": "PRATHAMIK",
                "language": "Hindi"
            },
            "schedule": {
                "session": "May 2026",
                "mode": "WRITTEN",
                "medium": "Hindi",
                "totalDuration": "2 Hours"
            },
            "rules": {
                "eligibility": "Class 5 or equivalent",
                "passingCriteria": "Minimum 40% total marks",
                "graceMarksAllowed": True,
                "revaluationAllowed": False,
                "maxAttempts": "Unlimited"
            },
            "structure": {
                "hasOral": False,
                "hasProject": False
            }
        }
    },
    {
        "exam_name": "Rashtrabhasha Pravin Pariksha (October 2026)",
        "exam_code": "PRAVIN_OCT_2026",
        "status": "DRAFT",
        "no_of_papers": 2,
        "exam_fees": 700,
        "application_start_date": "2026-07-01",
        "application_end_date": "2026-08-31",
        "exam_start_date": "2026-10-05",
        "exam_end_date": "2026-10-10",
        "papers": [
            {"name": "Pratham Prashnpatra", "maxMarks": 100},
            {"name": "Dvitiya Prashnpatra", "maxMarks": 100}
        ],
        "exam_details": {
            "identity": {
                "examFullTitle": "Rashtrabhasha Pravin Pariksha",
                "conductingBody": "Maharashtra Rashtrabhasha Sabha, Pune",
                "board": "Rashtrabhasha Sabha",
                "examLevel": "PRAVIN",
                "language": "Hindi"
            },
            "schedule": {
                "session": "October 2026",
                "mode": "WRITTEN",
                "medium": "Hindi",
                "totalDuration": "3 Hours"
            },
            "rules": {
                "eligibility": "Prabodh passed",
                "passingCriteria": "40% in each paper",
                "maxAttempts": "5"
            },
            "structure": {
                "hasOral": False,
                "hasProject": False
            }
        }
    },
    {
        "exam_name": "Rashtrabhasha Prabodh Pariksha (May 2026)",
        "exam_code": "PRABODH_MAY_2026",
        "status": "DRAFT",
        "no_of_papers": 2,
        "exam_fees": 550,
        "application_start_date": "2026-02-15",
        "application_end_date": "2026-04-15",
        "exam_start_date": "2026-05-12",
        "exam_end_date": "2026-05-15",
        "papers": [
            {"name": "Pratham Prashnpatra", "maxMarks": 100},
            {"name": "Dvitiya Prashnpatra", "maxMarks": 100}
        ],
        "exam_details": {
            "identity": {
                "examFullTitle": "Rashtrabhasha Prabodh Pariksha",
                "conductingBody": "Maharashtra Rashtrabhasha Sabha, Pune",
                "board": "Rashtrabhasha Sabha",
                "examLevel": "PRABODH",
                "language": "Hindi"
            },
            "schedule": {
                "session": "May 2026",
                "mode": "WRITTEN",
                "medium": "Hindi",
                "totalDuration": "3 Hours"
            },
            "rules": {
                "eligibility": "Prathamik passed",
                "passingCriteria": "40% in each paper",
                "maxAttempts": "5"
            },
            "structure": {
                "hasOral": False,
                "hasProject": False
            }
        }
    },
    # 4th entry — same exam_code as #1 (PRATHAMIK_MAY_2026).
    # Included as provided; backend may reject as duplicate.
    {
        "exam_name": "Rashtrabhasha Prathamik Pariksha (May 2026) [copy]",
        "exam_code": "PRATHAMIK_MAY_2026_B",
        "status": "DRAFT",
        "no_of_papers": 1,
        "exam_fees": 400,
        "application_start_date": "2026-02-15",
        "application_end_date": "2026-04-15",
        "exam_start_date": "2026-05-10",
        "exam_end_date": "2026-05-10",
        "papers": [
            {"name": "Prashnpatra", "maxMarks": 100}
        ],
        "exam_details": {
            "identity": {
                "examFullTitle": "Rashtrabhasha Prathamik Pariksha",
                "conductingBody": "Maharashtra Rashtrabhasha Sabha, Pune",
                "board": "Rashtrabhasha Sabha",
                "examLevel": "PRATHAMIK",
                "language": "Hindi"
            },
            "schedule": {
                "session": "May 2026",
                "mode": "WRITTEN",
                "medium": "Hindi",
                "totalDuration": "2 Hours"
            },
            "rules": {
                "eligibility": "Class 5 or equivalent",
                "passingCriteria": "Minimum 40% total marks",
                "graceMarksAllowed": True,
                "revaluationAllowed": False,
                "maxAttempts": "Unlimited"
            },
            "structure": {
                "hasOral": False,
                "hasProject": False
            }
        }
    },
]


def build_payload(exam: dict) -> dict:
    """
    Mirrors AdminDashboard.jsx handleCreateExam:
        papers       -> JSON.stringify(examForm.papers)
        exam_details -> JSON.stringify(examForm.exam_details)
    """
    return {
        **{k: v for k, v in exam.items() if k not in ("papers", "exam_details")},
        "papers":       json.dumps(exam["papers"],       ensure_ascii=False),
        "exam_details": json.dumps(exam["exam_details"], ensure_ascii=False),
    }


def insert_exam(exam: dict):
    url     = f"{BASE_URL}/addExam"
    payload = build_payload(exam)

    try:
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        print(f"  [FAIL] CONNECTION REFUSED - is the backend running at {BASE_URL}?")
        return None
    except requests.exceptions.HTTPError:
        print(f"  [FAIL] HTTP {resp.status_code}: {resp.text[:300]}")
        return None
    except Exception as e:
        print(f"  [FAIL] Unexpected error: {e}")
        return None


def main():
    print("=" * 65)
    print(" MRB Exam Bulk Insert - POST /addExam")
    print("=" * 65)
    print(f" Base URL : {BASE_URL}")
    print(f" Exams    : {len(EXAMS)} to insert")
    print("=" * 65)

    success = 0
    failed  = 0

    for idx, exam in enumerate(EXAMS, start=1):
        print(f"\n[{idx:02d}/{len(EXAMS):02d}] {exam['exam_name']}")
        print(f"       Code   : {exam['exam_code']}")
        print(f"       Fees   : Rs. {exam['exam_fees']}  |  Papers: {exam['no_of_papers']}  |  Status: {exam['status']}")
        print(f"       AppWin : {exam['application_start_date']} -> {exam['application_end_date']}")
        print(f"       ExamWin: {exam['exam_start_date']} -> {exam['exam_end_date']}")
        print(f"       Sending -> POST /addExam ...", end=" ", flush=True)

        result = insert_exam(exam)

        if result is not None:
            exam_no = result.get("examNo", "N/A")
            print(f"[OK] Created  (examNo={exam_no})")
            success += 1
        else:
            failed += 1

        time.sleep(0.3)

    print("\n" + "=" * 65)
    print(f" Done! {success} created successfully, {failed} failed.")
    print("=" * 65)

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
