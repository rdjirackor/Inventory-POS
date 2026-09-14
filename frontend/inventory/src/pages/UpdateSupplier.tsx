import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Supplier } from "../interfaces/interfaces";
import { getSupplier, patchSupplier } from "../apis/suppliers";

function UpdateSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        async function fetchSuppliers() {
            try {
                const data = await getSupplier(Number(id));
                setSupplier(data);
            } catch (error) {
                setError("Failed to load supplier");
            } finally {
                setLoading(false);
            }
        }

        fetchSuppliers();
    }, [id]);

    function handleChange(
        field: keyof Supplier,
        value: string | number
    ) {
        if (!supplier) return;

        setSupplier({
            ...supplier,
            [field]: value,
        });
    }

    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!supplier) return;

    setError("");
    setSaving(true);

    try {
        await patchSupplier(supplier.id, {

            name: supplier.name,
            products: supplier.products,
            phone_number: supplier.phone_number,
            email: supplier.email,
            address: supplier.address,
            contact_person: supplier.contact_person,
            tax_number: supplier.tax_number,
        });

        navigate("/suppliers");
    } catch (error) {
        setError("Failed to update supplier");
    } finally {
        setSaving(false);
    }
}

    if (loading) {
        return <p>Loading supplier...</p>;
    }

    if (error && !supplier) {
        return <p>{error}</p>;
    }

    if (!supplier) {
        return <p>Supplier not found</p>;
    }

    return (
        <div>
            <h1>Update Supplier</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <input
                        value={supplier.name}
                        onChange={(e) =>
                            handleChange("name", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Phone Number</label>
                    <input
                        value={supplier.phone_number}
                        onChange={(e) =>
                            handleChange("phone_number", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        value={supplier.email}
                        onChange={(e) =>
                            handleChange("email", e.target.value)
                        }
                    />
                </div>


                <div>
                    <label>Address</label>
                    <input
                        type="string"
                        value={supplier.address}
                        onChange={(e) =>
                            handleChange("address", e.target.value)
                        }
                    />
                </div>

 

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/products")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default UpdateSupplier;