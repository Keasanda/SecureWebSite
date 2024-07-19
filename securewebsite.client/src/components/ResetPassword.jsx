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
                <div className="col-md-5">
                   
                    <form onSubmit={handleSubmit}>

                    <h2 className="reheading ">Reset Password</h2>


                        <div className="mb-3 goat">
                            <label htmlFor="newPassword" className="form-label np">New Password</label>
                            <input 
                                type="password" 
                                className="form-control win" 
                                id="newPassword" 
                                 placeholder="newPassword"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3 goat">
                            <label htmlFor="confirmPassword" className="form-label CP">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="form-control win" 
                                id="confirmPassword" 
                                  placeholder="ConfirmPassword"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary grow">Reset Password</button>
                    </form>
                    {message && <p className="mt-3 red">{message}</p>}
                </div>
                <div className="col-md-7 ">
                    <img src="src\assets\5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Reset Password" className=" restpic " />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
