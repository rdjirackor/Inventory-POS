import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/interfaces";
import { getProducts } from "../../apis/products";

import type { Customer } from "../../interfaces/interfaces";
import { getCustomers } from "../../apis/customers";

function DashboardSales(){

    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");



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

    async function fetchCustomers() {
    try {
        const customersData = await getCustomers();
        setCustomers(customersData);
    } catch (error) {
        console.error("Could not load customers:", error);
    }
    }

    useEffect(()=>{
        fetchProducts();
        fetchCustomers();
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

            <label htmlFor="customer">Customer:</label>

            <select
                id="customer"
                value={selectedCustomer}
                onChange={(e) =>
                    setSelectedCustomer(
                        e.target.value === "" ? "" : Number(e.target.value)
                    )
                }
            >
                <option value="">Walk-in customer</option>

                {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                        {[
                            customer.first_name,
                            customer.second_name
                        ].filter(Boolean).join(" ") || `Customer #${customer.id}`}
                    </option>
                ))}
            </select>




            {Object.keys(saleItems).length>0 &&(<>
            <h3>Current Sale</h3>

                <ul>
                    {Object.entries(saleItems).map(([productId, qty]) => {
                        const product = items.find(
                            item => String(item.id) === productId
                        );
                        
                        if (!product) return null;

                        return (<>
                            <li key={productId} >
                                {product.name} — Quantity: {qty}
                                {" | "}Price: GHc {Number(product.selling_price_without_tax).toFixed(2)}
                                {" | "}Subtotal: GHc {
                                    (Number(product.selling_price_without_tax) * qty).toFixed(2)
                                }
                            <button
                                    onClick={() => 
                                    setSaleItems(prev => ({
                                    ...prev,
                                    [productId]: qty + 1
                                    }))}>
                                    +
                                </button>
                            
                            <button
                                    onClick={() =>
                                    setSaleItems(prev =>{
                                        const next= {... prev}
                                        if (next[productId]>1){
                                            next[productId] -= 1;
                                            }
                                        else{
                                            delete next[productId]
                                        }
                                        return next;

                                    })}>-</button>
                                    

                            <button onClick={()=>setSaleItems(prev=>{
                                    const next = {...prev};
                                    delete next[productId];
                                    return next;
                                }
                                )}>Remove</button>
                            </li>                           
                       </> );
                    })}
                </ul>
                <p>
                Total: {
                    Object.entries(saleItems).reduce((total, [productId, qty]) => {
                        const product = items.find(
                            item => String(item.id) === productId
                        );

                        if (!product) return total;

                        return total + Number(product.selling_price_without_tax) * qty;
                    }, 0).toFixed(2)
                }
            </p>
                </>)}
        </>
    );


}
export default DashboardSales;