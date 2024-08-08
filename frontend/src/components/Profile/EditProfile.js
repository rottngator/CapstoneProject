import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        about: '',
        pronouns: '',
        location: '',
        label: '',
        name: '',
        profilePicture: null,
        banner: null,
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setProfile(data);
                } else {
                    console.error('Failed to fetch profile');
                    setError('Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Error fetching profile');
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            for (const key in profile) {
                if (profile[key]) {
                    formData.append(key, profile[key]);
                }
            }

            const response = await fetch('http://localhost:3000/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Profile update failed');
            }

            const data = await response.json();
            setProfile(data);
            navigate('/profile');
        } catch (error) {
            console.error('Profile update error:', error);
            setError('Profile update failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="about" className="form-label">About</label>
                    <textarea
                        className="form-control"
                        id="about"
                        name="about"
                        value={profile.about}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="pronouns" className="form-label">Pronouns</label>
                    <input
                        type="text"
                        className="form-control"
                        id="pronouns"
                        name="pronouns"
                        value={profile.pronouns}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                        type="text"
                        className="form-control"
                        id="location"
                        name="location"
                        value={profile.location}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="label" className="form-label">Label</label>
                    <input
                        type="text"
                        className="form-control"
                        id="label"
                        name="label"
                        value={profile.label}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
                    <input
                        type="file"
                        className="form-control"
                        id="profilePicture"
                        name="profilePicture"
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="banner" className="form-label">Banner</label>
                    <input
                        type="file"
                        className="form-control"
                        id="banner"
                        name="banner"
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Update Profile</button>
                {error && <p className="text-danger mt-3">{error}</p>}
            </form>
        </div>
    );
};

export default EditProfile;
