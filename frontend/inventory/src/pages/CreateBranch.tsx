import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBranch } from "../apis/branches";



function CreateBranch() {
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
            await createBranch(
                name,
                location,
            );

            navigate("/branches");

        } catch (error) {
            setError("Failed to create Branch");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>

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
                    {loading ? "Creating..." : "Create Branch"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/branches")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateBranch;