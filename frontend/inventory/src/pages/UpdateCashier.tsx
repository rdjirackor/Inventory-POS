import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Cashier } from "../interfaces/interfaces";
import { getCashier, patchCashier } from "../apis/cashiers";

function UpdateCashier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cashier, setCashier] = useState<Cashier | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCashier() {
            try {
                const data = await getCashier(Number(id));
                setCashier(data);
            } catch (error) {
                setError("Failed to load Cashier");
            } finally {
                setLoading(false);
            }
        }

        fetchCashier();
    }, [id]);

    function handleChange(
        field: keyof Cashier,
        value: string | number
    ) {
        if (!cashier) return;

        setCashier({
            ...cashier,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!cashier) return;

        setError("");
        setSaving(true);

        try {
            await patchCashier(
                cashier.id,
                cashier.first_name,
                cashier.second_name,
                cashier.date_employed,
                cashier.branch_stationed_at
            );

            navigate("/cashiers");
        } catch (error) {
            setError("Failed to update cashier");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading cashier...</p>;
    }

    if (error && !cashier) {
        return <p>{error}</p>;
    }

    if (!cashier) {
        return <p>Cashier not found</p>;
    }

    return (
        <div>
            <h1>Update Cashier</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>First Name</label>
                    <input
                        value={cashier.first_name}
                        onChange={(e) =>
                            handleChange("first_name", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Second Name</label>
                    <input
                        value={cashier.second_name}
                        onChange={(e) =>
                            handleChange("second_name", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Date Employed</label>
                    <input
                        type="date"
                        value={cashier.date_employed}
                        onChange={(e) =>
                            handleChange("date_employed", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Branch Stationed At</label>
                    <input
                        type="number"
                        value={cashier.branch_stationed_at}
                        onChange={(e) =>
                            handleChange(
                                "branch_stationed_at",
                                Number(e.target.value)
                            )
                        }
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/cashiers")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default UpdateCashier;