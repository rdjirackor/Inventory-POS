import { useEffect, useState } from "react";
import { getCategories } from "../apis/categories";
import type { Category } from "../interfaces/interfaces";

function Categories() {
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");
    const [Categories, setCategories] = useState<Category[]>([]);
    



    async function fetchCategories(){
        setError("");
        setLoading(true);
        try{
            const data = await getCategories();
            setCategories(data);
        }
        catch(error){
            setError("Failed to load Categories");
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchCategories()
    },[]);
    console.log(Categories);
    return (
        <div>
            <h1>Categories</h1>

        </div>
    );
}

export default Categories;