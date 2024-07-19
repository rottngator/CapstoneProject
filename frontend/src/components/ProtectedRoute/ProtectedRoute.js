import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const { user } = useAuth();

    return user ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
