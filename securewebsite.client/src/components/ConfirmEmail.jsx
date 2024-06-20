import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const confirmEmail = async () => {
            const email = searchParams.get('email');
            const token = searchParams.get('token');
            
            if (!email || !token) {
                alert("Invalid confirmation link.");
                return;
            }

            const response = await fetch(`/api/securewebsite/confirmemail?email=${email}&token=${token}`);
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
            } else {
                alert("Email confirmation failed: " + data.message);
            }
        };

        confirmEmail();
    }, [searchParams]);

    return (
        <div>
            <h1>Confirming Email...</h1>
        </div>
    );
};

export default ConfirmEmail;
