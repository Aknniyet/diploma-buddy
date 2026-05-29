import { buildNlpMatchInsights } from "./nlpSupportService.js";

const SCORE_WEIGHTS = {
  studyProgram: 20,
  languages: 30,
  hobbies: 15,
  genderPreference: 15,
  buddyCapacity: 10,
  buddyRating: 10,
};

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildUniqueValues(values = []) {
  const map = new Map();

  values.forEach((value) => {
    const label = String(value || "").trim();
    const normalized = normalizeValue(label);

    if (label && normalized && !map.has(normalized)) {
      map.set(normalized, label);
    }
  });

  return map;
}

function findSharedValues(primaryValues = [], secondaryValues = []) {
  const primaryMap = buildUniqueValues(primaryValues);
  const secondaryMap = buildUniqueValues(secondaryValues);

  return Array.from(primaryMap.entries())
    .filter(([normalizedValue]) => secondaryMap.has(normalizedValue))
    .map(([, label]) => label);
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function buildScoreItem(key, label, score, maxScore, summary, details) {
  return {
    key,
    label,
    score,
    maxScore,
    summary,
    details,
  };
}

export function getBuddyMatchInsights(student = {}, buddy = {}) {
  const studentLanguages = Array.from(buildUniqueValues(student?.languages || []).values());
  const buddyLanguages = Array.from(buildUniqueValues(buddy?.languages || []).values());
  const studentHobbies = Array.from(buildUniqueValues(student?.hobbies || []).values());
  const buddyHobbies = Array.from(buildUniqueValues(buddy?.hobbies || []).values());

  const sharedLanguages = findSharedValues(studentLanguages, buddyLanguages);
  const sharedHobbies = findSharedValues(studentHobbies, buddyHobbies);

  const sameStudyProgram =
    normalizeValue(student?.study_program) &&
    normalizeValue(student?.study_program) === normalizeValue(buddy?.study_program);

  const studyProgramScore = sameStudyProgram ? SCORE_WEIGHTS.studyProgram : 0;
  const languageScore =
    studentLanguages.length > 0
      ? Math.round((sharedLanguages.length / studentLanguages.length) * SCORE_WEIGHTS.languages)
      : 0;
  const hobbyScore =
    studentHobbies.length > 0
      ? Math.round((sharedHobbies.length / studentHobbies.length) * SCORE_WEIGHTS.hobbies)
      : 0;

  const hasGenderPreference =
    student?.gender_preference && student.gender_preference !== "no_preference";
  const genderPreferenceMatches =
    hasGenderPreference &&
    normalizeValue(student.gender_preference) === normalizeValue(buddy?.gender);
  const genderPreferenceScore = genderPreferenceMatches ? SCORE_WEIGHTS.genderPreference : 0;

  const maxBuddies = Math.max(Number(buddy?.max_buddies || 3), 1);
  const activeStudents = clampNumber(buddy?.active_students_count, 0, maxBuddies);
  const availableSpots = Math.max(0, maxBuddies - activeStudents);
  const capacityScore = Math.round((availableSpots / maxBuddies) * SCORE_WEIGHTS.buddyCapacity);

  const feedbackCount = Math.max(Number(buddy?.feedback_count || 0), 0);
  const averageRating = clampNumber(buddy?.average_rating, 0, 5);
  const ratingScore =
    feedbackCount > 0
      ? Math.round((averageRating / 5) * SCORE_WEIGHTS.buddyRating)
      : Math.round(SCORE_WEIGHTS.buddyRating / 2);

  const breakdown = [
    buildScoreItem(
      "studyProgram",
      "Study program",
      studyProgramScore,
      SCORE_WEIGHTS.studyProgram,
      sameStudyProgram
        ? `Same study program: ${student.study_program}`
        : "Different study programs",
      sameStudyProgram
        ? "Students from the same program often have similar academic routines and questions."
        : "This buddy is from a different program, so the academic context may be less similar."
    ),
    buildScoreItem(
      "languages",
      "Shared languages",
      languageScore,
      SCORE_WEIGHTS.languages,
      sharedLanguages.length > 0
        ? `${sharedLanguages.length} shared language${sharedLanguages.length > 1 ? "s" : ""}: ${sharedLanguages.join(", ")}`
        : "No shared languages listed",
      studentLanguages.length > 0
        ? `Matches ${sharedLanguages.length} of the student's ${studentLanguages.length} selected language${studentLanguages.length > 1 ? "s" : ""}.`
        : "The student has not listed languages for matching."
    ),
    buildScoreItem(
      "hobbies",
      "Shared interests",
      hobbyScore,
      SCORE_WEIGHTS.hobbies,
      sharedHobbies.length > 0
        ? `${sharedHobbies.length} shared interest${sharedHobbies.length > 1 ? "s" : ""}: ${sharedHobbies.join(", ")}`
        : "No shared interests listed",
      studentHobbies.length > 0
        ? `Matches ${sharedHobbies.length} of the student's ${studentHobbies.length} listed interest${studentHobbies.length > 1 ? "s" : ""}.`
        : "The student has not listed interests for matching."
    ),
    buildScoreItem(
      "genderPreference",
      "Gender preference",
      genderPreferenceScore,
      SCORE_WEIGHTS.genderPreference,
      hasGenderPreference
        ? genderPreferenceMatches
          ? "Matches the student's gender preference"
          : "Does not match the student's gender preference"
        : "No gender preference set",
      hasGenderPreference
        ? "Applied only when the student explicitly asked for a preferred buddy gender."
        : "This criterion does not affect the ranking for this student."
    ),
    buildScoreItem(
      "buddyCapacity",
      "Buddy availability",
      capacityScore,
      SCORE_WEIGHTS.buddyCapacity,
      `${availableSpots} of ${maxBuddies} spots available`,
      availableSpots > 0
        ? "Buddies with more free capacity can usually respond faster and provide more attention."
        : "This buddy is already full and should not be offered for new matches."
    ),
    buildScoreItem(
      "buddyRating",
      "Buddy rating",
      ratingScore,
      SCORE_WEIGHTS.buddyRating,
      feedbackCount > 0
        ? `Rated ${averageRating.toFixed(1)}/5 from ${feedbackCount} review${feedbackCount > 1 ? "s" : ""}`
        : "New buddy with no reviews yet",
      feedbackCount > 0
        ? "Higher student feedback slightly increases the recommendation quality."
        : "New buddies get a neutral score instead of being penalized."
    ),
  ];

  const ruleBasedScore = breakdown.reduce((total, item) => total + item.score, 0);
  const nlpInsights = buildNlpMatchInsights(student, buddy);
  const hasNlpSignal =
    nlpInsights.score > 0 ||
    nlpInsights.detectedTopics.length > 0 ||
    nlpInsights.textSimilarity > 0;
  const nlpBonus = hasNlpSignal ? Math.round(nlpInsights.score * 0.15) : 0;
  const score = hasNlpSignal
    ? Math.min(100, ruleBasedScore + nlpBonus)
    : ruleBasedScore;
  const finalBreakdown = hasNlpSignal
    ? [
        ...breakdown,
        buildScoreItem(
          "nlpSupportFit",
          "NLP support fit",
          nlpBonus,
          15,
          nlpInsights.matchedTopics.length > 0
            ? `Matches support needs: ${nlpInsights.matchedTopics.join(", ")}`
            : nlpInsights.detectedTopics.length > 0
            ? `Detected student needs: ${nlpInsights.detectedTopics.join(", ")}`
            : "Profile text similarity checked",
          "Lightweight NLP compares request/profile text and support topics with the buddy profile."
        ),
      ]
    : breakdown;
  const reasons = breakdown
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item) => item.summary);
  const nlpReasons = nlpInsights.reasons.slice(0, 2);

  return {
    score,
    scoreLabel: `${score}/100`,
    ruleBasedScore,
    ruleBasedScoreLabel: `${ruleBasedScore}/100`,
    nlpScore: nlpInsights.score,
    nlpScoreLabel: nlpInsights.scoreLabel,
    breakdown: finalBreakdown,
    reasons: [...nlpReasons, ...reasons].slice(0, 4),
    sharedLanguages,
    sharedHobbies,
    nlpInsights,
  };
}

