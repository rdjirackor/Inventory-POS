import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProduct } from "../apis/products";
import { getCategories } from "../apis/categories";
import { getWarehouses } from "../apis/warehouses";
import { getDiscounts } from "../apis/discounts";
import { getTaxes } from "../apis/taxes";

import type {
    Category,
    Warehouse,
    Discount,
    TaxType,
} from "../interfaces/interfaces";
import { Card, Checkbox, Field, Flex, Heading, Input, NativeSelect, SimpleGrid, Stack } from "@chakra-ui/react";
import AppButton from "../components/AppButton";

function CreateProduct() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [brand, setBrand] = useState("");
    const [netCost, setNetCost] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [currentStock, setCurrentStock] = useState("");
    const [minimumStock, setMinimumStock] = useState("");
    const [barcode, setBarcode] = useState("");

    const [category, setCategory] = useState("");
    const [warehouse, setWarehouse] = useState("");
    const [discount, setDiscount] = useState("");
    const [taxes, setTaxes] = useState<number[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);

    const [image, setImage] = useState<File | null>(null);


    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOptions() {
            try {
                const [
                    categoryData,
                    warehouseData,
                    discountData,
                    taxData,
                ] = await Promise.all([
                    getCategories(),
                    getWarehouses(),
                    getDiscounts(),
                    getTaxes(),
                ]);

                setCategories(categoryData);
                setWarehouses(warehouseData);
                setDiscounts(discountData);
                setTaxTypes(taxData);
            } catch (error) {
                console.error(error);
                setError("Failed to load product options");
            } finally {
                setLoadingOptions(false);
            }
        }

        fetchOptions();
    }, []);

    function handleTaxChange(taxId: number) {
        setTaxes((currentTaxes) => {
            if (currentTaxes.includes(taxId)) {
                return currentTaxes.filter((id) => id !== taxId);
            }

            return [...currentTaxes, taxId];
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createProduct(
                name,
                sku,
                brand,
                Number(netCost),
                Number(sellingPrice),
                discount === "" ? null : Number(discount),
                Number(currentStock),
                Number(minimumStock),
                image,
                barcode,
                taxes,
                Number(category),
                Number(warehouse)
            );

            navigate("/products");

        } catch (error) {
            setError("Failed to create product");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

    if (loadingOptions) {
        return <p>Loading...</p>;
    }

    return (
        <div>

            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
            <Card.Root>
    <Card.Body gap={4}>
        <Heading size="md">Basic info</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root>
                <Field.Label>Name</Field.Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field.Root>
            <Field.Root>
                <Field.Label>SKU</Field.Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Brand</Field.Label>
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Net Cost</Field.Label>
                <Input value={netCost} onChange={(e) => setNetCost(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Selling Price</Field.Label>
                <Input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Current Stock</Field.Label>
                <Input value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Minimum Stock Level</Field.Label>
                <Input value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Barcode</Field.Label>
                <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </Field.Root>
                        <Field.Root>
                <Field.Label>Product Image</Field.Label>
                <Input  type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setImage(e.target.files?.[0] || null);
                        }} />
            </Field.Root>
                        <Field.Root>
    <Field.Label>Category</Field.Label>
    <NativeSelect.Root>
        <NativeSelect.Field value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
{categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}        </NativeSelect.Field>
        <NativeSelect.Indicator />
    </NativeSelect.Root>
</Field.Root>
                        <Field.Root>
    <Field.Label>Warehouse</Field.Label>
    <NativeSelect.Root>
        <NativeSelect.Field value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
             <option value="">Select Warehouse</option>

                        {warehouses.map((warehouse) => (
                            <option
                                key={warehouse.id}
                                value={warehouse.id}
                            >
                                {warehouse.name}
                            </option>
                        ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
    </NativeSelect.Root>
</Field.Root>






                        <Field.Root>
    <Field.Label>Discount</Field.Label>
    <NativeSelect.Root>
        <NativeSelect.Field value={discount} onChange={(e) => setDiscount(e.target.value)}>
            <option value="">Select Discount</option>
 {discounts.map((discount) => (
                            <option
                                key={discount.id}
                                value={discount.id}
                            >
                                {discount.name} - {discount.discount}%
                            </option>
                        ))}        </NativeSelect.Field>
        <NativeSelect.Indicator />
    </NativeSelect.Root>
</Field.Root>

<Field.Root>
    <Field.Label>Taxes</Field.Label>
    <Stack gap={2}>
        {taxTypes.map(tax => (
            <Checkbox.Root key={tax.id} checked={taxes.includes(tax.id)}
        onCheckedChange={() => handleTaxChange(tax.id)}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>{tax.name} - {tax.rate}%</Checkbox.Label>
    </Checkbox.Root>
        ))}
    </Stack>
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

export default CreateProduct;