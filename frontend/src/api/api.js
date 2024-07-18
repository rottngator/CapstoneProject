import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response.data);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await axios.get(`${API_BASE_URL}/me`, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch current user:', error.response.data);
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};
