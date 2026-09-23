import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import API from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "STARTUP"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);

            await API.post("/auth/register", form);

            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
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

                    <p className="eyebrow">
                        BUILD • PILOT • SCALE
                    </p>

                    <h1>
                        Where public
                        <span> innovation begins.</span>
                    </h1>

                    <p className="auth-description">
                        Join an ecosystem where government challenges
                        meet startups, technology and measurable impact.
                    </p>

                </div>

            </div>

            <div className="auth-right">

                <div className="auth-card">

                    <div className="form-heading">
                        <p>GET STARTED</p>

                        <h2>Create your account</h2>

                        <span>
                            Choose your role and join InnovProcure.
                        </span>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label>Full name</label>

                            <div className="input-wrapper">
                                <User size={18} />

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email address</label>

                            <div className="input-wrapper">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <Lock size={18} />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Account type</label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="STARTUP">
                                    Startup
                                </option>

                                <option value="GOVERNMENT">
                                    Government Department
                                </option>

                                <option value="EVALUATOR">
                                    Evaluator
                                </option>

                                <option value="PROCUREMENT_OFFICER">
                                    Procurement Officer
                                </option>
                            </select>
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}

                            {!loading && <ArrowRight size={18} />}
                        </button>

                    </form>

                    <p className="switch-auth">
                        Already have an account?
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;