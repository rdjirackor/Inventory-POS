import type { Payment } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export interface PaymentInput {
    amount: string;
    method: "Cash" | "Card" | "Mobile Money" | "Bank Transfer";
    provider?: string;
    reference_number?: string;
}

export interface RecordPaymentResponse {
    message: string;
    payment_id: number;
    order_id: number;
    amount_paid: string;
    balance_due: string;
    payment_status: "Unpaid" | "Partially Paid" | "Paid";
}

export async function getPayments(): Promise<Payment[]> {
    const response = await apiFetch("/payments/");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || data.detail || "Get Payments Failed"
        );
    }

    return data;
}

export async function recordPayment(
    order_id: number,
    payment: PaymentInput
): Promise<RecordPaymentResponse> {

    const response = await apiFetch(
        `/orders/${order_id}/payments/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payment),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || data.detail || "Record Payment Failed"
        );
    }

    return data;
}