import { Outlet } from "react-router-dom";
import "../App.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
    return (
        <div>
            <Navbar />
            <Sidebar/>

            <div className="app-body">

                <main>
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AppLayout;