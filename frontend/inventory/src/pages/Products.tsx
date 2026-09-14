import { useEffect, useState } from "react";
import { getProducts } from "../apis/products";
import type { Product } from "../interfaces/interfaces";
import "../styles/Products.css"
import { Navigate, useNavigate } from "react-router-dom";

function Products() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [products, setProducts] = useState<Product[]>([]);

    const navigate = useNavigate();
    



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

    function updateProducts(product_id:number){
        navigate(`/products/${product_id}`);
    }

    return (
        <div>
            <h1>Products</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="products_table">
                <table className="table">
                        <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                
                
                    <th>Current Stock</th>
                    <th>Category</th>
                </tr>
            </thead>

            <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>                                       
                        <td>{product.current_stock}</td>           
                        <td>{product.category_name}</td>
                       <td><button onClick={() => updateProducts(product.id)}>Update {product.id}</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        </div>
    );
}

export default Products;