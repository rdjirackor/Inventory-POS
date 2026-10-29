import { useEffect, useState } from "react";
import { deleteDiscount, getDiscounts, getDiscount } from "../apis/discounts";
import type { Discount } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

function Discounts() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    async function fetchDiscounts() {
        setError("");
        setLoading(true);

        try {
            const data = await getDiscounts();
            setDiscounts(data);
        } catch (error) {
            setError("Failed to load Discounts");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteDiscount(discount_id:number) {
        try {
            const discount = await getDiscount(discount_id);
            const confirmed = confirm(`Delete ${discount.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteDiscount(discount_id);

            await fetchDiscounts();
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
        fetchDiscounts();
    }, []);

    return (
        <div>
            <h1>Discounts</h1>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <Button>Test</Button>
            <div className="fetch_table">

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Discounts</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {discounts.map((discount) => (
                        <tr key={discount.id}>
                            <td>{discount.name}</td>
                            <td>{discount.discount}</td>
                            <td>
                                <button onClick={() => navigate(`/discounts/${discount.id}/edit`)}>Update</button>
                                <button onClick={()=> DeleteDiscount(discount.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="create_discount_button">
                <button onClick={()=>{navigate(`/discounts/create`)}}>Create</button>
            </div>
            </div>
        </div>
    );
}

export default Discounts;