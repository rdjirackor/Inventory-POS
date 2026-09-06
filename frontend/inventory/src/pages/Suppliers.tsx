import { useEffect, useState } from "react";
import { getSuppliers } from "../apis/suppliers";
import type { Supplier } from "../interfaces/interfaces";

function Suppliers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [Suppliers, setSuppliers] = useState<Supplier[]>([]);
    



    async function fetchSuppliers(){
        setError("");
        setLoading(true)
        try{
            const data = await getSuppliers();
            setSuppliers(data);
        }
        catch(error){
            setError("Failed to load Suppliers");
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchSuppliers()
    },[]);
    console.log(Suppliers);
    return (
        <div>
            <h1>Suppliers</h1>

        </div>
    );
}

export default Suppliers;