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
        // Fetch the current profile data from the server
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
                if (profile[key] !== null) {
                    formData.append(key, profile[key]);
                }
            }
            
            const response = await fetch('http://localhost:3000/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include'
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
    
            const result = await response.json();
            console.log(result.message);
            // Handle successful profile update
        } catch (error) {
            console.error('Failed to update profile:', error);
            setError('Failed to update profile');
        }
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>About:</label>
                    <input
                        type="text"
                        name="about"
                        value={profile.about}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Pronouns:</label>
                    <input
                        type="text"
                        name="pronouns"
                        value={profile.pronouns}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={profile.location}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Label:</label>
                    <input
                        type="text"
                        name="label"
                        value={profile.label}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        name="profilePicture"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Banner:</label>
                    <input
                        type="file"
                        name="banner"
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditProfile;
