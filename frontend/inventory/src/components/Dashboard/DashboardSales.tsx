import { useEffect, useState } from "react";
import type { Product, Customer } from "../../interfaces/interfaces";
import { getProducts } from "../../apis/products";
import { getCustomers } from "../../apis/customers";
import { checkout } from "../../apis/checkout";
import AppButton from "../AppButton";

import { useNavigate } from "react-router-dom";
import { Card, Flex, Input, InputGroup, SimpleGrid, Image, Stack, Heading, Text, NativeSelect } from "@chakra-ui/react";
import { Plus, Minus, Trash2, X, Search } from "lucide-react";
import AppIconButton from "../AppIconButton";


type PaymentMethod = "Cash" | "Card" | "Mobile Money" | "Bank Transfer";

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

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

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

    const [payments, setPayments] = useState<PaymentDraft[]>([emptyPayment()]);

    const sortedProducts = [...items].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const filteredProducts = sortedProducts.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const hasSaleItems = Object.keys(saleItems).length > 0;

    const showOrderCard = selectedProduct !== null || hasSaleItems;

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

    function cancelOrder() {
        setSelectedProduct(null);
        setQuantity("1");
        setSaleItems({});
        setSelectedCustomer("");
        setPayments([emptyPayment()]);
        setError("");
        setCheckoutMessage("");
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

    async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
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
        
        <Flex height="100vh" width="80vw" bg="gray.50">
            <Flex direction="column" flex="1" p={6} gap={4} overflowY="auto">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {checkoutMessage && (
                    <p style={{ color: "green" }}>{checkoutMessage}</p>
                )}

                <section>
                    <InputGroup  startElement={<Search size={16} />}>
                    <Input
                        bg="white"
                        color={"black"}
                        placeholder="Search products..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                    </InputGroup>

                    {loading && <p>Loading products...</p>}

                    {!loading && (
                        <>
                            {filteredProducts.length === 0 ? (
                                <p>No matching products found.</p>
                            ) : (
                                <>
                                    <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={4} my={4}>
                                        {paginatedProducts.map(item => (
                                            <Card.Root
                                                key={item.id}
                                                onClick={() => {
                                                    setSelectedProduct(item);
                                                    setQuantity("1");
                                                    setError("");
                                                }}

                                                transition="all 150ms ease"
                                                borderWidth="2px"
                                                borderColor={selectedProduct?.id === item.id ? "blue.500" : "transparent"}
                                                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                                                cursor="pointer"
                                            >
                                                <Card.Body p={3} alignItems="center" textAlign="center">
                                                    {item.image && (
                                                        <Image 
                                                        src={`http://127.0.0.1:8000${item.image}`}
                                                        alt={item.name}
                                                        w="100%"
                                                        h="110px"
                                                        objectFit="cover"
                                                        borderRadius="md" />
                                                      
                                                        
                                                    )}
                                                    <p style={{ fontWeight: 600 }}>{item.name}</p>
                                                    <p style={{ color: "gray" }}>
                                                        GH₵ {Number(item.actual_sale_price).toFixed(2)}
                                                    </p>
                                                </Card.Body>
                                            </Card.Root>
                                        ))}
                                    </SimpleGrid>

                                    {totalPages > 1 && (
                                        <Flex justify="space-between" align="center" my={4}>
                                            <AppButton
                                                type="button"
                                                intent="secondary"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            >
                                                Previous
                                            </AppButton>

                                            <span>
                                                Page {currentPage} of {totalPages}
                                            </span>

                                            <AppButton
                                                type="button"
                                                intent="secondary"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            >
                                                Next
                                            </AppButton>
                                        </Flex>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            </Flex>

                  <Flex
                    direction="column"
                    w="360px"
                    flexShrink={0}
                    bg="white"
                    borderLeftWidth="1px"
                    borderColor="gray.200"
                    p={4}
                    overflowY="auto"
                >
                {showOrderCard && (
      // <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" shadow="sm">
                                        <Card.Root variant="subtle" bg="transparent" shadow="none">

                        <Card.Body
                            color={"black"}
                     
                            p={0}
                            gap={4}
                        >
                                    <Stack gap={5}>

                            <Flex justify="space-between" align="center" mb={3}>
                                <Heading size="sm">Order</Heading>
                                    <AppIconButton label="Cancel" intent="danger" onClick={() => cancelOrder()}>
                                        <X size={16} />
                                    </AppIconButton>
                            </Flex>

                            <section style={{ marginBottom: "16px" }}>
                                <Stack gap={1}>
  <Text fontSize="sm" color="gray.600">Select customer</Text>
</Stack>

                                <NativeSelect.Root size="sm">
                                    <NativeSelect.Field 
                                        bg="white"
                                        color="black"
                                        colorScheme="light"
                                    
                                    value={selectedCustomer} 
                                    onChange={e =>
                                        setSelectedCustomer(
                                        e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                        )
                                    }>
                                    
                                    <option value="" style={{ background: "white", color: "black" }}>Walk-in customer</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id} style={{ background: "white", color: "black" }}>
                                            {[
                                                customer.first_name,
                                                customer.second_name,
                                            ].filter(Boolean).join(" ") ||
                                                `Customer #${customer.id}`}
                                            </option>
                                            ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>


                
                            </section>

                            {selectedProduct && (
                                <section style={{ marginBottom: "16px", borderBottom: "1px solid #ccc", paddingBottom: "12px" }}>
                                    <Heading size="sm">{selectedProduct.name}</Heading>
                                    <p>
                                        Selling price: GH₵{" "}
                                        {Number(selectedProduct.actual_sale_price).toFixed(2)}
                                    </p>
                                    <p>
                                        Available stock: {selectedProduct.current_stock}
                                    </p>

                                    <Stack gap={1}>
                                        <Text fontSize="sm" color="gray.600">Quantity</Text>
                                        <Input size="sm" type="number" value={quantity}   onChange={(e) => setQuantity(e.target.value)}
                                        />
                                        </Stack>

                                
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
                                        Clear Selection
                                    </AppButton>
                                </section>
                            )}

                            {hasSaleItems && (
                                <section style={{ marginBottom: "16px" }}>
                                    <Heading size="sm">Current Sale</Heading>
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

                                                return (<>
                                                <Stack key={productId} gap={2} py={3} borderBottomWidth="1px" borderColor="gray.100">
                              <Flex justify="space-between" align="center" gap={3}>
                                    <Stack gap={0} minW={0}>
                                    <Text fontWeight="medium" truncate>{product.name}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {qty} × GH₵ {unitPrice.toFixed(2)}
                                    </Text>
                                    </Stack>
                                    <Text fontWeight="semibold">GH₵ {(unitPrice * qty).toFixed(2)}</Text>
                                </Flex>

                                {qty > Number(product.current_stock) && (
                                    <Text fontSize="xs" color="red.600">Insufficient stock!</Text>
                                )}

                                <Flex gap={1}>{     <> 
                                    <AppIconButton label="Increase quantity" intent="secondary" mr={"3%"} onClick={() => changeSaleQuantity(productId, 1)}>
                                        <Plus size={16} />
                                    </AppIconButton>
                                

                                    <AppIconButton label="Decrease quantity" intent="secondary" mr={"3%"} onClick={() => changeSaleQuantity(productId, -1)}>
                                        <Minus size={16} />
                                    </AppIconButton>


                                    <AppIconButton label="Remove item" intent="danger" onClick={() => removeSaleItem(productId)}>
                                        <Trash2 size={16} />
                                    </AppIconButton>
                                    </>}</Flex>
                                </Stack>
                                               </> );
                                            }
                                        )}
                                    </ul>

                                    <Flex justify="space-between" align="center" pt={3}>
                                        <Text fontWeight="medium">Order total</Text>
                                        <Text fontSize="xl" fontWeight="bold">GH₵ {cartTotal.toFixed(2)}</Text>
                                    </Flex>
                                </section>
                            )}

                            {hasSaleItems && (
                                <form onSubmit={handleCheckout}>
                                    <section>
                                        <Heading size="sm">Payments</Heading>
                                        <p>
                                            You can record multiple payments or leave the amounts
                                            blank to create an unpaid order.
                                        </p>

                                        {payments.map((payment, index) => (
                                            <div key={index} style={{ marginBottom: "10px" }}>
                                                <h4>Payment {index + 1}</h4>

                                    <Stack gap={1}>
                                        <Text fontSize="sm" color="gray.600">Amount</Text>
                                        <Input size="sm" type="number" value={payment.amount}   onChange={e =>
                                                        updatePayment(
                                                            index,
                                                            "amount",
                                                            e.target.value
                                                        )
                                                    }
                                        />
                                        </Stack>

                                        

                                                <label>Payment method:</label>

                                        <NativeSelect.Root size="sm">
                                            <NativeSelect.Field value={payment.method} onChange={e =>
                                                        updatePayment(
                                                            index,
                                                            "method",
                                                            e.target.value as PaymentMethod
                                                        )
                                                    }>

                                                    <option value="Cash" style={{ background: "white", color: "black" }}>Cash</option>
                                                    <option style={{ background: "white", color: "black" }} value="Card">Card</option>
                                                    <option style={{ background: "white", color: "black" }} value="Mobile Money">Mobile Money</option>
                                                    <option style={{ background: "white", color: "black" }} value="Bank Transfer">Bank Transfer</option>  </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                       {(payment.method === "Mobile Money" ||
                                                    payment.method === "Bank Transfer") && (
                                                    <>
                                                    <Stack gap={1}>
                                                <Text fontSize="sm" color="gray.600">Provider</Text>
                                                <Input size="sm" type="text"
                                                value={payment.provider}
                                                required
                                                placeholder={
                                                payment.method === "Mobile Money"
                                                                ? "e.g. MTN"
                                                                : "e.g. Bank name"
                                                            } 
                                                onChange={e =>
                                                                               
                                                            updatePayment(
                                                            index,
                                                            "provider",
                                                            e.target.value
                                                            )} />
                                                </Stack>
                                                            
                                                       
                                                <Stack gap={1}>
                                                <Text fontSize="sm" color="gray.600">Reference number</Text>
                                                <Input size="sm" type="text" required value={quantity} placeholder="Transaction reference" 
                                                onChange={e =>
                                                                updatePayment(
                                                                    index,
                                                                    "reference_number",
                                                                    e.target.value
                                                                )
                                                            } />
                                                </Stack>
                                                    
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

                                        <p>Total entered: GH₵ {totalPayment.toFixed(2)}</p>
                                        <p>
                                            Remaining balance: GH₵{" "}
                                            {Math.max(0, cartTotal - totalPayment).toFixed(2)}
                                        </p>

                                       <AppButton type="submit" intent="primary" loading={checkingOut} disabled={checkingOut ||
                                                loading ||
                                                invalidPayments ||
                                                hasInsufficientStock ||
                                                totalPayment > cartTotal + 0.001} loadingText="Processing...">
    Complete Sale
</AppButton>
                                    </section>
                                </form>
                            )}
                            </Stack>
                        </Card.Body>
                    </Card.Root>
                )}
            </Flex>
        </Flex>
    );
}

export default DashboardSales;