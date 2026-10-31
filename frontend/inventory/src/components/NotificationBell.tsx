import { useEffect, useState } from "react";
import { getNotifications } from "../apis/notifications";
import type { NotificationReadStatus, AppNotification } from "../interfaces/interfaces";
import { Box, Flex, IconButton, Popover, Text } from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { createNotificationReadStatus, getNotificationReadStatus } from "../apis/notificationReadStatus";


function NotificationBell(){


    const [notifications, setNotifications] = useState<AppNotification[]>([]);


const [notificationReadStatus, setNotificationReadStatus] = useState<NotificationReadStatus[]>([]);



const hasUnreadNotifications = notificationReadStatus.some((status)=> !status.is_read)

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

        async function handleNotificationClick(notification_id: number) {
    try {
        await createNotificationReadStatus(notification_id);

        setNotificationReadStatus(previous =>
            previous.map(status =>
                status.notification === notification_id
                    ? { ...status, is_read: true }
                    : status
            )
        );

    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
}


                const timeLabel = (dateStr: string): string => {
                const date = new Date(dateStr);
                const diffMs = Date.now() - date.getTime();
                const mins = Math.floor(diffMs / 60000);
                if (mins < 1) return "Just now";
                if (mins < 60) return `${mins} min ago`;
                const hrs = Math.floor(mins / 60);
                if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
                return date.toLocaleDateString();
                };   
        return (
            <Popover.Root positioning={{ placement: "bottom-end" }}>
                <Box position="relative">
                    <Popover.Trigger asChild>
                        <IconButton
                            aria-label="Notifications"
                            variant="ghost"
                            position="relative"
                            color="black"
                        >
                            <Bell size={20} />
                        </IconButton>
                    </Popover.Trigger>

                    {hasUnreadNotifications && (
                        <Box
                            position="absolute"
                            top="6px"
                            right="6px"
                            w="8px"
                            h="8px"
                            bg="blue.600"
                            borderRadius="full"
                            pointerEvents="none"
                        />
                    )}
                </Box>

                <Popover.Positioner>
                    <Popover.Content width="350px" color="white">
                        <Popover.Header>
                            <Text fontWeight="bold" fontSize="lg">
                                Notifications
                            </Text>
                        </Popover.Header>

                       <Popover.Body>
                        


                            {notifications.length===0?
                            (<Text>No notifications yet.</Text>):
                            (
                                notifications.map(n=>{
                                    const status = notificationReadStatus.find(r=> r.notification === n.id);
                                    const isRead = status?.is_read?? false;

                                    return(

                                        

                                        <Flex
                                        key={n.id}
                                        px={4}
                                        py={3}
                                        gap={3}
                                        align={"flex-start"}
                                        borderBottom={"1px solid"}
                                        borderColor={"whiteAlpha.500"}>
                                            <Box
                                            w={"8px"}
                                            h={"8px"}
                                            borderRadius={"full"}
                                            mt = {"6px"}
                                            flexShrink={0}
                                            bg={isRead?"transparent":"blue.400"}
                                            />

                                            <Box  
 
                                            flex={1}
                                            minW={0}>
                                             
                                                
                                                <Text
                                                    onClick={() => handleNotificationClick(n.id)}
                                                    cursor="pointer"
                                                    fontSize="sm"
                                                    fontWeight={isRead ? "normal" : "semibold"}
                                                    opacity={isRead ? 0.6 : 1}
                                                >
                                                    {n.message}
                                                </Text>
                                                <Text fontStyle={"italic"}
                                                        fontSize={"xs"}
                                                        color={"gray.400"}
                                                        mt={1}>{timeLabel(n.created_at)}</Text>

                                                </Box>


                                        </Flex>
                                        
                                    )

                                }
                            )
                            
                            )}

                            
                            
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Popover.Root>
        );



    }


export default NotificationBell;



