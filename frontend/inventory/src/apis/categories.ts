import type { Category } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getCategories(): Promise<Category[]> {
    const response = await apiFetch("/categories/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Categories Failed");
    }

    return data;
}

export async function createCategory(name: string) {
    const response = await apiFetch("/categories/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Category Failed");
    }

    return data;
}

export async function getCategory(
    category_id: number
): Promise<Category> {
    const response = await apiFetch(
        `/categories/${category_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Category Failed");
    }

    return data;
}

export async function updateCategory(
    category_id: number,
    name: string
) {
    const response = await apiFetch(
        `/categories/${category_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Category Failed");
    }

    return data;
}

export async function patchCategory(
    category_id: number,
    name: string
) {
    const response = await apiFetch(
        `/categories/${category_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Category Failed");
    }

    return data;
}

export async function deleteCategory(
    category_id: number
) {
    const response = await apiFetch(
        `/categories/${category_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(
            data.message || "Delete Category Failed"
        );
    }
}