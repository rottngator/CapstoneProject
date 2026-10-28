import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => (
    <main className="page-shell about-page">
        <section className="about-frame surface-card">
            <div className="about-founder">
                <img src="/images/about.jpg" alt="Illustrated portrait representing the Sound Hub founder" />
                <div className="about-founder-copy">
                    <p className="eyebrow">THE PERSON BEHIND THE PROJECT</p>
                    <h1>About Gator</h1>
                    <p>Sound Hub is a place for independent artists and curious listeners to meet through music. It is built around a simple idea: discovering something new is better when you can share it with other people.</p>
                    <Link to="/register" className="button button-primary">Join the community</Link>
                </div>
            </div>
            <div className="about-vision">
                <p className="eyebrow">WHY SOUND HUB EXISTS</p>
                <h2>My vision</h2>
                <p>Make it easier for independent musicians to share their work, find an audience, and connect with people who care about what they create. Whether you are here to release a track, discover an artist, or find a local event, there should be room for you in the mix.</p>
            </div>
        </section>
        <section className="about-cta">
            <div><p className="eyebrow">INDEPENDENT SOUNDS, SHARED LOUDLY</p><h2>Find your next favorite sound.</h2></div>
            <Link to="/" className="button button-outline">Explore new releases</Link>
        </section>
    </main>
);

export default About;
