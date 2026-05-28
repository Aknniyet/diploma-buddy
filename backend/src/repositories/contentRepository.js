import { query } from '../config/db.js';

export function findAllEvents(userId) {
  return query(
    `SELECT e.id, e.title, e.description, e.event_date, e.location, e.category, e.image_url,
            EXISTS (
              SELECT 1
              FROM event_attendance ea
              WHERE ea.event_id = e.id AND ea.user_id = $1
            ) AS is_attending,
            (
              SELECT COUNT(*)::int
              FROM event_attendance ea
              WHERE ea.event_id = e.id
            ) AS attendees_count
     FROM events e
     ORDER BY event_date ASC`,
    [userId]
  );
}

export function findEventById(eventId, userId) {
  return query(
    `SELECT e.id, e.title, e.description, e.event_date, e.location, e.category, e.image_url,
            EXISTS (
              SELECT 1
              FROM event_attendance ea
              WHERE ea.event_id = e.id AND ea.user_id = $2
            ) AS is_attending,
            (
              SELECT COUNT(*)::int
              FROM event_attendance ea
              WHERE ea.event_id = e.id
            ) AS attendees_count
     FROM events e
     WHERE e.id = $1`,
    [eventId, userId]
  );
}

export function createEvent({ title, description, eventDate, location, category, imageUrl }) {
  return query(
    `INSERT INTO events (title, description, event_date, location, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, description, event_date, location, category, image_url`,
    [title, description || null, eventDate, location || null, category || null, imageUrl || null]
  );
}

export function updateEvent(eventId, { title, description, eventDate, location, category, imageUrl }) {
  return query(
    `UPDATE events
     SET title = $2,
         description = $3,
         event_date = $4,
         location = $5,
         category = $6,
         image_url = $7
     WHERE id = $1
     RETURNING id, title, description, event_date, location, category, image_url`,
    [eventId, title, description || null, eventDate, location || null, category || null, imageUrl || null]
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

export function createEventAttendance(eventId, userId) {
  return query(
    `INSERT INTO event_attendance (event_id, user_id, status, updated_at)
     VALUES ($1, $2, 'going', NOW())
     ON CONFLICT (event_id, user_id)
     DO UPDATE SET status = 'going', updated_at = NOW()
     RETURNING id`,
    [eventId, userId]
  );
}

export function deleteEventAttendance(eventId, userId) {
  return query(
    `DELETE FROM event_attendance
     WHERE event_id = $1 AND user_id = $2
     RETURNING id`,
    [eventId, userId]
  );
}
