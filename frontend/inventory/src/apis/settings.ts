const API_URL = "http://127.0.0.1:8000/api";

export async function getCashiers() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/cashiers/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Cashiers Failed");
    }

    return data;
}

export async function createCashier(
    user: number,
    first_name: string,
    second_name: string,
    date_employed: string,
    branch_stationed_at: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/cashiers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            user,
            first_name,
            second_name,
            date_employed,
            branch_stationed_at,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Cashier Failed");
    }

    return data;
}