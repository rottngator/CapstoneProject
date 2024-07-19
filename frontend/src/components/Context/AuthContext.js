import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/user/profile', { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        await axios.post('http://localhost:3000/api/auth/login', { username, password }, { withCredentials: true });
        const response = await axios.get('http://localhost:3000/api/user/profile', { withCredentials: true });
        setUser(response.data);
    };

    const logout = async () => {
        await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
