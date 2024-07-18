import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import './App.css';
import Home from './components/Home';
import Admin from './components/Admin';
import Login from './components/Login';
import Register from './components/Register';
import ConfirmEmail from './components/ConfirmEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DragNDrop from './components/DragNDrop';
import 'bootstrap/dist/css/bootstrap.min.css';





const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/'>
            <Route element={<ProtectedRoutes />}>
                <Route path='/' element={<Home />} />
                <Route path='/admin' element={<Admin />} />
            </Route>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/confirmemail' element={<ConfirmEmail />} />
            <Route path='/forgotpassword' element={<ForgotPassword />} />
            <Route path='/resetpassword' element={<ResetPassword />} />
            <Route path='/DragNDrop' element={<DragNDrop />} />
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
        const response = await fetch("/api/SecureWebsite/logout", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.removeItem("user");
            alert(data.message);
            document.location = "/login";
        } else {
            console.log("could not logout: ", response);
        }
    };

    return (
        <section>
            <div className='top-nav'>
                {isLogged ?
                    <span className='item-holder'>
                        <a href="/">Home</a>
                        <a href="/admin">Admin</a>
                        <span onClick={logout}>Log Out</span>
                    </span> :
                    <span className='item-holder'></span>
                }
            </div>
            <RouterProvider router={router} />
        </section>
    );
}

export default App;
