import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box } from "@chakra-ui/react";
import { AnnouncementBanner } from "./announcements/AnnouncementsBanner";

function AppLayout() {


    
    return (
        <div className="app-layout">
            <Box ml = "18vw"
            overflowX={"-moz-hidden-unscrollable"}>
            <Navbar />
            </Box>

            <div className="app-body">
                <Sidebar />
                <Box>
                    
                <main className="main-content" >
                    
                    <Box 
                    
                    ml = "18vw"
                    >
                        <AnnouncementBanner/>
                    <Outlet />
                    </Box>
                </main>
                </Box>
            </div>
        </div>
    );
}

export default AppLayout;