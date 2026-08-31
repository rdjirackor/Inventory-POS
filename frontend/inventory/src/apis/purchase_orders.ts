const API_URL = "http://127.0.0.1:8000/api";

export async function getPurchaseOrders() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/purchase-orders/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Purchase Orders Failed");
    }

    return data;
}

export async function createPurchaseOrder(
    supplier: number,
    expected_delivery: string,
    status: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/purchase-orders/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            supplier,
            expected_delivery,
            status,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Create Purchase Order Failed"
        );
    }

    return data;
}

export async function getPurchaseOrder(purchase_order_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/purchase-orders/${purchase_order_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Purchase Order Failed");
    }

    return data;
}

export async function updatePurchaseOrder(
    purchase_order_id: number,
    supplier: number,
    expected_delivery: string,
    status: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/purchase-orders/${purchase_order_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                supplier,
                expected_delivery,
                status,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Purchase Order Failed");
    }

    return data;
}

export async function patchPurchaseOrder(
    purchase_order_id: number,
    supplier?: number,
    expected_delivery?: string,
    status?: string
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/purchase-orders/${purchase_order_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(supplier !== undefined && { supplier }),
                ...(expected_delivery !== undefined && { expected_delivery }),
                ...(status !== undefined && { status }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Purchase Order Failed");
    }

    return data;
}

export async function deletePurchaseOrder(purchase_order_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/purchase-orders/${purchase_order_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Purchase Order Failed");
    }
}