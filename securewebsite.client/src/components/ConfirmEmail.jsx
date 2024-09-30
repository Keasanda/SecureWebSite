import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ConfirmEmail.css'; // Import a CSS file for styling

const ConfirmEmail = () => {
    // Get search parameters from the URL (email and token)
    const [searchParams] = useSearchParams();

    // useNavigate allows navigation to different routes programmatically
    const navigate = useNavigate();

    // State to manage loading status and confirmation message
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // useEffect runs when the component mounts and whenever searchParams changes
    useEffect(() => {
        const confirmEmail = async () => {
            const email = searchParams.get('email'); // Extract email from URL
            const token = searchParams.get('token'); // Extract token from URL

            // If email or token is missing, show an error message
            if (!email || !token) {
                console.log("Invalid confirmation link: missing email or token");
                setMessage("Invalid confirmation link.");
                setLoading(false);
                return;
            }

            // Send a request to confirm the email
            try {
                const response = await fetch(`/api/SecureWebsite/confirmemail?email=${email}&token=${token}`);
                const data = await response.json();

                // If the response is successful, show a success message
                if (response.ok) {
                    setMessage(data.message);
                } else {
                    // Show an error message if email confirmation fails
                    setMessage("Email confirmation failed: " + data.message);
                }
            } catch (error) {
                // Show an error message if there is an issue with the request
                setMessage("An error occurred during email confirmation.");
            } finally {
                // Stop loading once the request is complete
                setLoading(false);
            }
        };

        // Call the email confirmation function
        confirmEmail();
    }, [searchParams]); // Depend on searchParams, to re-run when they change

    // Function to handle button click and navigate to the login page
    const handleButtonClick = () => {
        navigate('/login');
    };

    return (
        <div className="confirm-email-container">
            <div className="confirmation-message">
                {/* Show a loading message while waiting, then show the result */}
                <h1>{loading ? 'Confirming Email...' : 'Done!'}</h1>
                {/* Display the confirmation message */}
                {!loading && <p className='me'>{message}</p>}
                {/* Show the "Go to Login" button once loading is complete */}
                {!loading && <button className="btn btn-primary confirm" onClick={() => window.location.href = '/login'}>Go to Login</button>}
            </div>
            <div className="confirmation-image">
                {/* Display a confirmation image */}
                <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Confirmation" />
            </div>
        </div>
    );
};

export default ConfirmEmail;
