import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-me">
            <div className="profile-section">
                <img src='/images/about.jpg' alt="Profile" className="profile-image" />
                <div className="about-text">
                    <h1>About Gator!</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                        sed do eiusmod tempor incididunt ut labore et dolore magna 
                        aliqua. Lectus quam id leo in vitae turpis. Semper eget duis 
                        at tellus at. Potenti nullam ac tortor vitae purus faucibus. 
                        Iaculis at erat pellentesque adipiscing. Sed pulvinar proin 
                        gravida hendrerit. Ullamcorper morbi tincidunt ornare massa 
                        eget. Lorem donec massa sapien faucibus et molestie ac feugiat 
                        sed. Sapien nec sagittis aliquam malesuada bibendum. In mollis 
                        nunc sed id semper risus.
                    </p>
                </div>
            </div>
            <div className="vision-section">
                <h2>My Vision</h2>
                <p>
                    Ever since I was a wee lad, Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lectus quam id 
                    leo in vitae turpis. Semper eget duis at tellus at. Potenti nullam ac tortor vitae 
                    purus faucibus. Iaculis at erat pellentesque adipiscing. Sed pulvinar proin gravida 
                    hendrerit. Ullamcorper morbi tincidunt ornare massa eget. Lorem donec massa sapien 
                    faucibus et molestie ac feugiat sed. Sapien nec sagittis aliquam malesuada bibendum.
                    In mollis nunc sed id semper risus.
                </p>
            </div>
        </div>
    );
};

export default About;
