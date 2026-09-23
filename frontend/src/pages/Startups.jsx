import { useEffect, useState } from "react";
import API from "../services/api";

function Startups() {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStartups = async () => {
        try {
            const response = await API.get("/startups");
            setStartups(response.data.startups || []);
        } catch (error) {
            console.error("Error fetching startups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStartups();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Startups</h1>
                    <p>Discover startups participating in the InnovProcure ecosystem.</p>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading startups...</p>
                </div>
            ) : startups.length === 0 ? (
                <div className="empty-state">
                    <h3>No startups registered</h3>
                    <p>
                        Registered startups will appear here.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {startups.map((startup) => (
                        <div className="dashboard-card" key={startup.id}>

                            <h3>
                                {startup.startup_name || startup.name}
                            </h3>

                            {startup.description && (
                                <p>{startup.description}</p>
                            )}

                            {startup.industry && (
                                <span className="status-badge">
                                    {startup.industry}
                                </span>
                            )}

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Startups;