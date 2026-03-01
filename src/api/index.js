import axios from 'axios';

const BASE_URL = 'https://school-erp.kesug.com/backend';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login            = (data)   => api.post('/api/login.php', data);
export const forgotPassword   = (data)   => api.post('/api/forgotPassword.php', data);
export const verifyOTP        = (data)   => api.post('/api/verifyOTP.php', data);
export const resetPassword    = (data)   => api.post('/api/resetPassword.php', data);

// Dashboard
export const getDashboard     = ()       => api.get('/api/getDashboardData.php');
export const getAttendance    = (params) => api.get('/api/getAttendance.php', { params });
export const getMonthlyReport = (params) => api.get('/api/getMonthlyReport.php', { params });

// Admin - Users
export const registerUser     = (data)   => api.post('/api/registerUser.php', data);
export const getUsers         = (role)   => api.get(`/api/getUsers.php?role=${role}`);
export const deleteUser       = (id)     => api.delete(`/api/getUsers.php?id=${id}`);
export const getStudents      = ()       => api.get('/api/getUsers.php?role=student');
export const updateStudent    = (data)   => api.put('/api/addStudent.php', data);
export const deleteStudent    = (id)     => api.delete(`/api/addStudent.php?id=${id}`);

// Classes
export const getClasses       = ()       => api.get('/api/addClass.php');
export const createClass      = (data)   => api.post('/api/addClass.php', data);

// QR
export const generateQR       = (params) => api.get('/api/generateQR.php', { params });
export const scanAttendance   = (data)   => api.post('/api/scanAttendance.php', data);
