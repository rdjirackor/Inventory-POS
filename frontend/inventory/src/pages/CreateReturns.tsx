
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../interfaces/interfaces";
import { getProducts } from "../apis/products";
import { createReturn } from "../apis/returns";

export default function CreateReturn() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load products."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const product = Number(productId);
        const order = Number(orderId);
        const amount = Number(quantity);

        if (
            !Number.isInteger(product) ||
            product <= 0 ||
            !Number.isInteger(order) ||
            order <= 0 ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !reason.trim()
        ) {
            setError("Enter a valid product, sale ID, quantity, and reason.");
            return;
        }

        setSaving(true);

        try {
            await createReturn(
                product,
                null,
                order,
                amount,
                reason.trim()
            );

            navigate("/returns");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create return."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p>Loading products...</p>;

    return (
        <div className="page-container">
            <h1>Create Return</h1>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="product">Product</label>
                    <select
                        id="product"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option
                                key={product.id}
                                value={product.id}
                            >
                                {product.name} — {product.sku}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="order">Original Sale ID</label>
                    <input
                        id="order"
                        type="number"
                        min="1"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="quantity">Return Quantity</label>
                    <input
                        id="quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reason">Reason for Return</label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter the reason for the return"
                        required
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Processing..." : "Create Return"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/returns")}
                    disabled={saving}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}
