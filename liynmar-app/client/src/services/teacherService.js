import api from './api';

// Get all teachers
export const getAllTeachers = async (params = {}) => {
  const response = await api.get('/teachers', { params });
  return response.data;
};

// Get deleted teachers
export const getDeletedTeachers = async () => {
  const response = await api.get('/teachers/deleted');
  return response.data;
};

// Get single teacher
export const getTeacherById = async (id) => {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
};

// Create teacher
export const createTeacher = async (teacherData) => {
  const response = await api.post('/teachers', teacherData);
  return response.data;
};

// Update teacher
export const updateTeacher = async (id, teacherData) => {
  const response = await api.put(`/teachers/${id}`, teacherData);
  return response.data;
};

// Soft delete teacher
export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
};

// Restore teacher
export const restoreTeacher = async (id) => {
  const response = await api.patch(`/teachers/${id}/restore`);
  return response.data;
};

// Permanent delete teacher
export const permanentDeleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}/permanent`);
  return response.data;
};

export default {
  getAllTeachers,
  getDeletedTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  restoreTeacher,
  permanentDeleteTeacher
};
