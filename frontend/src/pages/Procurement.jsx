import { useEffect, useState } from "react";
import API from "../services/api";

function Procurement() {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProcurements = async () => {
        try {
            const response = await API.get("/procurements");
            setProcurements(response.data.procurements || []);
        } catch (error) {
            console.error("Error fetching procurements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcurements();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Procurement</h1>
                    <p>
    Track contracts created after successful proposal evaluation
    and pilot validation.
</p>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading procurement records...</p>
                </div>
            ) : procurements.length === 0 ? (
                <div className="empty-state">
                    <h3>No procurement records</h3>
                    <p>
    Procurement records will appear here after a proposal
    completes evaluation and passes pilot validation.
</p>
                </div>
            ) : (
                <div className="card-grid">
                    {procurements.map((procurement) => (
                        <div className="dashboard-card" key={procurement.id}>

                            <h3>
                                {procurement.contract_number ||
                                    `Proposal #${procurement.proposal_id}`}
                            </h3>

                            <p>
                                Proposal #{procurement.proposal_id}
                            </p>

                            <div className="card-meta">
                                Contract Value:{" "}
                                {procurement.contract_value
                                    ? `₹${procurement.contract_value}`
                                    : "Not specified"}
                            </div>

                            <div className="card-meta">
                                Start Date:{" "}
                                {procurement.start_date || "Not specified"}
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Procurement;