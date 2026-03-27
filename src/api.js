import axios from "axios";

const API_URL2 = "http://100.53.20.30:8080";

const API_URL = "http://localhost:8080";

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
export const createStudent = async (studentData, schoolId) => {
  const response = await api.post(
    `/students?schoolId=${schoolId}`,
    studentData,
  );
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
 * GET application by ID and Exam No
 */
export const getExamApplicationByExactId = async (applicationId, examNo) => {
  const response = await api.get(
    `/exam-applications-byId?applicationId=${applicationId}&examNo=${examNo}`,
  );
  return response.data;
};

/**
 * GET application by ID using filtered search
 */
export const getExamApplicationById = async (id) => {
  // Use the search endpoint with applicationId filter to get paginated response
  const response = await api.get(`/exam-applications?applicationId=${id}`);
  // Return the first item from the content array
  return response.data.content?.[0] || null;
};

/**
 * POST /exam-applications
 */
export const createExamApplication = async (applicationData) => {
  const response = await api.post(`/exam-applications`, applicationData);
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
export const createExamCentre = async (centreData, regionId) => {
  const response = await api.post(
    `/exam-centres?regionId=${regionId}`,
    centreData,
  );
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
 * GET /schools/{id}
 */
export const getSchool = async (id) => {
  const response = await api.get(`/schools/${id}`);
  return response.data;
};

/**
 * POST /schools
 */
export const createSchool = async (schoolData, examCentreId) => {
  const response = await api.post(
    `/schools?centreId=${examCentreId}`,
    schoolData,
  );
  return response.data;
};

/**
 * PUT /schools/{id}
 */
export const updateSchool = async (id, schoolData) => {
  // Ensure we are sending schoolId and other DTO fields
  const payload = {
    ...schoolData,
    schoolId: id,
  };
  const response = await api.put("/schools", payload);
  return response.data;
};

/**
 * DELETE /schools/{id}
 */
export const deleteSchool = async (id) => {
  const response = await api.delete(`/schools/${id}`);
  return response.data;
};

// --- RESULT ENDPOINTS ---
export const createExamResult = async (resultData, applicationId) => {
  const response = await api.post(
    `/exam-results?applicationId=${applicationId}`,
    resultData,
  );
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

// --- ANALYTICS ENDPOINTS ---
export const getAnalyticsSummary = async () => {
  const response = await api.get("/summary");
  return response.data;
};

export const getStudentCountBySchool = async (schoolId) => {
  const response = await api.get(`/counts/school/${schoolId}/students`);
  return response.data;
};

export const getExamCentreCountByRegion = async (regionId) => {
  const response = await api.get(`/counts/region/${regionId}/exam-centres`);
  return response.data;
};

export const getSchoolCountByExamCentre = async (centreId) => {
  const response = await api.get(`/counts/exam-centre/${centreId}/schools`);
  return response.data;
};

export const getStudentCountByRegion = async (regionId) => {
  const response = await api.get(`/counts/region/${regionId}/students`);
  return response.data;
};

export const getSchoolCountByRegion = async (regionId) => {
  const response = await api.get(`/counts/region/${regionId}/schools`);
  return response.data;
};

export const getStudentCountByExamCentre = async (centreId) => {
  const response = await api.get(`/counts/exam-centre/${centreId}/students`);
  return response.data;
};

// --- STUDENT PROFILE ENDPOINTS ---
export const getStudentProfile = async (id) => {
  const response = await api.get(`/studentProfiles/${id}`);
  return response.data;
};

export const getStudentProfileByStudentIdString = async (studentId) => {
  const response = await api.get(`/studentprofile/studentId/${studentId}`);
  return response.data;
};
export const getAllStudentProfiles = async () => {
  const response = await api.get("/getAllStudentProfiles");
  return response.data;
};

export const addStudentProfile = async (studentId, profileData) => {
  const response = await api.post(
    `/addStudentProfile?studentId=${studentId}`,
    profileData,
  );
  return response.data;
};

export const createStudentProfileAPI = async (studentId, profileData) => {
  const response = await api.post(
    `/studentProfiles?studentId=${studentId}`,
    profileData,
  );
  return response.data;
};

export const getStudentProfileById = async (id) => {
  const response = await api.get(`/studentProfiles/${id}`);
  return response.data;
};

export const searchStudentProfiles = async ({
  page = 0,
  size = 20,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (sort) params.append("sort", sort);

  const response = await api.get(`/studentProfiles?${params.toString()}`);
  return response.data;
};

export const updateStudentProfile = async (id, profileData) => {
  const response = await api.put(`/studentProfiles/${id}`, profileData);
  return response.data;
};

export const deleteStudentProfile = async (id) => {
  const response = await api.delete(`/studentProfiles/${id}`);
  return response.data;
};

// --- FILE ENDPOINTS ---
/**
 * POST /upload
 * Supports single or multiple files
 */
export const uploadFiles = async (files) => {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append("files", file));
  } else {
    formData.append("files", files);
  }

  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * DELETE /upload
 */
export const deleteFile = async (objectName) => {
  const response = await api.delete(`/files/upload`, {
    params: { objectName },
  });
  return response.data;
};

// --- AUTH ENDPOINTS ---
/**
 * POST /auth/student/login
 * Accepts { username: email, password } and returns StudentDTO or throws on 401
 */
export const studentLogin = async (email, password) => {
  const response = await api.post("/auth/student/login", {
    username: email,
    password: password,
  });
  return response.data;
};

export default api;

