import type { Receipt } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getReceipts(): Promise<Receipt[]> {
    const response = await apiFetch("/receipts/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Receipts Failed"
        );
    }

    return data;
}

export async function getReceipt(
    receipt_id: number
): Promise<Receipt> {
    const response = await apiFetch(
        `/receipts/${receipt_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Receipt Failed"
        );
    }

    return data;
}