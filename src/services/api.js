// frontend/src/services/api.js
// Utility for communicating with the backend API

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies in requests
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// USER ENDPOINTS

export const userAPI = {
  // Get all users
  getAllUsers: () => apiClient.get('/users'),

  // Get user by ID
  getUserById: (id) => apiClient.get(`/users/${id}`),

  // Create new user
  createUser: (userData) => apiClient.post('/users', userData),

  // Update user
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};


// STUDY ENDPOINTS
// Ask the backend for an AI explanation of a topic at a chosen level.

export const studyAPI = {
  explainTopic: (topic, level) =>
    apiClient.post('/study/explain', { topic, level }),
};


// QUIZ ENDPOINTS
// These power the adaptive Quiz page and the Progress dashboard.

export const quizAPI = {
  // Generate one adaptive quiz question (topic is optional).
  generateQuiz: (topic) => apiClient.post('/quiz/generate', { topic }),

  // Submit the student's chosen answer so it gets graded and recorded.
  submitAnswer: (answerData) => apiClient.post('/quiz/answer', answerData),

  // Get the student's progress summary and per-topic statistics.
  getStats: () => apiClient.get('/quiz/stats'),
};

// ============================================
// ERROR HANDLING
// ============================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
