import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TaxType } from "../interfaces/interfaces";
import { deleteTax, getTax, getTaxes } from "../apis/taxes";



function Taxtype (){
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error,setError] = useState("");
    const [taxtypes, setTaxTypes] =useState<TaxType[]>([]);

    async function fetchTaxtype(){
        setError("");
        setLoading(true);

        try{

        const data = await getTaxes();
        setTaxTypes(data);
         }
        catch (error){
            setError("Failed to load tax types.")
        }
        finally{
            setLoading(false);
        }
    }
    async function DeleteTaxes(tax_id:number) {
            try {
                const tax = await getTax(tax_id);
                const confirmed = confirm(`Delete ${tax.name}?`);
                if (!confirmed){
                    return ;
                }
                await deleteTax(tax_id);
    
                await fetchTaxtype();
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
                fetchTaxtype();
            }, []);
        
            return (
                <div>
                    <h1>Tax Types</h1>
        
                    {loading && <p>Loading...</p>}
                    {error && <p>{error}</p>}
                    <div className="fetch_table">
        
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Rate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
        
                        <tbody>
                            {taxtypes.map((taxtype) => (
                                <tr key={taxtype.id}>
                                    <td>{taxtype.name}</td>
                                    <td>{taxtype.rate}</td>
                                    <td>{taxtype.active}</td>
                                    <td>
                                        <button onClick={() => navigate(`/taxtypes/${taxtype.id}/edit`)}>Update</button>
                                        <button onClick={()=> DeleteTaxes(taxtype.id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
        
                    <div className="create_entity_button">
                        <button onClick={()=>{navigate(`/taxtypes/create`)}}>Create</button>
                    </div>
                    </div>
                </div>
            );
        }
        
        export default Taxtype;

    


