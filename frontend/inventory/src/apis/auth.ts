import { apiFetch } from "./api";

const API_URL = "http://127.0.0.1:8000/api";

export async function login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login Message");
    }

    return data;
}

export async function getCurrentUser() {
    const response = await apiFetch("/me/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get current user"
        );
    }

    return data;
}
