function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getSharedItems(first = [], second = []) {
  const secondSet = new Set(second.map(normalizeText));
  return first.filter((item) => secondSet.has(normalizeText(item)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function calculateBuddyScore(student, buddy) {
  let score = 0;

  const studentLanguages = safeArray(student.languages);
  const buddyLanguages = safeArray(buddy.languages);
  const studentHobbies = safeArray(student.hobbies);
  const buddyHobbies = safeArray(buddy.hobbies);

  if (
    student.study_program &&
    buddy.study_program &&
    normalizeText(student.study_program) === normalizeText(buddy.study_program)
  ) {
    score += 3;
  }

  const sharedLanguages = getSharedItems(studentLanguages, buddyLanguages);
  score += Math.min(sharedLanguages.length, 2) * 3;

  const sharedHobbies = getSharedItems(studentHobbies, buddyHobbies);
  score += Math.min(sharedHobbies.length, 2) * 2;

  if (
    student.gender_preference &&
    student.gender_preference !== 'no_preference' &&
    buddy.gender &&
    normalizeText(student.gender_preference) === normalizeText(buddy.gender)
  ) {
    score += 2;
  }

  return score;
}

export function calculateCompatibilityPrediction(student, buddy) {
  const studentLanguages = safeArray(student.languages);
  const buddyLanguages = safeArray(buddy.languages);
  const studentHobbies = safeArray(student.hobbies);
  const buddyHobbies = safeArray(buddy.hobbies);

  const sharedLanguages = getSharedItems(studentLanguages, buddyLanguages);
  const sharedHobbies = getSharedItems(studentHobbies, buddyHobbies);

  const sameProgram =
    student.study_program &&
    buddy.study_program &&
    normalizeText(student.study_program) === normalizeText(buddy.study_program);

  const genderPreferenceMatch =
    student.gender_preference &&
    student.gender_preference !== "no_preference" &&
    buddy.gender &&
    normalizeText(student.gender_preference) === normalizeText(buddy.gender);

  const activeStudents = Number(buddy.active_students_count || 0);
  const maxBuddies = Number(buddy.max_buddies || 3);
  const availabilityRatio =
    maxBuddies > 0 ? (maxBuddies - activeStudents) / maxBuddies : 0;

  const languagePoints = Math.min(sharedLanguages.length, 2) * 15;
  const hobbyPoints = Math.min(sharedHobbies.length, 5) * 5;
  const programPoints = sameProgram ? 15 : 0;
  const genderPoints = genderPreferenceMatch ? 10 : 0;
  const availabilityPoints = Math.round(clamp(availabilityRatio, 0, 1) * 20);

  const rawPercentage =
    languagePoints +
    hobbyPoints +
    programPoints +
    genderPoints +
    availabilityPoints;
  const percentage = clamp(rawPercentage, 20, 95);

  return {
    percentage,
    label: `${percentage}%`,
    sharedLanguagesCount: sharedLanguages.length,
    sharedLanguages,
    sharedInterestsCount: sharedHobbies.length,
    sharedInterests: sharedHobbies,
    sameProgram: Boolean(sameProgram),
    genderPreferenceMatch: Boolean(genderPreferenceMatch),
    availabilityScore: availabilityPoints,
    explanation:
      "Estimated from shared languages, interests, academic program, preference match, and buddy availability.",
  };
}

export function formatBuddyCard(
  student,
  buddy,
  statusMap,
  activeMatchBuddyId,
  hasActiveMatch = false,
  pendingRequestBuddyId = null
) {
  const activeStudents = Number(buddy.active_students_count || 0);
  const maxBuddies = Number(buddy.max_buddies || 3);
  const score = calculateBuddyScore(student, buddy);
  const compatibility = calculateCompatibilityPrediction(student, buddy);
  const isMatched = activeMatchBuddyId === buddy.id;
  const requestStatus = statusMap.get(buddy.id) || null;
  const status = isMatched
    ? 'matched'
    : hasActiveMatch
    ? 'locked'
    : pendingRequestBuddyId && pendingRequestBuddyId !== buddy.id
    ? 'waiting'
    : requestStatus;

  return {
    id: buddy.id,
    name: buddy.full_name,
    email: buddy.email,
    city: buddy.city || 'Kazakhstan',
    program: buddy.study_program || 'Not specified',
    languages: safeArray(buddy.languages).join(', '),
    bio: buddy.about_you || 'This buddy has not added a bio yet.',
    interests: safeArray(buddy.hobbies),
    spotsAvailable: Math.max(0, maxBuddies - activeStudents),
    activeStudents,
    maxBuddies,
    score,
    compatibility,
    status,
    hasActiveMatch,
    hasPendingRequest: Boolean(pendingRequestBuddyId),
    averageRating: Number(buddy.average_rating || 0),
    feedbackCount: Number(buddy.feedback_count || 0),
    currentUserRating: buddy.current_user_rating ? Number(buddy.current_user_rating) : null,
    currentUserComment: buddy.current_user_comment || "",
    avatar:
      buddy.profile_photo_url ||
      'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  };
}
