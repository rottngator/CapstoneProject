import React, { useState } from 'react';
import { apiUrl, authHeaders } from '../../api';
import './Feedback.css';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSending(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(apiUrl('/feedback'), {
                method: 'POST',
                headers: authHeaders(true),
                body: JSON.stringify({ message: feedback }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not submit feedback.');
            setFeedback('');
            setSuccess(data.message);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="page-shell feedback-page">
            <section className="feedback-form surface-card">
                <p className="eyebrow">HELP US MAKE IT BETTER</p>
                <span className="feedback-spark">✳</span>
                <h1>A note from you<br />goes a long way.</h1>
                <p className="feedback-lede">What’s working? What’s missing? We’re listening.</p>
                <form onSubmit={handleSubmit}>
                    <label className="field-label" htmlFor="feedback">Your thoughts<textarea id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us what’s on your mind…" maxLength="4000" rows="6" required /></label>
                    <div className="feedback-form-footer"><span>{feedback.length} / 4000</span><button className="button button-primary" type="submit" disabled={!feedback.trim() || sending}>{sending ? 'Sending…' : 'Send feedback ↗'}</button></div>
                </form>
                {error && <p className="form-error" role="alert">{error}</p>}
                {success && <p className="feedback-success" role="status">{success}</p>}
            </section>
        </main>
    );
};

export default Feedback;
