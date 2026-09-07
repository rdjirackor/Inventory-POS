import type { PurchaseOrder } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await apiFetch("/purchase-orders/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Purchase Orders Failed"
        );
    }

    return data;
}

export async function createPurchaseOrder(
    supplier: number,
    expected_delivery: string,
    status: string
) {
    const response = await apiFetch("/purchase-orders/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

export async function getPurchaseOrder(
    purchase_order_id: number
): Promise<PurchaseOrder> {
    const response = await apiFetch(
        `/purchase-orders/${purchase_order_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Purchase Order Failed"
        );
    }

    return data;
}

export async function updatePurchaseOrder(
    purchase_order_id: number,
    supplier: number,
    expected_delivery: string,
    status: string
) {
    const response = await apiFetch(
        `/purchase-orders/${purchase_order_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
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
        throw new Error(
            data.message || "Update Purchase Order Failed"
        );
    }

    return data;
}

export async function patchPurchaseOrder(
    purchase_order_id: number,
    supplier?: number,
    expected_delivery?: string,
    status?: string
) {
    const response = await apiFetch(
        `/purchase-orders/${purchase_order_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(supplier !== undefined && { supplier }),
                ...(expected_delivery !== undefined && {
                    expected_delivery,
                }),
                ...(status !== undefined && { status }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Patch Purchase Order Failed"
        );
    }

    return data;
}

export async function deletePurchaseOrder(
    purchase_order_id: number
) {
    const response = await apiFetch(
        `/purchase-orders/${purchase_order_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Purchase Order Failed"
        );
    }
}