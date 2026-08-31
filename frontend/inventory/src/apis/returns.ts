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

export async function getReturn(return_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/returns/${return_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Return Failed");
    }

    return data;
}

export async function updateReturn(
    return_id: number,
    product: number,
    customer: number | null,
    stock_movement: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/returns/${return_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                product,
                customer,
                stock_movement,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Return Failed");
    }

    return data;
}

export async function patchReturn(
    return_id: number,
    product?: number,
    customer?: number | null,
    stock_movement?: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/returns/${return_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(product !== undefined && { product }),
                ...(customer !== undefined && { customer }),
                ...(stock_movement !== undefined && { stock_movement }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Return Failed");
    }

    return data;
}

export async function deleteReturn(return_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/returns/${return_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Return Failed");
    }
}