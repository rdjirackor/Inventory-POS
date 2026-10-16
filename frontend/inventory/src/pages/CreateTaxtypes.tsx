import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTax } from "../apis/taxes";



function CreateTax() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [rate, setRate] = useState("");
    const [status, setStatus] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createTax(
                name,
                Number(rate),
                status,
            );

            navigate("/taxtypes");

        } catch (error) {
            setError("Failed to create Taxtype");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>
            <h1>Create TaxType</h1>

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
                    <label>Rate</label>
                    <input
                        type ="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                </div>

                <div>
                    <label>
                    <input
                        type ="checkbox"
                        checked={status}
                        onChange={(e) => setStatus(e.target.checked)}
                    />
                    Active
                    </label>
                </div>



                

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create TaxType"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/taxtypes")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateTax;