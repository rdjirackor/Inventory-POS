import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>You successfully logged in.</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;