
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReturn, getReturns } from "../apis/returns";
import type { Return } from "../interfaces/interfaces";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";



export default function ViewReturns() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchReturns() {
            try {
                const data = await getReturns();
                setReturns(data as Return[]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load returns."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchReturns();
    }, []);

        

    if (loading) return <p>Loading returns...</p>;

    return (
        <PageShell
    title="Returns"
    action={
        <AppButton onClick={() => navigate("/returns/create")}>
            <Plus size={16} /> Create Return
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
    ) : returns.length === 0 ? (
        <Text color="gray.500">No returns yet.</Text>
    ) : (
        <Card.Root>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Username</Table.ColumnHeader>
                            <Table.ColumnHeader>Order ID</Table.ColumnHeader>
                            <Table.ColumnHeader >Product Name</Table.ColumnHeader>

                            <Table.ColumnHeader >Quantity</Table.ColumnHeader>
                            <Table.ColumnHeader >Reason</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {returns.map(item => (
                            <Table.Row key={item.id}>

                                <Table.Cell>{item.customer_name ? item.customer_name: "Unregistered Customer"}</Table.Cell>
                                <Table.Cell>{item.order_history}</Table.Cell>
                              
                                <Table.Cell>{item.product_name}</Table.Cell>
                                <Table.Cell>{item.quantity}</Table.Cell>
                                <Table.Cell>{item.reason}</Table.Cell>

                           
                         
                                  
    
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
        </Card.Root>
    )}
</PageShell>
    );
}
