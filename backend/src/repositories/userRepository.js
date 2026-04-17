import { query } from '../config/db.js';

export function findUserByEmail(email) {
  return query(
    `SELECT id, full_name, email, password_hash, role, buddy_status, max_buddies, email_verified
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );
}

export function findUserProfileById(userId) {
  return query(
    `SELECT id, full_name, email, role, home_country, city, study_program,
            languages, hobbies, about_you, gender, gender_preference,
            buddy_status, max_buddies, profile_photo_url, created_at, email_verified
     FROM users
     WHERE id = $1`,
    [userId]
  );
}

export function createUser(userData) {
  return query(
    `INSERT INTO users (
        full_name, email, password_hash, role, home_country, city, study_program,
        languages, hobbies, about_you, gender, gender_preference, buddy_status, max_buddies, email_verified
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[], $10, $11, $12, $13, $14, $15)
     RETURNING id, full_name, email, role, buddy_status, max_buddies`,
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
      userData.maxBuddies || 3,
      userData.emailVerified ?? false,
    ]
  );
}

export function createBuddyApplication(userId, motivation, availability = 'Flexible', maxBuddies = 3) {
  return query(
    `INSERT INTO buddy_applications (local_student_id, motivation, availability, max_buddies, status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT DO NOTHING`,
    [userId, motivation || null, availability, maxBuddies]
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
         max_buddies = COALESCE($11, max_buddies),
         updated_at = NOW()
     WHERE id = $12
     RETURNING id, full_name, email, role, home_country, city, study_program,
               languages, hobbies, about_you, gender, gender_preference,
               buddy_status, max_buddies, profile_photo_url`,
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
      profileData.maxBuddies || null,
      userId,
    ]
  );
}

export function updateBuddyStatus(userId, buddyStatus) {
  return query(
    `UPDATE users
     SET buddy_status = $2,
         updated_at = NOW()
     WHERE id = $1 AND role = 'local'
     RETURNING id, full_name, email, role, buddy_status`,
    [userId, buddyStatus]
  );
}

export function createEmailCode(email, code, purpose) {
  return query(
    `INSERT INTO email_codes (email, code, purpose, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
    [email.toLowerCase(), code, purpose]
  );
}

export function deleteEmailCodes(email, purpose) {
  return query("DELETE FROM email_codes WHERE email = $1 AND purpose = $2", [
    email.toLowerCase(),
    purpose,
  ]);
}

export function findValidEmailCode(email, code, purpose) {
  return query(
    `SELECT id
     FROM email_codes
     WHERE email = $1 AND code = $2 AND purpose = $3 AND expires_at > NOW()
     LIMIT 1`,
    [email.toLowerCase(), code, purpose]
  );
}

export function markEmailVerified(email) {
  return query("UPDATE users SET email_verified = TRUE WHERE email = $1", [
    email.toLowerCase(),
  ]);
}

export function updateUserPassword(email, passwordHash) {
  return query("UPDATE users SET password_hash = $1 WHERE email = $2", [
    passwordHash,
    email.toLowerCase(),
  ]);
}
