import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../apis/customers";
import { type User } from "../interfaces/interfaces";
import { getBranches } from "../apis/branches";

import { getUsers } from "../apis/users";



function CreateCustomer() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");

    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [rewardPoints, setRewardPoints] = useState("");
    const [creditBalance, setCreditBalance] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
    async function fetchOptions() {
        try {
            const [userData] = await Promise.all([
                getUsers(),
                getBranches(),
            ]);

            setUsers(userData);
        } catch (error) {
            console.error(error);
            setError("Failed to load users");
        }
    }

    fetchOptions();
}, []);


    async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
        await createCustomer(
            Number(userId),
            firstName,
            secondName,
            rewardPoints,
            creditBalance,
            
        );

        navigate("/customers");
    } catch (error) {
        setError("Failed to create customer");
        console.error(error);
    } finally {
        setLoading(false);
    }
}

  

    return (
    <div>
        <h1>Create Customer</h1>

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
                <label>Reward Points</label>
                <input
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Credit Balance</label>
                <input
                    value={creditBalance}
                    onChange={(e) => setCreditBalance(e.target.value)}
                    required
                >
      
                    
                </input>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Customer"}
            </button>

            <button
                type="button"
                onClick={() => navigate("/customers")}
            >
                Cancel
            </button>
        </form>
    </div>
);

               
}

export default CreateCustomer;