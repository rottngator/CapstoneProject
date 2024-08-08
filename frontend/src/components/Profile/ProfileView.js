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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tracks, setTracks] = useState([]);


    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Fetch profile data
                const profileResponse = await fetch(`http://localhost:3000/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (!profileResponse.ok) {
                    throw new Error(`Failed to fetch profile data: ${profileResponse.statusText}`);
                }
    
                const profileData = await profileResponse.json();
                setProfileData(profileData);
    
                // Fetch user's uploaded tracks
                const tracksResponse = await fetch(`http://localhost:3000/user/tracks`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (!tracksResponse.ok) {
                    throw new Error(`Failed to fetch tracks: ${tracksResponse.statusText}`);
                }
    
                const tracksData = await tracksResponse.json();
                setTracks(tracksData);
    
            } catch (error) {
                console.error('Failed to fetch data:', error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    

    // Ensure URLs are correct and valid
    const profilePictureUrl = `http://localhost:3000${profileData.profilePicture}`;
    const bannerUrl = `http://localhost:3000${profileData.banner}`;

    return (
        <div className="container profile-container">
            <div className="profile-header">
                <div
                    className="background-image"
                    style={{ backgroundImage: `url(${bannerUrl})` }}
                >
                    {console.log('Banner URL:', bannerUrl)}
                </div>
                <div className="profile-picture">
                    <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="rounded-circle"
                    />
                    {console.log('Profile Picture URL:', profilePictureUrl)}
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
                        {tracks.length === 0 ? (
                            <p>No tracks uploaded yet.</p>
                        ) : (
                            tracks.map(track => (
                                <div key={track._id} className="track">
                                    <audio controls>
                                        <source src={`http://localhost:3000${track.path}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <p>{track.title} by {track.artist}</p>
                                    <p>{track.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
