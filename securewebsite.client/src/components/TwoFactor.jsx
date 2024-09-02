import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TwoFactor = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleVerify2FA = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/SecureWebsite/verify2facode', { code });

            if (response.status === 200) {
                navigate('/home');  // Redirect to the home page after successful 2FA
            }
        } catch (error) {
            setMessage("Invalid 2FA code. Please try again.");
        }
    }

    return (
        <div>
            <h3>Enter the 2FA Code</h3>
            <form onSubmit={handleVerify2FA}>
                <input 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    required 
                />
                <button type="submit">Verify</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default TwoFactor;
