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
    
    // Ensure profilePicture URL is valid
    const profilePictureUrl = user ? `http://localhost:3000/public/uploads/${user.profilePicture}` : '';

    return (
        <nav className="navbar">
            <div className="logo">The Sound Hub</div>
            <div className="search-bar">
                <input type="text" placeholder="Search" />
                <button>Search</button>
            </div>
            <div className="user-section">
                {user ? (
                    <div className="dropdown">
                        <img
                            src={profilePictureUrl}
                            alt={user.username ? `${user.username}'s profile picture` : 'Profile'}
                            className="profile-picture"
                        />
                        <div className="dropdown-content">
                            <button onClick={() => navigate('/profile')}>Profile</button>
                            <button onClick={() => navigate('/edit')}>Edit Profile</button>
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
