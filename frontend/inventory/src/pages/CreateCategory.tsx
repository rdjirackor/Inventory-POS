import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../apis/categories";



function CreateCategory() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createCategory(
                name,
            );

            navigate("/categories");

        } catch (error) {
            setError("Failed to create category");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>
            <h1>Create Category</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Category"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/categories")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateCategory;