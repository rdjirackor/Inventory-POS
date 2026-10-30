import { useEffect, useState } from "react";
import { getNotifications } from "../apis/notifications";
import type { AppNotification } from "../interfaces/interfaces";
import { Box } from "@chakra-ui/react";
import { Bell } from "lucide-react";


function NotificationBell(){
const [notifications, setNotifications] = useState<AppNotification[]>([]);

const is_read = notifications.some((notification)=> !notification.is_read)

        async function fetchNotifications(){
            try {
                const data = await getNotifications();
                setNotifications(data);
                }
            catch(error){
                console.log(error);
            }
        }


        useEffect(()=> {
        fetchNotifications();
        },[]);


    return(

        <Box as = "button" position="relative" p = {2}>
            <Bell size={20} />
            {is_read && (
                <Box
                position={"absolute"}
                top="6px"
                right={"6px"}
                w={"8px"}
                h={"8px"}
                bg="blue.600"
                borderRadius={"full"}
                />

            )}
        </Box>
    );

        
    }


export default NotificationBell;



