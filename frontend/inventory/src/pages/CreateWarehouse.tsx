import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWarehouse } from "../apis/warehouses";



function CreateWarehouse() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createWarehouse(
                name,
                location,
            );

            navigate("/warehouses");

        } catch (error) {
            setError("Failed to create Warehouse");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>
            <h1>Create Warehouse</h1>

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
                    <label>Location</label>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Warehouse"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/warehouses")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateWarehouse;