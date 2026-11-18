import { useEffect, useState } from "react";
import { getDiscounts, updateDiscount } from "../apis/discounts";
import type { Discount } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import AppButton from "../components/AppButton";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";

function UpdateDiscount() {
    const { id } = useParams();
    const navigate = useNavigate();


    const [discount, setDiscount] = useState<Discount | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDiscount() {
            try {
                const discounts = await getDiscounts();

                const foundDiscount = discounts.find(
                    (discount) => discount.id === Number(id)
                );

                if (!foundDiscount) {
                    setError("Discount not found");
                    return;
                }

                setDiscount(foundDiscount);
            } catch (error) {
                setError("Failed to load discount");
            } finally {
                setLoading(false);
            }
        }

        fetchDiscount();
    }, [id]);

    function handleNameChange(value: string) {
        if (!discount) return;

        setDiscount({
            ...discount,
            name: value,
        });
    }
    function handleDiscountChange(value: string) {
        if (!discount) return;

        setDiscount({
            ...discount,
            discount: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!discount) return;

        setError("");
        setSaving(true);

        try {
            await updateDiscount(
                discount.id,
                discount.name,
                Number(discount.discount),
            );

            navigate("/discounts");
        } catch (error) {
            setError("Failed to update discount");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading discount...</p>;
    }

    if (!discount) {
        return <p>{error || "Discount not found"}</p>;
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
                            <FormField label="Discount Name" value={discount.name} onChange={(e) => handleNameChange(e)} />

                            <FormField label="Discount Percentage" value={discount.discount} onChange={(e)=> handleDiscountChange(e)} />

                  

                </SimpleGrid>
                </Card.Body>
                </Card.Root>
                

     <Flex justify="flex-end" gap={3}>
    <AppButton type="button" intent="secondary" onClick={() => navigate("/discounts")}>
        Cancel
    </AppButton>
    <AppButton type="submit" loading={saving} loadingText="Updating Discount...">
        Save Changes
    </AppButton>
</Flex>
               
            </form>
            </PageShell>

            </div>
    );
}

export default UpdateDiscount;