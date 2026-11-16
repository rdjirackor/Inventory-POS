
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSupplier } from "../apis/suppliers";
import { type Product } from "../interfaces/interfaces";
import { getProducts } from "../apis/products";

import { Card, Field, Flex, Heading, Input, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import CheckboxField from "../components/CheckboxField";

function CreateSupplier() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [taxNumber, setTaxNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOptions() {
            try {
                const productData = await getProducts();
                setProducts(productData);
            } catch (error) {
                console.error(error);
                setError("Failed to load products");
            }
        }

        fetchOptions();
    }, []);


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createSupplier(
                name,
                selectedProducts,
                phoneNumber,
                email,
                address,
                contactPerson,
                taxNumber
            );

            navigate("/suppliers");
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create supplier"
            );
        } finally {
            setLoading(false);
        }
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
                                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                                </Field.Root>

                                <CheckboxField
                                    label="Products Supplied"
                                    options={products.map((p) => ({ value: p.id, label: p.name }))}
                                    selected={selectedProducts}
                                    onChange={setSelectedProducts}
                                />



                                  <Field.Root>
                                    <Field.Label>Phone Number</Field.Label>
                                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                                </Field.Root>
                               
                                            <Field.Root>
                                    <Field.Label>Email</Field.Label>
                                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Address</Field.Label>
                                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Contact Person</Field.Label>
                                    <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                                </Field.Root>

                                    <Field.Root>
                                    <Field.Label>Tax Number</Field.Label>
                                    <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
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

export default CreateSupplier;
