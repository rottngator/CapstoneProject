import React from 'react';
import { useParams } from 'react-router-dom';
import './EventDetails.css';

const EventDetails = ({ events }) => {
    const { id } = useParams();
    const event = events.find(event => event.id === parseInt(id));

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
        </div>
    );
};

export default EventDetails;
