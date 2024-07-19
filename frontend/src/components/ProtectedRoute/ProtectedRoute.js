import React from 'react';
import { Route, Navigate } from 'react-router-dom'; // Import Navigate instead of Redirect
import useAuth from '../Context/useAuth'; // Ensure path is correct

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const { user } = useAuth(); // Using useAuth hook to get user data

    return (
        <Route
            {...rest}
            element={user ? <Component /> : <Navigate to="/login" />} // Use Navigate for redirection
        />
    );
};

export default ProtectedRoute;
