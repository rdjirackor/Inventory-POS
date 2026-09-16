import { useEffect, useState } from "react";
import { deleteSupplier, getSuppliers } from "../apis/suppliers";
import type { Supplier } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import "../styles/Pages.css"

function Suppliers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    const navigate = useNavigate();


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

    async function DeleteSupplier(supplier_id: number) {
        try {
            await deleteSupplier(supplier_id);
            await fetchSuppliers();
        } catch (error) {
            if (error instanceof Error && error.message === "Protected") {
                setError(
                    "Cannot delete this supplier because it is used in existing orders or stock movements."
                );
            }
        }
    }





    useEffect(() => {
        fetchSuppliers()
    },[]);

   function UpdateSuppliers(supplier_id: number){
    navigate(`/suppliers/${supplier_id}/edit`);
   }

    return (
        <div>
            <h1>Suppliers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">

           <table>
                <thead>
        <tr>
            <th>Name</th>
            <th>Products</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Address</th>
            <th>Contact Person</th>
            <th>Tax Number</th>
            <th>Actions</th>
        </tr>
    </thead>

    <tbody>
        {suppliers.map((supplier) => (
            <tr key={supplier.id}>
                
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
                <td>
                    <button onClick={() => UpdateSuppliers(supplier.id)}>Update</button>
                    <button onClick={() => DeleteSupplier(supplier.id)}>Delete</button>     
                </td>
            </tr>
        ))}
    </tbody>
</table>

        </div>
        </div>
    );
}

export default Suppliers;