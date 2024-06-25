import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
        navigate('/');
    };

    return (
        <div>
            <h1>{loading ? 'Confirming Email...' : 'Email Confirmation'}</h1>
            {!loading && <p>{message}</p>}
            {!loading && <button onClick={handleButtonClick}>Go to Home</button>}
        </div>
    );
};

export default ConfirmEmail;
