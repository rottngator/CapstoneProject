import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API requests
import { Link } from 'react-router-dom';
import AddEvent from './AddEvent';
import './EventCalendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showAddEvent, setShowAddEvent] = useState(false);

    useEffect(() => {
        // Fetch events from the backend
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3000/events', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // Convert date strings to Date objects
                const eventsWithDateObjects = response.data.map(event => ({
                    ...event,
                    date: new Date(event.date) // Ensure date is a Date object
                }));
                setEvents(eventsWithDateObjects);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const handleAddEvent = (event) => {
        setEvents((prevEvents) => [...prevEvents, {
            ...event,
            date: new Date(event.date) // Ensure date is a Date object
        }]);
    };

    const renderHeader = () => {
        const dateFormat = { month: 'long', year: 'numeric' };
        return (
            <div className="header">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                    Prev
                </button>
                <div className="current-month">{currentDate.toLocaleDateString(undefined, dateFormat)}</div>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                    Next
                </button>
                <button onClick={() => setShowAddEvent(!showAddEvent)}>
                    {showAddEvent ? 'Close Form' : 'Add Event'}
                </button>
            </div>
        );
    };

    const renderDaysOfWeek = () => {
        return (
            <div className="days-row">
                {daysOfWeek.map((day) => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = monthStart.getDay() === 0 ? monthStart : new Date(monthStart.setDate(monthStart.getDate() - monthStart.getDay()));
        const endDate = monthEnd.getDay() === 6 ? monthEnd : new Date(monthEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay())));
    
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';
    
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = day.toLocaleDateString(undefined, { day: 'numeric' });
                const cloneDay = new Date(day);
                days.push(
                    <div key={day.toDateString()} className={`day ${monthStart.getMonth() !== day.getMonth() ? 'disabled' : ''}`}>
                        <span>{formattedDate}</span>
                        <div className="events">
                            {events
                                .filter((event) => event.date.toDateString() === cloneDay.toDateString())
                                .map((event) => (
                                    <Link to={`/event/${event.id}`} key={event.id} className="event">
                                        {event.title}
                                    </Link>
                                ))}
                        </div>
                    </div>
                );
                day = new Date(day.setDate(day.getDate() + 1));
            }
            rows.push(
                <div key={day.toDateString()} className="row">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="body">{rows}</div>;
    };
    
    

    return (
        <div className="calendar">
            {renderHeader()}
            {renderDaysOfWeek()}
            {renderCells()}
            {showAddEvent && <AddEvent onAdd={handleAddEvent} />}
        </div>
    );
};

export default EventCalendar;
