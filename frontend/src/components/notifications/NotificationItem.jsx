import { Check, Trash2 } from "lucide-react";

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const Icon = notification.icon;

  return (
    <div className={notification.read ? "notification-item" : "notification-item unread"}>
      <div className="notification-left">
        <div className="notification-icon">
          <Icon size={20} />
        </div>

        <div className="notification-content">
          <h4>{notification.title}</h4>
          <p>{notification.description}</p>

          <div className="notification-actions">
            {!notification.read && (
              <button type="button" className="notification-link primary" onClick={() => onMarkRead(notification.id)}>
                <Check size={16} />
                <span>Mark as read</span>
              </button>
            )}

            <button type="button" className="notification-link" onClick={() => onDelete(notification.id)}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="notification-date">{notification.date}</div>
    </div>
  );
}

export default NotificationItem;
