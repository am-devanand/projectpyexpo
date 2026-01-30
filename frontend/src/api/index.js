import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Auth
export const login = (username, password, role) =>
    api.post('/login/', { username, password, role });

export const logout = () =>
    api.post('/logout/');

export const getCurrentUser = () =>
    api.get('/users/me/');

// Users
export const getCollectors = () =>
    api.get('/users/collectors/');

// Complaints
export const getComplaints = (params = {}) =>
    api.get('/complaints/', { params });

export const createComplaint = (formData) =>
    api.post('/complaints/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const assignComplaint = (complaintId, collectorId) =>
    api.post(`/complaints/${complaintId}/assign/`, { collector_id: collectorId });

export const resolveComplaint = (complaintId, formData) =>
    api.post(`/complaints/${complaintId}/resolve/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const rejectComplaint = (complaintId, reason) =>
    api.post(`/complaints/${complaintId}/reject/`, { reason });

// Simulation & Stats
export const simulateTimeout = (complaintIds = []) =>
    api.post('/simulate-timeout/', { complaint_ids: complaintIds });

export const getDashboardStats = () =>
    api.get('/stats/');

export default api;
