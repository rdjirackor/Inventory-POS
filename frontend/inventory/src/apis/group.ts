import type { Group } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function fetchGroups(): Promise<Group[]> {
    const response = await apiFetch("/groups/");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch groups");
    }

    return data;
}