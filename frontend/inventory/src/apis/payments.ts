import type { Payment } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getPayments(): Promise<Payment[]> {
    const response = await apiFetch("/payments/");

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
    const response = await apiFetch("/payments/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

export async function getPayment(
    payment_id: number
): Promise<Payment> {
    const response = await apiFetch(
        `/payments/${payment_id}/`
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
    const response = await apiFetch(
        `/payments/${payment_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
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
    const response = await apiFetch(
        `/payments/${payment_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
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

export async function deletePayment(
    payment_id: number
) {
    const response = await apiFetch(
        `/payments/${payment_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.message || "Delete Payment Failed"
        );
    }
}