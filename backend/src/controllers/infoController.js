import { findAllUsefulInfo } from '../repositories/contentRepository.js';

export async function getUsefulInfo(_req, res) {
  try {
    const result = await findAllUsefulInfo();
    return res.json(result.rows);
  } catch (error) {
    console.error('Useful info error:', error.message);
    return res.status(500).json({ message: 'Could not load information.' });
  }
}
