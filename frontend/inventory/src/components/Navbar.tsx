import { useEffect, useState } from "react";
import { getCurrentUser } from "../apis/auth";
import type { User } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";


function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        getCurrentUser()
            .then(data => setUser(data))
            .catch(error => console.error(error));
    }, []);

    function handleLogout() {
        const confirm_logout = window.confirm("Do you want to logout?");
        if (confirm_logout){
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        }
    }

    return (
        <>
        <header>
            <button onClick={handleLogout}>
            <p className="details">
                <em>Current User: <i>{user?.username}</i></em>
                <em>Role: <i>{user?.role}</i></em>
                </p>
                </button>
        </header>
    </>);
}

export default Navbar;