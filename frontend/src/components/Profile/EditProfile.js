import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="Username"
            />
            <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                placeholder="About"
            />
            <input
                type="text"
                name="pronouns"
                value={profile.pronouns}
                onChange={handleChange}
                placeholder="Pronouns"
            />
            <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Location"
            />
            <input
                type="text"
                name="label"
                value={profile.label}
                onChange={handleChange}
                placeholder="Label"
            />
            <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Name"
            />
            <input
                type="file"
                name="profilePicture"
                onChange={handleChange}
            />
            <input
                type="file"
                name="banner"
                onChange={handleChange}
            />
            <button type="submit">Update Profile</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default EditProfile;
