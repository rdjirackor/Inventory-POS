import type { OrderHistory } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getOrderHistories(): Promise<OrderHistory[]> {
    const response = await apiFetch("/histories/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get History Failed");
    }

    return data;
}

export async function getOrderHistory(
    order_history_id: number
): Promise<OrderHistory> {
    const response = await apiFetch(`/history/${order_history_id}/`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get History Failed");
    }

    return data;
}
