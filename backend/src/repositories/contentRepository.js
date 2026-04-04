import { query } from '../config/db.js';

export function findAllEvents() {
  return query(
    `SELECT id, title, description, event_date, location, category
     FROM events
     ORDER BY event_date ASC`
  );
}

export function findAllUsefulInfo() {
  return query(
    `SELECT id, title, content, category
     FROM useful_information
     ORDER BY created_at DESC`
  );
}
