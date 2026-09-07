import type { Discount } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getDiscounts(): Promise<Discount[]> {
    const response = await apiFetch("/discounts/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Discounts Failed");
    }

    return data;
}

export async function createDiscount(
    name: string,
    discount: number
) {
    const response = await apiFetch("/discounts/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            discount,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Discount Failed");
    }

    return data;
}

export async function getDiscount(
    discount_id: number
): Promise<Discount> {
    const response = await apiFetch(
        `/discounts/${discount_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Discount Failed");
    }

    return data;
}

export async function updateDiscount(
    discount_id: number,
    name: string,
    discount: number
) {
    const response = await apiFetch(
        `/discounts/${discount_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                discount,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Discount Failed");
    }

    return data;
}

export async function patchDiscount(
    discount_id: number,
    name?: string,
    discount?: number
) {
    const response = await apiFetch(
        `/discounts/${discount_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(name !== undefined && { name }),
                ...(discount !== undefined && { discount }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Discount Failed");
    }

    return data;
}

export async function deleteDiscount(
    discount_id: number
) {
    const response = await apiFetch(
        `/discounts/${discount_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.message || "Delete Discount Failed"
        );
    }
}