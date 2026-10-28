export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiUrl = (path) => `${API_URL}${path}`;

export const authHeaders = (json = false) => {
    const token = localStorage.getItem('token');
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
