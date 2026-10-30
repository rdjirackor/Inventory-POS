import type { NotificationReadStatus } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getNotificationReadStatus(
): Promise<NotificationReadStatus[]> {
    const response = await apiFetch(
        `/notifications-status/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Notification Read Status Failed"
        );
    }

    return data;
}