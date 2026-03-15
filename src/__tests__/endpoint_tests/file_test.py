import requests
import os
import sys
import mimetypes

BASE_URL = "http://localhost:8080"

def test_single_upload(file_path):
    print(f"\n--- Testing Single File Upload: {file_path} ---")
    url = f"{BASE_URL}/files/upload"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'application/octet-stream'

    with open(file_path, 'rb') as f:
        # Format: (field_name, (filename, file_object, content_type))
        files = [('files', (os.path.basename(file_path), f, content_type))]
        response = requests.post(url, files=files)
    
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
        return response.json()
    except:
        print(f"Response (text): {response.text}")

def test_multiple_upload(file_paths):
    print(f"\n--- Testing Multiple File Upload: {file_paths} ---")
    url = f"{BASE_URL}/files/upload"
    
    files = []
    opened_files = []
    try:
        for path in file_paths:
            if os.path.exists(path):
                f = open(path, 'rb')
                opened_files.append(f)
                content_type, _ = mimetypes.guess_type(path)
                if not content_type:
                    content_type = 'application/octet-stream'
                files.append(('files', (os.path.basename(path), f, content_type)))
            else:
                print(f"Warning: File {path} not found.")

        if not files:
            print("No valid files to upload.")
            return

        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
            return response.json()
        except:
            print(f"Response (text): {response.text}")
    finally:
        for f in opened_files:
            f.close()

def test_delete_file(filename):
    print(f"\n--- Testing File Deletion: {filename} ---")
    url = f"{BASE_URL}/files/upload"
    params = {'objectName': filename}
    
    response = requests.delete(url, params=params)
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response (text): {response.text}")

def create_dummy_file(filename, content="dummy content"):
    with open(filename, "w") as f:
        f.write(content)
    return filename

def main():
    # User provided file paths
    file1 = r"C:\Users\SUMIT\Desktop\mrb\MRB-DEMO-FRONTEND\mrb_class_diagram_v2_1773322740878.png"
    file2 = r"C:\Users\SUMIT\Desktop\mrb\MRB-DEMO-FRONTEND\mrb_object_diagram_v2_1773322986793.png"
    
    target_files = []
    if os.path.exists(file1): target_files.append(file1)
    if os.path.exists(file2): target_files.append(file2)
    
    if not target_files:
        print("Error: No target PNG files found. Falling back to dummy files.")
        f1 = create_dummy_file("test_file1.txt", "This is test file 1")
        f2 = create_dummy_file("test_file2.txt", "This is test file 2")
        target_files = [f1, f2]
    
    try:
        # 1. Test Single Upload
        res1 = test_single_upload(target_files[0])
        
        # 2. Test Multiple Upload (using distinct files to avoid duplicate key error)
        if len(target_files) < 2 and target_files[0].endswith(".png"):
            # If only one PNG exists, create a dummy for the second file
            f_extra = create_dummy_file("extra_test_file.txt", "Extra content")
            multi_files = [target_files[0], f_extra]
        else:
            multi_files = target_files[:2]
            
        res2 = test_multiple_upload(multi_files)
        
        # 3. Test Deletion
        # if res1 and isinstance(res1, dict) and len(res1) > 0:
        #     filename_to_delete = list(res1.keys())[0]
        #     test_delete_file(filename_to_delete)
        # elif res2 and isinstance(res2, dict) and len(res2) > 0:
        #     filename_to_delete = list(res2.keys())[0]
        #     test_delete_file(filename_to_delete)
        # else:
        #     print("\nSkipping deletion test as no upload successful.")
        pass

    finally:
        # Cleanup dummy files if they were created
        if "test_file1.txt" in locals() and os.path.exists("test_file1.txt"): os.remove("test_file1.txt")
        if "test_file2.txt" in locals() and os.path.exists("test_file2.txt"): os.remove("test_file2.txt")

if __name__ == "__main__":
    main()
