import { useEffect, useState } from "react";
import {
    FileText,
    Star,
    ArrowRight,
    X,
    Building2,
    Rocket,
    CheckCircle2,
    Clock
} from "lucide-react";
import API from "../services/api";

function EvaluatorDashboard() {

    const [proposals, setProposals] = useState([]);
const [evaluations, setEvaluations] = useState([]);
const [pilotValidations, setPilotValidations] = useState([]);

    const [selectedProposal, setSelectedProposal] = useState(null);

    const [evaluation, setEvaluation] = useState({
        technical_score: "",
        innovation_score: "",
        feasibility_score: ""
    });

    const [loading, setLoading] = useState(true);


    // =========================
    // FETCH DATA
    // =========================

    const fetchData = async () => {

        try {

            setLoading(true);

            const [
    proposalResponse,
    evaluationResponse,
    pilotResponse
] = await Promise.all([
    API.get("/proposals"),
    API.get("/evaluations"),
    API.get("/pilot-validations")
]);

            setProposals(
                proposalResponse.data.proposals || []
            );

            setEvaluations(
                evaluationResponse.data.evaluations || []
            );

            setPilotValidations(
    pilotResponse.data.validations || []
);

        } catch (error) {

            console.error(
                "Error fetching evaluator data:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchData();

    }, []);


    // =========================
    // FIND EVALUATION
    // =========================

    const getEvaluation = (proposalId) => {

        return evaluations.find(
            (evaluation) =>
                evaluation.proposal_id === proposalId
        );

    };


    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        setEvaluation({
            ...evaluation,
            [e.target.name]: e.target.value
        });

    };


    // =========================
    // SUBMIT EVALUATION
    // =========================

    const submitEvaluation = async (e) => {

        e.preventDefault();

        if (!selectedProposal) {

            alert(
                "Please select a proposal first."
            );

            return;

        }

        const technical =
            Number(evaluation.technical_score);

        const innovation =
            Number(evaluation.innovation_score);

        const feasibility =
            Number(evaluation.feasibility_score);


        // Validate scores

        if (
            technical < 0 ||
            technical > 10 ||
            innovation < 0 ||
            innovation > 10 ||
            feasibility < 0 ||
            feasibility > 10
        ) {

            alert(
                "All scores must be between 0 and 10."
            );

            return;

        }


        try {

            await API.post("/evaluations", {

                proposal_id:
                    selectedProposal.id,

                technical_score:
                    technical,

                innovation_score:
                    innovation,

                feasibility_score:
                    feasibility

            });


            alert(
                "Evaluation submitted successfully!"
            );


            setSelectedProposal(null);


            setEvaluation({
                technical_score: "",
                innovation_score: "",
                feasibility_score: ""
            });


            await fetchData();


        } catch (error) {

            console.error(
                "Evaluation error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to submit evaluation"
            );

        }

    };


    // =========================
    // COUNTS
    // =========================

    const evaluatedCount =
        proposals.filter(
            (proposal) =>
                getEvaluation(proposal.id)
        ).length;

    const pendingCount =
        proposals.length - evaluatedCount;


    return (

        <div className="evaluator-dashboard">


            {/* =========================
                HEADER
            ========================= */}

            <div className="evaluator-header">

                <div>

                    <div className="evaluator-eyebrow">
                        PROPOSAL EVALUATION
                    </div>

                    <h1>
                        Evaluator Dashboard
                    </h1>

                    <p>
                        Review startup proposals and assess
                        their technical quality, innovation,
                        and feasibility.
                    </p>

                </div>


                <div className="evaluator-stats-group">

                    <div className="evaluator-stat">

                        <FileText size={20} />

                        <div>

                            <strong>
                                {proposals.length}
                            </strong>

                            <span>
                                Total Proposals
                            </span>

                        </div>

                    </div>


                    <div className="evaluator-stat">

                        <Clock size={20} />

                        <div>

                            <strong>
                                {pendingCount}
                            </strong>

                            <span>
                                Pending Review
                            </span>

                        </div>

                    </div>


                    <div className="evaluator-stat">

                        <CheckCircle2 size={20} />

                        <div>

                            <strong>
                                {evaluatedCount}
                            </strong>

                            <span>
                                Evaluated
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                LOADING
            ========================= */}

            {loading ? (

                <div className="evaluator-empty">

                    <FileText size={40} />

                    <h3>
                        Loading proposals...
                    </h3>

                    <p>
                        Fetching proposals for evaluation.
                    </p>

                </div>

            ) : proposals.length === 0 ? (

                <div className="evaluator-empty">

                    <FileText size={40} />

                    <h3>
                        No proposals yet
                    </h3>

                    <p>
                        Startup proposals will appear here
                        once they are submitted.
                    </p>

                </div>

            ) : (

                <div className="proposal-grid">

                    {proposals.map((proposal) => {

                        const existingEvaluation =
                            getEvaluation(proposal.id);


                        return (

                            <div
                                className="evaluator-proposal-card"
                                key={proposal.id}
                            >


                                {/* TOP */}

                                <div className="proposal-card-top">

                                    <div className="proposal-icon">

                                        <FileText
                                            size={20}
                                        />

                                    </div>


                                    <span
                                        className={
                                            existingEvaluation
                                                ? "evaluated-tag"
                                                : "pending-tag"
                                        }
                                    >

                                        {existingEvaluation ? (
                                            <>
                                                <CheckCircle2
                                                    size={13}
                                                />

                                                Evaluated
                                            </>
                                        ) : (
                                            <>
                                                <Clock
                                                    size={13}
                                                />

                                                Pending Review
                                            </>
                                        )}

                                    </span>

                                </div>


                                {/* TITLE */}

                                <h2>
                                    {proposal.title}
                                </h2>


                                {/* STARTUP */}

                                <div className="evaluator-proposal-meta">

                                    <div>

                                        <Rocket size={15} />

                                        <span>
                                            {proposal.startup_name ||
                                                `Startup #${proposal.startup_id}`}
                                        </span>

                                    </div>


                                    <div>

                                        <Building2 size={15} />

                                        <span>
                                            {proposal.department_name ||
                                                "Department not specified"}
                                        </span>

                                    </div>

                                </div>


                                {/* CHALLENGE */}

                                <div className="evaluator-challenge">

                                    <span>
                                        Challenge
                                    </span>

                                    <strong>
                                        {proposal.challenge_title ||
                                            `Challenge #${proposal.challenge_id}`}
                                    </strong>

                                </div>


                                {/* SOLUTION */}

                                <div className="evaluator-content">

                                    <strong>
                                        Solution
                                    </strong>

                                    <p>
                                        {
                                            proposal.solution_description
                                        }
                                    </p>

                                </div>


                                {/* TECHNICAL APPROACH */}

                                <div className="technical-preview">

                                    <strong>
                                        Technical Approach
                                    </strong>

                                    <p>
                                        {
                                            proposal.technical_approach
                                        }
                                    </p>

                                </div>


                                {/* EVALUATION RESULT */}

                                {existingEvaluation && (

                                    <div className="evaluation-result">

                                        <div>

                                            <span>
                                                Technical
                                            </span>

                                            <strong>
                                                {
                                                    existingEvaluation
                                                        .technical_score
                                                }/10
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Innovation
                                            </span>

                                            <strong>
                                                {
                                                    existingEvaluation
                                                        .innovation_score
                                                }/10
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Feasibility
                                            </span>

                                            <strong>
                                                {
                                                    existingEvaluation
                                                        .feasibility_score
                                                }/10
                                            </strong>

                                        </div>

                                    </div>

                                )}


                                {/* ACTION */}

                                {!existingEvaluation && (

                                    <button
                                        className="evaluate-btn"
                                        onClick={() =>
                                            setSelectedProposal(
                                                proposal
                                            )
                                        }
                                    >

                                        Evaluate Proposal

                                        <ArrowRight
                                            size={17}
                                        />

                                    </button>

                                )}

                            </div>

                        );

                    })}

                </div>

            )}


            {/* =========================
                EVALUATION MODAL
            ========================= */}

            {selectedProposal && (

                <div className="modal-overlay">

                    <div className="evaluation-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Evaluate Proposal
                                </h2>

                                <p>
                                    {selectedProposal.title}
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedProposal(
                                        null
                                    )
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* STARTUP + CHALLENGE INFO */}

                        <div className="evaluator-modal-meta">

                            <div>

                                <Rocket size={16} />

                                <div>

                                    <span>
                                        Startup
                                    </span>

                                    <strong>
                                        {
                                            selectedProposal
                                                .startup_name ||
                                            `Startup #${selectedProposal.startup_id}`
                                        }
                                    </strong>

                                    {selectedProposal.startup_email && (

                                        <small>
                                            {
                                                selectedProposal
                                                    .startup_email
                                            }
                                        </small>

                                    )}

                                </div>

                            </div>


                            <div>

                                <Building2 size={16} />

                                <div>

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {
                                            selectedProposal
                                                .department_name ||
                                            "Not specified"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* PROPOSAL DETAILS */}

                        <div className="proposal-details">

                            <h3>
                                Solution
                            </h3>

                            <p>
                                {
                                    selectedProposal
                                        .solution_description
                                }
                            </p>


                            <h3>
                                Technical Approach
                            </h3>

                            <p>
                                {
                                    selectedProposal
                                        .technical_approach
                                }
                            </p>

                        </div>


                        {/* EVALUATION FORM */}

                        <form
                            onSubmit={
                                submitEvaluation
                            }
                        >

                            <h3 className="evaluation-form-title">
                                Evaluation Scores
                            </h3>


                            <div className="score-grid">


                                {/* TECHNICAL */}

                                <div className="form-group">

                                    <label>
                                        Technical Score / 10
                                    </label>

                                    <input
                                        type="number"
                                        name="technical_score"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={
                                            evaluation
                                                .technical_score
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* INNOVATION */}

                                <div className="form-group">

                                    <label>
                                        Innovation Score / 10
                                    </label>

                                    <input
                                        type="number"
                                        name="innovation_score"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={
                                            evaluation
                                                .innovation_score
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* FEASIBILITY */}

                                <div className="form-group">

                                    <label>
                                        Feasibility Score / 10
                                    </label>

                                    <input
                                        type="number"
                                        name="feasibility_score"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={
                                            evaluation
                                                .feasibility_score
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="evaluate-btn"
                            >

                                <Star size={17} />

                                Submit Evaluation

                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default EvaluatorDashboard;