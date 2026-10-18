import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDiscount } from "../apis/discounts";



function CreateDiscount() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [discount, setDiscount] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createDiscount(
                name,
                Number(discount),
            );

            navigate("/discounts");

        } catch (error) {
            setError("Failed to create Discount");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>
            <h1>Create Discount</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label>Discount</label>
                    <input
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                </div>

                

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Discount"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/discounts")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateDiscount;