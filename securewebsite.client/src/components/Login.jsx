import React, { useState } from 'react';
import './Login.css'; // Import CSS for styling
import { useNavigate } from 'react-router-dom'; // Hook for navigation
import { FaUser, FaLock } from "react-icons/fa"; // Importing icons for user and lock
import axios from "axios"; // Import Axios for making HTTP requests

const Login = () => {
    // State variables for email, password, and feedback message
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize navigation hook

    // Function to handle login submission
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        try {
            // Send POST request to the login API
            const response = await axios.post("/api/SecureWebsite/login", { email, password });

            // Check if the login was successful
            if (response.status === 200) {
                const { userEmail, userName, userID } = response.data;
                // Store user details in local storage
                localStorage.setItem("user", JSON.stringify({ userName, userEmail, userID }));
                navigate('/home'); // Navigate to Home page on successful login
            }
        } catch (error) {
            // Handle error response
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message); // Set error message from server
            } else {
                setMessage("An error occurred during login. Please try again."); // Generic error message
            }
        }
    };

    // Function to handle forgot password navigation
    const handleForgotPassword = () => {
        navigate('/forgotpassword'); // Navigate to forgot password page
    };

    return (
        <div className="background-image"> {/* Background image for the login page */}
            <div className="login-container"> {/* Container for the login form */}
                <div>
                    <h3 className="headinglogin">Image Gallery App</h3> {/* App title */}
                </div>

                <div>
                    <h3 className="secheading">Login</h3> {/* Login heading */}
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="emailtag" htmlFor="exampleInputEmail1">Username</label>
                        <div className="input-with-icon">
                            <FaUser className="icon" /> {/* User icon */}
                            <input
                                type="email"
                                className="form-control emailtext input-field"
                                id="exampleInputEmail1"
                                aria-describedby="emailHelp"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update email state
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="passwordtag" htmlFor="exampleInputPassword1">Password</label>
                        <div className="input-with-icon">
                            <FaLock className="icon" /> {/* Lock icon */}
                            <input
                                type="password"
                                className="form-control password input-field"
                                id="exampleInputPassword1"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Update password state
                                required
                            />
                        </div>
                    </div>

                    {/* Link to forgot password */}
                    <small id="emailHelp" className="foget text-muted">
                        <a onClick={handleForgotPassword}>Forgot Password?</a>
                    </small>

                    {/* Submit button for login */}
                    <button type="submit" className="btn btn-primary power login-button">Login</button>
                </form>

                {/* Display feedback message if exists */}
                {message && <p className="mams">{message}</p>}

                {/* Link to registration page */}
                <div className="register-link">
                    <p>New to this platform? <a href="/register" className="no-underline">Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login; // Export the Login component
