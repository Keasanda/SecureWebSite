// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/SecureWebsite/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate('/');
        } else {
            setMessage(data.message);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgotpassword');
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={handleForgotPassword}>Forgot Password?</button>
        </div>
    );
};

export default Login;
