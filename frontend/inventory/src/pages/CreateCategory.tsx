import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../apis/categories";
import FormField from "../components/FormField";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";



function CreateCategory() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createCategory(
                name,
            );

            navigate("/categories");

        } catch (error) {
            setError("Failed to create category");
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
             </SimpleGrid>
                        </Card.Body>
                    </Card.Root>              

              
                  <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/categories")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating...">
                Create Category
            </AppButton>
        </Flex>

            </form>
        </div>
    );
}

export default CreateCategory;
