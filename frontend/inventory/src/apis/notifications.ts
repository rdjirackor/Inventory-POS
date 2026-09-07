import type { Notification } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getNotifications(): Promise<Notification[]> {
    const response = await apiFetch("/notifications/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Notifications Failed"
        );
    }

    return data;
}

export async function markNotificationRead(
    notification_id: number
) {
    const response = await apiFetch(
        `/notifications/${notification_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                is_read: true,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Mark Notification Failed"
        );
    }

    return data;
}

export async function getNotification(
    notification_id: number
): Promise<Notification> {
    const response = await apiFetch(
        `/notifications/${notification_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Notification Failed"
        );
    }

    return data;
}

export async function patchNotification(
    notification_id: number,
    is_read: boolean
) {
    const response = await apiFetch(
        `/notifications/${notification_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                is_read,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Patch Notification Failed"
        );
    }

    return data;
}

export async function deleteNotification(
    notification_id: number
) {
    const response = await apiFetch(
        `/notifications/${notification_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Notification Failed"
        );
    }
}