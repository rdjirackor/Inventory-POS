import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTax } from "../apis/taxes";

import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import FormField from "../components/FormField";


function CreateTax() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [rate, setRate] = useState("");
    const [status, setStatus] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createTax(
                name,
                Number(rate),
                status,
            );

            navigate("/taxtypes");

        } catch (error) {
            setError("Failed to create Taxtype");
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
                                            <FormField label="Rate" type="number" value={rate} onChange={setRate} />
                                           <label> <input type="checkbox" checked= {status} onChange={(e) => setStatus(e.target.checked)} /> Active </label>

        
        
        
        
                                        </SimpleGrid>
                                        </Card.Body>
                                        </Card.Root>
        
                        
        
                        
              <Flex justify="flex-end" gap={3}>
                    <AppButton type="button" intent="secondary" onClick={() => navigate("/discount")}>
                        Cancel
                    </AppButton>
                    <AppButton type="submit" loading={loading} disabled={loading} loadingText="Creating Discount...">
                        Create TaxType
                    </AppButton>
                </Flex>
        
                    </form>
                </div>





       
    );
}

export default CreateTax;