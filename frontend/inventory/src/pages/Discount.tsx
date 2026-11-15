import { useEffect, useState } from "react";
import { deleteDiscount, getDiscounts, getDiscount } from "../apis/discounts";
import type { Discount } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";
function Discounts() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    async function fetchDiscounts() {
        setError("");
        setLoading(true);

        try {
            const data = await getDiscounts();
            setDiscounts(data);
        } catch (error) {
            setError("Failed to load Discounts");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteDiscount(discount_id:number) {
        try {
            const discount = await getDiscount(discount_id);
            const confirmed = confirm(`Delete ${discount.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteDiscount(discount_id);

            await fetchDiscounts();
        }
        catch(error){
            if (error instanceof Error && error.message === "Protected") {
                setError(
                    "Cannot delete this"
                );
            }
        }
        
    }

    useEffect(() => {
        fetchDiscounts();
    }, []);

    return (
        <PageShell
            title="Discounts"
            action={
                <AppButton onClick={() => navigate("/discounts/create")}>
                    <Plus size={16} /> Create Discount
                </AppButton>
            }
        >
            {error && (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            )}
        
            {loading ? (
                <Spinner />
            ) : discounts.length === 0 ? (
                <Text color="gray.500">No discounts yet.</Text>
            ) : (
                <Card.Root>
                    <Table.ScrollArea>
                        <Table.Root interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                                    <Table.ColumnHeader>Discount</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                             
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {discounts.map(discount => (
                                    <Table.Row key={discount.id}>
        
                                        <Table.Cell>{discount.name}</Table.Cell>
                                        <Table.Cell>{discount.discount}</Table.Cell>
                                      
        
                                   
                                        <Table.Cell>
                                            <Flex justify="flex-end" gap={1}>
                                           
                                                <AppIconButton label="Edit discount" intent="secondary"
                                                    onClick={() => navigate(`/discounts/${discount.id}/edit`)}>
                                                    <Pencil size={16} />
                                                </AppIconButton>
                                                <AppIconButton label="Delete discount" intent="danger"
                                                    onClick={() => DeleteDiscount(discount.id)}>
                                                    <Trash2 size={16} />
                                                </AppIconButton>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Table.ScrollArea>
                </Card.Root>
            )}
        </PageShell>
       
    );
}

export default Discounts;