import { useEffect, useState } from "react";
import { deleteCustomer, getCustomer, getCustomers } from "../apis/customers";
import type { Customer } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";



function Customers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    



    async function fetchCustomers(){
        setError("");
        setLoading(true);
        try{
            const data = await getCustomers();
            setCustomers(data);
        }
        catch(error){
            if(error instanceof Error && error.message == "Not Authorized"){
                setError("You are not authorized to view Customers");
                
            }

            else{setError("Failed to load Customers");}
        }
        finally{
            setLoading(false);
        }
    }


    async function DeleteCustomer(customer_id: number) {
        try {
            const customer = await getCustomer(customer_id);
            const confirmed = confirm(`Delete ${customer.first_name}?`);
            if (!confirmed){
                return ;
            }
            await deleteCustomer(customer_id);

            
            await fetchCustomers();
        }catch (error) {
                if (error instanceof Error && error.message === "Protected") {
                    setError(
                        "Cannot delete this Customer."
                    );
                }
            }
        }





    useEffect(() => {
        fetchCustomers()
    },[]);

    return (
        <PageShell
    title="Customers"
    action={
        <AppButton onClick={() => navigate("/customers/create")}>
            <Plus size={16} /> Create Customer
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
    ) : customers.length === 0 ? (
        <Text color="gray.500">No customers yet.</Text>
    ) : (
        <Card.Root>
            <Table.ScrollArea>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>First Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Second Name Number</Table.ColumnHeader>
                            <Table.ColumnHeader>Reward Points</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Credit Balance</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {customers.map(customer => (
                            <Table.Row key={customer.id}>

                                <Table.Cell>{customer.first_name}</Table.Cell>
                                <Table.Cell>{customer.second_name}</Table.Cell>
                                <Table.Cell>{customer.reward_points}</Table.Cell>
                              
                                <Table.Cell>{customer.credit_balance}</Table.Cell>
                           
                                <Table.Cell>
                                    <Flex justify="flex-end" gap={1}>
                                     
                                        <AppIconButton label="Edit customer" intent="secondary"
                                            onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                                            <Pencil size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Delete customer" intent="danger"
                                            onClick={() => DeleteCustomer(customer.id)}>
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

export default Customers;