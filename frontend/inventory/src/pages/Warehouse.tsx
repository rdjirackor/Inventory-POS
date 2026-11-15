import { useEffect, useState } from "react";
import {  deleteWarehouse, getWarehouse, getWarehouses } from "../apis/warehouses";
import type { Warehouse } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";

function Warehouses() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    async function fetchWarehouses() {
        setError("");
        setLoading(true);

        try {
            const data = await getWarehouses();
            setWarehouses(data);
        } catch (error) {
            setError("Failed to load Warehouses");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteWarehouse(warehouse_id:number) {
        try {
            const warehouse = await getWarehouse(warehouse_id);
            const confirmed = confirm(`Delete ${warehouse.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteWarehouse(warehouse_id);

            await fetchWarehouses();
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
        fetchWarehouses();
    }, []);

    return (
         <PageShell
            title="Warehouses"
            action={
                <AppButton onClick={() => navigate("/warehouses/create")}>
                    <Plus size={16} /> Create Warehouse
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
            ) : warehouses.length === 0 ? (
                <Text color="gray.500">No warehouses yet.</Text>
            ) : (
                <Card.Root>
                    <Table.ScrollArea>
                        <Table.Root interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                                    <Table.ColumnHeader>Location</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                             
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {warehouses.map(warehouse => (
                                    <Table.Row key={warehouse.id}>
        
                                        <Table.Cell>{warehouse.name}</Table.Cell>
                                        <Table.Cell>{warehouse.location}</Table.Cell>
                                      
        
                                   
                                        <Table.Cell>
                                            <Flex justify="flex-end" gap={1}>
                                           
                                                <AppIconButton label="Edit warehouse" intent="secondary"
                                                    onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}>
                                                    <Pencil size={16} />
                                                </AppIconButton>
                                                <AppIconButton label="Delete warehouse" intent="danger"
                                                    onClick={() => DeleteWarehouse(warehouse.id)}>
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

export default Warehouses;