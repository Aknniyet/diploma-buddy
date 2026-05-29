import { findUserProfileById, updateUserProfile } from '../repositories/userRepository.js';
import { validateProfileData } from '../utils/userValidation.js';
import { ensurePlatformEnhancements } from '../services/platformSetupService.js';

export async function getMyProfile(req, res) {
  try {
    await ensurePlatformEnhancements();
    const result = await findUserProfileById(req.user.id);
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ message: 'Could not load profile.' });
  }
}

export async function updateMyProfile(req, res) {
  try {
    await ensurePlatformEnhancements();
    const validation = validateProfileData(req.body, { role: req.user.role });
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const result = await updateUserProfile(req.user.id, validation.value);

    return res.json({
      message: 'Profile updated successfully.',
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
}
