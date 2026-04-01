import NotificationItem from "./NotificationItem";

function NotificationsList({ notifications, onMarkRead, onDelete }) {
  return (
    <div className="notifications-list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NotificationsList;