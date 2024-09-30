// src/components/ResetPassword.js
import React, { useState } from 'react'; // Import React and useState hook
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams for URL query parameters

import './ResetPassword.css'; // Import custom CSS for styling

const ResetPassword = () => {
    const [searchParams] = useSearchParams(); // Get search parameters from the URL
    const [email] = useState(searchParams.get('email')); // Extract email from query parameters
    const [token] = useState(searchParams.get('token')); // Extract token from query parameters
    const [password, setPassword] = useState(''); // State for new password
    const [confirmPassword, setConfirmPassword] = useState(''); // State for confirming new password
    const [message, setMessage] = useState(''); // State for feedback messages

    // Handle form submission for password reset
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate that passwords match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match."); // Set message if passwords do not match
            return;
        }

        try {
            // Send reset password request to the backend
            const response = await fetch("/api/SecureWebsite/resetpassword", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }, // Specify content type
                body: JSON.stringify({ email, token, password }) // Send email, token, and new password
            });

            const data = await response.json(); // Parse JSON response
            if (response.ok) {
                setMessage(data.message); // Set success message
            } else {
                setMessage(data.message); // Set error message
            }
        } catch (error) {
            console.error("Error during password reset:", error); // Log error for debugging
            setMessage("An error occurred while resetting your password. Please try again."); // Set generic error message
        }
    };

    return (
        <div className="container mt-5"> {/* Main container for the component */}
            <div className="row">
                <div className="col-md-5">
                    <form onSubmit={handleSubmit}> {/* Form for resetting password */}
                        <h2 className="reheading">Reset Password</h2> {/* Form heading */}
                        <div className="mb-3 goat">
                            <label htmlFor="newPassword" className="form-label np">New Password</label>
                            <input
                                type="password"
                                className="form-control win"
                                id="newPassword"
                                placeholder="New Password" // Placeholder text
                                value={password} // Bind input value to state
                                onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                                required
                            />
                        </div>
                        <div className="mb-3 goat">
                            <label htmlFor="confirmPassword" className="form-label CP">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control win"
                                id="confirmPassword"
                                placeholder="Confirm Password" // Placeholder text
                                value={confirmPassword} // Bind input value to state
                                onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state on input change
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary grow">Reset Password</button> {/* Submit button */}
                    </form>
                    {message && <p className="mt-3 resetvalidation">{message}</p>} {/* Display feedback message if present */}
                </div>
                <div className="col-md-7">
                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Reset Password" className="restpic" /> {/* Reset password image */}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; // Export the component
