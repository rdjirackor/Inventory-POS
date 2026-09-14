import type { Product } from "../interfaces/interfaces";
import { apiFetch } from "./api";



export async function getProducts(): Promise<Product[]> {
    const response = await apiFetch("/products/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Products Failed");
    }

    return data;
}

export async function createProduct(
    name: string,
    sku: string,
    brand: string,
    net_cost: number,
    selling_price_without_tax: number,
    discount: number | null,
    current_stock: number,
    minimum_stock_level: number,
    image: File | null,
    barcode_number: string,
    taxes: number[],
    category: number,
    warehouse: number
) {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("brand", brand);
    formData.append("net_cost", net_cost.toString());
    formData.append(
        "selling_price_without_tax",
        selling_price_without_tax.toString()
    );

    if (discount !== null) {
        formData.append("discount", discount.toString());
    }

    formData.append("current_stock", current_stock.toString());
    formData.append(
        "minimum_stock_level",
        minimum_stock_level.toString()
    );

    if (image !== null) {
        formData.append("image", image);
    }

    if (barcode_number) {
        formData.append("barcode_number", barcode_number);
    }

    taxes.forEach((tax) => {
        formData.append("taxes", tax.toString());
    });

    formData.append("category", category.toString());
    formData.append("warehouse", warehouse.toString());

    const response = await apiFetch("/products/", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Product creation failed"
        );
    }

    return data;
}

export async function getProduct(
    product_id: number
): Promise<Product> {
    const response = await apiFetch(
        `/products/${product_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Get Product Failed");
    }

    return data;
}

export async function updateProduct(
    product_id: number,
    name: string,
    sku: string,
    brand: string,
    net_cost: number,
    selling_price_without_tax: number,
    discount: number | null,
    current_stock: number,
    minimum_stock_level: number,
    image: File | null,
    barcode_number: string,
    taxes: number[],
    category: number,
    warehouse: number
) {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("brand", brand);
    formData.append("net_cost", net_cost.toString());
    formData.append(
        "selling_price_without_tax",
        selling_price_without_tax.toString()
    );

    if (discount !== null) {
        formData.append("discount", discount.toString());
    }

    formData.append("current_stock", current_stock.toString());
    formData.append(
        "minimum_stock_level",
        minimum_stock_level.toString()
    );

    if (image !== null) {
        formData.append("image", image);
    }

    formData.append("barcode_number", barcode_number);

    taxes.forEach((tax) => {
        formData.append("taxes", tax.toString());
    });

    formData.append("category", category.toString());
    formData.append("warehouse", warehouse.toString());

    const response = await apiFetch(
        `/products/${product_id}/`,
        {
            method: "PUT",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.log("UPDATE PRODUCT ERROR:", data);
        throw new Error(data.message || "Update Product Failed");
    }

    return data;
}

// export async function deleteProduct(
//     product_id: number
// ) {
//     const response = await apiFetch(
//         `/products/${product_id}/`,
//         {
//             method: "DELETE",
//         }
//     );

//     if (!response.ok) {
//         const data = await response.json();

//         throw new Error(
//             data.message || "Delete Product Failed"
//         );
//     }
// }

export async function deleteProduct(product_id: number) {
    const response = await apiFetch(
        `/products/${product_id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    console.log("DELETE PRODUCT ERROR:", data);

    throw new Error(
        data.error || data.message || data.detail || "Delete Product Failed"
    );
}
}

export async function patchProduct(
    product_id: number,
    fields: {
        name?: string;
        sku?: string;
        brand?: string;
        net_cost?: number;
        selling_price_without_tax?: number;
        discount?: number | null;
        current_stock?: number;
        minimum_stock_level?: number;
        image?: File;
        barcode_number?: string;
        taxes?: number[];
        category?: number;
        warehouse?: number;
    }
) {
    const formData = new FormData();

    if (fields.name !== undefined)
        formData.append("name", fields.name);

    if (fields.sku !== undefined)
        formData.append("sku", fields.sku);

    if (fields.brand !== undefined)
        formData.append("brand", fields.brand);

    if (fields.net_cost !== undefined)
        formData.append(
            "net_cost",
            fields.net_cost.toString()
        );

    if (fields.selling_price_without_tax !== undefined)
        formData.append(
            "selling_price_without_tax",
            fields.selling_price_without_tax.toString()
        );

    if (
        fields.discount !== undefined &&
        fields.discount !== null
    )
        formData.append(
            "discount",
            fields.discount.toString()
        );

    if (fields.current_stock !== undefined)
        formData.append(
            "current_stock",
            fields.current_stock.toString()
        );

    if (fields.minimum_stock_level !== undefined)
        formData.append(
            "minimum_stock_level",
            fields.minimum_stock_level.toString()
        );

    if (fields.image !== undefined)
        formData.append("image", fields.image);

    if (fields.barcode_number !== undefined)
        formData.append(
            "barcode_number",
            fields.barcode_number
        );

    if (fields.taxes !== undefined) {
        fields.taxes.forEach((tax) => {
            formData.append(
                "taxes",
                tax.toString()
            );
        });
    }

    if (fields.category !== undefined)
        formData.append(
            "category",
            fields.category.toString()
        );

    if (fields.warehouse !== undefined)
        formData.append(
            "warehouse",
            fields.warehouse.toString()
        );

    const response = await apiFetch(
        `/products/${product_id}/`,
        {
            method: "PATCH",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        
        throw new Error(
            data.message || "Patch Product Failed"
        );
    }

    return data;
}