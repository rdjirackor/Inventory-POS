import type { AuditLog } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getAuditLogs(): Promise<AuditLog[]> {
    const response = await apiFetch("/audit-logs/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Audit Logs Failed"
        );
    }

    return data;
}

export async function getAuditLog(
    audit_log_id: number
): Promise<AuditLog> {
    const response = await apiFetch(
        `/audit-logs/${audit_log_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Audit Log Failed"
        );
    }

    return data;
}