import axios from 'axios';

const API_URL = 'http://localhost:3000/user';

export const register = async (userData) => {
    return axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
};

export const login = async (username, password) => {
    return axios.post(`${API_URL}/auth/login`, { username, password }, { withCredentials: true });
};

export const logout = async () => {
    return axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
    return axios.get(`${API_URL}/profile`, { withCredentials: true });
};
