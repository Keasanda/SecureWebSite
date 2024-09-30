import React, { useState } from 'react'; // Import React and useState hook
import './OtpVerification.css'; // Import custom CSS for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const OtpVerification = () => {
    const [otp, setOtp] = useState(''); // State variable for OTP input
    const [message, setMessage] = useState(''); // State variable for feedback messages
    const navigate = useNavigate(); // Hook to programmatically navigate

    // Handle OTP verification on form submission
    const handleOtpVerification = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Send OTP to the backend for verification
        const response = await fetch("/api/SecureWebsite/verifyotp", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp }) // Include OTP in the request body
        });

        const data = await response.json(); // Parse JSON response

        // Check if the response is successful
        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user)); // Store user data in local storage
            navigate('/'); // Navigate to the home page
        } else {
            setMessage(data.message); // Set error message if OTP verification fails
        }
    };

    return (
        <div className="background-image"> {/* Background for the component */}
            <div className="otp-container"> {/* Container for OTP input */}
                <div className="heading">
                    <h3>OTP Verification</h3> {/* Heading for the verification form */}
                </div>
                <form onSubmit={handleOtpVerification}> {/* Form for OTP input */}
                    <div className="form-group">
                        <label htmlFor="otp">Enter OTP</label> {/* Label for the input */}
                        <input
                            type="text"
                            className="form-control"
                            id="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)} // Update OTP state on input change
                            required // Input is required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Verify OTP</button> {/* Submit button */}
                </form>
                {message && <p className="message">{message}</p>} {/* Display message if present */}
            </div>
        </div>
    );
};

export default OtpVerification; // Export the component
