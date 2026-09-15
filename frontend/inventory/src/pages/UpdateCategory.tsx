import { useEffect, useState } from "react";
import { getCategories, updateCategory } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";

function UpdateCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCategory() {
            try {
                const categories = await getCategories();

                const foundCategory = categories.find(
                    (category) => category.id === Number(id)
                );

                if (!foundCategory) {
                    setError("Category not found");
                    return;
                }

                setCategory(foundCategory);
            } catch (error) {
                setError("Failed to load category");
            } finally {
                setLoading(false);
            }
        }

        fetchCategory();
    }, [id]);

    function handleChange(value: string) {
        if (!category) return;

        setCategory({
            ...category,
            name: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!category) return;

        setError("");
        setSaving(true);

        try {
            await updateCategory(
                category.id,
                category.name
            );

            navigate("/categories");
        } catch (error) {
            setError("Failed to update category");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading category...</p>;
    }

    if (!category) {
        return <p>{error || "Category not found"}</p>;
    }

    return (
        <div>
            <h1>Update Category</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Category Name</label>

                    <input
                        value={category.name}
                        onChange={(e) =>
                            handleChange(e.target.value)
                        }
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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

export default UpdateCategory;