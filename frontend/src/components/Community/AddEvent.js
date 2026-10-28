import React, { useState } from 'react';
import { apiUrl, authHeaders } from '../../api';

const AddEvent = ({ onAdd, onClose }) => {
    const [form, setForm] = useState({ title: '', description: '', location: '', time: '', date: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const response = await fetch(apiUrl('/events'), {
                method: 'POST',
                headers: authHeaders(true),
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not create event.');
            onAdd(data);
            onClose();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="surface-card event-form" onSubmit={handleSubmit}>
            <div className="event-form-heading"><div><p className="eyebrow">BRING PEOPLE TOGETHER</p><h2>New community event</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close event form">×</button></div>
            <div className="form-grid">
                <label className="field-label">Event name<input name="title" value={form.title} onChange={update} required maxLength="160" placeholder="A night to remember" /></label>
                <label className="field-label">Location<input name="location" value={form.location} onChange={update} required maxLength="160" placeholder="Venue or online" /></label>
                <label className="field-label">Date<input type="date" name="date" value={form.date} onChange={update} required /></label>
                <label className="field-label">Time<input type="time" name="time" value={form.time} onChange={update} required /></label>
                <label className="field-label field-span">What’s the plan?<textarea name="description" value={form.description} onChange={update} rows="3" maxLength="4000" placeholder="Share the details with the community." /></label>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish event'}</button></div>
        </form>
    );
};

export default AddEvent;
