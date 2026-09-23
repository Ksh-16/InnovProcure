import { useEffect, useState } from "react";
import API from "../services/api";

function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = async () => {
        try {
            const response = await API.get("/challenges");
            setChallenges(response.data.challenges || []);
        } catch (error) {
            console.error("Error fetching challenges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Challenges</h1>
                    <p>Explore innovation challenges published by government departments.</p>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading challenges...</p>
                </div>
            ) : challenges.length === 0 ? (
                <div className="empty-state">
                    <h3>No challenges available</h3>
                    <p>
                        Government departments have not published any challenges yet.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {challenges.map((challenge) => (
                        <div className="dashboard-card" key={challenge.id}>

                            <h3>{challenge.title}</h3>

<p>
    {challenge.description}
</p>

{challenge.department_name && (
    <p className="challenge-department">
        Department: {challenge.department_name}
    </p>
)}

{challenge.category && (
    <span className="status-badge">
        {challenge.category}
    </span>
)}

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Challenges;