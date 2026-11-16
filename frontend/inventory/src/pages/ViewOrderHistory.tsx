
import { useEffect, useState } from "react";
import type { OrderHistory } from "../interfaces/interfaces";
import { getOrderHistories } from "../apis/order_history";

import { Alert, Spinner, Card, Text, Table} from "@chakra-ui/react";
import { useSettings } from "../hooks/useSettings";
import PageShell from "../components/PageShell";


const timeLabel = (dateStr: string): string => {
            const date = new Date(dateStr);
            const diffMs = Date.now() - date.getTime();
            const mins = Math.floor(diffMs / 60000);
            if (mins < 1) return "Just now";
             if (mins < 60) return `${mins} min ago`;
               const hrs = Math.floor(mins / 60);
               if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
                    return date.toLocaleDateString();
                }; 


export default function ViewHistories() {
    const [histories, setHistories] = useState<OrderHistory[]>([]);
    const [loadingLocal, setLoading] = useState(true);
    const [errorLocal, setError] = useState("");

    const { settingsData } = useSettings();



    useEffect(() => {
        async function fetchHistories() {
            try {
                const data = await getOrderHistories();
                setHistories(data as OrderHistory[]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load histories."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchHistories();
    }, []);

    if (loadingLocal) return <p>Loading histories...</p>;

    return (

        <PageShell
    title="Histories"

>
    {errorLocal && (
        <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>{errorLocal}</Alert.Title>
        </Alert.Root>
    )}

    {loadingLocal ? (
        <Spinner />
    ) : histories.length === 0 ? (
        <Text color="gray.500">No histories yet.</Text>
    ) : (
        <Card.Root>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Customer Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Amount Paid</Table.ColumnHeader>
                            
                            <Table.ColumnHeader>Time of Purchase</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {histories.map(item => (
                            <Table.Row key={item.id}>

                               

                                <Table.Cell
                                    
                                    color={
                                        item.customer_name
                                        ? "green"
                                        : "white"
                                    }>
                                
                                    {item.customer_name || "Unregistered Customer"}
                            </Table.Cell>   
                            <Table.Cell>{settingsData?.currency} {item.amount_paid}</Table.Cell>
                                <Table.Cell>{timeLabel(item.time_of_purchase)}</Table.Cell>
                                  
                         
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
        </Card.Root>
    )}
</PageShell>
        
    );
}
