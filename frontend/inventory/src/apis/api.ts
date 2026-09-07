const API_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    let accessToken = localStorage.getItem("access_token");

    let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            logout();
            throw new Error("Session expired");
        }

        const refreshResponse = await fetch(
            `${API_URL}/token/refresh/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );

        if (!refreshResponse.ok) {
            logout();
            throw new Error("Session expired");
        }

        const data = await refreshResponse.json();

        localStorage.setItem("access_token", data.access);

        accessToken = data.access;

        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    return response;
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login";
}