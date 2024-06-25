// src/components/ResetPassword.js
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [email] = useState(searchParams.get('email'));
    const [token] = useState(searchParams.get('token'));
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/securewebsite/resetpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, password })
        });

        const data = await response.json();
        if (response.ok) {
            setMessage(data.message);
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    New Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
