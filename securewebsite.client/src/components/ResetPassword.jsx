// src/components/ResetPassword.js
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import './ResetPassword.css'; // Ensure you have this CSS file for any custom styles

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [email] = useState(searchParams.get('email'));
    const [token] = useState(searchParams.get('token'));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        const response = await fetch("/api/SecureWebsite/resetpassword", {
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
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <h2 className="heading">Reset Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="newPassword" 
                                 placeholder="newPassword"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label CP">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="confirmPassword" 
                                  placeholder="ConfirmPassword"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Reset Password</button>
                    </form>
                    {message && <p className="mt-3">{message}</p>}
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-center">
                    <img src="src\assets\notebook-natural-laptop-macbook.jpg" alt="Reset Password" className="img-fluid" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
