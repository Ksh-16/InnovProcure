import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import GovernmentDashboard from "./pages/GovernmentDashboard";
import StartupDashboard from "./pages/StartupDashboard";
import EvaluatorDashboard from "./pages/EvaluatorDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import Challenges from "./pages/Challenges";
import Startups from "./pages/Startups";
import Proposals from "./pages/Proposals";
import Evaluations from "./pages/Evaluations";
import Procurement from "./pages/Procurement";
import Departments from "./pages/Departments";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Settings from "./pages/Settings";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ==================== */}
                {/* DEFAULT */}
                {/* ==================== */}

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />


                {/* ==================== */}
                {/* AUTHENTICATION */}
                {/* ==================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==================== */}
                {/* MAIN DASHBOARD */}
                {/* ==================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />


                {/* ==================== */}
                {/* ROLE DASHBOARDS */}
                {/* ==================== */}

                <Route
    path="/dashboard/admin"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
                <AdminDashboard />
            </DashboardLayout>
        </ProtectedRoute>
    }
/>

                <Route
                    path="/dashboard/government"
                    element={
                        <ProtectedRoute allowedRoles={["GOVERNMENT"]}>
                            <DashboardLayout>
                                <GovernmentDashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/startup"
                    element={
                        <ProtectedRoute allowedRoles={["STARTUP"]}>
                            <DashboardLayout>
                                <StartupDashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/evaluator"
                    element={
                        <ProtectedRoute allowedRoles={["EVALUATOR"]}>
                            <DashboardLayout>
                                <EvaluatorDashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/procurement"
                    element={
                        <ProtectedRoute allowedRoles={["PROCUREMENT_OFFICER"]}>
                            <DashboardLayout>
                                <ProcurementDashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />


                {/* ==================== */}
                {/* WORKSPACE PAGES */}
                {/* ==================== */}

                <Route
                    path="/challenges"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Challenges />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/startups"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Startups />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/proposals"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Proposals />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/evaluations"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Evaluations />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/procurement"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Procurement />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/departments"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Departments />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Notifications />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                {/* ==================== */}
{/* SETTINGS */}
{/* ==================== */}

<Route
    path="/settings"
    element={
        <ProtectedRoute>
            <DashboardLayout>
                <Settings />
            </DashboardLayout>
        </ProtectedRoute>
    }
/>

                {/* ==================== */}
                {/* UNKNOWN URL */}
                {/* ==================== */}

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;