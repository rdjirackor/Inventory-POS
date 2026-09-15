import { useEffect, useState } from "react";
import { getCashiers } from "../apis/cashiers";
import type { Cashier } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";


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
    useEffect(() => {
        fetchCashiers()
    },[]);

    return (
        <div>
            <h1>Cashiers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}


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
                            <button onClick={() => navigate(`/cashiers/${cashier.id}/edit`)}>
                                Update
                            </button>     
                        </td>

                        </tr>
                    ))}
                </tbody>
            </table>)}

        </div>
    );
}

export default Cashiers;