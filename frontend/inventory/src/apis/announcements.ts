import type { Announcement } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getAnnouncements(): Promise<Announcement[]> {
    const response = await apiFetch("/announcements/");

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

    const response = await apiFetch("/announcements/", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Create Announcement Failed"
        );
    }

    return data;
}

export async function getAnnouncement(
    announcement_id: number
): Promise<Announcement> {
    const response = await apiFetch(
        `/announcements/${announcement_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Announcement Failed"
        );
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
    const response = await apiFetch(
        `/announcements/${announcement_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
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
        throw new Error(
            data.message || "Update Announcement Failed"
        );
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
    const response = await apiFetch(
        `/announcements/${announcement_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fields),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Patch Announcement Failed"
        );
    }

    return data;
}

export async function deleteAnnouncement(
    announcement_id: number
) {
    const response = await apiFetch(
        `/announcements/${announcement_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Announcement Failed"
        );
    }
}