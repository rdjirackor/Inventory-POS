import type { Settings } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getSettings(): Promise<Settings[]> {
    const response = await apiFetch("/settings/");

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

    const response = await apiFetch("/settings/", {
        method: "PATCH",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Update Settings Failed");
    }

    return data;
}