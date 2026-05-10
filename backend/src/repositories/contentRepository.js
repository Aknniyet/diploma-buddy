import { query } from '../config/db.js';

export function findAllEvents() {
  return query(
    `SELECT id, title, description, event_date, location, category
     FROM events
     ORDER BY event_date ASC`
  );
}

export function findEventById(eventId) {
  return query(
    `SELECT id, title, description, event_date, location, category
     FROM events
     WHERE id = $1`,
    [eventId]
  );
}

export function createEvent({ title, description, eventDate, location, category }) {
  return query(
    `INSERT INTO events (title, description, event_date, location, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, event_date, location, category`,
    [title, description || null, eventDate, location || null, category || null]
  );
}

export function updateEvent(eventId, { title, description, eventDate, location, category }) {
  return query(
    `UPDATE events
     SET title = $2,
         description = $3,
         event_date = $4,
         location = $5,
         category = $6
     WHERE id = $1
     RETURNING id, title, description, event_date, location, category`,
    [eventId, title, description || null, eventDate, location || null, category || null]
  );
}

export function deleteEvent(eventId) {
  return query(
    `DELETE FROM events
     WHERE id = $1
     RETURNING id`,
    [eventId]
  );
}

export function findAllUsefulInfo() {
  return query(
    `SELECT id, title, content, category
     FROM useful_information
     ORDER BY created_at DESC`
  );
}

export function findUpcomingEventsForReminders() {
  return query(
    `SELECT id, title, event_date, location
     FROM events
     WHERE event_date > NOW()
       AND event_date <= NOW() + INTERVAL '24 hours'
     ORDER BY event_date ASC`
  );
}

export function hasEventReminderBeenSent(eventId, userId, reminderType) {
  return query(
    `SELECT id
     FROM event_reminder_deliveries
     WHERE event_id = $1
       AND user_id = $2
       AND reminder_type = $3
     LIMIT 1`,
    [eventId, userId, reminderType]
  );
}

export function markEventReminderSent(eventId, userId, reminderType) {
  return query(
    `INSERT INTO event_reminder_deliveries (event_id, user_id, reminder_type)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_id, reminder_type) DO NOTHING
     RETURNING id`,
    [eventId, userId, reminderType]
  );
}
