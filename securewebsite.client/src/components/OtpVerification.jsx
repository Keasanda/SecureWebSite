import React, { useState } from 'react';
import './OtpVerification.css';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/SecureWebsite/verifyotp", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate('/');
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="background-image">
            <div className="otp-container">
                <div className="heading">
                    <h3>OTP Verification</h3>
                </div>
                <form onSubmit={handleOtpVerification}>
                    <div className="form-group">
                        <label htmlFor="otp">Enter OTP</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="otp" 
                            placeholder="Enter OTP" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Verify OTP</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default OtpVerification;
