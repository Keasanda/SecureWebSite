// src/App.js
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'; // Import necessary components from react-router-dom
import ProtectedRoutes from './ProtectedRoutes'; // Import ProtectedRoutes for route protection
import Home from './components/Home'; // Import Home component
import Admin from './components/Admin'; // Import Admin component
import Login from './components/Login'; // Import Login component
import Register from './components/Register'; // Import Register component
import ConfirmEmail from './components/ConfirmEmail'; // Import ConfirmEmail component
import ForgotPassword from './components/ForgotPassword'; // Import ForgotPassword component
import ResetPassword from './components/ResetPassword'; // Import ResetPassword component
import DragNDrop from './components/DragNDrop'; // Import DragNDrop component
import LoggedInResetPassword from './components/LoggedInResetPassword'; // Import LoggedInResetPassword component
import ImageView from './components/ImageView'; // Import ImageView component
import MyGallery from './components/MyGallery'; // Import MyGallery component
import EditImage from './components/EditImage'; // Import EditImage component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Logoutpage from './components/Logoutpage'; // Import Logoutpage component

// Define the router with the application's routes
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/'> {/* Base route */}
            <Route element={<ProtectedRoutes />}> {/* Protected routes for authenticated users */}
                <Route path='/home' element={<Home />} /> {/* Home route */}
                <Route path='/admin' element={<Admin />} /> {/* Admin route */}
                <Route path='/MyGallery' element={<MyGallery />} /> {/* MyGallery route */}
                <Route path='/edit-image/:imageId' element={<EditImage />} /> {/* EditImage route with dynamic imageId */}
            </Route>
            <Route path='/login' element={<Login />} /> {/* Login route */}
            <Route path='/register' element={<Register />} /> {/* Register route */}
            <Route path='/confirmemail' element={<ConfirmEmail />} /> {/* Email confirmation route */}
            <Route path='/forgotpassword' element={<ForgotPassword />} /> {/* Forgot password route */}
            <Route path='/resetpassword' element={<ResetPassword />} /> {/* Reset password route */}
            <Route path='/dragndrop' element={<DragNDrop />} /> {/* Drag and drop functionality route */}
            <Route path='/loggedinresetpassword' element={<LoggedInResetPassword />} /> {/* Logged-in reset password route */}
            <Route path='/image/:imageId' element={<ImageView />} /> {/* Image view route with dynamic imageId */}
            <Route path='/Logoutpage' element={<Logoutpage />} /> {/* Logout page route */}

            {/* 404 Not Found route */}
            <Route path='*' element={
                <div>
                    <header>
                        <h1>Not Found</h1> {/* Not Found header */}
                    </header>
                    <p>
                        <a href="/">Back to Home</a> {/* Link to navigate back to home */}
                    </p>
                </div>
            } />
        </Route>
    )
);

// Main App component
function App() {
    const isLogged = localStorage.getItem("user"); // Check if user is logged in
    const logout = async () => {
        // Function to handle user logout
        const response = await fetch("/api/SecureWebsite/logout", {
            method: "GET", // Use GET method for logout
            credentials: "include" // Include credentials in the request
        });

        const data = await response.json(); // Parse JSON response
        if (response.ok) {
            localStorage.removeItem("user"); // Remove user data from local storage
            alert(data.message); // Show logout message
            document.location = "/login"; // Redirect to login page
        } else {
            console.log("Could not logout: ", response); // Log error if logout fails
        }
    };

    return (
        <section>
            <RouterProvider router={router} /> {/* Render the router with defined routes */}
        </section>
    );
}

export default App; // Export the App component
