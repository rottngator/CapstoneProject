import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../../api';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const response = await fetch(apiUrl(`/events/${id}`));
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not load event.');
                setEvent(data);
            } catch (loadError) {
                setError(loadError.message);
            }
        };
        loadEvent();
    }, [id]);

    if (error) return <main className="page-shell"><p className="status-message error-message">{error}</p></main>;
    if (!event) return <main className="page-shell"><p className="status-message">Loading event…</p></main>;

    const date = new Date(`${event.date}T00:00:00`);
    return (
        <main className="page-shell event-details-page">
            <Link to="/calendar" className="text-link">← Back to calendar</Link>
            <article className="event-details surface-card">
                <p className="eyebrow">SOUND HUB COMMUNITY EVENT</p>
                <h1>{event.title}</h1>
                <div className="event-detail-meta"><span>◷ &nbsp;{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span><span>◴ &nbsp;{event.time}</span><span>⌖ &nbsp;{event.location}</span></div>
                <div className="event-detail-description"><h2>About this event</h2><p>{event.description || 'Details coming soon. Check back with the host for more.'}</p></div>
            </article>
        </main>
    );
};

export default EventDetails;
