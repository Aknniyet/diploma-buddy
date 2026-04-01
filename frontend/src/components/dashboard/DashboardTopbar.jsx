import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function DashboardTopbar({ title = "Overview", sidebarType = "student" }) {
  const { user } = useAuth();
  const notificationsPath = sidebarType === "buddy" ? "/buddy/notifications" : "/student/notifications";
  const displayName = user?.full_name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-topbar">
      <h2>{title}</h2>
      <div className="topbar-actions">
        <Link to={notificationsPath} className="icon-button">
          <Bell size={20} />
        </Link>
        <div className="topbar-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          {initials}
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
