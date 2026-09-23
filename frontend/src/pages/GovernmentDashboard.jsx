import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Plus,
    FileText,
    Trash2,
    Target,
    X,
    BarChart3,
    ClipboardCheck,
    ShoppingCart,
    Eye
} from "lucide-react";

import API from "../services/api";

import {
    getProposalStatus,
    getProposalStatusClass
} from "../utils/proposalStatus";


function GovernmentDashboard() {

    const navigate = useNavigate();

    // =================================
    // BASIC STATES
    // =================================

    const [challenges, setChallenges] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);


    // =================================
    // WORKFLOW STATES
    // =================================

    const [proposals, setProposals] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [procurements, setProcurements] = useState([]);
    const [pilotValidations, setPilotValidations] = useState([]);


    // =================================
    // PROGRESS STATES
    // =================================

    const [selectedProgressChallenge, setSelectedProgressChallenge] =
        useState(null);

    const [progressKpis, setProgressKpis] = useState([]);


    // =================================
    // KPI MANAGEMENT STATES
    // =================================

    const [kpis, setKpis] = useState([]);

    const [selectedChallenge, setSelectedChallenge] =
        useState(null);

    const [showKpiForm, setShowKpiForm] =
        useState(false);


    const [kpiForm, setKpiForm] = useState({
        name: "",
        description: "",
        target_value: "",
        unit: ""
    });


    // =================================
    // PILOT VALIDATION FORM STATES
    // =================================

    const [showPilotForm, setShowPilotForm] =
        useState(false);

    const [selectedProposal, setSelectedProposal] =
        useState(null);

    const [selectedPilotKpi, setSelectedPilotKpi] =
        useState(null);

    const [pilotForm, setPilotForm] = useState({
        actual_value: "",
        status: "PASSED",
        remarks: ""
    });


    // =================================
    // CHALLENGE FORM
    // =================================

    const [form, setForm] = useState({
        title: "",
        description: "",
        requirements: "",
        category: "",
        department_id: ""
    });


    // =================================
    // FETCH CHALLENGES
    // =================================

    const fetchChallenges = async () => {

        try {

            const response =
                await API.get("/challenges");

            setChallenges(
                response.data.challenges || []
            );

        } catch (error) {

            console.error(
                "Error fetching challenges:",
                error
            );

        }

    };


    // =================================
    // FETCH DEPARTMENTS
    // =================================

    const fetchDepartments = async () => {

        try {

            const response =
                await API.get("/departments");

            setDepartments(
                response.data.departments || []
            );

        } catch (error) {

            console.error(
                "Error fetching departments:",
                error
            );

            setDepartments([]);

        }

    };


    // =================================
    // FETCH WORKFLOW DATA
    // =================================

    const fetchWorkflowData = async () => {

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


            setProposals(
                proposalResponse.data.proposals || []
            );


            setEvaluations(
                evaluationResponse.data.evaluations || []
            );


            setProcurements(
                procurementResponse.data.procurements || []
            );


            setPilotValidations(
                pilotResponse.data.validations || []
            );

        } catch (error) {

            console.error(
                "Error fetching workflow data:",
                error
            );

        }

    };


    // =================================
    // INITIAL LOAD
    // =================================

    useEffect(() => {

        fetchChallenges();

        fetchWorkflowData();

        fetchDepartments();

    }, []);


    // =================================
    // FETCH KPIs FOR PROGRESS PANEL
    // =================================

    const fetchProgressKpis = async (challengeId) => {

        try {

            const response =
                await API.get(
                    `/kpis/challenge/${challengeId}`
                );

            setProgressKpis(
                response.data.kpis || []
            );

        } catch (error) {

            console.error(
                "Error fetching progress KPIs:",
                error
            );

            setProgressKpis([]);

        }

    };


    // =================================
    // OPEN PROGRESS PANEL
    // =================================

    const openProgressPanel = (challenge) => {

        setSelectedProgressChallenge(challenge);

        fetchProgressKpis(challenge.id);

    };


    // =================================
    // CHALLENGE FORM
    // =================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!form.department_id) {

            alert(
                "Please select a government department."
            );

            return;

        }


        try {

            await API.post(
                "/challenges",
                {
                    ...form,
                    department_id:
                        Number(form.department_id)
                }
            );


            alert(
                "Challenge created successfully!"
            );


            setForm({
                title: "",
                description: "",
                requirements: "",
                category: "",
                department_id: ""
            });


            setShowForm(false);


            fetchChallenges();

        } catch (error) {

            console.error(
                "Error creating challenge:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to create challenge"
            );

        }

    };


    // =================================
    // DELETE CHALLENGE
    // =================================

    const deleteChallenge = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this challenge?"
            );


        if (!confirmDelete) return;


        try {

            await API.delete(
                `/challenges/${id}`
            );


            alert(
                "Challenge deleted successfully!"
            );


            if (
                selectedChallenge &&
                selectedChallenge.id === id
            ) {

                setSelectedChallenge(null);

                setKpis([]);

                setShowKpiForm(false);

            }


            if (
                selectedProgressChallenge &&
                selectedProgressChallenge.id === id
            ) {

                setSelectedProgressChallenge(null);

                setProgressKpis([]);

            }


            fetchChallenges();

            fetchWorkflowData();

        } catch (error) {

            console.error(
                "Error deleting challenge:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete challenge"
            );

        }

    };


    // =================================
    // KPI MANAGEMENT
    // =================================

    const fetchKpis = async (challengeId) => {

        try {

            const response =
                await API.get(
                    `/kpis/challenge/${challengeId}`
                );


            setKpis(
                response.data.kpis || []
            );

        } catch (error) {

            console.error(
                "Error fetching KPIs:",
                error
            );


            setKpis([]);

        }

    };


    const openKpiPanel = (challenge) => {

        setSelectedChallenge(challenge);

        setShowKpiForm(false);


        setKpiForm({
            name: "",
            description: "",
            target_value: "",
            unit: ""
        });


        fetchKpis(challenge.id);

    };


    const closeKpiPanel = () => {

        setSelectedChallenge(null);

        setKpis([]);

        setShowKpiForm(false);

    };


    const handleKpiChange = (e) => {

        setKpiForm({
            ...kpiForm,
            [e.target.name]: e.target.value
        });

    };


    const handleCreateKpi = async (e) => {

        e.preventDefault();


        if (!selectedChallenge) return;


        try {

            await API.post(
                "/kpis",
                {
                    challenge_id:
                        selectedChallenge.id,

                    name:
                        kpiForm.name,

                    description:
                        kpiForm.description,

                    target_value:
                        kpiForm.target_value
                            ? Number(
                                kpiForm.target_value
                            )
                            : null,

                    unit:
                        kpiForm.unit
                }
            );


            alert(
                "KPI created successfully!"
            );


            setKpiForm({
                name: "",
                description: "",
                target_value: "",
                unit: ""
            });


            setShowKpiForm(false);


            fetchKpis(
                selectedChallenge.id
            );


            if (selectedProgressChallenge) {

                fetchProgressKpis(
                    selectedProgressChallenge.id
                );

            }

        } catch (error) {

            console.error(
                "Error creating KPI:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to create KPI"
            );

        }

    };


    const handleDeleteKpi = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this KPI?"
            );


        if (!confirmDelete) return;


        try {

            await API.delete(
                `/kpis/${id}`
            );


            alert(
                "KPI deleted successfully!"
            );


            fetchKpis(
                selectedChallenge.id
            );


            if (selectedProgressChallenge) {

                fetchProgressKpis(
                    selectedProgressChallenge.id
                );

            }

        } catch (error) {

            console.error(
                "Error deleting KPI:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete KPI"
            );

        }

    };


    // =================================
    // PROGRESS CALCULATIONS
    // =================================

    const getChallengeProposals = (
        challengeId
    ) => {

        return proposals.filter(
            (proposal) =>
                Number(
                    proposal.challenge_id
                ) === Number(challengeId)
        );

    };


    const getChallengeEvaluations = (
        challengeId
    ) => {

        const challengeProposals =
            getChallengeProposals(
                challengeId
            );


        const proposalIds =
            challengeProposals.map(
                (proposal) =>
                    Number(proposal.id)
            );


        return evaluations.filter(
            (evaluation) =>
                proposalIds.includes(
                    Number(
                        evaluation.proposal_id
                    )
                )
        );

    };


    const getChallengeProcurements = (
        challengeId
    ) => {

        const challengeProposals =
            getChallengeProposals(
                challengeId
            );


        const proposalIds =
            challengeProposals.map(
                (proposal) =>
                    Number(proposal.id)
            );


        return procurements.filter(
            (procurement) =>
                proposalIds.includes(
                    Number(
                        procurement.proposal_id
                    )
                )
        );

    };


    // =================================
    // PILOT VALIDATION HELPERS
    // =================================

    const getProposalPilotValidations = (
        proposalId
    ) => {

        return pilotValidations.filter(
            (validation) =>
                Number(
                    validation.proposal_id
                ) === Number(proposalId)
        );

    };


    const getChallengePilotValidations = (
        challengeId
    ) => {

        const challengeProposals =
            getChallengeProposals(
                challengeId
            );


        const proposalIds =
            challengeProposals.map(
                (proposal) =>
                    Number(proposal.id)
            );


        return pilotValidations.filter(
            (validation) =>
                proposalIds.includes(
                    Number(
                        validation.proposal_id
                    )
                )
        );

    };


    const getProgress = (challenge) => {

        const challengeProposals =
            getChallengeProposals(
                challenge.id
            );


        const challengeEvaluations =
            getChallengeEvaluations(
                challenge.id
            );


        const challengeProcurements =
            getChallengeProcurements(
                challenge.id
            );


        const challengePilotValidations =
            getChallengePilotValidations(
                challenge.id
            );


        return {

            proposals:
                challengeProposals.length,

            evaluations:
                challengeEvaluations.length,

            pilotValidations:
                challengePilotValidations.length,

            procurements:
                challengeProcurements.length

        };

    };


    // =================================
    // CLOSE PROGRESS
    // =================================

    const closeProgressPanel = () => {

        setSelectedProgressChallenge(null);

        setProgressKpis([]);

    };


    // =================================
    // OPEN PILOT VALIDATION FORM
    // =================================

    const openPilotValidationForm = (
        proposal,
        kpi
    ) => {

        setSelectedProposal(
            proposal
        );

        setSelectedPilotKpi(
            kpi
        );


        setPilotForm({
            actual_value: "",
            status: "PASSED",
            remarks: ""
        });


        setShowPilotForm(true);

    };


    // =================================
    // CLOSE PILOT VALIDATION FORM
    // =================================

    const closePilotValidationForm = () => {

        setShowPilotForm(false);

        setSelectedProposal(null);

        setSelectedPilotKpi(null);


        setPilotForm({
            actual_value: "",
            status: "PASSED",
            remarks: ""
        });

    };


    // =================================
    // PILOT FORM CHANGE
    // =================================

    const handlePilotFormChange = (e) => {

        setPilotForm({
            ...pilotForm,
            [e.target.name]: e.target.value
        });

    };


    // =================================
    // CREATE PILOT VALIDATION
    // =================================

    const handleCreatePilotValidation = async (
        e
    ) => {

        e.preventDefault();


        if (
            !selectedProposal ||
            !selectedPilotKpi
        ) {

            return;

        }


        try {

            await API.post(
                "/pilot-validations",
                {
                    proposal_id:
                        selectedProposal.id,

                    kpi_id:
                        selectedPilotKpi.id,

                    actual_value:
                        pilotForm.actual_value === ""
                            ? null
                            : Number(
                                pilotForm.actual_value
                            ),

                    status:
                        pilotForm.status,

                    remarks:
                        pilotForm.remarks || null
                }
            );


            alert(
                "Pilot validation recorded successfully!"
            );


            closePilotValidationForm();


            await fetchWorkflowData();

        } catch (error) {

            console.error(
                "Error creating pilot validation:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to record pilot validation."
            );

        }

    };


    // =================================
    // UPDATE PILOT VALIDATION
    // =================================

    const handleUpdatePilotValidation = async (
        validation
    ) => {

        const actualValue =
            window.prompt(
                "Enter actual KPI value:",
                validation.actual_value ??
                ""
            );


        if (actualValue === null) return;


        const status =
            window.prompt(
                "Enter status: PENDING, PASSED or FAILED",
                validation.status ||
                "PASSED"
            );


        if (status === null) return;


        const normalizedStatus =
            status.trim().toUpperCase();


        if (
            ![
                "PENDING",
                "PASSED",
                "FAILED"
            ].includes(
                normalizedStatus
            )
        ) {

            alert(
                "Invalid status. Please use PENDING, PASSED or FAILED."
            );

            return;

        }


        const remarks =
            window.prompt(
                "Enter remarks:",
                validation.remarks || ""
            );


        try {

            await API.put(
                `/pilot-validations/${validation.id}`,
                {
                    actual_value:
                        actualValue === ""
                            ? null
                            : Number(
                                actualValue
                            ),

                    status:
                        normalizedStatus,

                    remarks:
                        remarks || null
                }
            );


            alert(
                "Pilot validation updated successfully!"
            );


            fetchWorkflowData();

        } catch (error) {

            console.error(
                "Error updating pilot validation:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to update pilot validation."
            );

        }

    };


    // =================================
    // SELECTED PROGRESS DATA
    // =================================

    const selectedProgressData =
        selectedProgressChallenge
            ? {

                proposals:
                    getChallengeProposals(
                        selectedProgressChallenge.id
                    ),

                evaluations:
                    getChallengeEvaluations(
                        selectedProgressChallenge.id
                    ),

                pilotValidations:
                    getChallengePilotValidations(
                        selectedProgressChallenge.id
                    ),

                procurements:
                    getChallengeProcurements(
                        selectedProgressChallenge.id
                    )

            }
            : null;


    // =================================
    // RENDER
    // =================================

    return (

        <div className="government-dashboard">


            {/* =================================
                HEADER
            ================================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Government Dashboard
                    </h1>

                    <p>
                        Create, manage and track
                        innovation challenges
                    </p>

                </div>


                <button
                    className="primary-btn"
                    onClick={() =>
                        setShowForm(!showForm)
                    }
                >

                    <Plus size={18} />

                    {showForm
                        ? "Close Form"
                        : "Create Challenge"}

                </button>

            </div>


            {/* =================================
                CREATE CHALLENGE
            ================================= */}

            {showForm && (

                <div className="challenge-form-card">

                    <h2>
                        Create New Challenge
                    </h2>


                    <form onSubmit={handleSubmit}>


                        <div className="form-group">

                            <label>
                                Challenge Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter challenge title"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the government problem"
                                rows="4"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Requirements
                            </label>

                            <textarea
                                name="requirements"
                                value={form.requirements}
                                onChange={handleChange}
                                placeholder="What should the startup provide?"
                                rows="4"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="e.g. Healthcare, Education, Waste Management"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Government Department
                            </label>


                            {departments.length === 0 ? (

                                <div className="department-warning">

                                    <p>
                                        No government department
                                        has been created yet.
                                    </p>


                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() =>
                                            navigate(
                                                "/departments"
                                            )
                                        }
                                    >

                                        <Plus size={16} />

                                        Create Department

                                    </button>

                                </div>

                            ) : (

                                <select
                                    name="department_id"
                                    value={
                                        form.department_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Government
                                        Department
                                    </option>


                                    {departments.map(
                                        (department) => (

                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >

                                                {
                                                    department.department_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            )}

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={
                                    departments.length === 0
                                }
                            >
                                Create Challenge
                            </button>

                        </div>


                    </form>

                </div>

            )}


            {/* =================================
                OVERVIEW
            ================================= */}

            <div className="government-overview">


                <div className="overview-card">

                    <div className="overview-icon">
                        <FileText size={20} />
                    </div>

                    <div>

                        <span>
                            Challenges
                        </span>

                        <strong>
                            {challenges.length}
                        </strong>

                    </div>

                </div>


                <div className="overview-card">

                    <div className="overview-icon">
                        <ClipboardCheck size={20} />
                    </div>

                    <div>

                        <span>
                            Proposals
                        </span>

                        <strong>
                            {proposals.length}
                        </strong>

                    </div>

                </div>


                <div className="overview-card">

                    <div className="overview-icon">
                        <BarChart3 size={20} />
                    </div>

                    <div>

                        <span>
                            Evaluations
                        </span>

                        <strong>
                            {evaluations.length}
                        </strong>

                    </div>

                </div>


                <div className="overview-card">

                    <div className="overview-icon">
                        <ShoppingCart size={20} />
                    </div>

                    <div>

                        <span>
                            Procurement
                        </span>

                        <strong>
                            {procurements.length}
                        </strong>

                    </div>

                </div>


            </div>


            {/* =================================
                CHALLENGES
            ================================= */}

            <div className="challenge-section">


                <div className="section-title">

                    <div>

                        <h2>
                            Your Challenges
                        </h2>

                        <p>
                            Government innovation
                            challenges
                        </p>

                    </div>


                    <span className="challenge-count">

                        {challenges.length}
                        {" "}
                        Challenges

                    </span>

                </div>


                {challenges.length === 0 ? (

                    <div className="empty-state">

                        <FileText size={40} />

                        <h3>
                            No challenges yet
                        </h3>

                        <p>
                            Create your first innovation
                            challenge to start receiving
                            startup solutions.
                        </p>

                    </div>

                ) : (

                    <div className="challenge-grid">


                        {challenges.map(
                            (challenge) => {

                                const progress =
                                    getProgress(
                                        challenge
                                    );


                                return (

                                    <div
                                        className="challenge-card"
                                        key={
                                            challenge.id
                                        }
                                    >


                                        <div className="challenge-card-top">

                                            <div className="challenge-icon">

                                                <FileText
                                                    size={20}
                                                />

                                            </div>


                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteChallenge(
                                                        challenge.id
                                                    )
                                                }
                                            >

                                                <Trash2
                                                    size={17}
                                                />

                                            </button>

                                        </div>


                                        <h3>
                                            {challenge.title}
                                        </h3>


                                        <p>
                                            {
                                                challenge.description
                                            }
                                        </p>


                                        <div className="challenge-meta">


                                            {challenge.department_name && (

                                                <span className="department-tag">

                                                    {
                                                        challenge.department_name
                                                    }

                                                </span>

                                            )}


                                            {challenge.category && (

                                                <span className="category-tag">

                                                    {
                                                        challenge.category
                                                    }

                                                </span>

                                            )}

                                        </div>


                                        {/* PROGRESS SUMMARY */}

                                        <div className="challenge-progress">


                                            <div className="progress-item">

                                                <FileText
                                                    size={15}
                                                />

                                                <span>
                                                    Proposals
                                                </span>

                                                <strong>
                                                    {
                                                        progress.proposals
                                                    }
                                                </strong>

                                            </div>


                                            <div className="progress-item">

                                                <ClipboardCheck
                                                    size={15}
                                                />

                                                <span>
                                                    Evaluated
                                                </span>

                                                <strong>
                                                    {
                                                        progress.evaluations
                                                    }
                                                </strong>

                                            </div>


                                            <div className="progress-item">

                                                <ShoppingCart
                                                    size={15}
                                                />

                                                <span>
                                                    Procurement
                                                </span>

                                                <strong>
                                                    {
                                                        progress.procurements
                                                    }
                                                </strong>

                                            </div>


                                        </div>


                                        {/* ACTIONS */}

                                        <div className="challenge-actions">


                                            <button
                                                className="secondary-btn"
                                                onClick={() =>
                                                    openProgressPanel(
                                                        challenge
                                                    )
                                                }
                                            >

                                                <Eye size={16} />

                                                View Progress

                                            </button>


                                            <button
                                                className="secondary-btn kpi-button"
                                                onClick={() =>
                                                    openKpiPanel(
                                                        challenge
                                                    )
                                                }
                                            >

                                                <Target
                                                    size={16}
                                                />

                                                Manage KPIs

                                            </button>


                                        </div>


                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* =================================
                PROGRESS PANEL
            ================================= */}

            {selectedProgressChallenge &&
                selectedProgressData && (

                    <div className="progress-panel">


                        <div className="progress-panel-header">


                            <div>

                                <h2>
                                    Challenge Progress
                                </h2>

                                <p>
                                    {
                                        selectedProgressChallenge.title
                                    }
                                </p>

                            </div>


                            <button
                                className="close-kpi-btn"
                                onClick={
                                    closeProgressPanel
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* PIPELINE */}

                        <div className="workflow-pipeline">


                            <div className="pipeline-step">

                                <div className="pipeline-number">
                                    1
                                </div>

                                <strong>
                                    Challenge
                                </strong>

                                <span>
                                    Published
                                </span>

                            </div>


                            <div className="pipeline-line" />


                            <div className="pipeline-step">

                                <div className="pipeline-number">
                                    2
                                </div>

                                <strong>
                                    Proposals
                                </strong>

                                <span>
                                    {
                                        selectedProgressData
                                            .proposals
                                            .length
                                    }
                                    {" "}
                                    received
                                </span>

                            </div>


                            <div className="pipeline-line" />


                            <div className="pipeline-step">

                                <div className="pipeline-number">
                                    3
                                </div>

                                <strong>
                                    Evaluation
                                </strong>

                                <span>
                                    {
                                        selectedProgressData
                                            .evaluations
                                            .length
                                    }
                                    {" "}
                                    evaluated
                                </span>

                            </div>


                            <div className="pipeline-line" />


                            <div className="pipeline-step">

                                <div className="pipeline-number">
                                    4
                                </div>

                                <strong>
                                    Pilot Validation
                                </strong>

                                <span>
                                    {
                                        selectedProgressData
                                            .pilotValidations
                                            .length
                                    }
                                    {" "}
                                    validated
                                </span>

                            </div>


                            <div className="pipeline-line" />


                            <div className="pipeline-step">

                                <div className="pipeline-number">
                                    5
                                </div>

                                <strong>
                                    Procurement
                                </strong>

                                <span>
                                    {
                                        selectedProgressData
                                            .procurements
                                            .length
                                    }
                                    {" "}
                                    initiated
                                </span>

                            </div>


                        </div>


                        {/* =================================
                            PROPOSALS
                        ================================= */}

                        <div className="progress-section">


                            <div className="progress-section-header">

                                <h3>
                                    Proposals
                                </h3>

                                <span>
                                    {
                                        selectedProgressData
                                            .proposals
                                            .length
                                    }
                                </span>

                            </div>


                            {selectedProgressData
                                .proposals.length === 0 ? (

                                <div className="progress-empty">

                                    No startup proposals
                                    received yet.

                                </div>

                            ) : (

                                <div className="progress-proposal-list">


                                    {selectedProgressData
                                        .proposals
                                        .map(
                                            (proposal) => {

                                                const evaluation =
                                                    selectedProgressData
                                                        .evaluations
                                                        .find(
                                                            (item) =>
                                                                Number(
                                                                    item.proposal_id
                                                                ) ===
                                                                Number(
                                                                    proposal.id
                                                                )
                                                        );


                                                const procurement =
                                                    selectedProgressData
                                                        .procurements
                                                        .find(
                                                            (item) =>
                                                                Number(
                                                                    item.proposal_id
                                                                ) ===
                                                                Number(
                                                                    proposal.id
                                                                )
                                                        );


                                                const proposalPilotValidations =
                                                    getProposalPilotValidations(
                                                        proposal.id
                                                    );


                                                const status =
    getProposalStatus(
        proposal.id,
        selectedProgressData
            .evaluations,
        selectedProgressData
            .pilotValidations,
        selectedProgressData
            .procurements
    );


                                                const statusClass =
                                                    getProposalStatusClass(
                                                        status
                                                    );


                                                return (

                                                    <div
                                                        className="progress-proposal-card"
                                                        key={
                                                            proposal.id
                                                        }
                                                    >


                                                        <div>

                                                            <h4>
                                                                {
                                                                    proposal.title
                                                                }
                                                            </h4>

                                                            <p>
                                                                Proposal #
                                                                {
                                                                    proposal.id
                                                                }
                                                            </p>

                                                        </div>


                                                        <div className="proposal-statuses">

                                                            <span
                                                                className={
                                                                    `status-badge ${statusClass}`
                                                                }
                                                            >
                                                                {status}
                                                            </span>

                                                        </div>


                                                        {/* EVALUATION */}

                                                        {evaluation && (

                                                            <div className="score-summary">

                                                                <span>
                                                                    Technical:
                                                                    <strong>
                                                                        {" "}
                                                                        {
                                                                            evaluation
                                                                                .technical_score
                                                                        }
                                                                    </strong>
                                                                </span>

                                                                <span>
                                                                    Innovation:
                                                                    <strong>
                                                                        {" "}
                                                                        {
                                                                            evaluation
                                                                                .innovation_score
                                                                        }
                                                                    </strong>
                                                                </span>

                                                                <span>
                                                                    Feasibility:
                                                                    <strong>
                                                                        {" "}
                                                                        {
                                                                            evaluation
                                                                                .feasibility_score
                                                                        }
                                                                    </strong>
                                                                </span>

                                                            </div>

                                                        )}


                                                        {/* PROCUREMENT */}

                                                        {procurement && (

                                                            <div className="procurement-summary">

                                                                <ShoppingCart
                                                                    size={15}
                                                                />

                                                                <span>
                                                                    Contract:
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        procurement
                                                                            .contract_number ||
                                                                        "Pending"
                                                                    }
                                                                </strong>


                                                                {procurement
                                                                    .contract_value && (

                                                                    <span>
                                                                        ₹
                                                                        {
                                                                            procurement
                                                                                .contract_value
                                                                        }
                                                                    </span>

                                                                )}

                                                            </div>

                                                        )}


                                                        {/* =================================
                                                            PILOT VALIDATION
                                                        ================================= */}

                                                        <div className="pilot-validation-section">


                                                            <div className="pilot-validation-header">

                                                                <div>

                                                                    <h5>
                                                                        Pilot Validation
                                                                    </h5>

                                                                    <p>
                                                                        Validate challenge KPIs
                                                                    </p>

                                                                </div>


                                                                <span>
                                                                    {
                                                                        proposalPilotValidations.length
                                                                    }
                                                                    {" "}
                                                                    validated
                                                                </span>

                                                            </div>


                                                            {/* KPI LIST */}

                                                            {progressKpis.length === 0 ? (

                                                                <div className="pilot-empty">

                                                                    <p>
                                                                        No KPIs have been
                                                                        defined for this
                                                                        challenge yet.
                                                                    </p>


                                                                    <button
                                                                        className="secondary-btn"
                                                                        onClick={() =>
                                                                            openKpiPanel(
                                                                                selectedProgressChallenge
                                                                            )
                                                                        }
                                                                    >

                                                                        <Target
                                                                            size={15}
                                                                        />

                                                                        Manage KPIs

                                                                    </button>

                                                                </div>

                                                            ) : (

                                                                <div className="pilot-kpi-list">


                                                                    {progressKpis.map(
                                                                        (kpi) => {

                                                                            const validation =
                                                                                proposalPilotValidations.find(
                                                                                    (
                                                                                        item
                                                                                    ) =>
                                                                                        Number(
                                                                                            item.kpi_id
                                                                                        ) ===
                                                                                        Number(
                                                                                            kpi.id
                                                                                        )
                                                                                );


                                                                            return (

                                                                                <div
                                                                                    className="pilot-validation-card"
                                                                                    key={
                                                                                        kpi.id
                                                                                    }
                                                                                >


                                                                                    <div className="pilot-kpi-info">

                                                                                        <strong>
                                                                                            {
                                                                                                kpi.name
                                                                                            }
                                                                                        </strong>

                                                                                        <span>
                                                                                            Target:
                                                                                            {" "}
                                                                                            {
                                                                                                kpi.target_value ??
                                                                                                "N/A"
                                                                                            }
                                                                                            {" "}
                                                                                            {
                                                                                                kpi.unit ||
                                                                                                ""
                                                                                            }
                                                                                        </span>

                                                                                        {kpi.description && (

                                                                                            <small>
                                                                                                {
                                                                                                    kpi.description
                                                                                                }
                                                                                            </small>

                                                                                        )}

                                                                                    </div>


                                                                                    {validation ? (

                                                                                        <div className="pilot-kpi-result">


                                                                                            <div>

                                                                                                <span>
                                                                                                    Actual:
                                                                                                    {" "}
                                                                                                    <strong>
                                                                                                        {
                                                                                                            validation.actual_value ??
                                                                                                            "N/A"
                                                                                                        }
                                                                                                    </strong>
                                                                                                    {" "}
                                                                                                    {
                                                                                                        validation.unit ||
                                                                                                        kpi.unit ||
                                                                                                        ""
                                                                                                    }
                                                                                                </span>


                                                                                                <span
                                                                                                    className={
                                                                                                        `pilot-status ${(validation.status || "PENDING").toLowerCase()}`
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        validation.status
                                                                                                    }
                                                                                                </span>

                                                                                            </div>


                                                                                            {validation.remarks && (

                                                                                                <p className="pilot-remarks">

                                                                                                    <strong>
                                                                                                        Remarks:
                                                                                                    </strong>
                                                                                                    {" "}
                                                                                                    {
                                                                                                        validation.remarks
                                                                                                    }

                                                                                                </p>

                                                                                            )}


                                                                                            <button
                                                                                                className="secondary-btn"
                                                                                                onClick={() =>
                                                                                                    handleUpdatePilotValidation(
                                                                                                        validation
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                Update Validation
                                                                                            </button>


                                                                                        </div>

                                                                                    ) : (

                                                                                        <button
                                                                                            className="primary-btn"
                                                                                            onClick={() =>
                                                                                                openPilotValidationForm(
                                                                                                    proposal,
                                                                                                    kpi
                                                                                                )
                                                                                            }
                                                                                        >

                                                                                            <ClipboardCheck
                                                                                                size={15}
                                                                                            />

                                                                                            Validate KPI

                                                                                        </button>

                                                                                    )}

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
                                        )}

                                </div>

                            )}

                        </div>


                    </div>

                )}


            {/* =================================
                PILOT VALIDATION MODAL
            ================================= */}

            {showPilotForm &&
                selectedProposal &&
                selectedPilotKpi && (

                    <div className="pilot-modal-overlay">


                        <div className="pilot-modal">


                            <div className="pilot-modal-header">

                                <div>

                                    <h2>
                                        Validate KPI
                                    </h2>

                                    <p>
                                        {
                                            selectedProposal.title
                                        }
                                    </p>

                                </div>


                                <button
                                    className="close-kpi-btn"
                                    onClick={
                                        closePilotValidationForm
                                    }
                                >

                                    <X size={20} />

                                </button>

                            </div>


                            <div className="pilot-kpi-summary">


                                <div>

                                    <strong>
                                        KPI
                                    </strong>

                                    <span>
                                        {
                                            selectedPilotKpi.name
                                        }
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        Target
                                    </strong>

                                    <span>
                                        {
                                            selectedPilotKpi
                                                .target_value ??
                                            "N/A"
                                        }
                                        {" "}
                                        {
                                            selectedPilotKpi.unit ||
                                            ""
                                        }
                                    </span>

                                </div>


                                {selectedPilotKpi.description && (

                                    <p>
                                        {
                                            selectedPilotKpi
                                                .description
                                        }
                                    </p>

                                )}

                            </div>


                            <form
                                className="pilot-form"
                                onSubmit={
                                    handleCreatePilotValidation
                                }
                            >


                                <div className="form-group">

                                    <label>
                                        Actual Value
                                    </label>

                                    <input
                                        type="number"
                                        name="actual_value"
                                        value={
                                            pilotForm.actual_value
                                        }
                                        onChange={
                                            handlePilotFormChange
                                        }
                                        placeholder="Enter measured value"
                                        step="0.01"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Validation Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            pilotForm.status
                                        }
                                        onChange={
                                            handlePilotFormChange
                                        }
                                    >

                                        <option value="PENDING">
                                            PENDING
                                        </option>

                                        <option value="PASSED">
                                            PASSED
                                        </option>

                                        <option value="FAILED">
                                            FAILED
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Remarks
                                    </label>

                                    <textarea
                                        name="remarks"
                                        value={
                                            pilotForm.remarks
                                        }
                                        onChange={
                                            handlePilotFormChange
                                        }
                                        placeholder="Enter validation remarks"
                                        rows="4"
                                    />

                                </div>


                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={
                                            closePilotValidationForm
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="primary-btn"
                                    >

                                        <ClipboardCheck
                                            size={16}
                                        />

                                        Save Validation

                                    </button>

                                </div>


                            </form>

                        </div>

                    </div>

                )}


            {/* =================================
                KPI MANAGEMENT PANEL
            ================================= */}

            {selectedChallenge && (

                <div className="kpi-panel">


                    <div className="kpi-panel-header">

                        <div>

                            <h2>
                                KPIs —{" "}
                                {
                                    selectedChallenge.title
                                }
                            </h2>

                            <p>
                                Define measurable targets
                                for this challenge.
                            </p>

                        </div>


                        <button
                            className="close-kpi-btn"
                            onClick={
                                closeKpiPanel
                            }
                        >

                            <X size={20} />

                        </button>

                    </div>


                    {!showKpiForm && (

                        <button
                            className="primary-btn"
                            onClick={() =>
                                setShowKpiForm(true)
                            }
                        >

                            <Plus size={17} />

                            Add KPI

                        </button>

                    )}


                    {showKpiForm && (

                        <form
                            className="kpi-form"
                            onSubmit={
                                handleCreateKpi
                            }
                        >


                            <div className="form-group">

                                <label>
                                    KPI Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        kpiForm.name
                                    }
                                    onChange={
                                        handleKpiChange
                                    }
                                    placeholder="e.g. Collection Efficiency"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Target Value
                                </label>

                                <input
                                    type="number"
                                    name="target_value"
                                    value={
                                        kpiForm.target_value
                                    }
                                    onChange={
                                        handleKpiChange
                                    }
                                    placeholder="e.g. 90"
                                    step="0.01"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Unit
                                </label>

                                <input
                                    type="text"
                                    name="unit"
                                    value={
                                        kpiForm.unit
                                    }
                                    onChange={
                                        handleKpiChange
                                    }
                                    placeholder="e.g. %, minutes, users"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        kpiForm.description
                                    }
                                    onChange={
                                        handleKpiChange
                                    }
                                    placeholder="Describe what this KPI measures"
                                    rows="3"
                                />

                            </div>


                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() =>
                                        setShowKpiForm(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-btn"
                                >
                                    Save KPI
                                </button>

                            </div>


                        </form>

                    )}


                    <div className="kpi-list">


                        <div className="kpi-list-header">

                            <h3>
                                Defined KPIs
                            </h3>

                            <span>
                                {kpis.length} KPIs
                            </span>

                        </div>


                        {kpis.length === 0 ? (

                            <div className="empty-state">

                                <Target size={35} />

                                <h3>
                                    No KPIs added
                                </h3>

                                <p>
                                    Add measurable targets
                                    for this challenge.
                                </p>

                            </div>

                        ) : (

                            kpis.map(
                                (kpi) => (

                                    <div
                                        className="kpi-card"
                                        key={
                                            kpi.id
                                        }
                                    >


                                        <div className="kpi-info">

                                            <h3>
                                                {
                                                    kpi.name
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    kpi.description ||
                                                    "No description provided"
                                                }
                                            </p>

                                        </div>


                                        <div className="kpi-target">

                                            <strong>
                                                {
                                                    kpi.target_value ??
                                                    "N/A"
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    kpi.unit ||
                                                    ""
                                                }
                                            </span>

                                        </div>


                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                handleDeleteKpi(
                                                    kpi.id
                                                )
                                            }
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                            Delete

                                        </button>


                                    </div>

                                )
                            )

                        )}

                    </div>


                </div>

            )}


        </div>

    );

}


export default GovernmentDashboard;