import { useEffect, useState } from "react";
import API from "../services/api";

function Evaluations() {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvaluations = async () => {
        try {
            const response = await API.get("/evaluations");
            setEvaluations(response.data.evaluations || []);
        } catch (error) {
            console.error("Error fetching evaluations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluations();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Evaluations</h1>
                    <p>Track technical and innovation evaluation results.</p>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading evaluations...</p>
                </div>
            ) : evaluations.length === 0 ? (
                <div className="empty-state">
                    <h3>No evaluations yet</h3>
                    <p>
                        Evaluations will appear here after proposals are reviewed.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {evaluations.map((evaluation) => (
                        <div className="dashboard-card" key={evaluation.id}>

    <div className="evaluation-card-header">
        <div>
            <h3>
                Proposal #{evaluation.proposal_id}
            </h3>

            <p className="evaluation-subtitle">
                Proposal evaluation completed
            </p>
        </div>

        <span className="status-badge">
            Evaluated
        </span>
    </div>

    <div className="evaluation-result">

        <div>
            <span>Technical</span>
            <strong>
                {evaluation.technical_score ?? "-"}
            </strong>
        </div>

        <div>
            <span>Innovation</span>
            <strong>
                {evaluation.innovation_score ?? "-"}
            </strong>
        </div>

        <div>
            <span>Feasibility</span>
            <strong>
                {evaluation.feasibility_score ?? "-"}
            </strong>
        </div>

    </div>

</div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Evaluations;