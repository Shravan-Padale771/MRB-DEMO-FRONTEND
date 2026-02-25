import requests
import time
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8080"
OUTPUT_DIR = r"c:\Users\SUMIT\Desktop\mrb\MRB-DEMO-FRONTEND\output_data"
SUMMARY_FILE = os.path.join(OUTPUT_DIR, "performance_results.txt")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Test cases for filterable endpoints
# We use standard params and some specific ones based on known data
TEST_ENDPOINTS = [
    {"name": "Students (Page 0)", "url": "/students", "params": {"page": 0, "size": 10}},
    {"name": "Students (ID 711)", "url": "/students", "params": {"studentId": 711}},
    {"name": "Exams (Page 0)", "url": "/exams", "params": {"page": 0, "size": 10}},
    {"name": "Exam Applications (Page 0)", "url": "/exam-applications", "params": {"page": 0, "size": 10}},
    {"name": "Exam Results (Page 0)", "url": "/exam-results", "params": {"page": 0, "size": 10}},
    {"name": "Regions (List)", "url": "/getRegions", "params": {}},
    {"name": "Schools (Page 0)", "url": "/schools", "params": {"page": 0, "size": 10}},
    {"name": "Exam Centres (Page 0)", "url": "/exam-centres", "params": {"page": 0, "size": 10}},
    {"name": "Get All Students (Legacy)", "url": "/getAllStudents", "params": {}},
    {"name": "Get All Exams (Legacy)", "url": "/getAllExams", "params": {}},
]

def run_performance_test():
    results = []
    
    print(f"Starting performance test at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    for test in TEST_ENDPOINTS:
        name = test["name"]
        url = f"{BASE_URL}{test['url']}"
        params = test["params"]
        
        try:
            start_time = time.perf_counter()
            response = requests.get(url, params=params, timeout=60)
            end_time = time.perf_counter()
            
            duration_ms = (end_time - start_time) * 1000
            status_code = response.status_code
            
            # Create a safe filename
            safe_name = name.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")
            file_path = os.path.join(OUTPUT_DIR, f"{safe_name}.json")
            
            # Save response content
            if status_code == 200:
                with open(file_path, "w") as f:
                    json.dump(response.json(), f, indent=4)
                data_size = len(response.content)
            else:
                data_size = 0
                
            result_entry = {
                "name": name,
                "url": url,
                "params": params,
                "status": status_code,
                "time_ms": round(duration_ms, 2),
                "size_bytes": data_size,
                "file": file_path
            }
            results.append(result_entry)
            
            print(f"| {name:<30} | {status_code:<5} | {duration_ms:>8.2f} ms |")
            
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            print(f"FAILED: {name} - Error: {error_msg}")
            results.append({
                "name": name,
                "status": "ERROR",
                "time_ms": 0,
                "size_bytes": 0,
                "error": error_msg
            })

    # Generate Summary file
    with open(SUMMARY_FILE, "w") as f:
        f.write(f"API Performance Summary - Generated {datetime.now()}\n")
        f.write("=" * 70 + "\n")
        f.write(f"{'Endpoint Name':<35} | {'Status':<8} | {'Time (ms)':<12} | {'Size (KB)':<10}\n")
        f.write("-" * 70 + "\n")
        
        for r in results:
            if r.get("status") == "ERROR":
                f.write(f"{r['name']:<35} | {'ERROR':<8} | {'N/A':<12} | {'N/A':<10}\n")
            else:
                kb_size = round(r['size_bytes'] / 1024, 2)
                f.write(f"{r['name']:<35} | {r['status']:<8} | {r['time_ms']:<12.2f} | {kb_size:<10}\n")
    
    print("-" * 60)
    print(f"Test completed. Results saved to {OUTPUT_DIR}")
    print(f"Summary available at: {SUMMARY_FILE}")

if __name__ == "__main__":
    run_performance_test()
