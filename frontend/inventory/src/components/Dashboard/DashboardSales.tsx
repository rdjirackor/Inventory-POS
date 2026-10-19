import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/interfaces";
import { getProducts } from "../../apis/products";

function DashboardSales(){

    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");



    const [search, setSearch] = useState("");
    const [items,setItems] = useState<Product[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const filtered = items.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()));
    const[quantity, setQuantity] = useState(1);

    const [saleItems, setSaleItems] = useState<Record<string,number>>({});

    async function fetchProducts() {
        setError("");
        setLoading(true);

        try{
            const productsData = await getProducts();
            setItems(productsData);
        }
        catch(error){
            setError("Could not load products");
        }
        finally{
            setLoading(false);
        }       
    }

    useEffect(()=>{
        fetchProducts()
    },[]);


    return(
        <>
        <input 
            type="text"
            placeholder="Search Products..."
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
            />
        {loading && <p>Loading Products...</p>}
        {error && <p>{error}</p>}


        {!loading && !error && (

        <ul>
            {filtered.map(item =>(
                <li key={item.id}
                onClick={()=>{
                    setSelectedProduct(item);
                    setQuantity(1);

                }}
                
                >{item.name}</li>
                
            ))}
        </ul>
        )}

        {!loading && !error && items.length === 0 && (
            <p>No products available.</p>
        )}

        {!loading && !error && items.length > 0 && filtered.length === 0 && (
            <p>No products match your search.</p>
        )}

        {selectedProduct &&(
            <>
                <p>{selectedProduct.name}</p>
                <input
                    type="number"
                    placeholder="Enter Quantity"
                    value= {quantity}
                    onChange={(e)=>setQuantity(Number(e.target.value))}
                    />


                <button onClick={()=>{
                    setSelectedProduct(null);
                    setQuantity(1);}}>
                    X
                </button>
                <button type="submit" onClick={()=>setSaleItems(prev => ({ ...prev, [selectedProduct.id]: quantity }))}>Proceed</button>

                
            </>)}
            {console.log(saleItems)}

            {Object.keys(saleItems).length>0 &&(<>
            <h3>Current Sale</h3>

                <ul>
                    {Object.entries(saleItems).map(([productId, qty]) => {
                        const product = items.find(
                            item => String(item.id) === productId
                        );

                        if (!product) return null;

                        return (
                            <li key={productId}>
                                {product.name} — Quantity: {qty}
                            </li>
                        );
                    })}
                </ul>
                </>)}
        </>
    );


}
export default DashboardSales;