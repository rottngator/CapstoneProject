import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-me">
            <div className="hero">
                <h1>About Me</h1>
            </div>
            <div className="section">
                <h2>Introduction</h2>
                <p>
                    Hi, I'm Lauren, a passionate developer with a love for music and technology. 
                    I created The Sound Hub to bring together like-minded individuals who share 
                    a love for discovering and sharing music.
                </p>
            </div>
            <div className="section">
                <h2>My Journey</h2>
                <p>
                    I started my journey in the world of music and technology at a young age. 
                    Over the years, I've developed a strong foundation in web development, 
                    and I'm always eager to learn and grow. My goal is to create innovative solutions that make a difference.
                </p>
            </div>
            <div className="section">
                <h2>Skills and Interests</h2>
                <ul>
                    <li>Web Development</li>
                    <li>Music Production</li>
                    <li>UI/UX Design</li>
                    <li>Artificial Intelligence</li>
                </ul>
            </div>
            <div className="section">
                <h2>Contact Me</h2>
                <p>Email: yourname@example.com</p>
                <p>Phone: (123) 456-7890</p>
                <p>Address: 123 Music Street, City, Country</p>
            </div>
        </div>
    );
};

export default About;
