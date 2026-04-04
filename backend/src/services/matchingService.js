export function calculateBuddyScore(student, buddy) {
  let score = 0;

  const studentLanguages = student.languages || [];
  const buddyLanguages = buddy.languages || [];
  const studentHobbies = student.hobbies || [];
  const buddyHobbies = buddy.hobbies || [];

  if (
    student.study_program &&
    buddy.study_program &&
    student.study_program === buddy.study_program
  ) {
    score += 3;
  }

  const sharedLanguages = studentLanguages.filter((language) =>
    buddyLanguages.includes(language)
  );
  score += Math.min(sharedLanguages.length, 2) * 3;

  const sharedHobbies = studentHobbies.filter((hobby) =>
    buddyHobbies.includes(hobby)
  );
  score += Math.min(sharedHobbies.length, 2) * 2;

  if (
    student.gender_preference &&
    student.gender_preference !== 'no_preference' &&
    buddy.gender &&
    student.gender_preference === buddy.gender
  ) {
    score += 2;
  }

  return score;
}

export function formatBuddyCard(student, buddy, statusMap, activeMatchBuddyId) {
  const activeStudents = Number(buddy.active_students_count || 0);
  const score = calculateBuddyScore(student, buddy);
  const isMatched = activeMatchBuddyId === buddy.id;

  return {
    id: buddy.id,
    name: buddy.full_name,
    email: buddy.email,
    city: buddy.city || 'Kazakhstan',
    program: buddy.study_program || 'Not specified',
    languages: (buddy.languages || []).join(', '),
    bio: buddy.about_you || 'This buddy has not added a bio yet.',
    interests: buddy.hobbies || [],
    spotsAvailable: Math.max(0, 3 - activeStudents),
    activeStudents,
    score,
    status: isMatched ? 'matched' : statusMap.get(buddy.id) || null,
    avatar:
      buddy.profile_photo_url ||
      'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  };
}
