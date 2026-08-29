const API_URL = "http://127.0.0.1:8000/api";

export async function getCustomers() {
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