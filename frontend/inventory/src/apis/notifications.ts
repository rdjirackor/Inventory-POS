const API_URL = "http://127.0.0.1:8000/api";

export async function getNotifications() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/notifications/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/notifications/${notification_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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