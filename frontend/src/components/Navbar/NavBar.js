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
                <img src='/images/The Sound Hub Logo.png' alt='logo'/>
                <span>The Sound Hub</span>
            </div>
            
            <div className='search-container'>
                <input type='text' className='search-bar' placeholder='Search' />
                <button className='search-button'>Search</button>
            </div>
            
            <div className='nav-items'>
                <img src='profile-pic-url' alt='Profile' className='profile-pic' onClick={toggleDropdown} />
                {dropdownVisible && (
                    <ul className='dropdown-menu'>
                        <li><a href='#profile'>Profile</a></li>
                        <li><a href='#settings'>Settings</a></li>
                        <li><a href='#logout'>Logout</a></li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
