import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import Home from './components/Home';
import Admin from './components/Admin';
import Login from './components/Login';
import Register from './components/Register';
import ConfirmEmail from './components/ConfirmEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DragNDrop from './components/DragNDrop';
import LoggedInResetPassword from './components/LoggedInResetPassword';
import ImageView from './components/ImageView';
import MyGallery from './components/MyGallery'; // Import MyGallery component
import EditImage from './components/EditImage'; // Import EditImage component
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/'>
            <Route element={<ProtectedRoutes />}>
                <Route path='/home' element={<Home />} />
                <Route path='/admin' element={<Admin />} />
                <Route path='/MyGallery' element={<MyGallery />} /> {/* Add this line */}
                <Route path='/edit-image/:imageId' element={<EditImage />} /> {/* Add EditImage route */}
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/confirmemail' element={<ConfirmEmail />} />
            <Route path='/forgotpassword' element={<ForgotPassword />} />
            <Route path='/resetpassword' element={<ResetPassword />} />
            <Route path='/dragndrop' element={<DragNDrop />} />
            <Route path='/loggedinresetpassword' element={<LoggedInResetPassword />} />
            <Route path='/image/:imageId' element={<ImageView />} />
            
            <Route path='*' element={
                <div>
                    <header>
                        <h1>Not Found</h1>
                    </header>
                    <p>
                        <a href="/">Back to Home</a>
                    </p>
                </div>
            } />
        </Route>
    )
);

function App() {
    const isLogged = localStorage.getItem("user");
    const logout = async () => {
        try {
            const response = await fetch("/api/securewebsite/logout", {
                method: "GET",
                credentials: "include"
            });
    
            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem("user");
                alert(data.message);
                window.location.href = "/login";
            } else {
                console.log("could not logout: ", response);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }



    return (
        <section>
            <RouterProvider router={router} />
        </section>
    );
}

export default App;
