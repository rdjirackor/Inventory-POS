import { useEffect, useState } from "react";
import { getCategories } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

function Categories() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    async function fetchCategories() {
        setError("");
        setLoading(true);

        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            setError("Failed to load Categories");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Categories</h1>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>{category.name}</td>

                            <td>
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/categories/${category.id}/edit`
                                        )
                                    }
                                >
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Categories;