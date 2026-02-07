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

export const addStudent = async (studentData) => {
  const response = await api.post("/addStudent", studentData);
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

export default api;
