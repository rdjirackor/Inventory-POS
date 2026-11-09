
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnnouncements } from "../apis/announcements";
import type { Announcement } from "../interfaces/interfaces";



export default function ViewEnabledAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


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

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const data = await getAnnouncements();
                setAnnouncements(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load announcements."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchAnnouncements();
    }, []);

    if (loading) return <p>Loading announcements...</p>;
                { console.log(announcements)}


    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/announcements/create">Create Announcement</Link>
            </div>

            {error && <p className="error-message">{error}</p>}

            {!error && !announcements && (
                <p>No announcements have been recorded yet.</p>
            )}

            {announcements && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Message</th>
                                <th>Created at</th>
                            </tr>
                        </thead>

                        <tbody>
                            {announcements.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>{item.message}</td>
                                    <td>{timeLabel(item.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
