import { useEffect, useState } from "react";
import { getProducts } from "../apis/products";
import type { Product } from "../interfaces/interfaces";

function Products() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [products, setProducts] = useState<Product[]>([]);
    



    async function fetchProducts(){
        setError("");
        setLoading(true);
        try{
            const data = await getProducts();
            setProducts(data);
        }
        catch(error){
            setError("Failed to load products");
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchProducts()
    },[]);
    console.log(products);


    return (
        <div>
            <h1>Products</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

           <table>
                <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Brand</th>
            <th>Net Cost</th>
            <th>Selling Price Without Tax</th>
            <th>Discount</th>
            <th>Current Stock</th>
            <th>Minimum Stock Level</th>
            <th>Barcode Number</th>
            <th>Taxes</th>
            <th>Category</th>
            <th>Warehouse</th>
        </tr>
    </thead>

    <tbody>
        {products.map((product) => (
            <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.brand}</td>
                <td>{product.net_cost}</td>
                <td>{product.selling_price_without_tax}</td>
                <td>{product.discount_name || "No discount"}</td>
                <td>{product.current_stock}</td>
                <td>{product.minimum_stock_level}</td>
                <td>{product.barcode_number}</td>

                <td>
                    {product.taxes_names.length > 0
                        ? product.taxes_names.join(", ")
                        : "No taxes"}
                </td>

                <td>{product.category_name}</td>
                <td>{product.warehouse_name}</td>
            </tr>
        ))}
    </tbody>
</table>
        </div>
    );
}

export default Products;