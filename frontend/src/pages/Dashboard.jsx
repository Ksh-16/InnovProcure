import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "ADMIN") {
        return <Navigate to="/dashboard/admin" replace />;
    }

    if (user.role === "GOVERNMENT") {
        return <Navigate to="/dashboard/government" replace />;
    }

    if (user.role === "STARTUP") {
        return <Navigate to="/dashboard/startup" replace />;
    }

    if (user.role === "EVALUATOR") {
        return <Navigate to="/dashboard/evaluator" replace />;
    }

    if (user.role === "PROCUREMENT_OFFICER") {
        return <Navigate to="/dashboard/procurement" replace />;
    }

    return <Navigate to="/login" replace />;
}

export default Dashboard;