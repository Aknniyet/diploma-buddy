import {
  createEvent,
  deleteEvent,
  findAllEvents,
  findEventById,
  updateEvent,
} from '../repositories/contentRepository.js';
import { findUserProfileById } from '../repositories/userRepository.js';
import { deleteNotificationsByReference } from "../repositories/notificationRepository.js";
import { findCommunityNotificationRecipients } from "../repositories/userRepository.js";
import { createNotification } from "../services/notificationService.js";
import { processEventReminders } from "../services/eventReminderService.js";

function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return false;
  }

  return true;
}

function triggerEventReminders() {
  processEventReminders().catch((error) => {
    console.error("Background event reminders error:", error.message);
  });
}

async function ensureEventViewer(req, res) {
  const result = await findUserProfileById(req.user.id);
  const user = result.rows[0];

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return null;
  }

  if (user.role === "admin" || user.role === "international") {
    return user;
  }

  if (user.role === "local" && user.buddy_status === "approved") {
    return user;
  }

  res.status(403).json({ message: "Events are available only for approved buddies." });
  return null;
}

export async function getEvents(req, res) {
  try {
    if (!(await ensureEventViewer(req, res))) return;
    triggerEventReminders();
    const result = await findAllEvents();
    return res.json(result.rows);
  } catch (error) {
    console.error('Events error:', error.message);
    return res.status(500).json({ message: 'Could not load events.' });
  }
}

export async function getEventDetails(req, res) {
  try {
    if (!(await ensureEventViewer(req, res))) return;
    triggerEventReminders();
    const result = await findEventById(req.params.eventId);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Event details error:", error.message);
    return res.status(500).json({ message: "Could not load event details." });
  }
}

export async function createEventByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { title, description, eventDate, location, category } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ message: "Title and event date are required." });
    }

    const result = await createEvent({
      title: title.trim(),
      description: description?.trim(),
      eventDate,
      location: location?.trim(),
      category: category?.trim(),
    });

    const recipients = await findCommunityNotificationRecipients(req.user.id).catch(() => ({ rows: [] }));
    const eventTitle = result.rows[0].title;

    await Promise.all(
      recipients.rows.map((recipient) =>
        createNotification({
          userId: recipient.id,
          type: "event_created",
          title: "New event published",
          description: `A new event "${eventTitle}" was added to the platform.`,
          referenceType: "event",
          referenceId: result.rows[0].id,
        }).catch(() => null)
      )
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create event error:", error.message);
    return res.status(500).json({ message: "Could not create event." });
  }
}

export async function updateEventByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { title, description, eventDate, location, category } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ message: "Title and event date are required." });
    }

    const result = await updateEvent(req.params.eventId, {
      title: title.trim(),
      description: description?.trim(),
      eventDate,
      location: location?.trim(),
      category: category?.trim(),
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update event error:", error.message);
    return res.status(500).json({ message: "Could not update event." });
  }
}

export async function deleteEventByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const eventId = Number(req.params.eventId);
    const result = await deleteEvent(eventId);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    await deleteNotificationsByReference("event", eventId).catch(() => null);

    return res.json({ message: "Event deleted." });
  } catch (error) {
    console.error("Delete event error:", error.message);
    return res.status(500).json({ message: "Could not delete event." });
  }
}
