function NotificationsHeader({ unreadCount }) {
  return (
    <div className="notifications-page-header">
      <h1>Notifications</h1>
      <p>
        {unreadCount > 0
          ? `You have ${unreadCount} unread notification${
              unreadCount > 1 ? "s" : ""
            }`
          : "You're all caught up!"}
      </p>
    </div>
  );
}

export default NotificationsHeader;