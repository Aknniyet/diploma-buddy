import { Bell, LogOut, Menu, User as UserIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import ThemeToggle from "../common/ThemeToggle";

function DashboardTopbar({
  sidebarType = "student",
  onMenuToggle = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsPath =
    sidebarType === "buddy"
      ? "/buddy/notifications"
      : sidebarType === "student"
      ? "/student/notifications"
      : null;
  const profilePath =
    sidebarType === "buddy"
      ? "/buddy/profile"
      : sidebarType === "student"
      ? "/student/profile"
      : null;
  const displayName = user?.full_name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel =
    user?.role === "local"
      ? "Buddy"
      : user?.role === "international"
      ? "International Student"
      : "Admin";
  const workspaceLabel =
    sidebarType === "admin"
      ? "Admin panel"
      : sidebarType === "buddy"
      ? "Buddy workspace"
      : "Student workspace";
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
  }, [notificationsPath]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileMenuOpen) return () => {};

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate("/login");
  };

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
        <span className="dashboard-topbar-context">{workspaceLabel}</span>
      </div>
      <div className="topbar-actions">
        <ThemeToggle compact />
        {notificationsPath ? (
          <Link to={notificationsPath} className="icon-button notification-bell-button">
            <Bell size={20} />
            {hasUnreadNotifications ? <span className="notification-dot" /> : null}
          </Link>
        ) : null}
        <div className="topbar-profile-menu" ref={profileMenuRef}>
          <button
            type="button"
            className="topbar-avatar-button"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          >
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} alt={displayName} className="topbar-avatar" />
            ) : (
              <div className="topbar-avatar topbar-avatar-initials">{initials}</div>
            )}
          </button>

          {isProfileMenuOpen ? (
            <div className="topbar-profile-dropdown" role="menu">
              <div className="topbar-profile-summary">
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={displayName} className="topbar-profile-summary-avatar" />
                ) : (
                  <div className="topbar-profile-summary-avatar topbar-avatar-initials">
                    {initials}
                  </div>
                )}
                <div>
                  <h4>{displayName}</h4>
                  <p>{roleLabel}</p>
                </div>
              </div>

              <div className="topbar-profile-dropdown-actions">
                {profilePath ? (
                  <Link
                    to={profilePath}
                    className="topbar-profile-dropdown-link"
                    role="menuitem"
                  >
                    <UserIcon size={18} />
                    <span>Profile</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="topbar-profile-dropdown-link danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;
