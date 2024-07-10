import React from 'react';
import './ProfileView.css';

const ProfileView = () => {
    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="background-image"></div>
                <div className="profile-picture">
                    <img src="/images/jensen1.jpg" alt="Profile" />
                </div>
            </div>
            <div className="about-section">
                <h2>ABOUT</h2>
                <p>text text text text text text text text text text text text text text 
                    text text text text text text text text text text text text text text text</p>
            </div>
            <div className="profile-content">
                <div className="profile-info">
                    <h1>NAMENAME</h1>
                    <h2>@USERNAME</h2>
                    <p>Artist / Fan / Producer</p>
                    <p>links i don't want to get icons</p>
                    <div className="follow-info">
                        <div>Following<br />00</div>
                        <div>Followers<br />00</div>
                    </div>
                </div>
                <div className="profile-details">
                    <div className="bio-section">
                        <h2>BIO</h2>
                        <p>PRONOUNS:</p>
                        <p>LOCATION:</p>
                        <p>LABEL:</p>
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
