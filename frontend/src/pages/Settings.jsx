import { useAuth } from "../context/AuthContext";

function Settings() {
    const { user } = useAuth();

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>
                        Manage your InnovProcure account and workspace preferences.
                    </p>
                </div>
            </div>

            <div className="settings-grid">

                {/* Profile */}
                <div className="settings-card">

                    <div className="settings-card-header">
                        <h2>Profile</h2>
                        <p>Your account information</p>
                    </div>

                    <div className="profile-section">

                        <div className="large-avatar">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="profile-info">
                            <h3>{user?.name}</h3>
                            <p>{user?.email}</p>

                            <span className="role-badge">
                                {user?.role}
                            </span>
                        </div>

                    </div>

                </div>


                {/* Account */}
                <div className="settings-card">

                    <div className="settings-card-header">
                        <h2>Account</h2>
                        <p>Account preferences</p>
                    </div>

                    <div className="settings-row">
                        <div>
                            <strong>Email notifications</strong>
                            <span>
                                Receive updates about procurement activity
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            defaultChecked
                        />
                    </div>

                    <div className="settings-row">
                        <div>
                            <strong>Platform updates</strong>
                            <span>
                                Receive important InnovProcure updates
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            defaultChecked
                        />
                    </div>

                </div>


                {/* Security */}
                <div className="settings-card">

                    <div className="settings-card-header">
                        <h2>Security</h2>
                        <p>Protect your account</p>
                    </div>

                    <button className="secondary-button">
                        Change Password
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Settings;