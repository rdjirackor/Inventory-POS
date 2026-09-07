import type { Warehouse } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getWarehouses(): Promise<Warehouse[]> {
    const response = await apiFetch("/warehouses/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Warehouses Failed");
    }

    return data;
}

export async function createWarehouse(
    name: string,
    location: string
) {
    const response = await apiFetch("/warehouses/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            location,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Warehouse creation failed"
        );
    }

    return data;
}

export async function getWarehouse(
    warehouse_id: number
): Promise<Warehouse> {
    const response = await apiFetch(
        `/warehouses/${warehouse_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Warehouse Failed");
    }

    return data;
}

export async function updateWarehouse(
    warehouse_id: number,
    name: string,
    location: string
) {
    const response = await apiFetch(
        `/warehouses/${warehouse_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                location,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Warehouse Failed");
    }

    return data;
}

export async function patchWarehouse(
    warehouse_id: number,
    name?: string,
    location?: string
) {
    const response = await apiFetch(
        `/warehouses/${warehouse_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...(name !== undefined && { name }),
                ...(location !== undefined && { location }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Warehouse Failed");
    }

    return data;
}

export async function deleteWarehouse(
    warehouse_id: number
) {
    const response = await apiFetch(
        `/warehouses/${warehouse_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Warehouse Failed"
        );
    }
}