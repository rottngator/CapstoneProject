import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
    const { id } = useParams(); // Extracts id from URL parameters
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) {
                console.error('Event ID is missing');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/events/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setEvent(response.data);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        fetchEvent();
    }, [id]);

    if (!event) return <div>Loading...</div>;

    return (
        <div>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <p>{event.time}</p>
        </div>
    );
};

export default EventDetails;
