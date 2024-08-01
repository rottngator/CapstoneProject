import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditProfile = () => {
    const [profileData, setProfileData] = useState({
        profilePicture: '',
        banner: '',
        about: '',
        pronouns: '',
        location: '',
        label: '',
        name: '',
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            const response = await fetch('http://localhost:3000/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setProfileData(data);
        };

        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3000/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(profileData),
        });

        if (response.ok) {
            console.log('Profile updated successfully');
        } else {
            console.error('Failed to update profile');
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label htmlFor="profilePicture" className="form-label">Profile Picture URL:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="profilePicture"
                        name="profilePicture"
                        value={profileData.profilePicture}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="banner" className="form-label">Banner URL:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="banner"
                        name="banner"
                        value={profileData.banner}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="about" className="form-label">About:</label>
                    <textarea
                        className="form-control"
                        id="about"
                        name="about"
                        value={profileData.about}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="pronouns" className="form-label">Pronouns:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="pronouns"
                        name="pronouns"
                        value={profileData.pronouns}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="label" className="form-label">Label:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="label"
                        name="label"
                        value={profileData.label}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
