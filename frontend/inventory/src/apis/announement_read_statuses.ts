const API_URL = "http://127.0.0.1:8000/api";


export async function getAnnouncementReadStatus(
    read_status_id: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/announcement-read-status/${read_status_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Announcement Read Status Failed"
        );
    }

    return data;
}