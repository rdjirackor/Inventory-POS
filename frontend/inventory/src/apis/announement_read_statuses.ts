import type { AnnouncementReadStatus } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getAnnouncementReadStatus(
    read_status_id: number
): Promise<AnnouncementReadStatus> {
    const response = await apiFetch(
        `/announcement-read-status/${read_status_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Announcement Read Status Failed"
        );
    }

    return data;
}