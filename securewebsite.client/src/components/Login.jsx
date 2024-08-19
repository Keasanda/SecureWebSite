import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    
    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post("/api/SecureWebsite/login", { email, password });
    
            if (response.status === 200) {
                const { userEmail, userName, userID } = response.data;
                localStorage.setItem("user", JSON.stringify({ userName, userEmail, userID }));
                navigate('/home');  // Navigate to Home page
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred during login. Please try again.");
            }
        }
    }
    



    const handleForgotPassword = () => {
        navigate('/forgotpassword');
    };

    return (
        <div className="background-image">
            <div className="login-container">
                <div >
                    <h3  className="headinglogin">Image Gallery App</h3>
                </div>

                <div>
                    <h3 className="secheading">Login</h3>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="emailtag" htmlFor="exampleInputEmail1">Username</label>
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

                    <small id="emailHelp" className="foget text-muted">
                        <a  onClick={handleForgotPassword}>Forgot Password?</a>
                    </small>
                    
                    <button type="submit" className="btn btn-primary power login-button">Login</button>
                </form>
                {message && <p className=" mams">{message}</p>}

                <div className="register-link">
                    <p>New to this platform? <a href="/register" className="no-underline">Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
