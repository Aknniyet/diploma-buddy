import { CheckCheck } from "lucide-react";

function NotificationsToolbar({ onMarkAllRead }) {
  return (
    <button type="button" className="mark-all-btn" onClick={onMarkAllRead}>
      <CheckCheck size={18} />
      <span>Mark all as read</span>
    </button>
  );
}

export default NotificationsToolbar;