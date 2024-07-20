import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const API_URL = 'http://localhost:3000';

const NavBar = () => {
    const [user, setUser] = useState(null);

    const getCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        return await response.json();
    };

    const fetchUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Failed to fetch user', error);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <nav className='navbar'>
            <div className='logo'>
                <img src='/images/The Sound Hub Logo.png' alt='logo' className='logo'/>
                <span>The Sound Hub</span>
            </div>
            
            <div className='search-container'>
                <input type='text' className='search-bar' />
                <button className='search-button'>Search</button>
            </div>
            <div className='dropdown'>
                {user ? (
                    <>
                        <img src={user.profilePicture || '/default-profile.png'} alt='Profile' className='profile-pic' />
                        <span>{user.username}</span>
                        <div className='dropdown-menu'>
                            <Link to='/profile'>Profile</Link>
                            <Link to='/settings'>Settings</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </>
                ) : (
                    <Link to='/login'>Login</Link>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
