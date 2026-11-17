import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Supplier, Product } from "../interfaces/interfaces";
import { getSupplier, patchSupplier } from "../apis/suppliers";
import { getProducts } from "../apis/products";
import { Card, Field, Flex, Heading, Input, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import CheckboxField from "../components/CheckboxField";

function UpdateSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState<number[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);


    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setSaving] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
    async function fetchSupplier() {
        try {
            const data = await getSupplier(Number(id));
            setSupplier(data);

            setProducts(data.products);
            const productData = await getProducts();
            setAvailableProducts(productData);

        } catch (error) {
            setError("Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }

    fetchSupplier();
}, [id]);

   function handleChange(
    field: keyof Supplier,
    value: string | number | number[]
) {
        if (!supplier) return;

        setSupplier({
            ...supplier,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!supplier) return;

    setError("");
    setSaving(true);

    try {
        await patchSupplier(supplier.id, {

            name: supplier.name,
            products: products,
            phone_number: supplier.phone_number,
            email: supplier.email,
            address: supplier.address,
            contact_person: supplier.contact_person,
            tax_number: supplier.tax_number,
        });

        navigate("/suppliers");
    } catch (error) {
        setError("Failed to update supplier");
    } finally {
        setSaving(false);
    }
}

    if (loading) {
        return <p>Loading supplier...</p>;
    }

    if (error && !supplier) {
        return <p>{error}</p>;
    }

    if (!supplier) {
        return <p>Supplier not found</p>;
    }

    return (

         <div>

            {error && <p>{error}</p>}
                                <form onSubmit={handleSubmit}>
                                <Card.Root>
                        <Card.Body gap={4}>
                            <Heading size="md">Basic info</Heading>
                            <SimpleGrid columns={{ base: 2, md: 2 }} gap={4}>

                            
            
                               
                         <Field.Root>
                                    <Field.Label>Supplier Name</Field.Label>
                                    <Input value={supplier.name}  onChange={(e) =>
                       handleChange("name", e.target.value)
                       } />
                                </Field.Root>                           

                                        <Field.Root>
                                    <Field.Label>Phone Number</Field.Label>
                                    <Input value={supplier.phone_number}  onChange={(e) =>
                       handleChange("phone_number", e.target.value)
                       } />
                                </Field.Root>
                              
                               
                                            <Field.Root>
                                    <Field.Label>Email</Field.Label>
                                    <Input value={supplier.email} onChange={(e) =>
                       handleChange("email", e.target.value)
                       } />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Address</Field.Label>
                                    <Input value={supplier.address} onChange={(e) =>
                       handleChange("address", e.target.value)
                       } />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Contact Person</Field.Label>
                                    <Input value={supplier.contact_person} onChange={(e) =>
                       handleChange("contact_person", e.target.value)
                       } />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Tax Number</Field.Label>
                                    <Input value={supplier.tax_number} onChange={(e) =>
                       handleChange("tax_number", e.target.value)
                       } />
                                </Field.Root>


                    <CheckboxField
    label="Products"
    options={availableProducts.map((p) => ({ value: p.id, label: p.name }))}
    selected={supplier.products}
    onChange={(selected) => handleChange("products", selected)}
/>
                                          
                                       
                                           
                                          
                                       
                                            
                                            
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>
                    
                    <Flex justify="flex-end" gap={3}>
                        <AppButton type="button" intent="secondary" onClick={() => navigate("/suppliers")}>
                            Cancel
                        </AppButton>
                        <AppButton type="submit" loading={loading} disabled={loading} loadingText="Updating...">
                            Update Supplier
                        </AppButton>
                    </Flex>
                    
                    </form>

          
        </div>
    );
}

export default UpdateSupplier;