import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ConfirmEmail.css'; // Import a CSS file for styling

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirmEmail = async () => {
            const email = searchParams.get('email');
            const token = searchParams.get('token');
            
            if (!email || !token) {
                console.log("Invalid confirmation link: missing email or token");
                setMessage("Invalid confirmation link.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/SecureWebsite/confirmemail?email=${email}&token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message);
                } else {
                    setMessage("Email confirmation failed: " + data.message);
                }
            } catch (error) {
                setMessage("An error occurred during email confirmation.");
            } finally {
                setLoading(false);
            }
        };

        confirmEmail();
    }, [searchParams]);

    const handleButtonClick = () => {
        navigate('/login ');
    };

    return (
        <div className="confirm-email-container">
            <div className="confirmation-message">
                <h1>{loading ? 'Confirming Email...' : 'Email Confirmation'}</h1>
                {!loading && <p className='me'>{message}</p>}
                {!loading && <button  className="btn btn-primary  confirm"  onClick={handleButtonClick}>Go to Home</button>}
            </div>
            <div className="confirmation-image">
                <img src="src\assets\5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Confirmation" />
            </div>
        </div>
    );
};

export default ConfirmEmail;
