
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../interfaces/interfaces";
import { getProducts } from "../apis/products";
import { createReturn } from "../apis/returns";
import { Card, Field, Flex, Heading, Input, NativeSelect, SimpleGrid, Textarea } from "@chakra-ui/react";
import AppButton from "../components/AppButton";

export default function CreateReturn() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load products."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const product = Number(productId);
        const order = Number(orderId);
        const amount = Number(quantity);

        if (
            !Number.isInteger(product) ||
            product <= 0 ||
            !Number.isInteger(order) ||
            order <= 0 ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !reason.trim()
        ) {
            setError("Enter a valid product, sale ID, quantity, and reason.");
            return;
        }

        setSaving(true);

        try {
            await createReturn(
                product,
                null,
                order,
                amount,
                reason.trim()
            );

            navigate("/returns");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create return."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p>Loading products...</p>;

    return (
        <div>
        
                    {error && <p>{error}</p>}
                    <form onSubmit={handleSubmit}>
                    <Card.Root>
            <Card.Body gap={4}>
                <Heading size="md">Basic info</Heading>
                <SimpleGrid columns={{ base: 2, md: 2 }} gap={4}>

                      <Field.Root>
            <NativeSelect.Root>
                <NativeSelect.Field value={productId}  onChange={(e) => setProductId(e.target.value)}>
                    <option value="">Select Product</option>
        {products.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                ))}        </NativeSelect.Field>
                <NativeSelect.Indicator />
            </NativeSelect.Root>
        </Field.Root>
             <Field.Root>
                        <Field.Label>Order ID</Field.Label>
                        <Input value={orderId} type="number"  onChange={(e) => setOrderId(e.target.value)} />
                    </Field.Root>
                      <Field.Root>
                        <Field.Label>Return Quantity</Field.Label>
                        <Input value={quantity} type="number" onChange={(e) => setQuantity(e.target.value)} />
                    </Field.Root>
                   
                                <Field.Root>
                        <Field.Label>Reason for Return</Field.Label>
                        <Textarea value={reason} placeholder="Enter the reason for the return" onChange={(e) => setReason(e.target.value)} />
                    </Field.Root>
                              
                           
                               
                              
                           
                                
                                
                </SimpleGrid>
            </Card.Body>
        </Card.Root>
        
        <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/products")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating...">
                Create Product
            </AppButton>
        </Flex>
        
        </form>
                    
        
                    
                </div>
    );
}
