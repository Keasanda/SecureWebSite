import React, { useEffect } from 'react';
import './Register.css'; // Import your CSS file
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function Register() {
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
            document.querySelector(".message").innerHTML = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch("/api/SecureWebsite/Register", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(dataToSend),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            const data = await response.json();
            const messageEl = document.querySelector(".message");

            if (response.ok) {
                messageEl.innerHTML = "Registered successfully. Please check your email to confirm your account.";
                document.location = "/login";
            } else {
                let errorMessages = "<div>Attention please:</div><div class='normal'>";
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(error => {
                        errorMessages += `<div>${error.description}</div>`;
                    });
                } else {
                    errorMessages += `<div>${data.message || 'An error occurred.'}</div>`;
                }
                errorMessages += "</div>";
                messageEl.innerHTML = errorMessages;
            }
        } catch (error) {
            console.error("Registration error:", error);
            document.querySelector(".message").innerHTML = "Something went wrong, please try again.";
        }
    }

    return (
        <div className="container ">
            <div className="row">
                <div className="col-md-6">
                    <h2 className="registerhead">Register Profile </h2>
                    <p class="pa"> Lorem ipsum dolor sit amet consectetur sit amet consectetur   </p>
                    
                    <form className='register' onSubmit={registerHandler}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label"  class="nae">Name</label>
                            <input type="text" className="control1" name='Name'    placeholder=    " Enter Name"    id='name' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label" class="nae"   >Email</label>
                            <input type="email" className="control1" name='Email'   placeholder=    " Enter Email"    id='email' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label" class="na"    >Password</label>
                            <input type="password" className="control1" name='PasswordHash'   placeholder=    " Password"    id='password' required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label"   class="con"  >Confirm Password</label>
                            <input type="password" className="control1" name='ConfirmPassword'  placeholder=" Confirm Password"     id='confirmPassword' required />
                        </div>
                        <button type="submit" className="btn btn-primary  registerbtn">Register</button>

                        <div className='mt-3'>
                        <span class="or">or </span>



                        <div className='mt-3 push'>
                    <button className="btn btn-link">
                            <FcGoogle style={{ marginRight: '8px' }} />
                            Sign in with Google
                        </button>

                        <button className="btn btn-link">
                            <FaFacebook style={{ marginRight: '8px' }} />
                            Sign in with Google
                        </button>
                       
                       
                    </div>

                        
                    </div>

                    </form>
                  
               
                </div>
                <div className="col-md-6 d-flex picRes">
                    <img src="src\assets\5b4b4419dc94f06b31a38beb2085ab3b.jpg" alt="Register" className="img-fluid custom-image" />
                </div>
            </div>
        </div>
    );
}

export default Register;
