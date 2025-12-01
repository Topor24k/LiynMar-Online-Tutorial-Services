import api from '../utils/api';

export const teacherService = {
  // Get all teachers
  getAll: async () => {
    const response = await api.get('/teachers');
    return response.data;
  },

  // Get single teacher
  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Create teacher
  create: async (teacherData) => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  // Update teacher
  update: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  // Delete teacher
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Get teacher's students
  getStudents: async (id, weekStart) => {
    const response = await api.get(`/teachers/${id}/students`, {
      params: { weekStart },
    });
    return response.data;
  },

  // Get teacher's earnings
  getEarnings: async (id, weekStart) => {
    const response = await api.get(`/teachers/${id}/earnings`, {
      params: { weekStart },
    });
    return response.data;
  },
};
