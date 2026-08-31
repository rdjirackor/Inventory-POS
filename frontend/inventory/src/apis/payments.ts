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
export async function getPayment(payment_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/payments/${payment_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Payment Failed");
    }

    return data;
}

export async function updatePayment(
    payment_id: number,
    order: number,
    amount: number,
    method: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/payments/${payment_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                order,
                amount,
                method,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Payment Failed");
    }

    return data;
}

export async function patchPayment(
    payment_id: number,
    amount?: number,
    method?: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/payments/${payment_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(amount !== undefined && { amount }),
                ...(method !== undefined && { method }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Payment Failed");
    }

    return data;
}

export async function deletePayment(payment_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/payments/${payment_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Payment Failed");
    }
}