const API_URL = "http://127.0.0.1:8000/api";

export async function getAnnouncements() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/announcements/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }, 
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Announcements Failed"
        );
    }

    return data;
}

export async function createAnnouncement(
    title: string,
    message: string,
    target_audience: string,
    excluded_users: number[]
) {
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("message", message);
    formData.append("target_audience", target_audience);

    excluded_users.forEach((user) => {
        formData.append(
            "excluded_users",
            user.toString()
        );
    });

    const response = await fetch(
        `${API_URL}/announcements/`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Create Announcement Failed"
        );
    }

    return data;
}
export async function getAnnouncement(announcement_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/announcements/${announcement_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Announcement Failed");
    }

    return data;
}

export async function updateAnnouncement(
    announcement_id: number,
    title: string,
    message: string,
    target_audience: string,
    excluded_users: number[]
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/announcements/${announcement_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                message,
                target_audience,
                excluded_users,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Announcement Failed");
    }

    return data;
}

export async function patchAnnouncement(
    announcement_id: number,
    fields: {
        title?: string;
        message?: string;
        target_audience?: string;
        excluded_users?: number[];
    }
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/announcements/${announcement_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(fields),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Announcement Failed");
    }

    return data;
}

export async function deleteAnnouncement(announcement_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/announcements/${announcement_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Announcement Failed");
    }
}