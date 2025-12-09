import api from './api';

// Set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Register new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.status === 'success') {
    const token = response.data.data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    setAuthToken(token);
  }
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.status === 'success') {
    const token = response.data.data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
    setAuthToken(token);
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  setAuthToken(null);
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`/auth/users/${userId}`);
  return response.data;
};

export default {
  register,
  login,
  logout,
  getProfile,
  isAuthenticated,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  setAuthToken
};