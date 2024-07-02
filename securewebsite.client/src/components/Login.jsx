import React, { useState } from 'react';
import './Login.css';
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
        <div className="background-image">
           
            <div className="login-container">

            <div class="heading">
                
                <h3>  Image Gallery App </h3>
                 </div>

                 <div>
                
                <h3 class="secheading">  Log in </h3>
                 </div>


                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="emailtag" htmlFor="exampleInputEmail1">Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="exampleInputEmail1" 
                            aria-describedby="emailHelp" 
                            placeholder="Enter email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="passwordtag" htmlFor="exampleInputPassword1">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="exampleInputPassword1" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <small id="emailHelp" className="form-text text-muted">
                            <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                        </small>
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">Login </button>
                    </div>
                </form>
                {message && <p>{message}</p>}
                <div className="register-link">
                    <p>New to this platform? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
