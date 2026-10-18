import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, patchProduct } from "../apis/products";
import type { Category, TaxType, Warehouse, Discount, Product } from "../interfaces/interfaces";
import {  getDiscounts } from "../apis/discounts";
import { getTaxes } from "../apis/taxes";
import { getCategories } from "../apis/categories";
import {  getWarehouses } from "../apis/warehouses";

function UpdateProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [image, setImage] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [discounts, setDiscounts] = useState<Discount[]>([]);


    const [taxes, setTaxes] = useState<number[]>([]);
    const [availableTaxes, setAvailableTaxes] = useState<TaxType[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    

    useEffect(() => {
        async function fetchProduct() {
            try {
                const data = await getProduct(Number(id));
                setProduct(data);

                const discountData = await getDiscounts();
                setDiscounts(discountData);

                setTaxes(data.taxes);
                const taxData = await getTaxes();
                setAvailableTaxes(taxData);

                const categoryData = await getCategories();
                setCategories(categoryData);

                const warehouseData = await getWarehouses();
                setWarehouses(warehouseData);
                
            } catch (error) {
                setError("Failed to load items");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();

       
    }, [id]);

    function handleChange(
        field: keyof Product,
        value: string | number
    ) {
        if (!product) return;

        setProduct({
            ...product,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    

    if (!product) return;

    setError("");
    setSaving(true);

    try {
        await patchProduct(product.id, {
            name: product.name,
            sku: product.sku,
            brand: product.brand,
            net_cost: Number(product.net_cost),
            selling_price_without_tax: Number(product.selling_price_without_tax),
            discount: product.discount,
            current_stock: Number(product.current_stock),
            minimum_stock_level: Number(product.minimum_stock_level),
            barcode_number: product.barcode_number || "",
            taxes: product.taxes,
            category: product.category,
            warehouse: product.warehouse,
            image : image || undefined,
            remove_image: removeImage,
        });

        navigate("/products");
    } catch (error) {
        setError("Failed to update product");
    } finally {
        setSaving(false);
    }

}

    if (loading) {
        return <p>Loading product...</p>;
    }

    if (error && !product) {
        return <p>{error}</p>;
    }

    if (!product) {
        return <p>Product not found</p>;
    }

    return (
        <div>
            <h1>Update Product</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <input
                        value={product.name}
                        onChange={(e) =>
                            handleChange("name", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>SKU</label>
                    <input
                        value={product.sku}
                        onChange={(e) =>
                            handleChange("sku", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Brand</label>
                    <input
                        value={product.brand}
                        onChange={(e) =>
                            handleChange("brand", e.target.value)
                        }
                    />
                </div>

                <div>
                <label>Product Image</label>

                {product.image && !removeImage && (
                    <div>
                        <img
                            src={`http://127.0.0.1:8000${product.image}`}
                            alt={product.name}
                            width="150"
                        />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setImage(e.target.files?.[0] || null);
                        setRemoveImage(true);
                    }}
                />

                {product.image && !removeImage && (
                    <div className="remove_image">
                        <button
                            type="button"
                            onClick={() => {
                                setImage(null);
                                setRemoveImage(true);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

                <div>
                    <label>Net Cost</label>
                    <input
                        type="number"
                        value={product.net_cost}
                        onChange={(e) =>
                            handleChange("net_cost", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Selling Price</label>
                    <input
                        type="number"
                        value={product.selling_price_without_tax}
                        onChange={(e) =>
                            handleChange(
                                "selling_price_without_tax",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>Current Stock</label>
                    <input
                        type="number"
                        value={product.current_stock}
                        onChange={(e) =>
                            handleChange(
                                "current_stock",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>Minimum Stock Level</label>
                    <input
                        type="number"
                        value={product.minimum_stock_level}
                        onChange={(e) =>
                            handleChange(
                                "minimum_stock_level",
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>Barcode</label>
                    <input
                        value={product.barcode_number || ""}
                        onChange={(e) =>
                            handleChange(
                                "barcode_number",
                                e.target.value
                            )
                        }
                    />
                </div>
                
            <div>
                <label htmlFor="discount">Discount</label>

                <select
                    id="discount"
                    value={product.discount ?? ""}
                    onChange={(e) =>
                        handleChange(
                            "discount",
                            e.target.value === "" ? "" : Number(e.target.value)
                        )
                    }
                >
                    <option value="">No discount</option>

                    {discounts.map((discount) => (
                        <option key={discount.id} value={discount.id}>
                            {discount.name} ({discount.discount}%)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="tax">Taxes</label>

                <select
                multiple
                value={taxes.map(String)}
                onChange={(e) => {
                    const selectedTaxes = Array.from(
                        e.target.selectedOptions,
                        (option) => Number(option.value)
                    );

                    setTaxes(selectedTaxes);
                }}
            >
                {availableTaxes.map((tax) => (
                    <option
                        key={tax.id}
                        value={tax.id}
                    >
                        {tax.name}
                    </option>
                ))}
            </select>
            </div>

            <div>
                <label htmlFor="warehouse">Warehouse</label>

                <select
                    id="warehouse"
                    value={product.warehouse ?? ""}
                    onChange={(e) =>
                        handleChange(
                            "warehouse",
                            e.target.value === "" ? "" : Number(e.target.value)
                        )
                    }
                >

                    {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} 
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="category">Category</label>

                <select
                    id="category"
                    value={product.category ?? ""}
                    onChange={(e) =>
                        handleChange(
                            "category",
                            e.target.value === "" ? "" : Number(e.target.value)
                        )
                    }
                >

                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>


                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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

export default UpdateProduct;