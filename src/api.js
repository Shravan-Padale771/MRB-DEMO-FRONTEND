import axios from "axios";

const API_URL = "http://localhost:8080/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- STUDENT ENDPOINTS ---
export const getAllStudents = async () => {
  const response = await api.get("/getAllStudents");
  return response.data;
};

export const getStudents = async ({
  page = 0,
  size = 20,
  firstName,
  lastName,
  schoolId,
  email,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (firstName) params.append("firstName", firstName);
  if (lastName) params.append("lastName", lastName);
  if (schoolId) params.append("schoolId", schoolId);
  if (email) params.append("email", email);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/students?${params.toString()}`);
  return response.data;
};

export const addStudent = async (schoolId, studentData) => {
  const response = await api.post(
    `/addStudent?schoolId=${schoolId}`,
    studentData,
  );
  return response.data;
};

export const registerStudent = async (studentData, schoolId = 1) => {
  // Backend expects schoolId as query param and student data in body
  const response = await api.post(
    `/addStudent?schoolId=${schoolId}`,
    studentData,
  );
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/getStudent?id=${id}`);
  return response.data;
};

// --- EXAM ENDPOINTS ---
export const getAllExams = async () => {
  const response = await api.get("/getAllExams");
  return response.data;
};

export const getExams = async ({
  page = 0,
  size = 20,
  examName,
  examCode,
  status,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (examName) params.append("examName", examName);
  if (examCode) params.append("examCode", examCode);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exams?${params.toString()}`);
  return response.data;
};

export const addExam = async (examData) => {
  const response = await api.post("/addExam", examData);
  return response.data;
};

export const updateExam = async (id, examData) => {
  const response = await api.put(`/updateExam?exam_no=${id}`, examData);
  return response.data;
};

export const deleteExam = async (id) => {
  const response = await api.delete(`/deleteExam?id=${id}`);
  return response.data;
};

// --- APPLICATION ENDPOINTS ---
export const applyForExam = async (applicationData) => {


  // applicationData should look like:
  // { student: { studentId: 1 }, exam: { examNo: 1 }, formData: "...", status: "PENDING" }
  const response = await api.post("/fill-form", applicationData);
  return response.data;
};

export const getApplicationStatus = async (appId, examNo) => {
  const response = await api.get(
    `/get-form?applicationId=${appId}&examNo=${examNo}`,
  );
  return response.data;
};

// ... existing code ...

// --- RESULT ENDPOINTS ---
export const addExamResult = async (resultData) => {
  // resultData structure:
  // { application: { applicationId: 123 }, resultData: "Passed", publishedAt: "2026-..." }
  const response = await api.post("/addExamResult", resultData);
  return response.data;
};

export const getExamResult = async (applicationId) => {
  const response = await api.get(
    `/getExamResult?applicationId=${applicationId}`,
  );
  return response.data;
};

// Add these to src/api.js
export const getAllApplications = async () => {
  const response = await api.get("/getAllApplications"); // New Endpoint
  return response.data;
};

// --- EXAM APPLICATIONS (Paginated + Filtered) ---
export const getExamApplications = async ({
  page = 0,
  size = 20,
  examId,
  studentId,
  status,
  regionId,
  schoolId,
  examCentre,
  applicationId,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (examId != null) params.append("examId", examId);
  if (studentId != null) params.append("studentId", studentId);
  if (status) params.append("status", status);
  if (regionId != null) params.append("regionId", regionId);
  if (schoolId != null) params.append("schoolId", schoolId);
  if (examCentre != null) params.append("examCentre", examCentre);
  if (applicationId != null) params.append("applicationId", applicationId);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exam-applications?${params.toString()}`);
  return response.data;
};

export const getAllResults = async () => {
  const response = await api.get("/getAllResults"); // New Endpoint
  return response.data;
};

export const getStudentResults = async (studentId) => {
  const response = await api.get(`/getStudentResults?studentId=${studentId}`);
  return response.data;
};

export const getExamResults = async ({
  page = 0,
  size = 20,
  studentId,
  examId,
  schoolId,
  regionId,
  minPercentage,
  maxPercentage,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (studentId) params.append("studentId", studentId);
  if (examId) params.append("examId", examId);
  if (schoolId) params.append("schoolId", schoolId);
  if (regionId) params.append("regionId", regionId);
  if (minPercentage) params.append("minPercentage", minPercentage);
  if (maxPercentage) params.append("maxPercentage", maxPercentage);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exam-results?${params.toString()}`);
  return response.data;
};

// --- REGION ENDPOINTS ---
export const getAllRegions = async () => {
  const response = await api.get("/getRegions");
  return response.data;
};

export const getRegions = async ({
  page = 0,
  size = 20,
  regionName,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (regionName) params.append("regionName", regionName);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/regions?${params.toString()}`);
  return response.data;
};

export const addRegion = async (regionData) => {
  console.log("API: POST /addregion Payload:", regionData);
  const response = await api.post("/addregion", regionData);
  return response.data;
};

// --- EXAM CENTRE ENDPOINTS ---
export const getAllExamCentres = async () => {
  const response = await api.get("/getAllExamCentres");
  return response.data;
};

export const getExamCentres = async ({
  page = 0,
  size = 20,
  centreName,
  centreCode,
  regionId,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (centreName) params.append("centreName", centreName);
  if (centreCode) params.append("centreCode", centreCode);
  if (regionId) params.append("regionId", regionId);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exam-centres?${params.toString()}`);
  return response.data;
};

export const addExamCentre = async (regionId, centreData) => {
  const response = await api.post(
    `/addExamCentre?regionId=${regionId}`,
    centreData,
  );
  return response.data;
};

// --- SCHOOL ENDPOINTS ---
export const getAllSchools = async () => {
  const response = await api.get("/getAllSchools");
  return response.data;
};

export const getSchools = async ({
  page = 0,
  size = 20,
  schoolName,
  examCentreId,
  regionId,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (schoolName) params.append("schoolName", schoolName);
  if (examCentreId) params.append("examCentreId", examCentreId);
  if (regionId) params.append("regionId", regionId);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/schools?${params.toString()}`);
  return response.data;
};

export const addSchool = async (centreId, schoolData) => {
  const response = await api.post(
    `/addSchool?centreId=${centreId}`,
    schoolData,
  );
  return response.data;
};

export default api;
