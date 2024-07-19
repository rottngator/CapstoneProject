import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const login = async (credential, password) => {
    const response = await axios.post(`${API_URL}/login`, { credential, password }, { withCredentials: true });
    return response.data;
};

export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch current user:', error.response.data);
        return null;
    }
};

export const getProtectedData = async () => {
    const response = await axios.get(`${API_URL}/protected`, { withCredentials: true, headers: { Authorization: localStorage.getItem('token') } });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};
