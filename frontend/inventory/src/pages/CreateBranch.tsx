import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBranch } from "../apis/branches";
import { Card, Heading, SimpleGrid, Field, Input, Flex } from "@chakra-ui/react";
import AppButton from "../components/AppButton";



function CreateBranch() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createBranch(
                name,
                location,
            );

            navigate("/branches");

        } catch (error) {
            setError("Failed to create Branch");
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
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <Field.Root>
                <Field.Label>Name</Field.Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field.Root>
            <Field.Root>
                <Field.Label>Location</Field.Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field.Root>
                               
                        
        </SimpleGrid>
    </Card.Body>
</Card.Root>

<Flex justify="flex-end" gap={3}>
    <AppButton type="button" intent="secondary" onClick={() => navigate("/branches")}>
        Cancel
    </AppButton>
    <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating...">
        Create Branch
    </AppButton>
</Flex>

</form>
            

            
        </div>
    );
}

export default CreateBranch;