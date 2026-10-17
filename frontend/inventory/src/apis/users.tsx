import type { User } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getUsers(): Promise<User[]> {
    const response = await apiFetch("/users/");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load users");
    }

    return data;
}