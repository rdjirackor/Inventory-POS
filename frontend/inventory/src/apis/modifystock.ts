import { apiFetch } from "./api";

export interface ModifyStock{
    "product" : Number,
    "quantity": Number,
    "direction": string,
    "reason": string,
}

export async function modify_stock(
    product_id:Number,
    quantity: Number,
    direction: string,
    reason: string,

) {
    const response = await apiFetch(
        "/stock-movements",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                },
            body: JSON.stringify({
                product_id,
                quantity,
                direction,
                reason,
            }),

        }
    );

    const data = await response.json();

    if (!response.ok){
        throw new Error(
            data.message || "Failed to create stock movement"
        );

    }
    return data;
}