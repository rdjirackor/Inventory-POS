import { useEffect, useState } from "react";
import { getSuppliers } from "../apis/suppliers";
import type { Supplier } from "../interfaces/interfaces";

function Suppliers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    



    async function fetchSuppliers(){
        setError("");
        setLoading(true)
        try{
            const data = await getSuppliers();
            console.log("Supplier API data:", data);
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
    console.log(suppliers);
    return (
        <div>
            <h1>Suppliers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

           <table>
                <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Products</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Address</th>
            <th>Contact Person</th>
            <th>Tax Number</th>
        </tr>
    </thead>

    <tbody>
        {suppliers.map((supplier) => (
            <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.product_names.length > 0
                    ? supplier.product_names.join(",")
                    : "No products"
                    }</td>
                <td>{supplier.phone_number}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td>{supplier.contact_person}</td>
                <td>{supplier.tax_number}</td>
            </tr>
        ))}
    </tbody>
</table>

        </div>
    );
}

export default Suppliers;