export function calculateBuddyScore(student, buddy) {
  return getBuddyMatchInsights(student, buddy).score;
}

export function formatBuddyCard(
  student,
  buddy,
  statusMap,
  activeMatchBuddyId,
  hasActiveMatch = false,
  pendingRequestBuddyId = null,
  activeMatchId = null,
  hasPendingReassignment = false
) {
  const activeStudents = Number(buddy.active_students_count || 0);
  const maxBuddies = Number(buddy.max_buddies || 3);
  const matchInsights = getBuddyMatchInsights(student, buddy);
  const isMatched = activeMatchBuddyId === buddy.id;
  const requestStatus = statusMap.get(buddy.id) || null;
  const status = isMatched
    ? "matched"
    : hasActiveMatch
    ? "locked"
    : pendingRequestBuddyId && pendingRequestBuddyId !== buddy.id
    ? "waiting"
    : requestStatus;

  return {
    id: buddy.id,
    matchId: isMatched ? activeMatchId : null,
    name: buddy.full_name,
    email: buddy.email,
    city: buddy.city || "Kazakhstan",
    program: buddy.study_program || "Not specified",
    languages: (buddy.languages || []).join(", "),
    languageList: buddy.languages || [],
    bio: buddy.about_you || "This buddy has not added a bio yet.",
    interests: buddy.hobbies || [],
    spotsAvailable: Math.max(0, maxBuddies - activeStudents),
    activeStudents,
    maxBuddies,
    preferredMeetingMode: buddy.preferred_meeting_mode || "both",
    maxWeeklyHours: Number(buddy.max_weekly_hours || 2),
    supportAreas: buddy.support_areas || [],
    score: matchInsights.score,
    scoreLabel: matchInsights.scoreLabel,
    ruleBasedScore: matchInsights.ruleBasedScore,
    ruleBasedScoreLabel: matchInsights.ruleBasedScoreLabel,
    nlpScore: matchInsights.nlpScore,
    nlpScoreLabel: matchInsights.nlpScoreLabel,
    nlpInsights: matchInsights.nlpInsights,
    matchReasons: matchInsights.reasons,
    matchBreakdown: matchInsights.breakdown,
    sharedLanguages: matchInsights.sharedLanguages,
    sharedHobbies: matchInsights.sharedHobbies,
    status,
    hasActiveMatch,
    hasPendingRequest: Boolean(pendingRequestBuddyId),
    hasPendingReassignment: isMatched && hasPendingReassignment,
    averageRating: Number(buddy.average_rating || 0),
    feedbackCount: Number(buddy.feedback_count || 0),
    currentUserRating: buddy.current_user_rating ? Number(buddy.current_user_rating) : null,
    currentUserComment: buddy.current_user_comment || "",
    avatar:
      buddy.profile_photo_url ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  };
}
