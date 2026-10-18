import { useEffect, useState } from "react";
import { getDiscounts, updateDiscount } from "../apis/discounts";
import type { Discount } from "../interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";

function UpdateDiscount() {
    const { id } = useParams();
    const navigate = useNavigate();


    const [discount, setDiscount] = useState<Discount | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDiscount() {
            try {
                const discounts = await getDiscounts();

                const foundDiscount = discounts.find(
                    (discount) => discount.id === Number(id)
                );

                if (!foundDiscount) {
                    setError("Discount not found");
                    return;
                }

                setDiscount(foundDiscount);
            } catch (error) {
                setError("Failed to load discount");
            } finally {
                setLoading(false);
            }
        }

        fetchDiscount();
    }, [id]);

    function handleNameChange(value: string) {
        if (!discount) return;

        setDiscount({
            ...discount,
            name: value,
        });
    }
    function handleDiscountChange(value: string) {
        if (!discount) return;

        setDiscount({
            ...discount,
            discount: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!discount) return;

        setError("");
        setSaving(true);

        try {
            await updateDiscount(
                discount.id,
                discount.name,
                Number(discount.discount),
            );

            navigate("/discounts");
        } catch (error) {
            setError("Failed to update discount");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading discount...</p>;
    }

    if (!discount) {
        return <p>{error || "Discount not found"}</p>;
    }

    return (
        <div>
            <h1>Update Discount</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Discount Name</label>

                    <input
                        value={discount.name}
                        onChange={(e) =>
                            handleNameChange(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Discount Percentage</label>

                    <input
                        value={discount.discount}
                        onChange={(e) =>
                            handleDiscountChange(e.target.value)
                        }
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/discounts")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default UpdateDiscount;