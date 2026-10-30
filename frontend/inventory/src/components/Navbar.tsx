import { useLocation } from "react-router-dom";

import { Box,Text, Flex, Heading } from "@chakra-ui/react";
import NotificationBell from "./NotificationBell";


function Navbar() {


    const location = useLocation();

    const pageTitles: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/products": "Products",
        "/categories": "Categories",
        "/cashiers": "Cashiers",
        "/taxtypes": "Tax Types",
        "/suppliers": "Suppliers",
    };
    
    const pageTitle =
        pageTitles[location.pathname] || "Inventory POS";


    return(
        <>
        <Flex justifyContent="space-between" p="1.5" bg="white" color={"black"}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" >
           <Heading>{pageTitle}</Heading>
           <Text>Inventory POS</Text>
           </Box>

           <Box alignItems='flex-end'>
    <NotificationBell/>
            </Box>
            </Flex></>);    
}

export default Navbar;