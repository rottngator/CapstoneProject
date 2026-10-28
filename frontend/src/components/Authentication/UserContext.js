import React, { createContext, useState, useEffect } from 'react';
import { apiUrl, authHeaders } from '../../api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!localStorage.getItem('token')) return;
            try {
                const response = await fetch(apiUrl('/user/profile'), {
                    headers: authHeaders(),
                });
                if (response.ok) {
                    setUser(await response.json());
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
