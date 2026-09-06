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

        </div>
    );
}

export default Products;