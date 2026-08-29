const API_URL = "http://127.0.0.1:8000/api";

export async function getBranches() {
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