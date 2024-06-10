import { useEffect } from 'react';

function Register() {

    document.title = "Register";

    // Don't ask an already registered user to register over and over again
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            document.location = "/";
        }
    }, []);

    async function registerHandler(e) {
        e.preventDefault();
        const form_ = e.target;
    
        const formData = new FormData(form_);
        const dataToSend = {};
    
        formData.forEach((value, key) => {
            dataToSend[key] = value;
        });
    
        // Create username
        const newUserName = dataToSend.Name.trim().split(" ");
        dataToSend.UserName = newUserName.join("");
    
        try {
            const response = await fetch("/api/securewebsite/register", {
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
                data.errors.forEach(error => {
                    errorMessages += error.description + " ";
                });
    
                errorMessages += "</div>";
                messageEl.innerHTML = errorMessages;
            }
        } catch (error) {
            console.error("Registration error: ", error);
            document.querySelector(".message").innerHTML = "Something went wrong, please try again.";
        }
    }

    return (
        <section className='register-page-wrapper page'>
            <div className='register-page'>
                <header>
                    <h1>Register Page</h1>
                </header>
                <p className='message'></p>
                <div className='form-holder'>
                    <form action="#" className='register' onSubmit={registerHandler}>
                        <label htmlFor="name">Name</label>
                        <br />
                        <input type="text" name='Name' id='name' required />
                        <br />
                        <label htmlFor="email">Email</label>
                        <br />
                        <input type="email" name='Email' id='email' required />
                        <br />
                        <label htmlFor="password">Password</label>
                        <br />
                        <input type="password" name='PasswordHash' id='password' required />
                        <br />
                        <input type="submit" value="Register" className='register btn' />
                    </form>
                </div>
                <div className='my-5'>
                    <span>Or </span>
                    <a href="/login">Login</a>
                </div>
            </div>
        </section>
    );
}

export default Register;
