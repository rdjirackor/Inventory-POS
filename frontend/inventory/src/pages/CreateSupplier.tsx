
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSupplier } from "../apis/suppliers";
import { type Product } from "../interfaces/interfaces";
import { getProducts } from "../apis/products";

function CreateSupplier() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [taxNumber, setTaxNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchOptions() {
            try {
                const productData = await getProducts();
                setProducts(productData);
            } catch (error) {
                console.error(error);
                setError("Failed to load products");
            }
        }

        fetchOptions();
    }, []);

    function handleProductChange(productId: number, checked: boolean) {
        setSelectedProducts((current) =>
            checked
                ? [...current, productId]
                : current.filter((id) => id !== productId)
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createSupplier(
                name,
                selectedProducts,
                phoneNumber,
                email,
                address,
                contactPerson,
                taxNumber
            );

            navigate("/suppliers");
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create supplier"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Create Supplier</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Supplier Name</label>
                    <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Products Supplied</label>
                    {products.map((product) => (
                        <div key={product.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={(e) =>
                                        handleProductChange(
                                            product.id,
                                            e.target.checked
                                        )
                                    }
                                />
                                {product.name}
                            </label>
                        </div>
                    ))}
                </div>

                <div>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="address">Address</label>
                    <input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="contactPerson">Contact Person</label>
                    <input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="taxNumber">Tax Number</label>
                    <input
                        id="taxNumber"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Supplier"}
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

export default CreateSupplier;
