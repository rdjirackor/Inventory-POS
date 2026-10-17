import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCashier } from "../apis/cashiers";
import { type Branch, type User } from "../interfaces/interfaces";
import { getBranches } from "../apis/branches";

import { getUsers } from "../apis/users";



function CreateCashier() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");

    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [dateEmployed, setDateEmployed] = useState("");

    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchId, setBranchId] = useState("");


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");



    useEffect(() => {
    async function fetchOptions() {
        try {
            const [userData, branchData] = await Promise.all([
                getUsers(),
                getBranches(),
            ]);

            setUsers(userData);
            setBranches(branchData);
        } catch (error) {
            console.error(error);
            setError("Failed to load users and branches");
        }
    }

    fetchOptions();
}, []);


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
        await createCashier(
            Number(userId),
            firstName,
            secondName,
            dateEmployed,
            Number(branchId),
        );

        navigate("/cashiers");
    } catch (error) {
        setError("Failed to create cashier");
        console.error(error);
    } finally {
        setLoading(false);
    }
}

  

    return (
    <div>
        <h1>Create Cashier</h1>

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div>
                <label>User</label>
                <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>First Name</label>
                <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Second Name</label>
                <input
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Date Employed</label>
                <input
                    type="date"
                    value={dateEmployed}
                    onChange={(e) => setDateEmployed(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Branch</label>
                <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Cashier"}
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

export default CreateCashier;