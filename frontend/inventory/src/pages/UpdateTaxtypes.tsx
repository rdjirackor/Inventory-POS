import { useEffect, useState } from "react";
import { getTaxes, updateTax } from "../apis/taxes";
import type { TaxType } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";

function UpdateTaxtype() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [taxtype, setTaxtype] = useState<TaxType | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTaxtype() {
            try {
                const taxtypes = await getTaxes();

                const foundTaxtype = taxtypes.find(
                    (taxtype) => taxtype.id === Number(id)
                );

                if (!foundTaxtype) {
                    setError("Taxtype not found");
                    return;
                }

                setTaxtype(foundTaxtype);
            } catch (error) {
                setError("Failed to load Taxtype");
            } finally {
                setLoading(false);
            }
        }

        fetchTaxtype();
    }, [id]);

  function handleNameChange(value: string) {
    if (!taxtype) return;
    setTaxtype({ ...taxtype, name: value });
}

function handleRateChange(value: string) {
    if (!taxtype) return;

    setTaxtype({
        ...taxtype,
        rate: value === "" ? "" : Number(value),
    });
}

function handleActiveChange(value: boolean) {
    if (!taxtype) return;
    setTaxtype({ ...taxtype, active: value });
}



    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!taxtype) return;

        setError("");
        setSaving(true);

        try {
            await updateTax(
                taxtype.id,
                taxtype.name,
                Number(taxtype.rate),
                taxtype.active,

            );

            navigate("/taxtypes");
        } catch (error) {
            setError("Failed to update Taxtype");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading Taxtype...</p>;
    }

    if (!taxtype) {
        return <p>{error || "Taxtype not found"}</p>;
    }

    return (
        <div>
            <h1>Update Taxtype</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Taxtype Name</label>

                    <input
                        value={taxtype.name}
                        onChange={(e) =>
                            handleNameChange(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Rate</label>
                    <input
                        type ="number"
                        step="0.01"
                        value={taxtype.rate}
                        onChange={(e) => handleRateChange(e.target.value)}
                    />
                </div>
                <div>
                    <label>Status</label>
                    <input
                        type ="checkbox"
                        checked={taxtype.active}
                        onChange={(e) => handleActiveChange(e.target.checked)}
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/taxtypes")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default UpdateTaxtype;