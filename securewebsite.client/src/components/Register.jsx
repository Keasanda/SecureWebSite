import React, { useEffect, useState } from 'react';
import './Register.css';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function Register() {
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            document.location = "/";
        }
    }, []);

    async function registerHandler(e) {
        e.preventDefault();
        const form = e.target;

        const formData = new FormData(form);
        const dataToSend = {};

        formData.forEach((value, key) => {
            dataToSend[key] = value;
        });

        const newUserName = dataToSend.Name.trim().split(" ").join("");
        dataToSend.UserName = newUserName;

        if (dataToSend.PasswordHash !== dataToSend.ConfirmPassword) {
            setMessage("Passwords do not match.");
            setErrors([]);
            return;
        }

        try {
            const response = await fetch("/api/SecureWebsite/register", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(dataToSend),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Registered successfully. Please check your email to confirm your account.");
                setErrors([]);
                document.location = "/login";
            } else {
                let errorMessages = [];
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessages = data.errors;
                } else {
                    errorMessages.push(data.message || 'An error occurred.');
                }
                setMessage("Attention please:");
                setErrors(errorMessages);
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Something went wrong, please try again.");
            setErrors([]);
        }
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-4">
                   
                    <form className='register' onSubmit={registerHandler}>

                    <h2 className="registerhead">Register Profile</h2>

                        <div className="mb-3">
                            <label htmlFor="name" className="form-label nae">Full Name</label>
                            <input type="text" className="control1" name='Name' placeholder="Enter Name" id='name' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label nae">Email</label>
                            <input type="email" className="control1" name='Email' placeholder="Enter Email" id='email' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label na">Password</label>
                            <input type="password" className="control1" name='PasswordHash' placeholder="Password" id='password' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label con">Confirm Password</label>
                            <input type="password" className="control1" name='ConfirmPassword' placeholder="Confirm Password" id='confirmPassword' required />
                        </div>
                        <button type="submit" className="btn  registerbtn">Register</button>
                        <div className='mt-3'>
                            <span className="or">or</span>
                            <div className='mt-5 push'>
                                <button className="btn twin btn-default">
                                    <FcGoogle style={{ marginRight: '8px' }} />
                                    Sign in with Google
                                </button>

                                <button className="btn twin btn-default">
                                    <FaFacebook style={{ marginRight: '8px' }} />
                                    Sign in with Facebook
                                </button>
                            </div>
                        </div>
                    </form>
                    {message && <p className="message resgistervalidation">{message}</p>}
                    {errors.length > 0 && (
                        <ul className="error-messages" >
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="col-md-7">
                    <img src="src/assets/5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Register" className=" picRes" />
                </div>
            </div>
        </div>
    );
}

export default Register;
