import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/interfaces";
import { getProducts } from "../../apis/products";
import type { Customer } from "../../interfaces/interfaces";
import { getCustomers } from "../../apis/customers";
import { checkout } from "../../apis/checkout";
import AppButton from "../AppButton";
import { SaveCancel } from "../Buttons";

function DashboardSales(){

    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");

    const selectedCustomerObj = customers.find((c)=> c.id===selectedCustomer);

    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState("");


    const [search, setSearch] = useState("");
    const [items,setItems] = useState<Product[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const filtered = items.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()));
    const[quantity, setQuantity] = useState("1");

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


async function handleCheckout() {
    setError("");
    setCheckoutMessage("");
    setCheckingOut(true);

    try {
        const checkoutItems = Object.entries(saleItems).map(
            ([productId, qty]) => ({
                product_id: Number(productId),
                quantity: String(qty),
            })
        );

        const result = await checkout(
            checkoutItems,
            selectedCustomer === "" ? null : selectedCustomer,
            paymentMethod
        );

        setCheckoutMessage(
            `Sale completed! Order #${result.order_id} — Total: GH₵ ${Number(result.total).toFixed(2)}`
        );

        setSaleItems({});
        setSelectedProduct(null);
        setQuantity("1");
        setSelectedCustomer("");
        

    } catch (error) {
        setError(
            error instanceof Error
                ? error.message
                : "Checkout failed. Please try again."
        );
    } finally {
        setCheckingOut(false);
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
                    setQuantity("1");

                }}
                
                >{item.image && (
                                            <img
                                                src={`http://127.0.0.1:8000${item.image}`}
                                                alt={item.name}
                                                width="80"
                                                height="80"
                                            />
                                        )}{item.name}</li>
                
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
                    onChange={(e)=>setQuantity(e.target.value)}
                    />


                <AppButton onClick={()=>{
                    setSelectedProduct(null);
                    setQuantity("1");}}>
                    X
                </AppButton>
                
                <AppButton/>



                <AppButton intent="primary"
                    type="button"
                    disabled={
                        quantity.trim() === "" ||
                        !Number.isFinite(Number(quantity)) ||
                        Number(quantity) <= 0 ||
                        Math.round(Number(quantity) * 100) !== Number(quantity) * 100
                    }
                    onClick={() => {
                        const qty = Number(quantity);

                        setSaleItems(prev => ({
                            ...prev,
                            [selectedProduct.id]: qty
                        }));

                        setSelectedProduct(null);
                        setQuantity("1");
                    }}
                >
                    Proceed
                </AppButton>   

                
                
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

                        return (
                            <li key={productId} >
                                {product.name} — Quantity: {qty}
                                {qty > Number(product.current_stock) && (
                                    <span style={{ color: "red" }}> Insufficient stock!</span>
                                )}
                                {" | "}Price: GHc {Number(product.selling_price_without_tax).toFixed(2)}
                                {" | "}Subtotal: GHc {
                                    (Number(product.selling_price_without_tax) * qty).toFixed(2)
                                }
                            <AppButton intent="primary"
                                    onClick={() => 
                                    setSaleItems(prev => ({
                                    ...prev,
                                    [productId]: qty + 1
                                    }))}>
                                    +
                                </AppButton>
                            
                            <AppButton intent="secondary"
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

                                    })}>-</AppButton>
                                    

                            <AppButton intent="secondary" onClick={()=>setSaleItems(prev=>{
                                    const next = {...prev};
                                    delete next[productId];
                                    return next;
                                }
                                )}>Remove</AppButton>
                            </li>                           
                        );
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
                }            </p>

                {selectedCustomerObj&&(
                    <p>{[selectedCustomerObj.first_name, selectedCustomerObj.second_name]
                        .filter(Boolean)
                        .join("")
                    
                    }</p>
                )}

            <label htmlFor="payment-method">Payment method:</label>

            <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
            </select>

            <AppButton intent="primary"
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut || Object.keys(saleItems).length === 0}
            >
                {checkingOut ? "Processing..." : "Complete Sale"}

            </AppButton>


                </>)
                }
                {checkoutMessage && <p>{checkoutMessage}</p>}
        </>
    );


}
export default DashboardSales;