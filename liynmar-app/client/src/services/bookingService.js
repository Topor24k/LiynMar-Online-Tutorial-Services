import api from './api';

// Get all bookings
export const getAllBookings = async (params = {}) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

// Get booking statistics
export const getBookingStats = async () => {
  const response = await api.get('/bookings/stats');
  return response.data;
};

// Get bookings by teacher
export const getBookingsByTeacher = async (teacherId) => {
  const response = await api.get(`/bookings/teacher/${teacherId}`);
  return response.data;
};

// Get single booking
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Create booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Update booking
export const updateBooking = async (id, bookingData) => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

// Delete booking
export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export default {
  getAllBookings,
  getBookingStats,
  getBookingsByTeacher,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
