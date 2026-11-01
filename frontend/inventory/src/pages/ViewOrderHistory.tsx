
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderHistory } from "../interfaces/interfaces";
import { getOrderHistories } from "../apis/order_history";


const timeLabel = (dateStr: string): string => {
            const date = new Date(dateStr);
            const diffMs = Date.now() - date.getTime();
            const mins = Math.floor(diffMs / 60000);
            if (mins < 1) return "Just now";
             if (mins < 60) return `${mins} min ago`;
               const hrs = Math.floor(mins / 60);
               if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
                    return date.toLocaleDateString();
                }; 


export default function ViewHistories() {
    const [histories, setHistories] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchHistories() {
            try {
                const data = await getOrderHistories();
                setHistories(data as OrderHistory[]);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load histories."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchHistories();
    }, []);

    if (loading) return <p>Loading histories...</p>;

    return (
        <div className="page-container">
          

            {error && <p className="error-message">{error}</p>}

            {!error && histories.length === 0 && (
                <p>No histories have been recorded yet.</p>
            )}

            {histories.length > 0 && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Time of Purchase</th>
                   
                            </tr>
                        </thead>

                        <tbody>
                            {histories.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.customer_name || "Walk In Customer"}</td>
                                    <td>{timeLabel(item.time_of_purchase)}</td>
                        
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
