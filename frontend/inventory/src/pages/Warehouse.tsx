import { useEffect, useState } from "react";
import {  deleteWarehouse, getWarehouse, getWarehouses } from "../apis/warehouses";
import type { Warehouse } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import "../styles/Pages.css"

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
        <div>
            <h1>Warehouses</h1>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {warehouses.map((warehouse) => (
                        <tr key={warehouse.id}>
                            <td>{warehouse.name}</td>
                            <td>{warehouse.location}</td>
                            <td>
                                <button onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}>Update</button>
                                <button onClick={()=> DeleteWarehouse(warehouse.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="create_button">
                <button onClick={()=>{navigate(`/warehouses/create`)}}>Create</button>
            </div>
            </div>
        </div>
    );
}

export default Warehouses;