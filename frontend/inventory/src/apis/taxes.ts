import type { TaxType } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getTaxes(): Promise<TaxType[]> {
    const response = await apiFetch("/taxtypes/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Taxes Failed");
    }

    return data;
}

export async function createTax(
    name: string,
    rate: number,
    active: boolean
) {
    const response = await apiFetch("/taxtypes/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            rate,
            active,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Tax creation failed"
        );
    }

    return data;
}

export async function getTax(
    tax_id: number
): Promise<TaxType> {
    const response = await apiFetch(
        `/taxtypes/${tax_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Tax Failed");
    }

    return data;
}

export async function updateTax(
    tax_id: number,
    name: string,
    rate: number,
    active: boolean
) {
    const response = await apiFetch(
        `/taxtypes/${tax_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                rate,
                active,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Tax Failed");
    }

    return data;
}

export async function patchTax(
    tax_id: number,
    name?: string,
    rate?: number,
    active?: boolean
) {
    const response = await apiFetch(
        `/taxtypes/${tax_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(name !== undefined && { name }),
                ...(rate !== undefined && { rate }),
                ...(active !== undefined && { active }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Tax Failed");
    }

    return data;
}

export async function deleteTax(tax_id: number) {
    const response = await apiFetch(
        `/taxtypes/${tax_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Tax Failed"
        );
    }
}