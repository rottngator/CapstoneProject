import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AddEvent from './AddEvent';
import { UserContext } from '../Authentication/UserContext';
import { apiUrl } from '../../api';
import './EventCalendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const EventCalendar = () => {
    const { user } = useContext(UserContext);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [events, setEvents] = useState([]);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const loadEvents = async () => {
            setError('');
            try {
                const response = await fetch(apiUrl('/events'));
                if (!response.ok) throw new Error('Could not load community events.');
                setEvents(await response.json());
            } catch (loadError) {
                setError(loadError.message === 'Failed to fetch'
                    ? 'We could not reach the events calendar. Check your connection, then try again.'
                    : loadError.message);
            }
        };
        loadEvents();
    }, [retryCount]);

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const todayKey = dateKey(new Date());
    const upcomingEvents = events
        .filter((event) => event.date >= todayKey)
        .sort((first, second) => `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`))
        .slice(0, 3);
    const calendarDays = useMemo(() => {
        const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
        return Array.from({ length: 42 }, (_, index) => {
            const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            const key = dateKey(day);
            return { date: day, key };
        });
    }, [currentDate]);

    const moveMonth = (amount) => {
        setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
    };
    const goToToday = () => setCurrentDate(new Date());
    const handleAddEvent = (event) => setEvents((current) => [...current, event]);

    return (
        <main className="page-shell calendar-page">
            <div className="calendar-intro">
                <div><p className="eyebrow">MAKE A NIGHT OF IT</p><h1>Community calendar</h1><p>Shows, listening parties, and the good stuff in between.</p></div>
                {user ? (
                    <button className="button button-primary" type="button" onClick={() => setShowAddEvent((show) => !show)}>{showAddEvent ? 'Close form' : '＋ Add an event'}</button>
                ) : (
                    <Link className="button button-primary" to="/login">Sign in to host an event</Link>
                )}
            </div>
            {showAddEvent && user && <AddEvent onAdd={handleAddEvent} onClose={() => setShowAddEvent(false)} />}
            {error && <div className="calendar-error" role="alert"><div><strong>Events are taking a break.</strong><p>{error}</p></div><button className="button button-outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button></div>}
            <section className="calendar surface-card">
                <div className="calendar-toolbar">
                    <div><p className="eyebrow">THE SCENE, IN ONE PLACE</p><h2>{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2></div>
                    <div className="calendar-controls"><button type="button" className="calendar-today" onClick={goToToday}>Today</button><button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>←</button><button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>→</button></div>
                </div>
                <p className="calendar-mobile-hint">Swipe sideways to see every day of the week <span aria-hidden="true">→</span></p>
                <div className="calendar-grid" role="grid" aria-label={currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}>
                    {daysOfWeek.map((day) => <div className="calendar-weekday" role="columnheader" key={day}>{day}</div>)}
                    {calendarDays.map(({ date, key }) => {
                        const dayEvents = events.filter((event) => event.date === key);
                        return (
                            <div
                                className={`calendar-day ${date.getMonth() !== monthStart.getMonth() ? 'is-outside' : ''} ${key === todayKey ? 'is-today' : ''}`}
                                key={key}
                                role="gridcell"
                                aria-label={date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                aria-current={key === todayKey ? 'date' : undefined}
                            >
                                <span className="calendar-day-number">{date.getDate()}</span>
                                {dayEvents.map((event) => <Link className="calendar-event" key={event.id} to={`/event/${event.id}`}>{event.title}</Link>)}
                            </div>
                        );
                    })}
                </div>
            </section>
            <section className="upcoming-events" aria-labelledby="upcoming-events-heading">
                <div className="section-heading">
                    <div><p className="eyebrow">SAVE THE DATE</p><h2 id="upcoming-events-heading">Coming up</h2></div>
                    <span className="section-note">{upcomingEvents.length ? `${upcomingEvents.length} upcoming ${upcomingEvents.length === 1 ? 'event' : 'events'}` : 'A good night starts with an invite.'}</span>
                </div>
                {upcomingEvents.length ? (
                    <div className="upcoming-event-list">
                        {upcomingEvents.map((event) => (
                            <Link className="upcoming-event surface-card" to={`/event/${event.id}`} key={event.id}>
                                <span className="upcoming-event-date">{new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <span className="upcoming-event-copy"><strong>{event.title}</strong><small>{event.location} · {event.time}</small></span>
                                <span className="upcoming-event-arrow" aria-hidden="true">↗</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-tracks"><span className="empty-icon" aria-hidden="true">◷</span><h3>No upcoming events yet.</h3><p>Check back soon, or start something and invite the community.</p></div>
                )}
            </section>
        </main>
    );
};

export default EventCalendar;
