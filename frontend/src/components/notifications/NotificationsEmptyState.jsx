import { Bell } from "lucide-react";

function NotificationsEmptyState() {
  return (
    <div className="notifications-empty-state">
      <div className="notifications-empty-content">
        <Bell size={54} />
        <h3>No notifications</h3>
        <p>You'll see notifications here when there's activity on your account</p>
      </div>
    </div>
  );
}

export default NotificationsEmptyState;