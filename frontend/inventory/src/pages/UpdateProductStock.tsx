import { useEffect, useState } from "react";
import type { Product } from "../interfaces/interfaces";
import { getProduct } from "../apis/products";
import { useNavigate, useParams } from "react-router-dom";
import { modify_stock } from "../apis/stock_movements";




function UpdateProductStock(){

const [product, setProduct] = useState<Product >();
const { id } = useParams();
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const [quantity, setQuantity] = useState("");
const [direction, setDirection] = useState<"Increase"| "Decrease">("Increase");
const [reason, setReason] = useState("");

    async function fetchProduct() {

        try{
            setLoading(true);
            const data = await getProduct(Number(id));
            setProduct(data);
        }
        catch (error){
            setError("Failed to fetch Product");
        }
        finally{
            setLoading(false);
        }
        
    }
    useEffect(()=>{
        fetchProduct();
    },[id]);



    


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    

   if (!quantity || Number(quantity) <= 0) {
    setError("Enter a quantity greater than zero.");
    return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for the adjustment.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await modify_stock({
                product_id:Number(id),
                quantity:Number(quantity),
                direction,
                reason:reason.trim()}
            );

            navigate("/products");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to adjust stock."
            );
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
        <h1>Update Product Stock</h1>

        <h2>{product.name}</h2>
        <p>SKU: {product.sku}</p>

        <p>
            Current Stock: {product.current_stock}
        </p>

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="direction">
                    Adjustment Type
                </label>

                <select
                    id="direction"
                    
                    onChange={(event) =>{
                        const value = event.target.value;
                        if (value==="Increase" || value === "Decrease"){
                        setDirection(value);}}
                    }
                
                >
                    <option value="Increase">Increase</option>
                    <option value="Decrease">Decrease</option>
                </select>
            </div>

            <div>
                <label htmlFor="quantity">
                    Quantity
                </label>

                <input
                    id="quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    value={quantity}
                    onChange={(event) =>
                        setQuantity(event.target.value)
                    }
                    required
                />
            </div>

            <div>
                <label htmlFor="reason">
                    Reason
                </label>

                <textarea
                    id="reason"
                    value={reason}
                    onChange={(event) =>
                        setReason(event.target.value)
                    }
                    placeholder="e.g. Damaged goods, stock count correction"
                    required
                />
            </div>

            <button type="submit"
                    disabled={saving}>
                {saving ? "Saving..." : "Save Adjustment"}
                
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
export default UpdateProductStock;

