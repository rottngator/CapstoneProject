import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/user/profile', { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
        const response = await axios.get('/api/user/profile', { withCredentials: true });
        setUser(response.data);
    };

    const logout = async () => {
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
