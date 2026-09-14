import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProduct } from "../apis/products";
import { getCategories } from "../apis/categories";
import { getWarehouses } from "../apis/warehouses";
import { getDiscounts } from "../apis/discounts";
import { getTaxes } from "../apis/taxes";

import type {
    Category,
    Warehouse,
    Discount,
    TaxType,
} from "../interfaces/interfaces";

function CreateProduct() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [brand, setBrand] = useState("");
    const [netCost, setNetCost] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [currentStock, setCurrentStock] = useState("");
    const [minimumStock, setMinimumStock] = useState("");
    const [barcode, setBarcode] = useState("");

    const [category, setCategory] = useState("");
    const [warehouse, setWarehouse] = useState("");
    const [discount, setDiscount] = useState("");
    const [taxes, setTaxes] = useState<number[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);

    const [image, setImage] = useState<File | null>(null);


    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOptions() {
            try {
                const [
                    categoryData,
                    warehouseData,
                    discountData,
                    taxData,
                ] = await Promise.all([
                    getCategories(),
                    getWarehouses(),
                    getDiscounts(),
                    getTaxes(),
                ]);

                setCategories(categoryData);
                setWarehouses(warehouseData);
                setDiscounts(discountData);
                setTaxTypes(taxData);
            } catch (error) {
                console.error(error);
                setError("Failed to load product options");
            } finally {
                setLoadingOptions(false);
            }
        }

        fetchOptions();
    }, []);

    function handleTaxChange(taxId: number) {
        setTaxes((currentTaxes) => {
            if (currentTaxes.includes(taxId)) {
                return currentTaxes.filter((id) => id !== taxId);
            }

            return [...currentTaxes, taxId];
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createProduct(
                name,
                sku,
                brand,
                Number(netCost),
                Number(sellingPrice),
                discount === "" ? null : Number(discount),
                Number(currentStock),
                Number(minimumStock),
                image,
                barcode,
                taxes,
                Number(category),
                Number(warehouse)
            );

            navigate("/products");

        } catch (error) {
            setError("Failed to create product");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

    if (loadingOptions) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Create Product</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label>SKU</label>
                    <input
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                    />
                </div>

                <div>
                    <label>Brand</label>
                    <input
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                </div>

                <div>
                    <label>Net Cost</label>
                    <input
                        type="number"
                        value={netCost}
                        onChange={(e) => setNetCost(e.target.value)}
                    />
                </div>

                <div>
                    <label>Selling Price</label>
                    <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                    />
                </div>

                <div>
                    <label>Current Stock</label>
                    <input
                        type="number"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                    />
                </div>

                <div>
                    <label>Minimum Stock Level</label>
                    <input
                        type="number"
                        value={minimumStock}
                        onChange={(e) => setMinimumStock(e.target.value)}
                    />
                </div>

                <div>
                    <label>Barcode</label>
                    <input
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                    />
                </div>
                <div>
                    <label>Product Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setImage(e.target.files?.[0] || null);
                        }}
                    />
                </div>

                <div>
                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Warehouse</label>
                    <select
                        value={warehouse}
                        onChange={(e) => setWarehouse(e.target.value)}
                    >
                        <option value="">Select Warehouse</option>

                        {warehouses.map((warehouse) => (
                            <option
                                key={warehouse.id}
                                value={warehouse.id}
                            >
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Discount</label>
                    <select
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    >
                        <option value="">No Discount</option>

                        {discounts.map((discount) => (
                            <option
                                key={discount.id}
                                value={discount.id}
                            >
                                {discount.name} - {discount.discount}%
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Taxes</label>

                    {taxTypes.map((tax) => (
                        <div key={tax.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={taxes.includes(tax.id)}
                                    onChange={() =>
                                        handleTaxChange(tax.id)
                                    }
                                />
                                {tax.name} - {tax.rate}%
                            </label>
                        </div>
                    ))}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/products")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateProduct;