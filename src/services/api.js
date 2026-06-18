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


// LANGUAGE PREFERENCE
// The student's chosen reply language ('en' or 'ne') is kept in localStorage so
// it persists across pages and page reloads. Every AI request reads it through
// getLanguage() and sends it to the backend.

export const getLanguage = () => localStorage.getItem('language') || 'en';

// Save the language choice. localStorage is kept as a fast local cache, but the
// account on the server is the source of truth: when the student is logged in we
// also persist the choice to their profile so it follows them across devices.
// The server call is fire-and-forget so the UI updates instantly.
export const setLanguage = (language) => {
  const normalized = language === 'ne' ? 'ne' : 'en';
  localStorage.setItem('language', normalized);

  if (localStorage.getItem('token')) {
    apiClient.put('/users/profile', { language: normalized }).catch(() => {});
  }

  return normalized;
};


// TOPIC SELECTION & RECENTLY STUDIED TOPICS
// These power the lecturer's request: let students PICK a topic to study, and
// make quizzes specific to what they JUST studied instead of generic.

// A starter list of common tech-study topics shown as clickable chips so the
// student can select a topic instead of always typing one.
export const SUGGESTED_TOPICS = [
  'Arrays', 'Pointers', 'Recursion', 'Big-O Notation', 'Linked Lists',
  'Stacks & Queues', 'SQL Joins', 'OOP', 'HTTP', 'Binary Search',
];

// Remember the topics a student has recently studied (most recent first), kept
// in localStorage. The Quiz page reads these so it can offer a quiz on exactly
// what the student just studied.
const RECENT_TOPICS_KEY = 'recentTopics';

export const getRecentTopics = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_TOPICS_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
};

export const addRecentTopic = (topic) => {
  const clean = String(topic || '').trim();
  if (!clean) return getRecentTopics();

  // Put the new topic first, drop any duplicate (case-insensitive), keep 5.
  const existing = getRecentTopics().filter(
    (item) => item.toLowerCase() !== clean.toLowerCase()
  );
  const updated = [clean, ...existing].slice(0, 5);

  localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(updated));
  return updated;
};


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
    apiClient.post('/study/explain', { topic, level, language: getLanguage() }),
};


// QUIZ ENDPOINTS
// These power the adaptive Quiz page and the Progress dashboard.

export const quizAPI = {
  // Generate one adaptive quiz question (topic is optional).
  generateQuiz: (topic) => apiClient.post('/quiz/generate', { topic, language: getLanguage() }),

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
