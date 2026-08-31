const API_URL = "http://127.0.0.1:8000/api";

export async function getReceipts() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/receipts/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Receipts Failed");
    }

    return data;
}
export async function getReceipt(receipt_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/receipts/${receipt_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Receipt Failed");
    }

    return data;
}