import { NavLink, Link, useNavigate } from "react-router-dom";
import { LogOut, Users, X } from "lucide-react";
import { sidebarLinks } from "../../constants/dashboardData";
import { localSidebarLinks } from "../../constants/localDashboardData";
import { adminSidebarLinks } from "../../constants/adminDashboardData";
import { useAuth } from "../../context/AuthContext";

function DashboardSidebar({
  sidebarType = "student",
  isMobileOpen = false,
  onClose = () => {},
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links =
    sidebarType === "buddy"
      ? localSidebarLinks
      : sidebarType === "admin"
      ? adminSidebarLinks
      : sidebarLinks;

  const displayName = user?.full_name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = user?.role === "local" ? "Buddy" : user?.role === "international" ? "International Student" : "Admin";

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <>
      <button
        type="button"
        className={`dashboard-sidebar-backdrop ${isMobileOpen ? "active" : ""}`}
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className={`dashboard-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div>
          <div className="dashboard-sidebar-mobile-header">
            <Link to="/" className="sidebar-logo" onClick={onClose}>
              <div className="logo-icon"><Users size={18} /></div>
              <span>KazakhBuddy</span>
            </Link>
            <button
              type="button"
              className="sidebar-close-button"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div>
              <h4>{displayName}</h4>
              <p>{roleLabel}</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
