
import { useEffect, useState } from "react";
import type { Product, Customer } from "../../interfaces/interfaces";
import { getProducts } from "../../apis/products";
import { getCustomers } from "../../apis/customers";
import { checkout } from "../../apis/checkout";
import AppButton from "../AppButton";

import { useNavigate } from "react-router-dom";


type PaymentMethod =
    | "Cash"
    | "Card"
    | "Mobile Money"
    | "Bank Transfer";

interface PaymentDraft {
    amount: string;
    method: PaymentMethod;
    provider: string;
    reference_number: string;
}

const emptyPayment = (): PaymentDraft => ({
    amount: "",
    method: "Cash",
    provider: "",
    reference_number: "",
});

function DashboardSales() {

    const navigate = useNavigate();


    const [loading, setLoading] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    const [error, setError] = useState("");
    const [checkoutMessage, setCheckoutMessage] = useState("");

    const [items, setItems] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState("1");

    const [saleItems, setSaleItems] = useState<Record<string, number>>({});

    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");

    const [payments, setPayments] = useState<PaymentDraft[]>([
        emptyPayment(),
    ]);

    const selectedCustomerObj = customers.find(
        customer => customer.id === selectedCustomer
    );

    const filteredProducts = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const cartTotal = Object.entries(saleItems).reduce(
        (total, [productId, qty]) => {
            const product = items.find(
                item => String(item.id) === productId
            );

            if (!product) return total;

            return total + Number(product.actual_sale_price) * qty;
        },
        0
    );

    const totalPayment = payments.reduce(
        (total, payment) => total + (Number(payment.amount) || 0),
        0
    );

    const invalidPayments = payments.some(payment => {
        if (payment.amount.trim() === "") {
            return false;
        }

        const amount = Number(payment.amount);

        return (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            Math.round(amount * 100) !== amount * 100
        );
    });

    const hasInsufficientStock = Object.entries(saleItems).some(
        ([productId, qty]) => {
            const product = items.find(
                item => String(item.id) === productId
            );

            return !product || qty > Number(product.current_stock);
        }
    );

    async function fetchProducts() {
        setLoading(true);
        setError("");

        try {
            const productsData = await getProducts();
            setItems(productsData);
        } catch {
            setError("Could not load products.");
        } finally {
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

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    function addProductToSale() {
        if (!selectedProduct) return;

        const qty = Number(quantity);

        if (
            quantity.trim() === "" ||
            !Number.isFinite(qty) ||
            qty <= 0 ||
            Math.round(qty * 100) !== qty * 100
        ) {
            setError("Enter a valid quantity.");
            return;
        }

        const existingQuantity = saleItems[selectedProduct.id] || 0;
        const newQuantity = existingQuantity + qty;

        if (newQuantity > Number(selectedProduct.current_stock)) {
            setError(
                `Insufficient stock for ${selectedProduct.name}.`
            );
            return;
        }

        setError("");

        setSaleItems(prev => ({
            ...prev,
            [selectedProduct.id]: newQuantity,
        }));

        setSelectedProduct(null);
        setQuantity("1");
    }

    function changeSaleQuantity(productId: string, change: number) {
        setSaleItems(prev => {
            const next = { ...prev };
            const newQuantity = (next[productId] || 0) + change;

            if (newQuantity <= 0) {
                delete next[productId];
            } else {
                next[productId] = newQuantity;
            }

            return next;
        });
    }

    function removeSaleItem(productId: string) {
        setSaleItems(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
        });
    }

    function addPayment() {
        setPayments(prev => [...prev, emptyPayment()]);
    }

    function updatePayment(
        index: number,
        field: keyof PaymentDraft,
        value: string
    ) {
        setPayments(prev =>
            prev.map((payment, i) =>
                i === index
                    ? { ...payment, [field]: value }
                    : payment
            )
        );
    }

    function removePayment(index: number) {
        setPayments(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    async function handleCheckout(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setCheckoutMessage("");

        if (Object.keys(saleItems).length === 0) {
            setError("Add at least one product to the sale.");
            return;
        }

        if (hasInsufficientStock) {
            setError("One or more products have insufficient stock.");
            return;
        }

        if (invalidPayments) {
            setError("Check the payment amounts. They must be positive and have at most two decimal places.");
            return;
        }

        if (totalPayment > cartTotal + 0.001) {
            setError("The total payment cannot exceed the order total.");
            return;
        }

        setCheckingOut(true);

        try {
            const checkoutItems = Object.entries(saleItems).map(
                ([productId, qty]) => ({
                    product_id: Number(productId),
                    quantity: String(qty),
                })
            );

           
            const paymentPayload = payments
                .filter(payment => payment.amount.trim() !== "")
                .map(payment => ({
                    amount: payment.amount,
                    method: payment.method,
                    provider: payment.provider.trim(),
                    reference_number: payment.reference_number.trim(),
                }));

                const result = await checkout(
                    checkoutItems,
                    selectedCustomer === "" ? null : selectedCustomer,
                    paymentPayload
                );

                navigate(`/receipts/${result.receipt_id}`);
                return;
            

            setCheckoutMessage(
                `Sale completed! Order #${result.order_id} — ` +
                `Total: GH₵ ${Number(result.total).toFixed(2)} — ` +
                `Paid: GH₵ ${Number(result.amount_paid).toFixed(2)} — ` +
                `Balance: GH₵ ${Number(result.balance_due).toFixed(2)} — ` +
                `${result.payment_status}`
                
            );

            setSaleItems({});
            setSelectedProduct(null);
            setQuantity("1");
            setSelectedCustomer("");
            setPayments([emptyPayment()]);

            await fetchProducts();
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

    return (
        <>
            <h2>New Sale</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {checkoutMessage && (
                <p style={{ color: "green" }}>{checkoutMessage}</p>
            )}

            <section>
                <h3>Products</h3>

                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {loading && <p>Loading products...</p>}

                {!loading && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <p>No matching products found.</p>
                        ) : (
                            <ul>
                                {filteredProducts.map(item => (
                                    <li
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedProduct(item);
                                            setQuantity("1");
                                            setError("");
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {item.image && (
                                            <img
                                                src={`http://127.0.0.1:8000${item.image}`}
                                                alt={item.name}
                                                width="80"
                                                height="80"
                                            />
                                        )}

                                        <span>
                                            {item.name} — GH₵{" "}
                                            {Number(item.actual_sale_price).toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </section>

            {selectedProduct && (
                <section>
                    <h3>{selectedProduct.name}</h3>

                    <p>
                        Selling price: GH₵{" "}
                        {Number(selectedProduct.actual_sale_price).toFixed(2)}
                    </p>

                    <p>
                        Available stock: {selectedProduct.current_stock}
                    </p>

                    <label htmlFor="product-quantity">
                        Quantity:
                    </label>

                    <input
                        id="product-quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                    />

                    <AppButton
                        type="button"
                        intent="primary"
                        onClick={addProductToSale}
                    >
                        Add to Sale
                    </AppButton>

                    <AppButton
                        type="button"
                        intent="secondary"
                        onClick={() => {
                            setSelectedProduct(null);
                            setQuantity("1");
                        }}
                    >
                        Cancel
                    </AppButton>
                </section>
            )}

            <section>
                <h3>Customer</h3>

                <label htmlFor="customer">
                    Select customer:
                </label>

                <select
                    id="customer"
                    value={selectedCustomer}
                    onChange={e =>
                        setSelectedCustomer(
                            e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                        )
                    }
                >
                    <option value="">Walk-in customer</option>

                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {[
                                customer.first_name,
                                customer.second_name,
                            ].filter(Boolean).join(" ") ||
                                `Customer #${customer.id}`}
                        </option>
                    ))}
                </select>

                {selectedCustomerObj && (
                    <p>
                        Selected:{" "}
                        {[
                            selectedCustomerObj.first_name,
                            selectedCustomerObj.second_name,
                        ].filter(Boolean).join(" ")}
                    </p>
                )}
            </section>

            {Object.keys(saleItems).length > 0 && (
                <section>
                    <h3>Current Sale</h3>

                    <ul>
                        {Object.entries(saleItems).map(
                            ([productId, qty]) => {
                                const product = items.find(
                                    item => String(item.id) === productId
                                );

                                if (!product) return null;

                                const unitPrice = Number(
                                    product.actual_sale_price
                                );

                                return (
                                    <li key={productId}>
                                        <p>{product.name}</p>

                                        <p>
                                            Unit price: GH₵{" "}
                                            {unitPrice.toFixed(2)}
                                        </p>

                                        <p>
                                            Quantity: {qty}
                                        </p>

                                        <p>
                                            Subtotal: GH₵{" "}
                                            {(unitPrice * qty).toFixed(2)}
                                        </p>

                                        {qty > Number(product.current_stock) && (
                                            <p style={{ color: "red" }}>
                                                Insufficient stock!
                                            </p>
                                        )}

                                        <AppButton
                                            type="button"
                                            intent="primary"
                                            onClick={() =>
                                                changeSaleQuantity(productId, 1)
                                            }
                                        >
                                            +
                                        </AppButton>

                                        <AppButton
                                            type="button"
                                            intent="secondary"
                                            onClick={() =>
                                                changeSaleQuantity(productId, -1)
                                            }
                                        >
                                            -
                                        </AppButton>

                                        <AppButton
                                            type="button"
                                            intent="secondary"
                                            onClick={() =>
                                                removeSaleItem(productId)
                                            }
                                        >
                                            Remove
                                        </AppButton>
                                    </li>
                                );
                            }
                        )}
                    </ul>

                    <h3>
                        Order Total: GH₵ {cartTotal.toFixed(2)}
                    </h3>
                </section>
            )}

            {Object.keys(saleItems).length > 0 && (
                <form onSubmit={handleCheckout}>
                <section>
                    <h3>Payments</h3>

                    <p>
                        You can record multiple payments or leave the amounts
                        blank to create an unpaid order.
                    </p>

                    {payments.map((payment, index) => (
                        <div key={index}>
                            <h4>Payment {index + 1}</h4>

                            <label>
                                Amount:
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter amount"
                                value={payment.amount}
                                onChange={e =>
                                    updatePayment(
                                        index,
                                        "amount",
                                        e.target.value
                                    )
                                }
                            />

                            <label>
                                Payment method:
                            </label>

                            <select
                                value={payment.method}
                                onChange={e =>
                                    updatePayment(
                                        index,
                                        "method",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="Mobile Money">Mobile Money</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>

                            {(payment.method === "Mobile Money" ||
                                payment.method === "Bank Transfer") && (
                                <>
                                    <label>
                                        Provider:
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder={
                                            payment.method === "Mobile Money"
                                                ? "e.g. MTN"
                                                : "e.g. Bank name"
                                        }
                                        value={payment.provider}
                                        onChange={e =>
                                            updatePayment(
                                                index,
                                                "provider",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <label>
                                        Reference number:
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder="Transaction reference"
                                        value={payment.reference_number}
                                        onChange={e =>
                                            updatePayment(
                                                index,
                                                "reference_number",
                                                e.target.value
                                            )
                                        }
                                    />
                                </>
                            )}

                            {payments.length > 1 && (
                                <AppButton
                                    type="button"
                                    intent="secondary"
                                    onClick={() => removePayment(index)}
                                >
                                    Remove Payment
                                </AppButton>
                            )}
                        </div>
                    ))}

                    <AppButton
                        type="button"
                        intent="secondary"
                        onClick={addPayment}
                    >
                        Add Another Payment
                    </AppButton>

                    <p>
                        Total entered: GH₵ {totalPayment.toFixed(2)}
                    </p>

                    <p>
                        Remaining balance: GH₵{" "}
                        {Math.max(0, cartTotal - totalPayment).toFixed(2)}
                    </p>


                    <AppButton
                        type="submit"
                        intent="primary"
                        disabled={
                            checkingOut ||
                            loading ||
                            invalidPayments ||
                            hasInsufficientStock ||
                            totalPayment > cartTotal + 0.001
                        }
                    >
                        {checkingOut  ? "Processing..." : "Complete Sale"}
                    </AppButton>


                </section>
                </form>
            )}
        </>
    );
}

export default DashboardSales;
