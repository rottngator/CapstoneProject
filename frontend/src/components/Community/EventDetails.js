import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const EventDetails = ({ events }) => {
    const { id } = useParams();
    const [event, setEvent] = useState(events.find(event => event.id === parseInt(id)));
    const [isRSVPd, setIsRSVPd] = useState(false);

    const handleRSVP = async () => {
        try {
            const response = await fetch(`http://localhost:3000/events/${id}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 'currentUserId' }), // replace with actual user ID
            });

            if (!response.ok) {
                throw new Error('Failed to RSVP');
            }

            setIsRSVPd(true);
        } catch (error) {
            console.error('Error RSVPing:', error);
        }
    };

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <div className="event-details">
            <h1>{event.title}</h1>
            <p>Date: {event.date.toLocaleDateString()}</p>
            <p>Description: {event.description}</p>
            <p>Location: {event.location}</p>
            <p>Time: {event.time}</p>
            <button onClick={handleRSVP} disabled={isRSVPd}>
                {isRSVPd ? 'RSVP’d' : 'RSVP'}
            </button>
        </div>
    );
};

export default EventDetails;
