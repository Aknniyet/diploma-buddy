import {
  createEvent,
  deleteEvent,
  findAllEvents,
  findEventById,
  updateEvent,
} from '../repositories/contentRepository.js';

function ensureAdmin(req, res) {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return false;
  }

  return true;
}

export async function getEvents(_req, res) {
  try {
    const result = await findAllEvents();
    return res.json(result.rows);
  } catch (error) {
    console.error('Events error:', error.message);
    return res.status(500).json({ message: 'Could not load events.' });
  }
}

export async function getEventDetails(req, res) {
  try {
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

    const result = await deleteEvent(req.params.eventId);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json({ message: "Event deleted." });
  } catch (error) {
    console.error("Delete event error:", error.message);
    return res.status(500).json({ message: "Could not delete event." });
  }
}
