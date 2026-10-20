
import { apiFetch } from "./api";

export interface CheckoutItem {
    product_id: number;
    quantity: string;
}

export interface CheckoutResponse {
    message: string;
    order_id: number;
    payment_id: number;
    total: string;
    customer_id: number | null;
}

export async function checkout(
    items: CheckoutItem[],
    customer_id: number | null,
    payment_method: string,
    amount_paid: string
): Promise<CheckoutResponse> {
    const response = await apiFetch("/checkout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items,
            customer_id,
            payment_method,
            amount_paid,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || "Checkout failed");
    }

    return data;
}
