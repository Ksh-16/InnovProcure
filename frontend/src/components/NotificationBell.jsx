import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const fetchUnreadNotifications = async () => {
        try {
            const response = await API.get("/notifications/unread");

            setUnreadCount(
                response.data.notifications?.length || 0
            );
        } catch (error) {
            console.error(
                "Error fetching unread notifications:",
                error
            );
        }
    };

    useEffect(() => {
        fetchUnreadNotifications();

        const interval = setInterval(() => {
            fetchUnreadNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <button
            className="notification-bell"
            onClick={() => navigate("/notifications")}
            title="Notifications"
        >
            <Bell size={20} />

            {unreadCount > 0 && (
                <span className="notification-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
}

export default NotificationBell;