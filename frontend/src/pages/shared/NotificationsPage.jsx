import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, MessageCircle, UserCheck, UserRoundX } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import NotificationsHeader from "../../components/notifications/NotificationsHeader";
import NotificationsToolbar from "../../components/notifications/NotificationsToolbar";
import NotificationsList from "../../components/notifications/NotificationsList";
import NotificationsEmptyState from "../../components/notifications/NotificationsEmptyState";
import { apiRequest } from "../../lib/api";
import "../../styles/notifications.css";

const iconMap = {
  new_message: MessageCircle,
  request_sent: Bell,
  request_received: Bell,
  request_accepted: CheckCircle2,
  request_declined: UserRoundX,
  match_created: UserCheck,
  match_reassigned: UserCheck,
  match_completed: CheckCircle2,
  match_cancelled: UserRoundX,
  buddy_profile_approved: UserCheck,
  buddy_profile_rejected: UserRoundX,
};

function formatDate(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationsPage({ userType = "student" }) {
  const [notifications, setNotifications] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadNotifications = async () => {
    const data = await apiRequest("/notifications");
    const items = Array.isArray(data) ? data : [];
    setNotifications(
      items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        read: item.read,
        date: formatDate(item.created_at),
        icon: iconMap[item.type] || Bell,
      }))
    );
    setLoadError("");
  };

  useEffect(() => {
    loadNotifications().catch((error) => {
      setLoadError(error.message || "Could not load notifications.");
      setNotifications([]);
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const handleMarkRead = async (id) => {
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const handleDelete = async (id) => {
    await apiRequest(`/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const handleMarkAllRead = async () => {
    await apiRequest("/notifications/mark-all-read", { method: "PATCH" });
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  return (
    <DashboardLayout title="Notifications" sidebarType={userType === "buddy" ? "buddy" : "student"}>
      <section className="notifications-page">
        <div className="notifications-page-top">
          <NotificationsHeader unreadCount={unreadCount} />
          <NotificationsToolbar onMarkAllRead={handleMarkAllRead} />
        </div>

        <div className="notifications-card">
          <div className="notifications-card-header">
            <h3>Recent Notifications</h3>
            <p>Stay updated on your requests, matches, and messages.</p>
          </div>

          {loadError ? (
            <div className="notifications-load-error">{loadError}</div>
          ) : null}

          {notifications.length > 0 ? (
            <NotificationsList notifications={notifications} onMarkRead={handleMarkRead} onDelete={handleDelete} />
          ) : (
            <NotificationsEmptyState />
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default NotificationsPage;
