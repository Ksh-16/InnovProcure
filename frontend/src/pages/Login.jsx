import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        const result = await login(email, password);

        if (!result.success) {
            setError(result.message);
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        if (user.role === "ADMIN") {
    navigate("/dashboard/admin");
} else if (user.role === "GOVERNMENT") {
    navigate("/dashboard/government");
} else if (user.role === "STARTUP") {
    navigate("/dashboard/startup");
} else if (user.role === "EVALUATOR") {
    navigate("/dashboard/evaluator");
} else if (user.role === "PROCUREMENT_OFFICER") {
    navigate("/dashboard/procurement");
} else {
    navigate("/dashboard");
}
    };

    return (
        <div className="auth-page">

            <div className="auth-left">
                <div className="brand">
                    <div className="brand-logo">IP</div>
                    <span>InnovProcure</span>
                </div>

                <div className="auth-content">
                    <p className="eyebrow">PUBLIC PROCUREMENT • INNOVATION</p>

                    <h1>
                        Turn public challenges
                        <span> into real solutions.</span>
                    </h1>

                    <p className="auth-description">
                        A digital platform connecting government departments,
                        innovative startups and evaluators to transform ideas
                        into scalable public solutions.
                    </p>

                    <div className="auth-points">
                        <div>
                            <strong>01</strong>
                            <span>Discover public challenges</span>
                        </div>

                        <div>
                            <strong>02</strong>
                            <span>Evaluate innovative solutions</span>
                        </div>

                        <div>
                            <strong>03</strong>
                            <span>Procure & scale successful pilots</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">

                <div className="auth-card">

                    <div className="mobile-brand">
                        <div className="brand-logo">IP</div>
                        <span>InnovProcure</span>
                    </div>

                    <div className="form-heading">
                        <p>WELCOME BACK</p>
                        <h2>Sign in to your account</h2>
                        <span>
                            Access your InnovProcure workspace.
                        </span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label>Email address</label>

                            <div className="input-wrapper">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <Lock size={18} />

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}

                            {!loading && <ArrowRight size={18} />}
                        </button>

                    </form>

                    <p className="switch-auth">
                        Don't have an account?
                        <Link to="/register">
                            Create account
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;