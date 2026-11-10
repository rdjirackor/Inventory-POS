import { useEffect, useState } from "react";
import { getLastAnnouncement } from "../../apis/announcements";
import type { Announcement } from "../../interfaces/interfaces";

import { Box, Text, IconButton, Flex } from "@chakra-ui/react";
import { X, Megaphone } from "lucide-react";

export function AnnouncementBanner() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [announcementDismissed, setAnnouncementDismissed] = useState<string[]>(
        () => JSON.parse(localStorage.getItem("dismissed_announcement_ids") || "[]")
    );

    async function fetchAnnouncements() {
        setError("");
        setLoading(true);

        try {
            const data = await getLastAnnouncement();
            setAnnouncement(data);
        } catch (err) {
            setError("Failed to load announcement");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    if (loading || error || !announcement || announcement.id == null) {
        return null;
    }
    {console.log(announcement)}

    const announcementIdStr = String(announcement.id);

    if (announcementDismissed.includes(announcementIdStr)) {
        return null;
    }

    async function handleClick(id: number | string) {
        const idStr = String(id);
        const dismissed_ids: string[] = JSON.parse(
            localStorage.getItem("dismissed_announcement_ids") || "[]"
        );

        if (!dismissed_ids.includes(idStr)) {
            const updatedIds = [...dismissed_ids, idStr];

            localStorage.setItem(
                "dismissed_announcement_ids",
                JSON.stringify(updatedIds)
            );
            setAnnouncementDismissed(updatedIds);
        }
    }

    return (
        <Box
            bg="#1a1a3e"
            color="white"
            px={6}
            py={4}
            borderBottom="4px solid #b99d64"
            position="relative"
            width={"full"}
            ml={"0"}
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
                onClick={() => handleClick(announcement.id)}
            >
                <X size={16} />
            </IconButton>
        </Box>
    );
}