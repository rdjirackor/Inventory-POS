import { useEffect, useState } from "react";
import { getCurrentUser } from "../apis/auth";
import type { User } from "../interfaces/interfaces";
import { useNavigate, useLocation } from "react-router-dom";


function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const location = useLocation();

    const pageTitles: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/products": "Products",
        "/categories": "Categories",
        "/cashiers": "Cashiers",
        "/suppliers": "Suppliers",
    };

    const pageTitle =
        pageTitles[location.pathname] || "Inventory POS";
    


    useEffect(() => {
        getCurrentUser()
            .then(data => setUser(data))
            .catch(error => console.error(error));
    }, []);

    function handleLogout() {
        const confirm_logout = window.confirm("Sign out?");
        if (confirm_logout){
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        }
    }

    return(
        <>
        <div className="navbar">
           <h2 className="page_name">{pageTitle}</h2>
            <button className="logout" onClick={handleLogout}>    
                            
                <p className="details">
                    <em>Current User: <i>{user?.username}</i></em>
                    <em>Role: <i>{user?.role ?? "No role"}</i></em>
                </p>

                </button>
            </div></>);    
}

export default Navbar;