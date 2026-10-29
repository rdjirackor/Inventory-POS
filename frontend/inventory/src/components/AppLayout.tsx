import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box } from "@chakra-ui/react";

function AppLayout() {

    return (
        <div className="app-layout">
            <Box ml = "250px">
            <Navbar />
            </Box>

            <div className="app-body">
                <Sidebar />

                <main className="main-content" >
                    <Box ml = "250px">
                    <Outlet />
                    </Box>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;