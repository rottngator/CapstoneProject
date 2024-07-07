import React, { useState } from 'react';
import './Feedback.css';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    
    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Feedback submitted:', feedback);
        // Add your form submission logic here
    };

    const handleCancel = () => {
        setFeedback('');
    };

    return (
        <div className="feedback-form">
            <h1>Feedback Survey</h1>
            <p>How are you liking The Sound Hub?</p>
            <p>*insert emojis*</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="feedback">Do you have anything you’d like to share?</label>
                <textarea
                    id="feedback"
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder="Type your feedback here..."
                ></textarea>
                <div className="button-group">
                    <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
                    <button type="submit" className="submit-button">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default Feedback;
