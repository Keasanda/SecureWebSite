import React, { useState } from 'react';
import './LoggedInResetPassword.css';

const LoggedInResetPassword = () => {
    const [newPassword, setNewPassword] = useState(''); // State to hold the new password
    const [confirmPassword, setConfirmPassword] = useState(''); // State to hold the confirmed password
    const [message, setMessage] = useState(''); // State to hold feedback messages

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match."); // Set error message
            return;
        }

        // Send a POST request to update the password
        const response = await fetch("/api/SecureWebsite/loggedinresetpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword }) // Include the new password in the request body
        });

        const data = await response.json(); // Parse the JSON response
        if (response.ok) {
            setMessage(data.message); // Set success message
        } else {
            setMessage(data.message); // Set error message from the server
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-5">
                    <form onSubmit={handleSubmit}> {/* Handle form submission */}
                        <h2 className="reheading">Reset Password</h2>

                        {/* Input for the new password */}
                        <div className="mb-3 goat">
                            <label htmlFor="newPassword" className="form-label np">New Password</label>
                            <input
                                type="password"
                                className="form-control win"
                                id="newPassword"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} // Update new password state
                                required
                            />
                        </div>

                        {/* Input for confirming the new password */}
                        <div className="mb-3 goat">
                            <label htmlFor="confirmPassword" className="form-label CP">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control win"
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state
                                required
                            />
                            <p className='bac'>
                                <a href="/home" className="no-underline">Back to home</a>
                            </p>
                        </div>

                        {/* Submit button for resetting the password */}
                        <button type="submit" className="btn btn-primary grow">Reset Password</button>

                        {/* Display feedback message if exists */}
                        {message && <p className="mt-3 red">{message}</p>}
                    </form>
                </div>

                {/* Side image for aesthetic purposes */}
                <div className="col-md-6">
                    <img
                        src="src/assets/notebook-natural-laptop-macbook.jpg"
                        alt="Display"
                        className="img-fluid"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Responsive styling
                    />
                </div>
            </div>
        </div>
    );
};

export default LoggedInResetPassword;
