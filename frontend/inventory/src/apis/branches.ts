import type { Branch } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getBranches(): Promise<Branch[]> {
    const response = await apiFetch("/branches/");

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
    const response = await apiFetch("/branches/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

export async function getBranch(
    branch_id: number
): Promise<Branch> {
    const response = await apiFetch(
        `/branches/${branch_id}/`
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
    const response = await apiFetch(
        `/branches/${branch_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
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
    const response = await apiFetch(
        `/branches/${branch_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
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

export async function deleteBranch(
    branch_id: number
) {
    const response = await apiFetch(
        `/branches/${branch_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.message || "Delete Branch Failed"
        );
    }
}