import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../../api/api';
import './NavBar.css';

const NavBar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
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
