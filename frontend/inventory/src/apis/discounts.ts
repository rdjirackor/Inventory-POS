const API_URL = "http://127.0.0.1:8000/api";

export async function getDiscounts() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/discounts/`, {
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

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
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/discounts/`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
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

export async function getDiscount(discount_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/discounts/${discount_id}/`,
        {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/discounts/${discount_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/discounts/${discount_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
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

export async function deleteDiscount(discount_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/discounts/${discount_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Discount Failed");
    }
}