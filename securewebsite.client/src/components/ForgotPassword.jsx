import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    // State to store the email entered by the user
    const [email, setEmail] = useState('');
    // State to store any success or error message
    const [message, setMessage] = useState('');
    // Hook to programmatically navigate between routes
    const navigate = useNavigate();

    // Handle form submission for password recovery
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Make a POST request to the forgot password API endpoint
        const response = await fetch("/api/SecureWebsite/forgotpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }) // Sending email as JSON
        });

        const data = await response.json();
        // If the response is successful, show a success message and redirect to login
        if (response.ok) {
            setMessage("Password reset link has been sent to your email.");
            // Navigate to the login page after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            // Show error message from the server if the request fails
            setMessage(data.message);
        }
    };

    return (
        <div className="container mt-8">
            <div className="row">
                {/* Left column containing the form */}
                <div className="col-md-4 dow">
                    <h2 className="fg">Recover Password</h2>
                    {/* Form for entering email */}
                    <form className='tanahala' onSubmit={handleSubmit}>
                        <div className="mb-3 cont">
                            <label htmlFor="exampleInputEmail1" className="email-label la">Email address</label>
                            <input
                                type="email"
                                className="forgetcontrol"
                                id="exampleInputEmail1"
                                aria-describedby="emailHelp"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Link to navigate back to login */}
                        <div className="backhome">
                            <p><a href="/login" className="no-underline">Back to login</a></p>
                        </div>

                        {/* Submit button */}
                        <button type="submit" className="btn btn-primary rest">Recover Password</button>
                    </form>
                    {/* Display success or error message */}
                    {message && <p className="mt-3 recovermasgge">{message}</p>}
                </div>

                {/* Right column containing an image */}
                <div className="col-md-8 open">
                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Forgot Password" className="img-fluid custom-image" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
