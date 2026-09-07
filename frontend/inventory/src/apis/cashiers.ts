import type { Cashier } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getCashiers(): Promise<Cashier[]> {
    const response = await apiFetch("/cashiers/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Cashiers Failed");
    }

    return data;
}

export async function createCashier(
    user: number,
    first_name: string,
    second_name: string,
    date_employed: string,
    branch_stationed_at: number
) {
    const response = await apiFetch("/cashiers/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user,
            first_name,
            second_name,
            date_employed,
            branch_stationed_at,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Cashier Failed");
    }

    return data;
}

export async function getCashier(
    cashier_id: number
): Promise<Cashier> {
    const response = await apiFetch(
        `/cashiers/${cashier_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Cashier Failed");
    }

    return data;
}

export async function updateCashier(
    cashier_id: number,
    user: number,
    first_name: string,
    second_name: string,
    date_employed: string,
    branch_stationed_at: number
) {
    const response = await apiFetch(
        `/cashiers/${cashier_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user,
                first_name,
                second_name,
                date_employed,
                branch_stationed_at,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Cashier Failed");
    }

    return data;
}

export async function patchCashier(
    cashier_id: number,
    first_name?: string,
    second_name?: string,
    date_employed?: string,
    branch_stationed_at?: number
) {
    const response = await apiFetch(
        `/cashiers/${cashier_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(first_name !== undefined && { first_name }),
                ...(second_name !== undefined && { second_name }),
                ...(date_employed !== undefined && { date_employed }),
                ...(branch_stationed_at !== undefined && {
                    branch_stationed_at,
                }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Cashier Failed");
    }

    return data;
}

export async function deleteCashier(
    cashier_id: number
) {
    const response = await apiFetch(
        `/cashiers/${cashier_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.message || "Delete Cashier Failed"
        );
    }
}