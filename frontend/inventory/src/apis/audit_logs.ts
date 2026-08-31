const API_URL = "http://127.0.0.1:8000/api";

export async function getAuditLogs() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/audit-logs/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Audit Logs Failed"
        );
    }

    return data;
}
export async function getAuditLog(audit_log_id: number) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/audit-logs/${audit_log_id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Audit Log Failed");
    }

    return data;
}