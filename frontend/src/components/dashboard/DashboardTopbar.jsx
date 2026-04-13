import { Bell, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

function DashboardTopbar({
  title = "Overview",
  sidebarType = "student",
  onMenuToggle = () => {},
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const notificationsPath =
    sidebarType === "buddy"
      ? "/buddy/notifications"
      : sidebarType === "student"
      ? "/student/notifications"
      : null;
  const displayName = user?.full_name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hasUnreadNotifications = useMemo(
    () => notifications.some((item) => !item.read),
    [notifications]
  );

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const data = await apiRequest("/notifications");
      if (isMounted) {
        setNotifications(Array.isArray(data) ? data : []);
      }
    };

    if (!notificationsPath) {
      setNotifications([]);
      return () => {};
    }

    loadNotifications().catch(() => null);

    const handleNotificationsUpdated = () => {
      loadNotifications().catch(() => null);
    };

    window.addEventListener("focus", handleNotificationsUpdated);
    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleNotificationsUpdated);
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-left">
        <button
          type="button"
          className="dashboard-menu-button"
          aria-label="Open menu"
          onClick={onMenuToggle}
        >
          <Menu size={20} />
        </button>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        {notificationsPath ? (
          <Link to={notificationsPath} className="icon-button notification-bell-button">
            <Bell size={20} />
            {hasUnreadNotifications ? <span className="notification-dot" /> : null}
          </Link>
        ) : null}
        <div className="topbar-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          {initials}
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
