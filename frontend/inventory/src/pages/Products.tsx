import { useEffect, useState } from "react";
import { getProducts } from "../apis/products";
import type { Product } from "../interfaces/interfaces";
import "../styles/Products.css"
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../apis/products";

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



async function DeleteProduct(product_id: number) {
    try {
        await deleteProduct(product_id);
        await fetchProducts();
    } catch (error) {
        if (error instanceof Error && error.message === "Protected") {
            setError(
                "Cannot delete this product because it is used in existing orders or stock movements."
            );
        }
    }
}


    useEffect(() => {
        fetchProducts()
    },[]);

   function UpdateProducts(product_id: number){
    navigate(`/products/${product_id}/edit`);
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
                    <th>Name</th>
                
                
                    <th>Current Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {products.map((product) => (



                    <tr key={product.id}>
                        <td>{product.name}</td>                                       
                        <td>{product.current_stock}</td>           
                        <td>{product.category_name}</td>
                       <td>
                        <button onClick={() => UpdateProducts(product.id)}>Update</button>
                        <button onClick={() => DeleteProduct(product.id)}>Delete</button>     
                        </td>
                        <td>
    {product.image && (
        <img
            src={`http://127.0.0.1:8000${product.image}`}
            alt={product.name}
            width="80"
            height="80"
        />
    )}
</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        <button onClick={() => navigate("/products/create")}>
    Create Product
</button>
        </div>
    );
}

export default Products;