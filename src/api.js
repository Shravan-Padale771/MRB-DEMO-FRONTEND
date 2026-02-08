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

export const addStudent = async (schoolId, studentData) => {
  const response = await api.post(`/addStudent?schoolId=${schoolId}`, studentData);
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

export const getAllResults = async () => {
  const response = await api.get("/getAllResults"); // New Endpoint
  return response.data;
};

export const getStudentResults = async (studentId) => {
  const response = await api.get(`/getStudentResults?studentId=${studentId}`);
  return response.data;
};

// --- REGION ENDPOINTS ---
export const getAllRegions = async () => {
  const response = await api.get("/getRegions");
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

export const addExamCentre = async (regionId, centreData) => {
  const response = await api.post(`/addExamCentre?regionId=${regionId}`, centreData);
  return response.data;
};

// --- SCHOOL ENDPOINTS ---
export const getAllSchools = async () => {
  const response = await api.get("/getAllSchools");
  return response.data;
};

export const addSchool = async (centreId, schoolData) => {
  const response = await api.post(`/addSchool?centreId=${centreId}`, schoolData);
  return response.data;
};

export default api;
