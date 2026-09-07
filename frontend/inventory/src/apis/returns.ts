import type { Return } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getReturns(): Promise<Return[]> {
    const response = await apiFetch("/returns/");

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
    const response = await apiFetch("/returns/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

export async function getReturn(
    return_id: number
): Promise<Return> {
    const response = await apiFetch(`/returns/${return_id}/`);

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
    const response = await apiFetch(
        `/returns/${return_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
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
    const response = await apiFetch(
        `/returns/${return_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(product !== undefined && { product }),
                ...(customer !== undefined && { customer }),
                ...(stock_movement !== undefined && {
                    stock_movement,
                }),
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
    const response = await apiFetch(
        `/returns/${return_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Delete Return Failed");
    }
}