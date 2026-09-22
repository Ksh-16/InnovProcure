import {
    LayoutDashboard,
    FileText,
    Building2,
    Rocket,
    ClipboardCheck,
    ShoppingCart,
    Target,
    Bell,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";

function DashboardLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const allMenuItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "STARTUP",
            "EVALUATOR",
            "PROCUREMENT_OFFICER"
        ]
    },

    {
        label: "Challenges",
        icon: FileText,
        path: "/challenges",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "STARTUP"
        ]
    },

    {
        label: "Startups",
        icon: Rocket,
        path: "/startups",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "EVALUATOR",
            "PROCUREMENT_OFFICER"
        ]
    },

    {
        label: "Proposals",
        icon: ClipboardCheck,
        path: "/proposals",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "STARTUP",
            "EVALUATOR",
            "PROCUREMENT_OFFICER"
        ]
    },

    {
        label: "Evaluations",
        icon: Target,
        path: "/evaluations",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "EVALUATOR"
        ]
    },

    {
        label: "Procurement",
        icon: ShoppingCart,
        path: "/procurement",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "PROCUREMENT_OFFICER"
        ]
    },

    {
        label: "Departments",
        icon: Building2,
        path: "/departments",
        roles: [
            "ADMIN",
            "GOVERNMENT"
        ]
    },

    {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
        roles: [
            "ADMIN",
            "GOVERNMENT",
            "STARTUP",
            "EVALUATOR",
            "PROCUREMENT_OFFICER"
        ]
    }
];

const dashboardPath = {
    ADMIN: "/dashboard/admin",
    GOVERNMENT: "/dashboard/government",
    STARTUP: "/dashboard/startup",
    EVALUATOR: "/dashboard/evaluator",
    PROCUREMENT_OFFICER: "/dashboard/procurement"
};

const menuItems = allMenuItems
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => {
        if (item.label === "Dashboard") {
            return {
                ...item,
                path: dashboardPath[user?.role] || "/dashboard"
            };
        }

        return item;
    });
    return (
        <div className="dashboard-container">

            {/* Mobile Overlay */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* Sidebar */}

            <aside
                className={`dashboard-sidebar ${
                    sidebarOpen ? "sidebar-open" : ""
                }`}
            >

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        IP
                    </div>

                    <div>
                        <strong>InnovProcure</strong>
                        <span>Innovation Procurement</span>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Navigation */}

                <nav className="sidebar-nav">

                    <p className="nav-heading">
                        WORKSPACE
                    </p>

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                            >

                                <Icon size={18} />

                                <span>
                                    {item.label}
                                </span>

                            </NavLink>
                        );

                    })}

                </nav>


                {/* Bottom */}

                <div className="sidebar-bottom">

                    <NavLink
                        to="/settings"
                        className="sidebar-link"
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </NavLink>

                    <button
                        className="sidebar-link logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* Main */}

            <main className="dashboard-main">

                <header className="dashboard-header">

    <button
        className="mobile-menu"
        onClick={() =>
            setSidebarOpen(true)
        }
    >
        <Menu size={22} />
    </button>


    <div className="header-spacer" />


    <div className="header-actions">

        <NotificationBell />

        <div className="header-user">

            <div className="header-avatar">
                {user?.name
                    ?.charAt(0)
                    ?.toUpperCase()}
            </div>

            <div className="header-user-info">

                <strong>
                    {user?.name}
                </strong>

                <span>
                    {user?.role}
                </span>

            </div>

        </div>

    </div>

</header>
                <section className="dashboard-content">

                    {children}

                </section>

            </main>

        </div>
    );
}

export default DashboardLayout;