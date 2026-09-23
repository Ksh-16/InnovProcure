import { useEffect, useState } from "react";
import { Eye, X, CheckCircle2, Clock, ShoppingCart } from "lucide-react";
import API from "../services/api";
import {
    getProposalStatus,
    getProposalStatusClass
} from "../utils/proposalStatus";

function Proposals() {
    const [proposals, setProposals] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [pilotValidations, setPilotValidations] = useState([]);
    const fetchData = async () => {
    try {
        const [
            proposalResponse,
            evaluationResponse,
            procurementResponse,
            pilotResponse
        ] = await Promise.all([
            API.get("/proposals"),
            API.get("/evaluations"),
            API.get("/procurements"),
            API.get("/pilot-validations")
        ]);

        setProposals(proposalResponse.data.proposals || []);
        setEvaluations(evaluationResponse.data.evaluations || []);
        setProcurements(procurementResponse.data.procurements || []);
        setPilotValidations(pilotResponse.data.validations || []);

    } catch (error) {
        console.error("Error fetching proposal data:", error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchData();
    }, []);

    const getEvaluation = (proposalId) => {
        return evaluations.find(
            (evaluation) => evaluation.proposal_id === proposalId
        );
    };

    const getProcurement = (proposalId) => {
        return procurements.find(
            (procurement) => procurement.proposal_id === proposalId
        );
    };

    
    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Proposals</h1>
                    <p>
                        Review innovation proposals submitted by startups.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading proposals...</p>
                </div>
            ) : proposals.length === 0 ? (
                <div className="empty-state">
                    <h3>No proposals yet</h3>
                    <p>
                        Startup proposals will appear here once they are submitted.
                    </p>
                </div>
            ) : (
                <div className="card-grid">

                    {proposals.map((proposal) => {

                        const status = getProposalStatus(
    proposal.id,
    evaluations,
    pilotValidations,
    procurements
);

const statusClass =
    getProposalStatusClass(status);
                        const evaluation = getEvaluation(proposal.id);
                        const procurement = getProcurement(proposal.id);

                        return (
                            <div
                                className="dashboard-card proposal-card"
                                key={proposal.id}
                            >

                                <div className="proposal-card-header">
                                    <div>
                                        <h3>{proposal.title}</h3>

                                        <div className="proposal-startup">
                                            {proposal.startup_name ||
                                                `Startup #${proposal.startup_id}`}
                                        </div>
                                    </div>

                                    <span
    className={`proposal-status ${getProposalStatusClass(status)}`}
>
    {status === "PENDING EVALUATION" && (
        <Clock size={14} />
    )}

    {status === "EVALUATED" && (
        <CheckCircle2 size={14} />
    )}

    {status === "PROCURED" && (
        <ShoppingCart size={14} />
    )}

    {status === "PILOT VALIDATED" && (
        <CheckCircle2 size={14} />
    )}

    {status === "PILOT FAILED" && (
        <X size={14} />
    )}

    {status === "PILOT PENDING" && (
        <Clock size={14} />
    )}

    {status}
</span>
                                </div>

                                <div className="proposal-info-row">

                                    <div>
                                        <span>Challenge</span>
                                        <strong>
                                            {proposal.challenge_title ||
                                                `Challenge #${proposal.challenge_id}`}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Department</span>
                                        <strong>
                                            {proposal.department_name ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                </div>

                                <p className="proposal-description">
                                    {proposal.solution_description}
                                </p>

                                {evaluation && (
                                    <div className="proposal-score-summary">

                                        <div>
                                            <span>Technical</span>
                                            <strong>
                                                {evaluation.technical_score}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Innovation</span>
                                            <strong>
                                                {evaluation.innovation_score}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Feasibility</span>
                                            <strong>
                                                {evaluation.feasibility_score}
                                            </strong>
                                        </div>

                                    </div>
                                )}

                                {procurement && (
                                    <div className="proposal-procurement-summary">
                                        <ShoppingCart size={16} />

                                        <span>
                                            Procurement initiated
                                            {procurement.contract_number
                                                ? ` • ${procurement.contract_number}`
                                                : ""}
                                        </span>
                                    </div>
                                )}

                                <button
                                    className="secondary-button proposal-view-button"
                                    onClick={() =>
                                        setSelectedProposal(proposal)
                                    }
                                >
                                    <Eye size={16} />
                                    View Proposal
                                </button>

                            </div>
                        );
                    })}

                </div>
            )}

            {selectedProposal && (
                <div
                    className="proposal-modal-overlay"
                    onClick={() => setSelectedProposal(null)}
                >
                    <div
                        className="proposal-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="proposal-modal-header">
                            <div>
                                <h2>{selectedProposal.title}</h2>

                                <p>
                                    Proposal #{selectedProposal.id}
                                </p>
                            </div>

                            <button
                                className="modal-close-button"
                                onClick={() => setSelectedProposal(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="proposal-detail-grid">

                            <div className="proposal-detail-box">
                                <span>Startup</span>
                                <strong>
                                    {selectedProposal.startup_name ||
                                        `Startup #${selectedProposal.startup_id}`}
                                </strong>

                                {selectedProposal.startup_email && (
                                    <small>
                                        {selectedProposal.startup_email}
                                    </small>
                                )}
                            </div>

                            <div className="proposal-detail-box">
                                <span>Challenge</span>
                                <strong>
                                    {selectedProposal.challenge_title ||
                                        `Challenge #${selectedProposal.challenge_id}`}
                                </strong>
                            </div>

                            <div className="proposal-detail-box">
                                <span>Department</span>
                                <strong>
                                    {selectedProposal.department_name ||
                                        "Not specified"}
                                </strong>
                            </div>

                            <div className="proposal-detail-box">
                                <span>Status</span>

                                <strong>
    {getProposalStatus(
        selectedProposal.id,
        evaluations,
        pilotValidations,
        procurements
    )}
</strong>
                            </div>

                        </div>

                        <div className="proposal-detail-section">
                            <h3>Solution Description</h3>

                            <p>
                                {selectedProposal.solution_description}
                            </p>
                        </div>

                        <div className="proposal-detail-section">
                            <h3>Technical Approach</h3>

                            <p>
                                {selectedProposal.technical_approach}
                            </p>
                        </div>

                        {getEvaluation(selectedProposal.id) && (
                            <div className="proposal-detail-section">

                                <h3>Evaluation Results</h3>

                                <div className="proposal-score-summary">

                                    <div>
                                        <span>Technical Score</span>
                                        <strong>
                                            {
                                                getEvaluation(
                                                    selectedProposal.id
                                                ).technical_score
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Innovation Score</span>
                                        <strong>
                                            {
                                                getEvaluation(
                                                    selectedProposal.id
                                                ).innovation_score
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Feasibility Score</span>
                                        <strong>
                                            {
                                                getEvaluation(
                                                    selectedProposal.id
                                                ).feasibility_score
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>
                        )}

                        {getProcurement(selectedProposal.id) && (
                            <div className="proposal-detail-section">

                                <h3>Procurement Details</h3>

                                <div className="procurement-detail-box">

                                    <p>
                                        <strong>Contract:</strong>{" "}
                                        {getProcurement(
                                            selectedProposal.id
                                        ).contract_number ||
                                            "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Contract Value:</strong>{" "}
                                        {getProcurement(
                                            selectedProposal.id
                                        ).contract_value
                                            ? `₹${getProcurement(
                                                  selectedProposal.id
                                              ).contract_value}`
                                            : "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Start Date:</strong>{" "}
                                        {getProcurement(
                                            selectedProposal.id
                                        ).start_date ||
                                            "Not specified"}
                                    </p>

                                </div>

                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default Proposals;