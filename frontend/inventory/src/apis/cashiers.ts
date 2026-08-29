const API_URL = "http://127.0.0.1:8000/api";

export async function getSettings() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/settings/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Settings Failed");
    }

    return data;
}

export async function updateSettings(
    business_name: string,
    currency: string,
    receipt_footer: string,
    timezone: string,
    backup_enabled: boolean,
    backup_provider: string,
    store_logo: File | null
) {
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("business_name", business_name);
    formData.append("currency", currency);
    formData.append("receipt_footer", receipt_footer);
    formData.append("timezone", timezone);
    formData.append(
        "backup_enabled",
        backup_enabled ? "true" : "false"
    );
    formData.append("backup_provider", backup_provider);

    if (store_logo) {
        formData.append("store_logo", store_logo);
    }

    const response = await fetch(`${API_URL}/settings/`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Settings Failed");
    }

    return data;
}