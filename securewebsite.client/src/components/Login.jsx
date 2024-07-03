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
         
         <div  className="heading" >

                    <h4 >Image Gallery App</h4>
              
                    </div>

                <div>
                    <h4 className="secheading">Log in</h4>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="emailtag" htmlFor="exampleInputEmail1">  Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            class="emailtext"
                            id="exampleInputEmail1" 
                            aria-describedby="emailHelp" 
                            placeholder=    " Enter Email" 
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
                                class="password"
                            id="exampleInputPassword1" 
                            placeholder="Enter Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    
                    </div>

                    <small id="emailHelp" className="form-text text-muted">
                            <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                        </small>

                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">Login</button>
                    </div>
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
