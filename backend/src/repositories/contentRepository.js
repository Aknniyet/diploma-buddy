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
