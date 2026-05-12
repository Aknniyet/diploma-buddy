function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function formatBuddyCard(
  buddy,
  statusMap,
  activeMatchBuddyId,
  hasActiveMatch = false,
  pendingRequestBuddyId = null
) {
  const activeStudents = Number(buddy.active_students_count || 0);
  const maxBuddies = Number(buddy.max_buddies || 3);
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
