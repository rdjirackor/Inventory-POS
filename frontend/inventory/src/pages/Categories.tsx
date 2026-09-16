import { useEffect, useState } from "react";
import { deleteCategory, getCategories, getCategory } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import "../styles/Pages.css"

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

    async function DeleteCategory(category_id:number) {
        try {
            const category = await getCategory(category_id);
            const confirmed = confirm(`Delete ${category.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteCategory(category_id);

            await fetchCategories();
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
        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Categories</h1>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">

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
                                <button onClick={() => navigate(`/categories/${category.id}/edit`)}>Update</button>
                                <button onClick={()=> DeleteCategory(category.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="create_category_button">
                <button onClick={()=>{navigate(`/categories/create`)}}>Create</button>
            </div>
            </div>
        </div>
    );
}

export default Categories;