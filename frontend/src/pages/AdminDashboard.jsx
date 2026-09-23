import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    FileText,
    ClipboardCheck,
    ShoppingCart,
    Rocket,
    Activity,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
    startups: 0,
    departments: 0,
    challenges: 0,
    proposals: 0,
    evaluations: 0,
    pilotValidations: 0,
    procurements: 0
});

    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [
    startupResponse,
    departmentResponse,
    challengeResponse,
    proposalResponse,
    evaluationResponse,
    pilotResponse,
    procurementResponse
] = await Promise.all([
    API.get("/startups"),
    API.get("/departments"),
    API.get("/challenges"),
    API.get("/proposals"),
    API.get("/evaluations"),
    API.get("/pilot-validations"),
    API.get("/procurements")
]);

            setStats({
                startups:
                    startupResponse.data.startups?.length || 0,

                departments:
                    departmentResponse.data.departments?.length || 0,

                challenges:
                    challengeResponse.data.challenges?.length || 0,

                proposals:
                    proposalResponse.data.proposals?.length || 0,

                evaluations:
                    evaluationResponse.data.evaluations?.length || 0,

                pilotValidations:
    pilotResponse.data.validations?.length || 0,

                procurements:
                    procurementResponse.data.procurements?.length || 0
            });

        } catch (error) {
            console.error(
                "Error fetching admin dashboard data:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = [
        {
            title: "Registered Startups",
            value: stats.startups,
            icon: Rocket,
            path: "/startups"
        },
        {
            title: "Government Departments",
            value: stats.departments,
            icon: Building2,
            path: "/departments"
        },
        {
            title: "Active Challenges",
            value: stats.challenges,
            icon: FileText,
            path: "/challenges"
        },
        {
            title: "Total Proposals",
            value: stats.proposals,
            icon: ClipboardCheck,
            path: "/proposals"
        },
        {
            title: "Evaluations",
            value: stats.evaluations,
            icon: Activity,
            path: "/evaluations"
        },
        {
    title: "Pilot Validations",
    value: stats.pilotValidations,
    icon: ClipboardCheck,
    path: "/proposals"
},
        {
            title: "Procurements",
            value: stats.procurements,
            icon: ShoppingCart,
            path: "/procurement"
        }
    ];

    const evaluatedPercentage =
        stats.proposals > 0
            ? Math.round(
                  (stats.evaluations / stats.proposals) * 100
              )
            : 0;

    const procurementPercentage =
        stats.proposals > 0
            ? Math.round(
                  (stats.procurements / stats.proposals) * 100
              )
            : 0;

    return (
        <div className="admin-dashboard">

            {/* =========================
                HEADER
            ========================= */}

            <div className="admin-header">

                <div>
                    <div className="admin-eyebrow">
                        PLATFORM ADMINISTRATION
                    </div>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Monitor and manage the InnovProcure
                        innovation procurement ecosystem.
                    </p>
                </div>

                <div className="admin-header-icon">
                    <Activity size={26} />
                </div>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            {loading ? (
                <div className="admin-loading">
                    Loading platform statistics...
                </div>
            ) : (
                <div className="admin-stat-grid">

                    {statCards.map((card) => {

                        const Icon = card.icon;

                        return (
                            <div
                                className="admin-stat-card"
                                key={card.title}
                                onClick={() =>
                                    navigate(card.path)
                                }
                            >

                                <div className="admin-stat-top">

                                    <div className="admin-stat-icon">
                                        <Icon size={21} />
                                    </div>

                                    <ArrowRight
                                        size={17}
                                        className="admin-stat-arrow"
                                    />

                                </div>

                                <div className="admin-stat-value">
                                    {card.value}
                                </div>

                                <div className="admin-stat-title">
                                    {card.title}
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}


            {/* =========================
                WORKFLOW OVERVIEW
            ========================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>
                        <h2>Procurement Pipeline</h2>

                        <p>
                            Current progress across the
                            innovation procurement workflow.
                        </p>
                    </div>

                </div>


                <div className="admin-pipeline">

                    <div className="admin-pipeline-item">

                        <div className="admin-pipeline-icon">
                            <FileText size={20} />
                        </div>

                        <div className="admin-pipeline-content">

                            <span>Challenges</span>

                            <strong>
                                {stats.challenges}
                            </strong>

                            <small>
                                Government challenges published
                            </small>

                        </div>

                    </div>


                    <div className="admin-pipeline-line"></div>


                    <div className="admin-pipeline-item">

                        <div className="admin-pipeline-icon">
                            <ClipboardCheck size={20} />
                        </div>

                        <div className="admin-pipeline-content">

                            <span>Proposals</span>

                            <strong>
                                {stats.proposals}
                            </strong>

                            <small>
                                Startup proposals submitted
                            </small>

                        </div>

                    </div>


                    <div className="admin-pipeline-line"></div>


                    <div className="admin-pipeline-item">

                        <div className="admin-pipeline-icon">
                            <Activity size={20} />
                        </div>

                        <div className="admin-pipeline-content">

                            <span>Evaluations</span>

                            <strong>
                                {stats.evaluations}
                            </strong>

                            <small>
                                Proposals evaluated
                            </small>

                        </div>

                    </div>
                    <div className="admin-pipeline-line"></div>

<div className="admin-pipeline-item">

    <div className="admin-pipeline-icon">
        <ClipboardCheck size={20} />
    </div>

    <div className="admin-pipeline-content">

        <span>Pilot Validation</span>

        <strong>
            {stats.pilotValidations}
        </strong>

        <small>
            Pilot KPI validations recorded
        </small>

    </div>

</div>

                    <div className="admin-pipeline-line"></div>


                    <div className="admin-pipeline-item">

                        <div className="admin-pipeline-icon">
                            <ShoppingCart size={20} />
                        </div>

                        <div className="admin-pipeline-content">

                            <span>Procurement</span>

                            <strong>
                                {stats.procurements}
                            </strong>

                            <small>
                                Procurement records created
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                PLATFORM HEALTH
            ========================= */}

            <div className="admin-bottom-grid">

                <div className="admin-section admin-health-card">

                    <div className="admin-section-header">

                        <div>
                            <h2>Platform Progress</h2>

                            <p>
                                Proposal processing overview.
                            </p>
                        </div>

                    </div>


                    <div className="admin-progress-row">

                        <div className="admin-progress-info">

                            <span>
                                Proposals Evaluated
                            </span>

                            <strong>
                                {evaluatedPercentage}%
                            </strong>

                        </div>

                        <div className="admin-progress-track">

                            <div
                                className="admin-progress-fill"
                                style={{
                                    width: `${evaluatedPercentage}%`
                                }}
                            ></div>

                        </div>

                    </div>


                    <div className="admin-progress-row">

                        <div className="admin-progress-info">

                            <span>
                                Proposals in Procurement
                            </span>

                            <strong>
                                {procurementPercentage}%
                            </strong>

                        </div>

                        <div className="admin-progress-track">

                            <div
                                className="admin-progress-fill"
                                style={{
                                    width: `${procurementPercentage}%`
                                }}
                            ></div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    QUICK ACTIONS
                ========================= */}

                <div className="admin-section">

                    <div className="admin-section-header">

                        <div>
                            <h2>Quick Access</h2>

                            <p>
                                Navigate to major platform areas.
                            </p>
                        </div>

                    </div>


                    <div className="admin-quick-actions">

                        <button
                            onClick={() =>
                                navigate("/departments")
                            }
                        >
                            <Building2 size={18} />
                            Departments
                        </button>

                        <button
                            onClick={() =>
                                navigate("/startups")
                            }
                        >
                            <Rocket size={18} />
                            Startups
                        </button>

                        <button
                            onClick={() =>
                                navigate("/proposals")
                            }
                        >
                            <ClipboardCheck size={18} />
                            Proposals
                        </button>

                        <button
                            onClick={() =>
                                navigate("/procurement")
                            }
                        >
                            <ShoppingCart size={18} />
                            Procurement
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;