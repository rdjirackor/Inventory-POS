import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Box, Flex } from "@chakra-ui/react";
import { AnnouncementBanner } from "./announcements/AnnouncementsBanner";
import { useState } from "react";
import { SidebarOpen } from "lucide-react"; 

function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    return (
        <Flex h="100vh" overflow="hidden" className="app-layout" position="relative">
            {isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />}
            
            {!isSidebarOpen && (
                <SidebarOpen size={26}
                style={{ cursor: "pointer" }}
                onClick={() => setIsSidebarOpen(true)} />
            )}

            <Flex 
                direction="column" 
                flex="1" 
                h="full" 
                overflow="hidden" 
                ml={isSidebarOpen ? "18vw" : "1vw"}
                borderLeft={isSidebarOpen ? "none" : "2px solid white"}   
                transition="margin-left 0.2s ease"
            >
                <Navbar />

                <Box 
                    as="main" 
                    className="main-content" 
                    flex="1"
                    overflowY="auto"
                >
                    <AnnouncementBanner />
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
}

export default AppLayout;