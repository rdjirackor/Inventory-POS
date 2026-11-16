import { useEffect, useState } from "react";
import type { StockMovement, User } from "../interfaces/interfaces";
import { getStockMovements } from "../apis/stock_movements";
import { getUsers } from "../apis/users";

import { Alert, Spinner, Card, Text, Table} from "@chakra-ui/react";
import PageShell from "../components/PageShell";


function ViewStockMovements(){
    const [movements, setMovements] = useState<StockMovement []>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [users, setUsers] = useState<User[]>([]);
    
    

    async function fetchMovements() {
        setError("");
        setLoading(true);
        try{
            const movementsData = (await getStockMovements()).toReversed();
            const usersData = await getUsers();
            setMovements(movementsData);
            setUsers(usersData);

            
        }
        catch(error){
            setError("Failed to fetch stock movements");
        }
        finally{
            setLoading(false);
            }
        }

        useEffect(()=>{
            fetchMovements();
        },[]);

        return(

              <PageShell
    title="Movements"
   
>
    {error && (
        <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
    )}

    {loading ? (
        <Spinner />
    ) : movements.length === 0 ? (
        <Text color="gray.500">No movements yet.</Text>
    ) : (
        
        <Card.Root>
                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            
                            <Table.ColumnHeader >Product</Table.ColumnHeader>
                            <Table.ColumnHeader>Performed By</Table.ColumnHeader>
                            <Table.ColumnHeader>Movement Type</Table.ColumnHeader>

                            <Table.ColumnHeader >Quantity</Table.ColumnHeader>
                            <Table.ColumnHeader >Reason</Table.ColumnHeader>
                     
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                       {movements.map(movement => {
    const user = users.find(u => u.id === movement.performed_by);

    return (
                    <Table.Row key={movement.id}>
                        <Table.Cell>{movement.product_name}</Table.Cell>
                        <Table.Cell>   Staff: {user
                                ? user.username
                                : movement.performed_by === null
                                    ? "System / Unassigned"
                                    : "User not found"}</Table.Cell>
                        <Table.Cell>{movement.movement_type}</Table.Cell>
                                
                              
                        <Table.Cell>{movement.quantity}</Table.Cell>
                        <Table.Cell>{movement.reason}</Table.Cell>

                    </Table.Row>
    );
})}
                    </Table.Body>
                </Table.Root>
        </Card.Root>
    )}
</PageShell>
           
        )
}
export default ViewStockMovements;