import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoutes() {
    const [isLogged, setIsLogged] = useState(false);
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== JSON.stringify(undefined)) {
            try {
                const user = JSON.parse(storedUser);
                console.log("User info from storage: ", user);
                setIsLogged(true);
                setWaiting(false);
            } catch (err) {
                console.log("Error parsing stored user: ", err);
                localStorage.removeItem("user");
            }
        } else {
            fetch('/api/securewebsite/xhtlekd/', {
                method: "GET",
                credentials: "include"
            }).then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        localStorage.setItem("user", JSON.stringify(data.user));
                        console.log(data.user);
                        setIsLogged(true);
                        setWaiting(false);
                    }).catch(err => {
                        throw new Error("Invalid JSON response");
                    });
                } else {
                    throw new Error('Failed to authenticate');
                }
            }).catch(err => {
                console.log("Error protected routes: ", err);
                setWaiting(false);
                localStorage.removeItem("user");
            });
        }
    }, []);

    return waiting ? (
        <div className="waiting-page">
            <div>Waiting...</div>
        </div>
    ) : (
        isLogged ? <Outlet /> : <Navigate to="/login" />
    );
}

export default ProtectedRoutes;