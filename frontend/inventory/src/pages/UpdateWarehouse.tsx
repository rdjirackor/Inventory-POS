import { useEffect, useState } from "react";
import { getWarehouses, updateWarehouse } from "../apis/warehouses";
import type { Warehouse } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";

function UpdateWarehouse() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchWarehouse() {
            try {
                const warehouses = await getWarehouses();

                const foundWarehouse = warehouses.find(
                    (warehouse) => warehouse.id === Number(id)
                );

                if (!foundWarehouse) {
                    setError("Warehouse not found");
                    return;
                }

                setWarehouse(foundWarehouse);
            } catch (error) {
                setError("Failed to load warehouse");
            } finally {
                setLoading(false);
            }
        }

        fetchWarehouse();
    }, [id]);

    function handleNameChange(value: string) {
        if (!warehouse) return;

        setWarehouse({
            ...warehouse,
            name: value,
        });
    }

    function handleLocChange(value: string) {
        if (!warehouse) return;

        setWarehouse({
            ...warehouse,
            location: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!warehouse) return;

        setError("");
        setSaving(true);

        try {
            await updateWarehouse(
                warehouse.id,
                warehouse.name,
                warehouse.location,
            );

            navigate("/warehouses");
        } catch (error) {
            setError("Failed to update warehouse");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading warehouse...</p>;
    }

    if (!warehouse) {
        return <p>{error || "Warehouse not found"}</p>;
    }

    return (
        <div>
            <h1>Update Warehouse</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>

                    <input
                        value={warehouse.name}
                        onChange={(e) =>
                            handleNameChange(e.target.value)
                        }
                    />
                </div>
                
                <div>
                    <label>Location</label>

                    <input
                        value={warehouse.location}
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
                    onClick={() => navigate("/warehouses")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default UpdateWarehouse;