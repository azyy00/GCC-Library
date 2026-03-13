import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  search: (query) => api.get(`/students/search?q=${query}`),
  getProfile: (studentId) => api.get(`/students/profile/${studentId}`)
};

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (id) => api.post(`/attendance/checkout/${id}`)
};

export default api;
