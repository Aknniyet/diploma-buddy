import { findAllEvents } from '../repositories/contentRepository.js';

export async function getEvents(_req, res) {
  try {
    const result = await findAllEvents();
    return res.json(result.rows);
  } catch (error) {
    console.error('Events error:', error.message);
    return res.status(500).json({ message: 'Could not load events.' });
  }
}
