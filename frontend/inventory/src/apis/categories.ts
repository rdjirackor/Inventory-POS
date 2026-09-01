import type { Category } from "../interfaces/interfaces";

const API_URL = "http://127.0.0.1:8000/api";

export async function getCategories(): Promise<Category[]> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/categories/`, {
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Categories Failed");
    }

    return data;
}

export async function createCategory(name: string) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
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

export async function getCategory(category_id: number): Promise<Category> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/categories/${category_id}/`,
        {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/categories/${category_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/categories/${category_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
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

export async function deleteCategory(category_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/categories/${category_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Category Failed");
    }
}