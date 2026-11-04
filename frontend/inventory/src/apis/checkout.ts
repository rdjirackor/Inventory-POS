
import { apiFetch } from "./api";

export interface CheckoutItem {
    product_id: number;
    quantity: string;
}

export interface CheckoutResponse {
    message: string;
    order_id: number;
    total: string;
    amount_paid: string;
    balance_due: string;
    payment_status: "Unpaid" | "Partially Paid" | "Paid";
    payment_ids: number[];
    customer_id: number | null;
}



export async function checkout(
    items: CheckoutItem[],
    customer_id: number | null,
    payments: {
        amount: string;
        method: string;
        provider: string;
        reference_number: string;
    }[]
): Promise<CheckoutResponse> {
    const response = await apiFetch("/checkout/", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
    items,
    customer_id,
    payments,
}),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || data.message || "Checkout failed"
        );
    }

    return data;
}
