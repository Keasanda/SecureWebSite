import React, { useState } from 'react';
import './ForgotPassword.css'; // Import your CSS file

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/SecureWebsite/forgotpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
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
                <div className="col-md-6 ">
                    <h2 className="fg">Forgot Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="email-label">Email address</label>
                            <input 
                                type="email" 
                                className="forgetcontrol" 
                                id="exampleInputEmail1" 
                                aria-describedby="emailHelp" 
                                placeholder="Enter email"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />

                        </div>
                        <button type="submit" className="btn btn-primary rest">Send Reset Link</button>
                    </form>
                    {message && <p className="mt-3">{message}</p>}
                </div>
                <div className="forgetpic ">
                    <img src="src\assets\5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Forgot Password" className="img-fluid custom-image" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
