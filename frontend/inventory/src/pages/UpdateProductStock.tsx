import { useEffect, useState } from "react";
import type { Product } from "../interfaces/interfaces";
import { getProduct } from "../apis/products";
import { useNavigate, useParams } from "react-router-dom";
import { modify_stock } from "../apis/stock_movements";
import { Alert, Card, Flex, Stack, Field, Input, Textarea, Heading, Badge, Text } from "@chakra-ui/react";
import { Plus, Minus } from "lucide-react";
import AppButton from "../components/AppButton";
import PageShell from "../components/PageShell";




function UpdateProductStock(){

const [product, setProduct] = useState<Product >();
const { id } = useParams();
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const [quantity, setQuantity] = useState("");
const [direction, setDirection] = useState<"Increase"| "Decrease">("Increase");
const [reason, setReason] = useState("");

    async function fetchProduct() {

        try{
            setLoading(true);
            const data = await getProduct(Number(id));
            setProduct(data);
        }
        catch (error){
            setError("Failed to fetch Product");
        }
        finally{
            setLoading(false);
        }
        
    }
    useEffect(()=>{
        fetchProduct();
    },[id]);



    


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    

   if (!quantity || Number(quantity) <= 0) {
    setError("Enter a quantity greater than zero.");
    return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for the adjustment.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await modify_stock({
                product_id:Number(id),
                quantity:Number(quantity),
                direction,
                reason:reason.trim()}
            );

            navigate("/products");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to adjust stock."
            );
        } finally {
            setSaving(false);
        }

}

    if (loading) {
        return <p>Loading product...</p>;
    }

    if (error && !product) {
        return <p>{error}</p>;
    }

    if (!product) {
        return <p>Product not found</p>;
    }

return (
    <PageShell title="Adjust Stock" maxW="520px">
    {error && (
        <Alert.Root status="error"><Alert.Indicator /><Alert.Title>{error}</Alert.Title></Alert.Root>
    )}
    <Card.Root>
        <Card.Body gap={5}>
            <Flex justify="space-between" align="center">
                <Stack gap={0}>
                    <Heading size="md">{product.name}</Heading>
                    <Text fontSize="sm" color="gray.500">SKU: {product.sku}</Text>
                </Stack>
                <Badge size="lg" colorPalette="blue">In stock: {product.current_stock}</Badge>
            </Flex>

            <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                    <Flex gap={2}>
                        <AppButton type="button" flex="1"
                            intent={direction === "Increase" ? "primary" : "secondary"}
                            onClick={() => setDirection("Increase")}>
                            <Plus size={16} /> Increase
                        </AppButton>
                        <AppButton type="button" flex="1"
                            intent={direction === "Decrease" ? "danger" : "secondary"}
                            onClick={() => setDirection("Decrease")}>
                            <Minus size={16} /> Decrease
                        </AppButton>
                    </Flex>

                    <Field.Root>
                        <Field.Label>Quantity</Field.Label>
                        <Input type="number" min="0.01" step="any" value={quantity}
                            onChange={(e) => setQuantity(e.target.value)} />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Reason</Field.Label>
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Damaged goods, stock count correction" />
                    </Field.Root>

                    <Flex justify="flex-end" gap={3}>
                        <AppButton type="button" intent="secondary" onClick={() => navigate("/products")}>Cancel</AppButton>
                        <AppButton type="submit" loading={saving} loadingText="Saving...">Save Adjustment</AppButton>
                    </Flex>
                </Stack>
            </form>
        </Card.Body>
    </Card.Root>
</PageShell>
);
    
}
export default UpdateProductStock;

