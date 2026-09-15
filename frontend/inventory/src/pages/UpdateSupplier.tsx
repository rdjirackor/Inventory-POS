import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Supplier, Product } from "../interfaces/interfaces";
import { getSupplier, patchSupplier } from "../apis/suppliers";
import { getProducts } from "../apis/products";

function UpdateSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState<number[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);


    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
    async function fetchSupplier() {
        try {
            const data = await getSupplier(Number(id));
            setSupplier(data);
            setProducts(data.products);

            const productData = await getProducts();
            setAvailableProducts(productData);

        } catch (error) {
            setError("Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }

    fetchSupplier();
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
            products: products,
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
            <label>Products</label>

            <select
                multiple
                value={products.map(String)}
                onChange={(e) => {
                    const selectedProducts = Array.from(
                        e.target.selectedOptions,
                        (option) => Number(option.value)
                    );

                    setProducts(selectedProducts);
                }}
            >
                {availableProducts.map((product) => (
                    <option
                        key={product.id}
                        value={product.id}
                    >
                        {product.name}
                    </option>
                ))}
            </select>
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

                <div>
                    <label>Contact Person</label>
                    <input
                        type="string"
                        value={supplier.contact_person}
                        onChange={(e) =>
                            handleChange("contact_person", e.target.value)
                        }
                    />
                </div>
                <div>
                    <label>Tax Number</label>
                    <input
                        type="string"
                        value={supplier.tax_number}
                        onChange={(e) =>
                            handleChange("tax_number", e.target.value)
                        }
                    />
                </div>
 

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/suppliers")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default UpdateSupplier;