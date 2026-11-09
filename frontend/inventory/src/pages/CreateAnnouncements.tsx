import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "../apis/announcements";



function CreateAnnouncement() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");




    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createAnnouncement(
                title,
                message,
            );

            navigate("/active-announcements");

        } catch (error) {
            setError("Failed to create announcement");
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

  

    return (
        <div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label>Message</label>
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Announcement"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/announcements")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateAnnouncement;