import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Customer } from "../interfaces/interfaces";
import { getCustomer, patchCustomer } from "../apis/customers";

import { Card,Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";

function UpdateCustomer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCustomer() {
            try {
                const data = await getCustomer(Number(id));
                setCustomer(data);
            } catch (error) {
                setError("Failed to load Customer");
            } finally {
                setLoading(false);
            }
        }

        fetchCustomer();
    }, [id]);

    function handleChange(
        field: keyof Customer,
        value: string | number
    ) {
        if (!customer) return;

        setCustomer({
            ...customer,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!customer) return;

        setError("");
        setSaving(true);

        try {
            await patchCustomer(
                customer.id,
                customer.first_name,
                customer.second_name,
                Number(customer.credit_balance),
                Number(customer.reward_points)
            );

            navigate("/customers");
        } catch (error) {
            setError("Failed to update customer");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading customer...</p>;
    }

    if (error && !customer) {
        return <p>{error}</p>;
    }

    if (!customer) {
        return <p>Customer not found</p>;
    }

    return (


          <div>
        
                    {error && <p>{error}</p>}
        <PageShell title="Edit Product" maxW="860px">
     
                    <form onSubmit={handleSubmit}>
        
                        <Card.Root>
                            <Card.Body gap={4}>
                                <Heading size="md">Basic info</Heading>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <FormField label="Name" value={customer.first_name} onChange={(val) =>
                                    handleChange("first_name", val)} />

                                    <FormField label="Second Name" value={customer.second_name} onChange={(val) =>
                                    handleChange("second_name", val)} />


                                    <FormField label="Credit Balance" value={customer.credit_balance} onChange={(val) =>
                                    handleChange("credit_balance", val)} />


                                    <FormField label="Reward Points" value={customer.reward_points} onChange={(val) =>
                                    handleChange("reward_points", val)} />
                                              
                                                
                                </SimpleGrid>
                            </Card.Body>
                        </Card.Root>
        
        
        <Flex justify="flex-end" gap={3}>
            <AppButton type="button" intent="secondary" onClick={() => navigate("/customers")}>
                Cancel
            </AppButton>
            <AppButton type="submit" loading={saving} loadingText="Updating...">
                Save Changes
            </AppButton>
        </Flex>
                      
        
                    </form>
                    </PageShell>
                </div>
      
    );
}

export default UpdateCustomer;