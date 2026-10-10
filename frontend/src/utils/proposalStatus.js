export const getProposalStatus = (
    proposalId,
    evaluations = [],
    pilotValidations = [],
    procurements = []
) => {

    // =========================================
    // 1. CHECK PROCUREMENT
    // =========================================

    const hasProcurement = procurements.some(
        (procurement) =>
            Number(procurement.proposal_id) === Number(proposalId)
    );

    if (hasProcurement) {
        return "PROCURED";
    }


    // =========================================
    // 2. CHECK PILOT VALIDATION
    // =========================================

    const proposalPilotValidations =
        pilotValidations.filter(
            (validation) =>
                Number(validation.proposal_id) ===
                Number(proposalId)
        );


    if (proposalPilotValidations.length > 0) {

        const hasPassedPilot =
            proposalPilotValidations.some(
                (validation) =>
                    validation.status === "PASSED"
            );

        const hasFailedPilot =
            proposalPilotValidations.some(
                (validation) =>
                    validation.status === "FAILED"
            );


        if (hasPassedPilot) {
            return "PILOT VALIDATED";
        }


        if (hasFailedPilot) {
            return "PILOT FAILED";
        }


        return "PILOT PENDING";
    }


    // =========================================
    // 3. CHECK EVALUATION
    // =========================================

    const hasEvaluation = evaluations.some(
        (evaluation) =>
            Number(evaluation.proposal_id) ===
            Number(proposalId)
    );

    if (hasEvaluation) {
        return "EVALUATED";
    }


    // =========================================
    // 4. DEFAULT
    // =========================================

    return "PENDING EVALUATION";
};


export const getProposalStatusClass = (status) => {

    switch (status) {

        case "PROCURED":
            return "status-procured";

        case "PILOT VALIDATED":
            return "status-pilot-validated";

        case "PILOT FAILED":
            return "status-pilot-failed";

        case "PILOT PENDING":
            return "status-pilot-pending";

        case "EVALUATED":
            return "status-evaluated";

        case "PENDING EVALUATION":
            return "status-pending";

        default:
            return "status-pending";
    }
};