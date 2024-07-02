import React, { useState } from 'react';
import './NavBar.css';

const NavBar = () => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <nav className='navbar'>
            <div className='logo'>
                <img src='/frontend/public/images/soundLogo.png' alt='logo'/>
                <span>The Sound Hub</span>
            </div>
            
            <div className='search-container'>
                <input type='text' className='search-bar' placeholder='Search' />
                <button className='search-button'>Search</button>
            </div>
            <div className='dropdown'>
                <img src='profile-pic-url' alt='Profile' className='profile-pic' onClick={toggleDropdown} />
                {dropdownVisible && (
                    <div className='dropdown-menu'>
                        <a href='/profile'>Profile</a>
                        <a href='/settings'>Settings</a>
                        <a href='/logout'>Logout</a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
