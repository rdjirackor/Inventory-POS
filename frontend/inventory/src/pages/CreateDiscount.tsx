import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDiscount } from "../apis/discounts";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import FormField from "../components/FormField";



function CreateDiscount() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [discount, setDiscount] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createDiscount(
                name,
                Number(discount),
            );

            navigate("/discounts");

        } catch (error) {
            setError("Failed to create Discount");
            console.error(error);

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

                                    <FormField label="Name" value={name} onChange={setName} />
                                    <FormField label="Discount" value={discount} onChange={setDiscount} />




                                </SimpleGrid>
                                </Card.Body>
                                </Card.Root>

                

                
      <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/discount")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating Discount...">
                Create Discount
            </AppButton>
        </Flex>

            </form>
        </div>
    );
}

export default CreateDiscount;