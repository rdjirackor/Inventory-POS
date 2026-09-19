import { useEffect, useState } from "react";
import { deleteCashier, getCashier, getCashiers } from "../apis/cashiers";
import type { Cashier } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import "../styles/Pages.css"



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
        <div>
            <h1>Cashiers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">


            {!error && (<table>
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Second Name</th>
                    <th>Date Employed</th>
                    <th>Branch</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cashiers.map((cashier)=>(
                        <tr key={cashier.id}>
                        <td>{cashier.id}</td>
                        <td>{cashier.first_name}</td>
                        <td>{cashier.second_name}</td>
                        <td>{cashier.date_employed}</td>
                        <td>{cashier.branch_stationed_at}</td>
                        <td>
                            <button onClick={() => navigate(`/cashiers/${cashier.id}/edit`)}>Update</button>
                            <button onClick={() => DeleteCashier(cashier.id)}>Delete</button>
                        </td>

                        </tr>
                    ))}
                </tbody>
            </table>)}

            </div>

        </div>
    );
}

export default Cashiers;