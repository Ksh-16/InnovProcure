import { useEffect, useState } from "react";
import API from "../services/api";

function ProcurementDashboard() {

    const [procurements, setProcurements] = useState([]);
    const [evaluatedProposals, setEvaluatedProposals] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
const [pilotValidations, setPilotValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProposals, setLoadingProposals] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        proposal_id: "",
        contract_number: "",
        contract_value: "",
        start_date: ""
    });


    // Fetch procurement records
    const fetchProcurements = async () => {

        try {

            setLoading(true);

            const response = await API.get("/procurements");

            setProcurements(
                response.data.procurements || []
            );

        } catch (error) {

            console.error(
                "Error fetching procurements:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // Fetch proposals + evaluations + procurements
    const fetchWorkflowData = async () => {

        try {

            setLoadingProposals(true);

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


            const proposals =
                proposalResponse.data.proposals || [];

            const evaluationData =
                evaluationResponse.data.evaluations || [];

            const procurementData =
                procurementResponse.data.procurements || [];
            
            const pilotData =
    pilotResponse.data.validations || [];

            setEvaluations(evaluationData);
            setPilotValidations(pilotData);

            // IDs of proposals that have already been evaluated
            const evaluatedProposalIds =
                evaluationData.map(
                    (evaluation) =>
                        evaluation.proposal_id
                );
            
            const passedPilotProposalIds =
    pilotData
        .filter(
            (pilot) =>
                pilot.status === "PASSED"
        )
        .map(
            (pilot) =>
                pilot.proposal_id
        );

            // IDs of proposals that already have procurement
            const procuredProposalIds =
                procurementData.map(
                    (procurement) =>
                        procurement.proposal_id
                );


            // Only evaluated + not yet procured proposals
            const availableProposals =
                proposals.filter((proposal) => {

                    const isEvaluated =
                        evaluatedProposalIds.includes(
                            proposal.id
                        );

                    const isAlreadyProcured =
                        procuredProposalIds.includes(
                            proposal.id
                        );

                    const hasPassedPilot =
    passedPilotProposalIds.includes(
        proposal.id
    );

return (
    isEvaluated &&
    hasPassedPilot &&
    !isAlreadyProcured
);

                });


            setEvaluatedProposals(
                availableProposals
            );

        } catch (error) {

            console.error(
                "Error fetching workflow data:",
                error
            );

        } finally {

            setLoadingProposals(false);

        }

    };


    useEffect(() => {

        fetchProcurements();
        fetchWorkflowData();

    }, []);


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.proposal_id) {

            alert("Please select a proposal.");

            return;

        }


        try {

            await API.post("/procurements", {

                proposal_id:
                    Number(form.proposal_id),

                contract_number:
                    form.contract_number,

                contract_value:
                    form.contract_value
                        ? Number(form.contract_value)
                        : null,

                start_date:
                    form.start_date || null

            });


            alert(
                "Procurement created successfully!"
            );


            setForm({
                proposal_id: "",
                contract_number: "",
                contract_value: "",
                start_date: ""
            });


            setShowForm(false);

            await fetchProcurements();
            await fetchWorkflowData();


        } catch (error) {

            console.error(
                "Error creating procurement:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to create procurement"
            );

        }

    };


    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this procurement?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            await API.delete(
                `/procurements/${id}`
            );


            alert(
                "Procurement deleted successfully!"
            );


            await fetchProcurements();
            await fetchWorkflowData();


        } catch (error) {

            console.error(
                "Error deleting procurement:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete procurement"
            );

        }

    };


    // Find evaluation for a proposal
    const getEvaluation = (proposalId) => {

        return evaluations.find(
            (evaluation) =>
                evaluation.proposal_id === proposalId
        );

    };


    return (

        <div className="procurement-dashboard">


            {/* Header */}

            <div className="dashboard-header">

                <div>

                    <span className="procurement-eyebrow">
                        PROCUREMENT WORKFLOW
                    </span>

                    <h1>
                        Procurement Management
                    </h1>

                    <p>
                        Manage evaluated proposals, contracts
                        and procurement records.
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={() =>
                        setShowForm(!showForm)
                    }
                >

                    {showForm
                        ? "Close Form"
                        : "+ New Procurement"}

                </button>

            </div>


            {/* Workflow summary */}

            <div className="procurement-summary">

                <div className="procurement-summary-card">

                    <span>
                        Evaluated Proposals
                    </span>

                    <strong>
                        {evaluatedProposals.length}
                    </strong>

                    <small>
                        Ready for procurement
                    </small>

                </div>


                <div className="procurement-summary-card">

                    <span>
                        Active Procurement
                    </span>

                    <strong>
                        {procurements.length}
                    </strong>

                    <small>
                        Procurement records
                    </small>

                </div>


                <div className="procurement-summary-card">

                    <span>
                        Workflow Stage
                    </span>

                    <strong>
                        Procurement
                    </strong>

                    <small>
                        After evaluation
                    </small>

                </div>

            </div>


            {/* Create Procurement Form */}

            {showForm && (

                <div className="procurement-form-card">

                    <h2>
                        Create Procurement
                    </h2>

                    <p className="form-description">
                        Select a proposal that has completed
evaluation, passed pilot validation,
and has not yet entered procurement.
                    </p>


                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">


                            {/* Proposal */}

                            <div className="form-group">

                                <label>
                                    Select Evaluated Proposal
                                </label>


                                {loadingProposals ? (

                                    <p>
                                        Loading proposals...
                                    </p>

                                ) : evaluatedProposals.length === 0 ? (

                                    <div className="form-empty">

                                        <strong>
                                            No proposals available
                                        </strong>

                                        <span>
                                            Only evaluated proposals that have
passed pilot validation and do not
already have procurement can be selected.
                                        </span>

                                    </div>

                                ) : (

                                    <select
                                        name="proposal_id"
                                        value={
                                            form.proposal_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select a proposal
                                        </option>


                                        {evaluatedProposals.map(
                                            (proposal) => {

                                                const evaluation =
                                                    getEvaluation(
                                                        proposal.id
                                                    );

                                                return (

                                                    <option
                                                        key={
                                                            proposal.id
                                                        }
                                                        value={
                                                            proposal.id
                                                        }
                                                    >

                                                        #{proposal.id} -{" "}
                                                        {proposal.title}
                                                        {" | Score: "}
                                                        {
                                                            evaluation
                                                                ? (
                                                                    (
                                                                        Number(
                                                                            evaluation.technical_score || 0
                                                                        ) +
                                                                        Number(
                                                                            evaluation.innovation_score || 0
                                                                        ) +
                                                                        Number(
                                                                            evaluation.feasibility_score || 0
                                                                        )
                                                                    ) / 3
                                                                ).toFixed(1)
                                                                : "N/A"
                                                        }

                                                    </option>

                                                );

                                            }
                                        )}

                                    </select>

                                )}

                            </div>


                            {/* Contract Number */}

                            <div className="form-group">

                                <label>
                                    Contract Number
                                </label>

                                <input
                                    type="text"
                                    name="contract_number"
                                    value={
                                        form.contract_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. IP-2026-001"
                                />

                            </div>


                            {/* Contract Value */}

                            <div className="form-group">

                                <label>
                                    Contract Value
                                </label>

                                <input
                                    type="number"
                                    name="contract_value"
                                    value={
                                        form.contract_value
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter contract value"
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* Start Date */}

                            <div className="form-group">

                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    name="start_date"
                                    value={
                                        form.start_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={
                                loadingProposals ||
                                evaluatedProposals.length === 0
                            }
                        >

                            Create Procurement

                        </button>

                    </form>

                </div>

            )}


            {/* Procurement Records */}

            <div className="procurement-section">

                <div className="section-title">

                    <div>

                        <span className="section-eyebrow">
                            CONTRACTS
                        </span>

                        <h2>
                            Procurement Records
                        </h2>

                    </div>

                    <span>
                        {procurements.length} Records
                    </span>

                </div>


                {loading ? (

                    <div className="empty-state">
                        Loading procurements...
                    </div>

                ) : procurements.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No procurement records yet
                        </h3>

                        <p>
                            Once an evaluated proposal enters
                            procurement, its contract details
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="procurement-grid">

                        {procurements.map(
                            (procurement) => {

                                const evaluation =
                                    getEvaluation(
                                        procurement.proposal_id
                                    );

                                return (

                                    <div
                                        className="procurement-card"
                                        key={
                                            procurement.id
                                        }
                                    >


                                        <div className="card-top">

                                            <div>

                                                <span className="record-label">
                                                    PROCUREMENT
                                                </span>

                                                <h3>
                                                    #
                                                    {
                                                        procurement.id
                                                    }
                                                </h3>

                                            </div>


                                            <span className="status-badge">
                                                INITIATED
                                            </span>

                                        </div>


                                        <div className="procurement-details">


                                            <div>

                                                <span>
                                                    Proposal ID
                                                </span>

                                                <strong>
                                                    #
                                                    {
                                                        procurement.proposal_id
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Contract Number
                                                </span>

                                                <strong>
                                                    {
                                                        procurement.contract_number ||
                                                        "Not assigned"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Contract Value
                                                </span>

                                                <strong>

                                                    {
                                                        procurement.contract_value
                                                            ? `₹${Number(
                                                                  procurement.contract_value
                                                              ).toLocaleString(
                                                                  "en-IN"
                                                              )}`
                                                            : "Not specified"
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Start Date
                                                </span>

                                                <strong>

                                                    {
                                                        procurement.start_date
                                                            ? new Date(
                                                                  procurement.start_date
                                                              ).toLocaleDateString(
                                                                  "en-IN"
                                                              )
                                                            : "Not specified"
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Officer ID
                                                </span>

                                                <strong>
                                                    {
                                                        procurement.procurement_officer_id ||
                                                        "Not assigned"
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* Evaluation */}

                                        {evaluation && (

                                            <div className="procurement-evaluation">

                                                <div className="procurement-evaluation-header">

                                                    <strong>
                                                        Evaluation Summary
                                                    </strong>

                                                    <span>
                                                        Evaluated
                                                    </span>

                                                </div>


                                                <div className="procurement-score-grid">

                                                    <div>

                                                        <span>
                                                            Technical
                                                        </span>

                                                        <strong>
                                                            {
                                                                evaluation.technical_score
                                                            }
                                                            /10
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Innovation
                                                        </span>

                                                        <strong>
                                                            {
                                                                evaluation.innovation_score
                                                            }
                                                            /10
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Feasibility
                                                        </span>

                                                        <strong>
                                                            {
                                                                evaluation.feasibility_score
                                                            }
                                                            /10
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        )}


                                        <div className="card-actions">

                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        procurement.id
                                                    )
                                                }
                                            >

                                                Delete

                                            </button>

                                        </div>


                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default ProcurementDashboard;