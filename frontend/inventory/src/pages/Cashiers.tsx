import { useEffect, useState } from "react";
import { deleteCashier, getCashier, getCashiers } from "../apis/cashiers";
import type { Cashier } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

import { Alert, Spinner, Card, Flex, Text, Table} from "@chakra-ui/react";
import { Plus, Pencil, Trash2} from "lucide-react";
import AppButton from "../components/AppButton";
import AppIconButton from "../components/AppIconButton";
import PageShell from "../components/PageShell";



function Cashiers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    const navigate = useNavigate();
    



    async function fetchCashiers(){
        setError("");
        setLoading(true);
        try{
            const data = await getCashiers();
            setCashiers(data);
        }
        catch(error){
            if(error instanceof Error && error.message == "Not Authorized"){
                setError("You are not authorized to view Cashiers");
                
            }

            else{setError("Failed to load Cashiers");}
        }
        finally{
            setLoading(false);
        }
    }


    async function DeleteCashier(cashier_id: number) {
        try {
            const cashier = await getCashier(cashier_id);
            const confirmed = confirm(`Delete ${cashier.first_name}?`);
            if (!confirmed){
                return ;
            }
            await deleteCashier(cashier_id);

            
            await fetchCashiers();
        }catch (error) {
                if (error instanceof Error && error.message === "Protected") {
                    setError(
                        "Cannot delete this Cashier."
                    );
                }
            }
        }





    useEffect(() => {
        fetchCashiers()
    },[]);

    return (

        <PageShell
    title="Cashiers"
    action={
        <AppButton onClick={() => navigate("/cashiers/create")}>
            <Plus size={16} /> Create Cashier
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
    ) : cashiers.length === 0 ? (
        <Text color="gray.500">No cashiers yet.</Text>
    ) : (
        <Card.Root>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>First Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Second Name</Table.ColumnHeader>
                            <Table.ColumnHeader >Branch Name</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {cashiers.map(cashier => (
                            <Table.Row key={cashier.id}>

                                <Table.Cell>{cashier.first_name}</Table.Cell>
                                <Table.Cell>{cashier.second_name}</Table.Cell>
                              
                                <Table.Cell>{cashier.branch_name}</Table.Cell>

                           
                                <Table.Cell>
                                    <Flex justify="flex-end" gap={1}>
                                   
                                        <AppIconButton label="Edit cashier" intent="secondary"
                                            onClick={() => navigate(`/cashiers/${cashier.id}/edit`)}>
                                            <Pencil size={16} />
                                        </AppIconButton>
                                        <AppIconButton label="Delete cashier" intent="danger"
                                            onClick={() => DeleteCashier(cashier.id)}>
                                            <Trash2 size={16} />
                                        </AppIconButton>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
        </Card.Root>
    )}
</PageShell>


       
    );
}

export default Cashiers;