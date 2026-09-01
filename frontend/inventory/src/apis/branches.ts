import type { Branch } from "../interfaces/interfaces";

const API_URL = "http://127.0.0.1:8000/api";

export async function getBranches(): Promise<Branch[]> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/branches/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Branches Failed");
    }

    return data;
}

export async function createBranch(
    name: string,
    location: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/branches/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            location,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Branch Failed");
    }

    return data;
}
export async function getBranch(branch_id: number): Promise<Branch> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/branches/${branch_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Branch Failed");
    }

    return data;
}

export async function updateBranch(
    branch_id: number,
    name: string,
    location: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/branches/${branch_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                location,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Branch Failed");
    }

    return data;
}

export async function patchBranch(
    branch_id: number,
    name?: string,
    location?: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/branches/${branch_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(name !== undefined && { name }),
                ...(location !== undefined && { location }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Branch Failed");
    }

    return data;
}

export async function deleteBranch(branch_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/branches/${branch_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Branch Failed");
    }
}