export const getProposalStatus = (
    proposalId,
    evaluations = [],
    pilotValidations = [],
    procurements = [],
    totalKpis = 0
) => {
    const hasProcurement = procurements.some(
        (procurement) =>
            Number(procurement.proposal_id) === Number(proposalId)
    );

    if (hasProcurement) return "PROCURED";

    const proposalPilotValidations = pilotValidations.filter(
        (validation) =>
            Number(validation.proposal_id) === Number(proposalId)
    );

    if (proposalPilotValidations.length > 0) {
        const hasFailedPilot = proposalPilotValidations.some(
            (validation) => validation.status === "FAILED"
        );

        const allKpisPassed =
            totalKpis > 0 &&
            proposalPilotValidations.length === totalKpis &&
            new Set(
                proposalPilotValidations.map(
                    (validation) => Number(validation.kpi_id)
                )
            ).size === totalKpis &&
            proposalPilotValidations.every(
                (validation) => validation.status === "PASSED"
            );

        if (hasFailedPilot) return "PILOT FAILED";
        if (allKpisPassed) return "PILOT VALIDATED";

        return "PILOT PENDING";
    }

    const hasEvaluation = evaluations.some(
        (evaluation) =>
            Number(evaluation.proposal_id) === Number(proposalId)
    );

    if (hasEvaluation) return "EVALUATED";

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