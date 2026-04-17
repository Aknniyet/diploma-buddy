import { normalizeArray } from '../services/arrayUtils.js';
import { findUserProfileById, updateUserProfile } from '../repositories/userRepository.js';

export async function getMyProfile(req, res) {
  try {
    const result = await findUserProfileById(req.user.id);
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ message: 'Could not load profile.' });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const result = await updateUserProfile(req.user.id, {
      fullName: req.body.fullName,
      homeCountry: req.body.homeCountry,
      city: req.body.city,
      studyProgram: req.body.studyProgram,
      languages: normalizeArray(req.body.languages),
      hobbies: normalizeArray(req.body.hobbies),
      aboutYou: req.body.aboutYou,
      profilePhotoUrl: req.body.profilePhotoUrl,
      gender: req.body.gender,
      genderPreference: req.body.genderPreference,
      maxBuddies: req.user.role === 'local' ? Number(req.body.maxBuddies) || null : null,
    });

    return res.json({
      message: 'Profile updated successfully.',
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
}
