
import { useEffect, useState } from "react";
import { getLastAnnouncement } from "../../apis/announcements";
import type { Announcement } from "../../interfaces/interfaces";

import { Box, Text, IconButton, Flex } from "@chakra-ui/react";
import { X, Megaphone } from "lucide-react";

export function AnnouncementBanner() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [visible, setVisible] = useState(true);
    const [announcementDismissed] = useState(
        () => localStorage.getItem("announcement_dismissed") === "True"
    );
    async function fetchAnnouncements() {
        setError("");
        setLoading(true);

        try {
            const data = await getLastAnnouncement();
            setAnnouncement(data);
        } catch (error) {
            setError("Failed to load announcement");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    if (loading || error || !announcement || !visible) {
        return null;
    }



    async function handleClick() {
        localStorage.setItem("announcement_dismissed", "True");
        setVisible(false);
        
    }

    if (!announcementDismissed){
    return (

        
        <Box
            bg="#1a1a3e"
            color="white"
            px={6}
            py={4}
            borderBottom="4px solid #b99d64"
            position="relative"
            w="full"
        >
            <Flex align="center" gap={2} mb={2}>
                <Megaphone size={18} />

                <Text fontWeight="bold" fontSize="lg">
                    {announcement.title}
                </Text>
            </Flex>

            <Text fontSize="sm" opacity={0.9}>
                {announcement.message}
            </Text>

            <IconButton
                aria-label="Dismiss announcement"
                size="xs"
                variant="ghost"
                color="white"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleClick()}
            >
                <X size={16} />
            </IconButton>
        </Box>
    
    );}
}
