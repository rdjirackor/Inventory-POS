import { useEffect, useState } from "react";
import { deleteCustomer, getCustomer, getCustomers } from "../apis/customers";
import type { Customer } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";



function Customers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const navigate = useNavigate();
    



    async function fetchCustomers(){
        setError("");
        setLoading(true);
        try{
            const data = await getCustomers();
            setCustomers(data);
        }
        catch(error){
            if(error instanceof Error && error.message == "Not Authorized"){
                setError("You are not authorized to view Customers");
                
            }

            else{setError("Failed to load Customers");}
        }
        finally{
            setLoading(false);
        }
    }


    async function DeleteCustomer(customer_id: number) {
        try {
            const customer = await getCustomer(customer_id);
            const confirmed = confirm(`Delete ${customer.first_name}?`);
            if (!confirmed){
                return ;
            }
            await deleteCustomer(customer_id);

            
            await fetchCustomers();
        }catch (error) {
                if (error instanceof Error && error.message === "Protected") {
                    setError(
                        "Cannot delete this Customer."
                    );
                }
            }
        }





    useEffect(() => {
        fetchCustomers()
    },[]);

    return (
        <div>
            <h1>Customers</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">


            {!error && (<table>
                <thead>
                    <tr>
                    <th>First Name</th>
                    <th>Second Name</th>
                    <th>Credit Balance Employed</th>
                    <th>Reward Points</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer)=>(
                        <tr key={customer.id}>
                        <td>{customer.first_name}</td>
                        <td>{customer.second_name}</td>
                        <td>{customer.credit_balance}</td>
                        <td>{customer.reward_points}</td>
                        <td>
                            <button onClick={() => navigate(`/customers/${customer.id}/edit`)}>Update</button>
                            <button onClick={() => DeleteCustomer(customer.id)}>Delete</button>
                        </td>

                        </tr>
                    ))}
                </tbody>
            </table>)}

            </div>

            <button onClick={() => navigate("/customers/create")}>
    Create Customer
</button>

        </div>
    );
}

export default Customers;