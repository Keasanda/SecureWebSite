import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";

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
        <div className="background-image">
            <div className="login-container">
                <div className="headinglogin">
                    <h3>Image Gallery App</h3>
                </div>
                <div>
                    <h3 className="secheading">Log in</h3>
                </div>
                <form onSubmit={handleLogin}>
                    
                <div className="form-group">
    <label className="emailtag" htmlFor="exampleInputEmail1">Email address</label>
    <div className="input-with-icon">
        <FaUser className="icon" />
        <input 
            type="email" 
            className="form-control emailtext input-field" 
            id="exampleInputEmail1" 
            aria-describedby="emailHelp" 
            placeholder="Enter Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
        />
    </div>
</div>
<div className="form-group">
    <label className="passwordtag" htmlFor="exampleInputPassword1">Password</label>
    <div className="input-with-icon">
        <FaLock className="icon" />
        <input 
            type="password" 
            className="form-control password input-field" 
            id="exampleInputPassword1" 
            placeholder="Enter Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
        />
    </div>
</div>

                    <small id="emailHelp" className="form-text text-muted">
                        <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                    </small>
                   
                    <button type="submit" className="btn btn-primary power login-button">Login</button>

                 
                </form>
                {message && <p className="message">{message}</p>}
                <div className="register-link">
                    <p>New to this platform? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
