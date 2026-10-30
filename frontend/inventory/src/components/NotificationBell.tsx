import { useEffect, useState } from "react";
import { getNotifications } from "../apis/notifications";
import type { NotificationReadStatus, AppNotification, User } from "../interfaces/interfaces";
import { Box } from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { getCurrentUser } from "../apis/auth";
import { getNotificationReadStatus } from "../apis/notificationReadStatus";


function NotificationBell(){

    const [user, setUser] = useState<User | null>(null);

    const [notifications, setNotifications] = useState<AppNotification[]>([]);


const [notificationReadStatus, setNotificationReadStatus] = useState<NotificationReadStatus[]>([]);

    useEffect(() => {
        getCurrentUser()
            .then(data => setUser(data))
            .catch(error => console.error(error));
    }, []);

const is_read = notificationReadStatus.some((status)=> !status.is_read)

        async function fetchNotifications(){
            try {
                const notificationData = await getNotifications();
                const notificationReadStatusData = await getNotificationReadStatus();
                setNotifications(notificationData);
                setNotificationReadStatus(notificationReadStatusData);


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



