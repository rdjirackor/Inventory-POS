import { useEffect, useState } from "react";
import type { StockMovement, User } from "../interfaces/interfaces";
import { getStockMovements } from "../apis/stock_movements";
import { getUsers } from "../apis/users";

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
        },([]));

        return(
            <div>
                <h1>Stock Movements</h1>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <div className="stocks">

                    {movements.map(movement => {

                    const user = users.find(
                        user => user.id === movement.performed_by
                    );

                    

                        return (
                            <li key={movement.id}>
                        <p>
                            Staff: {user
                                ? user.username
                                : movement.performed_by === null
                                    ? "System / Unassigned"
                                    : "User not found"}
                        </p>                               
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