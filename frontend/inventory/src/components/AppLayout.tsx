import { Outlet } from "react-router-dom";
import "../App.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
    return (
        <div>

            <Navbar />
            <aside className="sidebar">
                <Sidebar/>
                </aside>

            <div className="app-body">

                <main>
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AppLayout;