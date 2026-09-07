import type { Supplier } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export async function getSuppliers(): Promise<Supplier[]> {
    const response = await apiFetch("/suppliers/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Suppliers Failed"
        );
    }

    return data;
}

export async function createSupplier(
    name: string,
    products: number[],
    phone_number: string,
    email: string,
    address: string,
    contact_person: string,
    tax_number: string
) {
    const formData = new FormData();

    formData.append("name", name);

    products.forEach((product) => {
        formData.append("products", product.toString());
    });

    formData.append("phone_number", phone_number);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("contact_person", contact_person);
    formData.append("tax_number", tax_number);

    const response = await apiFetch("/suppliers/", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Create Supplier Failed"
        );
    }

    return data;
}

export async function getSupplier(
    supplier_id: number
): Promise<Supplier> {
    const response = await apiFetch(
        `/suppliers/${supplier_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Supplier Failed"
        );
    }

    return data;
}

export async function updateSupplier(
    supplier_id: number,
    name: string,
    products: number[],
    phone_number: string,
    email: string,
    address: string,
    contact_person: string,
    tax_number: string
) {
    const formData = new FormData();

    formData.append("name", name);

    products.forEach((product) => {
        formData.append("products", product.toString());
    });

    formData.append("phone_number", phone_number);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("contact_person", contact_person);
    formData.append("tax_number", tax_number);

    const response = await apiFetch(
        `/suppliers/${supplier_id}/`,
        {
            method: "PUT",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Update Supplier Failed"
        );
    }

    return data;
}

export async function patchSupplier(
    supplier_id: number,
    fields: {
        name?: string;
        products?: number[];
        phone_number?: string;
        email?: string;
        address?: string;
        contact_person?: string;
        tax_number?: string;
    }
) {
    const formData = new FormData();

    if (fields.name !== undefined)
        formData.append("name", fields.name);

    if (fields.products !== undefined) {
        fields.products.forEach((product) => {
            formData.append(
                "products",
                product.toString()
            );
        });
    }

    if (fields.phone_number !== undefined)
        formData.append(
            "phone_number",
            fields.phone_number
        );

    if (fields.email !== undefined)
        formData.append("email", fields.email);

    if (fields.address !== undefined)
        formData.append("address", fields.address);

    if (fields.contact_person !== undefined)
        formData.append(
            "contact_person",
            fields.contact_person
        );

    if (fields.tax_number !== undefined)
        formData.append(
            "tax_number",
            fields.tax_number
        );

    const response = await apiFetch(
        `/suppliers/${supplier_id}/`,
        {
            method: "PATCH",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Patch Supplier Failed"
        );
    }

    return data;
}

export async function deleteSupplier(
    supplier_id: number
) {
    const response = await apiFetch(
        `/suppliers/${supplier_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message || "Delete Supplier Failed"
        );
    }
}