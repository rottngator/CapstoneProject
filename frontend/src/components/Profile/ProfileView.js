import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProfileView.css';

const ProfileView = () => {
    const [profileData, setProfileData] = useState({
        profilePicture: '',
        banner: '',
        about: '',
        pronouns: '',
        location: '',
        label: '',
        name: '',
        username: '',
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/user/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Failed to fetch profile data:', response.statusText);
                    return;
                }

                const data = await response.json();
                setProfileData(data); // Directly set the data object
                console.log(data);  // Log the fetched data
            } catch (error) {
                console.error('Failed to fetch profile data:', error.message);
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="container profile-container">
            <div className="profile-header">
            <div className="background-image" 
                style={{ backgroundImage: 
                    `url(${profileData.banner ? `/uploads/${profileData.banner}` : ''})` }} 
                > {console.log('Banner URL:', profileData.banner)} </div>
                <div className="profile-picture">
                    <img 
                    src={`/uploads/${profileData.profilePicture || 'default.png'}`} 
                    alt="Profile" 
                    className="rounded-circle" 
                    />
                    {console.log('Profile Picture URL:', `/uploads/${profileData.profilePicture}`)}
                </div>
            </div>
            
            <div className="about-section mt-3">
                <h2>ABOUT</h2>
                <p>{profileData.about}</p>
            </div>
            <div className="profile-content row">
                <div className="profile-info col-md-4">
                    <h1>{profileData.name}</h1>
                    <h2>@{profileData.username}</h2>
                    <p>{profileData.label}</p>
                    <p>Links: <a href="#link">Link 1</a>, <a href="#link">Link 2</a></p>
                    <div className="follow-info">
                        <div>Following<br />00</div>
                        <div>Followers<br />00</div>
                    </div>
                </div>
                <div className="profile-details col-md-8">
                    <div className="bio-section">
                        <h2>BIO</h2>
                        <p>PRONOUNS: {profileData.pronouns}</p>
                        <p>LOCATION: {profileData.location}</p>
                        <p>LABEL: {profileData.label}</p>
                    </div>
                    <div className="tracks-section">
                        <h2>TRACKS</h2>
                        <div className="track">
                            <img src="/images/track.jpg" alt="Track" />
                            <p>Dungeon Meshi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
