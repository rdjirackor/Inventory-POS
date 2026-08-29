const API_URL = "http://127.0.0.1:8000/api";

export async function getStockMovements() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/stock-movements/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Stock Movements Failed"
        );
    }

    return data;
}

export async function createStockMovement(
    product: number,
    quantity: number,
    movement_type: string,
    performed_by: number,
    reason: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/stock-movements/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                product,
                quantity,
                movement_type,
                performed_by,
                reason,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Create Stock Movement Failed"
        );
    }

    return data;
}