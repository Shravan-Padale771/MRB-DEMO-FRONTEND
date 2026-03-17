import api from '../api';

/**
 * POST /exams
 */
export const createExam = async (examData) => {
  const response = await api.post("/exams", examData);
  return response.data;
};

/**
 * GET /exams/all
 */
export const getAllExams = async () => {
  const response = await api.get("/exams/all");
  return response.data;
};

/**
 * GET /exams (Paginated)
 */
export const searchExams = async ({
  page = 0,
  size = 20,
  exam_name,
  exam_code,
  status,
  sort,
} = {}) => {
  const params = new URLSearchParams({ page, size });
  if (exam_name) params.append("exam_name", exam_name);
  if (exam_code) params.append("exam_code", exam_code);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);

  const response = await api.get(`/exams?${params.toString()}`);
  return response.data;
};

/**
 * GET /exams/{id}
 */
export const getExam = async (id) => {
  const response = await api.get(`/exams/${id}`);
  return response.data;
};

/**
 * PUT /exams/{id}
 */
export const updateExam = async (examData) => {
  const response = await api.put("/exams", examData);
  return response.data;
};

/**
 * DELETE /exams/{id}
 */
export const deleteExam = async (id) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};
