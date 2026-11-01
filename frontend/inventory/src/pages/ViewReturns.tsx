
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReturns } from "../apis/returns";
import type { Return } from "../interfaces/interfaces";



export default function ViewReturns() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReturns() {
            try {
                const data = await getReturns();
                setReturns(data as Return[]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load returns."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchReturns();
    }, []);

    if (loading) return <p>Loading returns...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Returns</h1>
                <Link to="/returns/create">Create Return</Link>
            </div>

            {error && <p className="error-message">{error}</p>}

            {!error && returns.length === 0 && (
                <p>No returns have been recorded yet.</p>
            )}

            {returns.length > 0 && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Return ID</th>
                                <th>Product ID</th>
                                <th>Sale ID</th>
                                <th>Customer ID</th>
                                <th>Quantity</th>
                                <th>Reason</th>
                            </tr>
                        </thead>

                        <tbody>
                            {returns.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.product}</td>
                                    <td>{item.order_history}</td>
                                    <td>{item.customer ?? "Walk-in"}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.reason || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
