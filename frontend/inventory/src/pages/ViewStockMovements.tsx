import { useEffect, useState } from "react";
import type { StockMovement } from "../interfaces/interfaces";
import { getStockMovements } from "../apis/stock_movements";

function ViewStockMovements(){
    const [movements, setMovements] = useState<StockMovement []>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");

    async function fetchMovements() {
        setError("");
        setLoading(true);
        try{
            const movementsData = await getStockMovements();
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
                    
                    <ul>
                        {movements.map(movement => (
                            <li key={movement.id}>
                                {movement.id}
                                {movement.performed_by}
                                {movement.movement_type}
                                {movement.product}
                                {movement.quantity}
                                {movement.reason}
                                </li>
                        ))}
                        <li>
                            
                        </li>
                    </ul>
                </div>

            </div>
        )
}
export default ViewStockMovements;