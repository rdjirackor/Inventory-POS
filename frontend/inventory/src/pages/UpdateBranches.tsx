import { useEffect, useState } from "react";
import { getBranches, updateBranch } from "../apis/branches";
import type { Branch } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";

function UpdateBranch() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBranch() {
            try {
                const branches = await getBranches();

                const foundBranch = branches.find(
                    (branch) => branch.id === Number(id)
                );

                if (!foundBranch) {
                    setError("Branch not found");
                    return;
                }

                setBranch(foundBranch);
            } catch (error) {
                setError("Failed to load branch");
            } finally {
                setLoading(false);
            }
        }

        fetchBranch();
    }, [id]);

    function handleNameChange(value: string) {
        if (!branch) return;

        setBranch({
            ...branch,
            name: value,
        });
    }

    function handleLocChange(value: string) {
        if (!branch) return;

        setBranch({
            ...branch,
            location: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!branch) return;

        setError("");
        setSaving(true);

        try {
            await updateBranch(
                branch.id,
                branch.name,
                branch.location,
            );

            navigate("/branches");
        } catch (error) {
            setError("Failed to update branch");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading branch...</p>;
    }

    if (!branch) {
        return <p>{error || "Branch not found"}</p>;
    }

    return (
        <div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>

                    <input
                        value={branch.name}
                        onChange={(e) =>
                            handleNameChange(e.target.value)
                        }
                    />
                </div>
                
                <div>
                    <label>Location</label>

                    <input
                        value={branch.location}
                        onChange={(e) =>
                            handleLocChange(e.target.value)
                        }
                    />
                </div>

            
                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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

export default UpdateBranch;