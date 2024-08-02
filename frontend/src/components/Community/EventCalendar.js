import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AddEvent from './AddEvent'; // Import the AddEvent component
import './EventCalendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([
        { id: 1, date: new Date(2024, 6, 10), title: 'Event 1', description: 'Description 1', location: 'Location 1', time: '10:00 AM' },
        { id: 2, date: new Date(2024, 6, 15), title: 'Event 2', description: 'Description 2', location: 'Location 2', time: '2:00 PM' },
    ]);
    const [showAddEvent, setShowAddEvent] = useState(false);

    const handleAddEvent = (event) => {
        setEvents((prevEvents) => [...prevEvents, event]);
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
                    <div key={day} className={`day ${monthStart.getMonth() !== day.getMonth() ? 'disabled' : ''}`}>
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
                <div key={day} className="row">
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
