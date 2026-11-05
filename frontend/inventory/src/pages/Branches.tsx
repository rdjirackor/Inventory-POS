import { useEffect, useState } from "react";
import {  deleteBranch, getBranch, getBranches } from "../apis/branches";
import type { Branch } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";

function Branches() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);

    async function fetchBranches() {
        setError("");
        setLoading(true);

        try {
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            setError("Failed to load Branches");
        } finally {
            setLoading(false);
        }
    }

    async function DeleteBranch(branch_id:number) {
        try {
            const branch = await getBranch(branch_id);
            const confirmed = confirm(`Delete ${branch.name}?`);
            if (!confirmed){
                return ;
            }
            await deleteBranch(branch_id);

            await fetchBranches();
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
        fetchBranches();
    }, []);

    return (
        <div>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <div className="fetch_table">

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {branches.map((branch) => (
                        <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.location}</td>
                            <td>
                                <button onClick={() => navigate(`/branches/${branch.id}/edit`)}>Update</button>
                                <button onClick={()=> DeleteBranch(branch.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="create_button">
                <button onClick={()=>{navigate(`/branches/create`)}}>Create</button>
            </div>
            </div>
        </div>
    );
}

export default Branches;