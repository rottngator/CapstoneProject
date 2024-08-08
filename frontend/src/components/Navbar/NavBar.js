import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Authentication/UserContext';
import './NavBar.css';

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.removeItem('token'); // Remove token from localStorage
            setUser(null); // Clear user state
            navigate('/'); // Redirect to home page
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="navbar">
            <a href="/" className="logo">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub Logo" />
            </a>
            <div className="search-bar">
                <input type="text" placeholder="Search" />
                <button>Search</button>
            </div>
            <div className="user-section">
                {user ? (
                    <div className="dropdown">
                        <button className="welcome-button">
                            Welcome, {user.username}!
                        </button>
                        <div className="dropdown-content">
                            <button onClick={() => navigate('/profile')}>Profile</button>
                            <button onClick={() => navigate('/edit')}>Edit Profile</button>
                            <button onClick={() => navigate('/calendar')}>Calendar</button>
                            <button onClick={() => navigate('/feedback')}>Feedback</button>
                            <button onClick={() => navigate('/chat')}>Chat</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                ) : (
                    <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
