import { Bell } from "lucide-react";

function NotificationsEmptyState() {
  return (
    <div className="notifications-empty-state">
      <div className="notifications-empty-content">
        <Bell size={54} />
        <h3>No notifications yet</h3>
        <p>You will see updates here when there is new activity on your account.</p>
      </div>
    </div>
  );
}

export default NotificationsEmptyState;
