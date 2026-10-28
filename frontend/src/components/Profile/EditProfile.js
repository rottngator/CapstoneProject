import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl, authHeaders } from '../../api';
import './EditProfile.css';

const initialProfile = {
    username: '',
    email: '',
    about: '',
    pronouns: '',
    location: '',
    label: '',
    name: '',
    profilePicture: null,
    banner: null,
};

const EditProfile = () => {
    const [profile, setProfile] = useState(initialProfile);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch(apiUrl('/user/profile'), { headers: authHeaders() });
                if (!response.ok) throw new Error('Could not load your profile.');
                setProfile({ ...initialProfile, ...(await response.json()) });
            } catch (loadError) {
                setError(loadError.message);
            }
        };
        loadProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value, files } = event.target;
        setProfile((current) => ({ ...current, [name]: files ? files[0] || null : value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'string') {
                formData.append(key, value);
            }
        });
        setSaving(true);
        setError('');
        try {
            const response = await fetch(apiUrl('/user/profile'), {
                method: 'PUT',
                headers: authHeaders(),
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Profile update failed.');
            navigate('/profile');
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="page-shell profile-edit-page">
            <section className="profile-edit-intro">
                <p className="eyebrow">YOUR SPACE, YOUR STORY</p>
                <h1>Make it yours.</h1>
                <p>Give the community a little more to listen for.</p>
                <Link to="/profile" className="text-link">← Back to profile</Link>
            </section>
            <form className="surface-card profile-edit-form" onSubmit={handleSubmit}>
                <div className="section-heading"><div><p className="eyebrow">ARTIST DETAILS</p><h2>Profile settings</h2></div></div>
                <div className="form-grid">
                    <label className="field-label">Display name<input name="name" value={profile.name || ''} onChange={handleChange} maxLength="100" /></label>
                    <label className="field-label">Username<input name="username" value={profile.username || ''} onChange={handleChange} required maxLength="40" /></label>
                    <label className="field-label">Email<input type="email" name="email" value={profile.email || ''} onChange={handleChange} required /></label>
                    <label className="field-label">Pronouns<input name="pronouns" value={profile.pronouns || ''} onChange={handleChange} placeholder="e.g. they/them" /></label>
                    <label className="field-label">Location<input name="location" value={profile.location || ''} onChange={handleChange} placeholder="City, country" /></label>
                    <label className="field-label">Label<input name="label" value={profile.label || ''} onChange={handleChange} placeholder="Independent" /></label>
                    <label className="field-label field-span">About<textarea name="about" value={profile.about || ''} onChange={handleChange} rows="4" maxLength="2000" placeholder="Tell listeners what you’re about." /></label>
                    <label className="field-label">Profile image<input type="file" name="profilePicture" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleChange} /></label>
                    <label className="field-label">Banner image<input type="file" name="banner" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleChange} /></label>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="form-actions"><Link to="/profile" className="button button-outline">Cancel</Link><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
            </form>
        </main>
    );
};

export default EditProfile;
