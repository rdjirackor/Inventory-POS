const API_URL = "http://127.0.0.1:8000/api";

export async function getReturns() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/returns/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Returns Failed");
    }

    return data;
}

export async function createReturn(
    product: number,
    customer: number | null,
    stock_movement: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/returns/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            product,
            customer,
            stock_movement,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Return Failed");
    }

    return data;
}

