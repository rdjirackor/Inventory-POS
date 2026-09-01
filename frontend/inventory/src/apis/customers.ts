import type { Customer } from "../interfaces/interfaces";

const API_URL = "http://127.0.0.1:8000/api";

export async function getCustomers(): Promise<Customer[]> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/customers/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Customers Failed");
    }

    return data;
}

export async function createCustomer(
    user: number,
    first_name: string,
    second_name: string,
    reward_points: number,
    credit_balance: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/customers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            user,
            first_name,
            second_name,
            reward_points,
            credit_balance,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Create Customer Failed");
    }

    return data;
}
export async function getCustomer(customer_id: number): Promise<Customer> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/customers/${customer_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Customer Failed");
    }

    return data;
}

export async function updateCustomer(
    customer_id: number,
    user: number,
    first_name: string,
    second_name: string,
    reward_points: number,
    credit_balance: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/customers/${customer_id}/`,
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                user,
                first_name,
                second_name,
                reward_points,
                credit_balance,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Customer Failed");
    }

    return data;
}

export async function patchCustomer(
    customer_id: number,
    first_name?: string,
    second_name?: string,
    reward_points?: number,
    credit_balance?: number
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/customers/${customer_id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...(first_name !== undefined && { first_name }),
                ...(second_name !== undefined && { second_name }),
                ...(reward_points !== undefined && { reward_points }),
                ...(credit_balance !== undefined && { credit_balance }),
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Patch Customer Failed");
    }

    return data;
}

export async function deleteCustomer(customer_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/customers/${customer_id}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete Customer Failed");
    }
}