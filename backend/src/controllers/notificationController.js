import {
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
} from "../repositories/notificationRepository.js";

export async function getNotifications(req, res) {
  try {
    const result = await getNotificationsByUserId(req.user.id);

    const formatted = result.rows.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      reference_type: item.reference_type,
      reference_id: item.reference_id,
      is_read: item.is_read,
      created_at: item.created_at,
      read: item.is_read,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Notifications error:", error.message);
    return res.status(500).json({ message: "Could not load notifications." });
  }
}

export async function readNotification(req, res) {
  try {
    const { notificationId } = req.params;

    const result = await markNotificationAsRead(notificationId, req.user.id);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark notification read error:", error.message);
    return res.status(500).json({ message: "Could not update notification." });
  }
}

export async function readAllNotifications(req, res) {
  try {
    await markAllNotificationsAsRead(req.user.id);
    return res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark all notifications read error:", error.message);
    return res.status(500).json({ message: "Could not update notifications." });
  }
}

export async function removeNotification(req, res) {
  try {
    const { notificationId } = req.params;

    const result = await deleteNotificationById(notificationId, req.user.id);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Delete notification error:", error.message);
    return res.status(500).json({ message: "Could not delete notification." });
  }
}