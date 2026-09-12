import { apiFetch } from "./api";

export async function getDashboard() {
    const response = await apiFetch("/dashboard/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load dashboard");
    }

    return data;
}