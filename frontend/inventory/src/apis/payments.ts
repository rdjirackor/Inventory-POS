const API_URL = "http://127.0.0.1:8000/api";

export async function getPayments() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/payments/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Payments Failed");
    }

    return data;
}

export async function createPayment(
    order: number,
    amount: number,
    method: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/payments/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            order,
            amount,
            method,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Payment Failed");
    }

    return data;
}