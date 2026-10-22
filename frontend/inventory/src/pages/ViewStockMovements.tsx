import { useEffect, useState } from "react";
import type { Cashier, StockMovement, User } from "../interfaces/interfaces";
import { getStockMovements } from "../apis/stock_movements";
import { getUsers } from "../apis/users";

function ViewStockMovements(){
    const [movements, setMovements] = useState<StockMovement []>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [users, setUsers] = useState<User [] >([]);
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    

    async function fetchMovements() {
        setError("");
        setLoading(true);
        try{
            const movementsData = await getStockMovements();
            const usersData = await getUsers();
            setUsers(usersData);
            setMovements(movementsData);

            
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
        },([]));

        return(
            <div>
                <h1>Stock Movements</h1>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <div className="stocks">

                    {movements.map(movement => {
                        const cashier = cashiers.find(
                            cashier => cashier.id === movement.performed_by,
                            console.log(movement.performed_by)
                        );

                        const user = users.find(
                            user => user.id === cashier?.user
                        );

                        return (
                            <li key={movement.id}>
                                <p>Staff: {cashier? `${cashier.first_name} ${cashier.second_name}` : "No linked user"}</p>
                                <p>Movement: {movement.movement_type}</p>
                                <p>Product ID: {movement.product}</p>
                                <p>Quantity: {movement.quantity}</p>
                                <p>Reason: {movement.reason}</p>
                            </li>
                        );
                    })}
                    
                    
                </div>

            </div>
        )
}
export default ViewStockMovements;