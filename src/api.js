import axios from "axios";

const API_URL = "http://100.53.20.30:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- STUDENT ENDPOINTS ---
/**
 * GET /students (Paginated)
 */
export const getStudents = async ({
  page = 0,
  size = 20,
  firstName,
  lastName,
  studentId,
  schoolId,
  email,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (firstName) params.append("firstName", firstName);
  if (lastName) params.append("lastName", lastName);
  if (studentId) params.append("studentId", studentId);
  if (schoolId) params.append("schoolId", schoolId);
  if (email) params.append("email", email);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/students?${params.toString()}`);
  return response.data;
};

/**
 * POST /students
 */
export const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

/**
 * PUT /students/{id}
 */
export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

/**
 * DELETE /students/{id}
 */
export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

// --- EXAM ENDPOINTS ---
/**
 * GET /exams (Paginated)
 */
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

/**
 * POST /exams
 */
export const createExam = async (examData) => {
  const response = await api.post("/exams", examData);
  return response.data;
};

/**
 * PUT /exams/{id}
 */
export const updateExam = async (id, examData) => {
  const response = await api.put(`/exams/${id}`, examData);
  return response.data;
};

/**
 * DELETE /exams/{id}
 */
export const deleteExam = async (id) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};

// --- EXAM APPLICATION ENDPOINTS ---
/**
 * GET /exam-applications (Paginated)
 */
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

/**
 * POST /exam-applications
 */
export const createExamApplication = async (applicationData) => {
  const response = await api.post("/exam-applications", applicationData);
  return response.data;
};

/**
 * PUT /exam-applications/{id}
 */
export const updateExamApplication = async (id, applicationData) => {
  const response = await api.put(`/exam-applications/${id}`, applicationData);
  return response.data;
};

/**
 * DELETE /exam-applications/{id}
 */
export const deleteExamApplication = async (id) => {
  const response = await api.delete(`/exam-applications/${id}`);
  return response.data;
};

// --- REGION ENDPOINTS ---
/**
 * GET /regions (Paginated)
 */
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

/**
 * POST /regions
 */
export const createRegion = async (regionData) => {
  const response = await api.post("/regions", regionData);
  return response.data;
};

/**
 * PUT /regions/{id}
 */
export const updateRegion = async (id, regionData) => {
  const response = await api.put(`/regions/${id}`, regionData);
  return response.data;
};

/**
 * DELETE /regions/{id}
 */
export const deleteRegion = async (id) => {
  const response = await api.delete(`/regions/${id}`);
  return response.data;
};

// --- EXAM CENTRE ENDPOINTS ---
/**
 * GET /exam-centres (Paginated)
 */
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

/**
 * POST /exam-centres
 */
export const createExamCentre = async (centreData) => {
  const response = await api.post("/exam-centres", centreData);
  return response.data;
};

/**
 * PUT /exam-centres/{id}
 */
export const updateExamCentre = async (id, centreData) => {
  const response = await api.put(`/exam-centres/${id}`, centreData);
  return response.data;
};

/**
 * DELETE /exam-centres/{id}
 */
export const deleteExamCentre = async (id) => {
  const response = await api.delete(`/exam-centres/${id}`);
  return response.data;
};

// --- SCHOOL ENDPOINTS ---
/**
 * GET /schools (Paginated)
 */
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

/**
 * POST /schools
 */
export const createSchool = async (schoolData) => {
  const response = await api.post("/schools", schoolData);
  return response.data;
};

// --- RESULT ENDPOINTS ---
export const createExamResult = async (resultData) => {
  const response = await api.post("/exam-results", resultData);
  return response.data;
};

export const getExamResults = async ({
  page = 0,
  size = 20,
  studentId,
  examId,
  schoolId,
  regionId,
  centreId,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (studentId) params.append("studentId", studentId);
  if (examId) params.append("examId", examId);
  if (schoolId) params.append("schoolId", schoolId);
  if (regionId) params.append("regionId", regionId);
  if (centreId) params.append("centreId", centreId);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exam-results?${params.toString()}`);
  return response.data;
};

export default api;
