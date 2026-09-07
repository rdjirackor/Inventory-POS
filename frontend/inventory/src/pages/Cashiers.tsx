import { useEffect, useState } from "react";
import { getCashiers } from "../apis/cashiers";
import type { Cashier } from "../interfaces/interfaces";

function Cashiers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    



    async function fetchCashiers(){
        setError("");
        setLoading(true);
        try{
            const data = await getCashiers();
            setCashiers(data);
        }
        catch(error){
            setError("Failed to load Cashiers");
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchCashiers()
    },[]);
    console.log(Cashiers);

    return (
        <div>
            <h1>Cashiers</h1>

        </div>
    );
}

export default Cashiers;