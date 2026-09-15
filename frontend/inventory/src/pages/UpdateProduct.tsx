import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, patchProduct } from "../apis/products";
import type { Product } from "../interfaces/interfaces";

function UpdateProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const data = await getProduct(Number(id));
                setProduct(data);
            } catch (error) {
                setError("Failed to load product");
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
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setImage(e.target.files?.[0] || null);
                        }}
                    />
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