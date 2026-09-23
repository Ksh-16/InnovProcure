import { useEffect, useState } from "react";
import API from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await API.get("/notifications");
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put("/notifications/read-all");

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );
        } catch (error) {
            console.error("Error marking notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Stay updated with activity across InnovProcure.</p>
                </div>

                {notifications.some((notification) => !notification.is_read) && (
                    <button
                        className="secondary-button"
                        onClick={markAllAsRead}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <h3>No notifications</h3>
                    <p>
                        New platform activity will appear here.
                    </p>
                </div>
            ) : (
                <div className="notification-list">

                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${
                                !notification.is_read
                                    ? "notification-unread"
                                    : ""
                            }`}
                        >

                            <div>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>

                                {notification.type && (
                                    <span className="status-badge">
                                        {notification.type}
                                    </span>
                                )}
                            </div>

                            {!notification.is_read && (
                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        markAsRead(notification.id)
                                    }
                                >
                                    Mark as read
                                </button>
                            )}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default Notifications;