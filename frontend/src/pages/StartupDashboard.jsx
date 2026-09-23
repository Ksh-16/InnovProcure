import { useEffect, useState } from "react";
import {
    Search,
    FileText,
    ArrowRight,
    X,
    Building2,
    CheckCircle2
} from "lucide-react";
import {
    getProposalStatus,
    getProposalStatusClass
} from "../utils/proposalStatus";
import API from "../services/api";

function StartupDashboard() {

    const [challenges, setChallenges] = useState([]);
    const [proposals, setProposals] = useState([]);

    const [evaluations, setEvaluations] = useState([]);
    const [procurements, setProcurements] = useState([]);
    const [pilotValidations, setPilotValidations] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");

    const [selectedChallenge, setSelectedChallenge] = useState(null);

    const [proposal, setProposal] = useState({
        title: "",
        solution_description: "",
        technical_approach: ""
    });


    // =================================
    // FETCH CHALLENGES
    // =================================

    const fetchChallenges = async () => {

        try {

            const response = await API.get("/challenges");

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
    // FETCH MY PROPOSALS
    // =================================

    const fetchProposals = async () => {

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
            "Error fetching proposal workflow data:",
            error
        );

    }

};


    // =================================
    // INITIAL LOAD
    // =================================

    useEffect(() => {

        fetchChallenges();
        fetchProposals();

    }, []);


    // =================================
    // CATEGORIES
    // =================================

    const categories = [
        "ALL",
        ...new Set(
            challenges
                .map((challenge) => challenge.category)
                .filter(Boolean)
        )
    ];


    // =================================
    // CHECK IF ALREADY APPLIED
    // =================================

    const hasApplied = (challengeId) => {

        return proposals.some(
            (proposal) =>
                proposal.challenge_id === challengeId
        );

    };


    // =================================
    // FILTER CHALLENGES
    // =================================

    const filteredChallenges = challenges.filter(
        (challenge) => {

            const matchesSearch =
                challenge.title
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||

                challenge.description
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "ALL" ||
                challenge.category === category;

            return matchesSearch && matchesCategory;

        }
    );


    // =================================
    // PROPOSAL FORM
    // =================================

    const handleProposalChange = (e) => {

        setProposal({
            ...proposal,
            [e.target.name]: e.target.value
        });

    };


    // =================================
    // SUBMIT PROPOSAL
    // =================================

    const submitProposal = async (e) => {

        e.preventDefault();

        if (!selectedChallenge) return;


        // Prevent duplicate submission

        if (hasApplied(selectedChallenge.id)) {

            alert(
                "You have already submitted a proposal for this challenge."
            );

            return;

        }


        try {

            await API.post("/proposals", {

                challenge_id:
                    selectedChallenge.id,

                title:
                    proposal.title,

                solution_description:
                    proposal.solution_description,

                technical_approach:
                    proposal.technical_approach

            });


            alert(
                "Proposal submitted successfully!"
            );


            setSelectedChallenge(null);


            setProposal({
                title: "",
                solution_description: "",
                technical_approach: ""
            });


            // Refresh proposal list

            fetchProposals();


        } catch (error) {

            console.error(
                "Proposal submission error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to submit proposal"
            );

        }

    };


    // =================================
    // CLOSE MODAL
    // =================================

    const closeModal = () => {

        setSelectedChallenge(null);

        setProposal({
            title: "",
            solution_description: "",
            technical_approach: ""
        });

    };


    return (

        <div className="startup-dashboard">


            {/* =================================
                HEADER
            ================================= */}

            <div className="startup-header">

                <div>

                    <h1>
                        Innovation Challenges
                    </h1>

                    <p>
                        Discover government problems
                        and submit your solutions.
                    </p>

                </div>


                <div className="startup-stat">

                    <FileText size={20} />

                    <div>

                        <strong>
                            {challenges.length}
                        </strong>

                        <span>
                            Active Challenges
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================
                FILTERS
            ================================= */}

            <div className="challenge-filters">

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search challenges..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >

                    {categories.map((item) => (

                        <option
                            value={item}
                            key={item}
                        >
                            {item}
                        </option>

                    ))}

                </select>

            </div>


            {/* =================================
                CHALLENGES
            ================================= */}

            {filteredChallenges.length === 0 ? (

                <div className="startup-empty">

                    <FileText size={40} />

                    <h3>
                        No challenges found
                    </h3>

                    <p>
                        Try changing your search
                        or category filter.
                    </p>

                </div>

            ) : (

                <div className="startup-challenge-grid">

                    {filteredChallenges.map(
                        (challenge) => {

                            const applied =
                                hasApplied(
                                    challenge.id
                                );

                            return (

                                <div
                                    className="startup-challenge-card"
                                    key={challenge.id}
                                >


                                    {/* CARD TOP */}

                                    <div className="startup-card-top">

                                        <div className="startup-file-icon">

                                            <FileText
                                                size={20}
                                            />

                                        </div>


                                        <div className="startup-card-tags">

                                            {challenge.department_name && (

                                                <span className="startup-department">

                                                    <Building2
                                                        size={13}
                                                    />

                                                    {
                                                        challenge.department_name
                                                    }

                                                </span>

                                            )}


                                            {challenge.category && (

                                                <span className="startup-category">

                                                    {
                                                        challenge.category
                                                    }

                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    {/* TITLE */}

                                    <h2>
                                        {challenge.title}
                                    </h2>


                                    {/* DESCRIPTION */}

                                    <p className="challenge-description">

                                        {
                                            challenge.description
                                        }

                                    </p>


                                    {/* REQUIREMENTS */}

                                    {challenge.requirements && (

                                        <div className="requirements">

                                            <strong>
                                                Requirements
                                            </strong>

                                            <p>
                                                {
                                                    challenge.requirements
                                                }
                                            </p>

                                        </div>

                                    )}


                                    {/* ACTION */}

                                    {applied ? (

                                        <button
                                            className="applied-btn"
                                            disabled
                                        >

                                            <CheckCircle2
                                                size={17}
                                            />

                                            Proposal Submitted

                                        </button>

                                    ) : (

                                        <button
                                            className="apply-btn"
                                            onClick={() =>
                                                setSelectedChallenge(
                                                    challenge
                                                )
                                            }
                                        >

                                            View & Apply

                                            <ArrowRight
                                                size={17}
                                            />

                                        </button>

                                    )}

                                </div>

                            );

                        }
                    )}

                </div>

            )}

             {/* =================================
    MY PROPOSALS
================================= */}

<div className="startup-proposals-section">

    <div className="startup-section-header">

        <div>

            <span className="section-eyebrow">
                SUBMITTED PROPOSALS
            </span>

            <h2>
                My Proposals
            </h2>

        </div>

        <span className="startup-proposal-count">
            {proposals.length} Proposals
        </span>

    </div>


    {proposals.length === 0 ? (

        <div className="startup-proposals-empty">

            <FileText size={32} />

            <h3>
                No proposals submitted yet
            </h3>

            <p>
                Browse the challenges above and submit
                your first proposal.
            </p>

        </div>

    ) : (

        <div className="startup-proposals-grid">

            {proposals.map((item) => {

                const status =
                    getProposalStatus(
                        item.id,
                        evaluations,
                         pilotValidations,
                        procurements
                    );


                const statusClass =
                    getProposalStatusClass(
                        status
                    );


                return (

                    <div
                        className="startup-proposal-card"
                        key={item.id}
                    >

                        <div className="startup-proposal-card-top">

                            <div>

                                <span className="proposal-id">
                                    PROPOSAL #{item.id}
                                </span>

                                <h3>
                                    {item.title}
                                </h3>

                            </div>


                            <span
                                className={`status-badge ${statusClass}`}
                            >
                                {status}
                            </span>

                        </div>


                        <div className="startup-proposal-info">

                            <div>

                                <span>
                                    Challenge
                                </span>

                                <strong>
                                    {item.challenge_title ||
                                        `Challenge #${item.challenge_id}`}
                                </strong>

                            </div>


                            {item.department_name && (

                                <div>

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {item.department_name}
                                    </strong>

                                </div>

                            )}

                        </div>


                        <p className="startup-proposal-description">

                            {item.solution_description}

                        </p>


                        {/* Evaluation Scores */}

                        {(() => {

                            const evaluation =
                                evaluations.find(
                                    (evaluation) =>
                                        evaluation.proposal_id ===
                                        item.id
                                );


                            if (!evaluation) {
                                return null;
                            }


                            return (

                                <div className="startup-evaluation-summary">

                                    <span>
                                        Evaluation
                                    </span>

                                    <div>

                                        <strong>
                                            Technical:{" "}
                                            {evaluation.technical_score}/10
                                        </strong>

                                        <strong>
                                            Innovation:{" "}
                                            {evaluation.innovation_score}/10
                                        </strong>

                                        <strong>
                                            Feasibility:{" "}
                                            {evaluation.feasibility_score}/10
                                        </strong>

                                    </div>

                                </div>

                            );

                        })()}

                    </div>

                );

            })}

        </div>

    )}

</div>
            {/* =================================
                PROPOSAL MODAL
            ================================= */}

            {selectedChallenge && (

                <div className="modal-overlay">

                    <div className="proposal-modal">


                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Submit Proposal
                                </h2>

                                <p>
                                    {
                                        selectedChallenge.title
                                    }
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={closeModal}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* CHALLENGE INFORMATION */}

                        <div className="proposal-challenge-info">

                            {selectedChallenge.department_name && (

                                <div>

                                    <Building2
                                        size={16}
                                    />

                                    <span>

                                        <strong>
                                            Department:
                                        </strong>{" "}

                                        {
                                            selectedChallenge.department_name
                                        }

                                    </span>

                                </div>

                            )}


                            {selectedChallenge.category && (

                                <div>

                                    <FileText
                                        size={16}
                                    />

                                    <span>

                                        <strong>
                                            Category:
                                        </strong>{" "}

                                        {
                                            selectedChallenge.category
                                        }

                                    </span>

                                </div>

                            )}

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                submitProposal
                            }
                        >


                            <div className="form-group">

                                <label>
                                    Proposal Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        proposal.title
                                    }
                                    onChange={
                                        handleProposalChange
                                    }
                                    placeholder="Enter proposal title"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Solution Description
                                </label>

                                <textarea
                                    name="solution_description"
                                    value={
                                        proposal.solution_description
                                    }
                                    onChange={
                                        handleProposalChange
                                    }
                                    placeholder="Describe your proposed solution"
                                    rows="5"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Technical Approach
                                </label>

                                <textarea
                                    name="technical_approach"
                                    value={
                                        proposal.technical_approach
                                    }
                                    onChange={
                                        handleProposalChange
                                    }
                                    placeholder="Explain the technical approach, technologies and implementation"
                                    rows="5"
                                    required
                                />

                            </div>


                            <button
                                type="submit"
                                className="apply-btn"
                            >

                                Submit Proposal

                                <ArrowRight
                                    size={17}
                                />

                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default StartupDashboard;