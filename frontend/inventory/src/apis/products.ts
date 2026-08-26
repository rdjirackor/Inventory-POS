const API_URL = "http://127.0.0.1:8000/api"

export async function getProducts(){
    const token = localStorage.getItem("access_token");

    const response = await fetch (`${API_URL}/products/`,{
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
        
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message||"Get Products Failed");
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
    const token = localStorage.getItem("access_token");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("brand", brand);
    formData.append("net_cost", net_cost.toString());
    formData.append("selling_price_without_tax", selling_price_without_tax.toString());

    if (discount !== null) {
        formData.append("discount", discount.toString());
    }

    formData.append("current_stock", current_stock.toString());
    formData.append("minimum_stock_level", minimum_stock_level.toString());

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

    const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
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

