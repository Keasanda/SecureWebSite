import React, { useEffect, useState } from 'react'; // Import React and hooks
import './Register.css'; // Import custom CSS for styling
import { FcGoogle } from "react-icons/fc"; // Import Google icon
import { FaFacebook } from "react-icons/fa"; // Import Facebook icon

function Register() {
    const [message, setMessage] = useState(''); // State for feedback messages
    const [errors, setErrors] = useState([]); // State for error messages

    // Effect to redirect if user is already logged in
    useEffect(() => {
        const user = localStorage.getItem("user"); // Check local storage for user
        if (user) {
            document.location = "/"; // Redirect to home if user is found
        }
    }, []);

    // Handle user registration form submission
    async function registerHandler(e) {
        e.preventDefault(); // Prevent default form submission behavior
        const form = e.target; // Get the form element

        const formData = new FormData(form); // Create FormData object from the form
        const dataToSend = {}; // Object to hold form data

        // Populate dataToSend with form data
        formData.forEach((value, key) => {
            dataToSend[key] = value;
        });

        // Trim spaces from name and create username
        const newUserName = dataToSend.Name.trim().split(" ").join("");
        dataToSend.UserName = newUserName;

        // Validate that passwords match
        if (dataToSend.PasswordHash !== dataToSend.ConfirmPassword) {
            setMessage("Passwords do not match."); // Set message if passwords do not match
            setErrors([]);
            return;
        }

        try {
            // Send registration data to the backend
            const response = await fetch("/api/SecureWebsite/register", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(dataToSend), // Convert object to JSON string
                headers: {
                    "Content-Type": "application/json", // Specify content type
                    "Accept": "application/json" // Specify acceptable response format
                }
            });

            const data = await response.json(); // Parse JSON response
            if (response.ok) {
                setMessage("Registered successfully. Please check your email to confirm your account."); // Success message
                setErrors([]);
                document.location = "/login"; // Redirect to login page
            } else {
                let errorMessages = []; // Array to hold error messages
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessages = data.errors; // Use backend error messages if available
                } else {
                    errorMessages.push(data.message || 'An error occurred.'); // Fallback message
                }
                setMessage("Attention please:");
                setErrors(errorMessages); // Set errors for display
            }
        } catch (error) {
            console.error("Registration error:", error); // Log error for debugging
            setMessage("Something went wrong, please try again."); // Set error message
            setErrors([]);
        }
    }

    return (
        <div className="container"> {/* Main container */}
            <div className="row">
                <div className="col-md-4">
                    <form className='register' onSubmit={registerHandler}> {/* Registration form */}
                        <h2 className="registerhead">Register Profile</h2> {/* Form heading */}
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label nae">Full Name</label>
                            <input type="text" className="control1" name='Name' placeholder="Enter Name" id='name' required /> {/* Full Name input */}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label nae">Email</label>
                            <input type="email" className="control1" name='Email' placeholder="Enter Email" id='email' required /> {/* Email input */}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label na">Password</label>
                            <input type="password" className="control1" name='PasswordHash' placeholder="Password" id='password' required /> {/* Password input */}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label con">Confirm Password</label>
                            <input type="password" className="control1" name='ConfirmPassword' placeholder="Confirm Password" id='confirmPassword' required /> {/* Confirm Password input */}
                        </div>
                        <button type="submit" className="btn registerbtn">Register</button> {/* Register button */}
                        <div className='mt-3'>
                            <span className="or">or</span> {/* Alternative sign-in message */}
                            <div className='mt-5 push'>
                                <button className="btn twin btn-default"> {/* Google sign-in button */}
                                    <FcGoogle style={{ marginRight: '8px' }} />
                                    Sign in with Google
                                </button>
                                <button className="btn twin btn-default"> {/* Facebook sign-in button */}
                                    <FaFacebook style={{ marginRight: '8px' }} />
                                    Sign in with Facebook
                                </button>
                            </div>
                        </div>
                    </form>
                    {message && <p className="message resgistervalidation">{message}</p>} {/* Display feedback message */}
                    {errors.length > 0 && ( // Display error messages if present
                        <ul className="error-messages">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li> // Map through errors and display
                            ))}
                        </ul>
                    )}
                </div>
                <div className="col-md-7">
                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Register" className="picRes" /> {/* Register image */}
                </div>
            </div>
        </div>
    );
}

export default Register; // Export the component
