import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/SecureWebsite/forgotpassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (response.ok) {
            setMessage("Password reset link has been sent to your email.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="container mt-8">
            <div className="row">
                <div className="col-md-4 dow">
                    <h2 className="fg">Recover Password</h2>
                    <form  className='tanahala' onSubmit={handleSubmit}>
                        <div className="mb-3 cont">
                            <label htmlFor="exampleInputEmail1" className="email-label la ">Email address</label>
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
                     
                        <div className="backhome">
                    <p><a href="/login" className="no-underline">Back to login</a></p>
                </div>
                        <button type="submit" className="btn btn-primary rest">Recover Password</button>
                    </form>
                    {message && <p className="mt-3 recovermasgge">{message}</p>}
                </div>
                <div className="col-md-8 open">
                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Forgot Password" className="img-fluid custom-image" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
