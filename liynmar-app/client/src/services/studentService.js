import api from './api';

// Get all students
export const getAllStudents = async (params = {}) => {
  const response = await api.get('/students', { params });
  return response.data;
};

// Get deleted students
export const getDeletedStudents = async () => {
  const response = await api.get('/students/deleted');
  return response.data;
};

// Get single student
export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

// Create student
export const createStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

// Update student
export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

// Soft delete student
export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

// Restore student
export const restoreStudent = async (id) => {
  const response = await api.patch(`/students/${id}/restore`);
  return response.data;
};

// Permanent delete student
export const permanentDeleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}/permanent`);
  return response.data;
};

// Assign teacher to student
export const assignTeacher = async (studentId, teacherId) => {
  const response = await api.patch(`/students/${studentId}/assign-teacher`, { teacherId });
  return response.data;
};

// Unassign teacher from student
export const unassignTeacher = async (studentId) => {
  const response = await api.patch(`/students/${studentId}/unassign-teacher`);
  return response.data;
};

export default {
  getAllStudents,
  getDeletedStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
  permanentDeleteStudent,
  assignTeacher,
  unassignTeacher
};
