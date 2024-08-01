import React, { useState } from 'react';

const LoggedInResetPassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        const response = await fetch("/api/SecureWebsite/loggedinresetpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
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
                        <h2 className="reheading">Reset Password</h2>

                        <div className="mb-3 goat">
                            <label htmlFor="currentPassword" className="form-label np">Current Password</label>
                            <input 
                                type="password" 
                                className="form-control win" 
                                id="currentPassword" 
                                placeholder="Current Password"
                                value={currentPassword} 
                                onChange={(e) => setCurrentPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3 goat">
                            <label htmlFor="newPassword" className="form-label np">New Password</label>
                            <input 
                                type="password" 
                                className="form-control win" 
                                id="newPassword" 
                                placeholder="New Password"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3 goat">
                            <label htmlFor="confirmPassword" className="form-label CP">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="form-control win" 
                                id="confirmPassword" 
                                placeholder="Confirm Password"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary grow">Reset Password</button>
                    </form>
                    {message && <p className="mt-3 red">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default LoggedInResetPassword;
