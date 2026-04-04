import { query } from '../config/db.js';

export function findUserByEmail(email) {
  return query(
    `SELECT id, full_name, email, password_hash, role, buddy_status
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );
}

export function findUserProfileById(userId) {
  return query(
    `SELECT id, full_name, email, role, home_country, city, study_program,
            languages, hobbies, about_you, gender, gender_preference,
            buddy_status, profile_photo_url, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
}

export function createUser(userData) {
  return query(
    `INSERT INTO users (
        full_name, email, password_hash, role, home_country, city, study_program,
        languages, hobbies, about_you, gender, gender_preference, buddy_status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[], $10, $11, $12, $13)
     RETURNING id, full_name, email, role, buddy_status`,
    [
      userData.fullName,
      userData.email.toLowerCase(),
      userData.passwordHash,
      userData.role,
      userData.homeCountry || null,
      userData.city || null,
      userData.studyProgram || null,
      userData.languages,
      userData.hobbies,
      userData.aboutYou || null,
      userData.gender || null,
      userData.genderPreference || null,
      userData.buddyStatus,
    ]
  );
}

export function createBuddyApplication(userId, motivation, availability = 'Flexible') {
  return query(
    `INSERT INTO buddy_applications (local_student_id, motivation, availability, max_buddies, status)
     VALUES ($1, $2, $3, 3, 'approved')
     ON CONFLICT DO NOTHING`,
    [userId, motivation || null, availability]
  );
}

export function updateUserProfile(userId, profileData) {
  return query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         home_country = COALESCE($2, home_country),
         city = COALESCE($3, city),
         study_program = COALESCE($4, study_program),
         languages = COALESCE($5::text[], languages),
         hobbies = COALESCE($6::text[], hobbies),
         about_you = COALESCE($7, about_you),
         profile_photo_url = COALESCE($8, profile_photo_url),
         gender = COALESCE($9, gender),
         gender_preference = COALESCE($10, gender_preference),
         updated_at = NOW()
     WHERE id = $11
     RETURNING id, full_name, email, role, home_country, city, study_program,
               languages, hobbies, about_you, gender, gender_preference,
               buddy_status, profile_photo_url`,
    [
      profileData.fullName || null,
      profileData.homeCountry || null,
      profileData.city || null,
      profileData.studyProgram || null,
      profileData.languages,
      profileData.hobbies,
      profileData.aboutYou || null,
      profileData.profilePhotoUrl || null,
      profileData.gender || null,
      profileData.genderPreference || null,
      userId,
    ]
  );
}
