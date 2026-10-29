import { useEffect, useState } from "react";
import { getCurrentUser } from "../apis/auth";
import type { User } from "../interfaces/interfaces";
import { useLocation } from "react-router-dom";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Box,Text, Flex, Heading } from "@chakra-ui/react";


function Navbar() {



    const [user, setUser] = useState<User | null>(null);
    const auth = useContext(AuthContext);


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
    


    useEffect(() => {
        getCurrentUser()
            .then(data => setUser(data))
            .catch(error => console.error(error));
    }, []);

    function handleLogout() {
        const confirm_logout = window.confirm("Sign out?");
        if (confirm_logout){
            auth?.logout();
            window.location.reload();
        }
    }

    return(
        <>
        <Flex justifyContent="space-between" p="1.5" bg="white" color={"black"}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" >
           <Heading>{pageTitle}</Heading>
           <Text>Inventory POS</Text>
           </Box>

           <Box alignItems='flex-end'>
    
            </Box>
            </Flex></>);    
}

export default Navbar;