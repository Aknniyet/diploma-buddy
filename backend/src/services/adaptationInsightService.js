function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getAccountAgeDays(createdAt) {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;
  const diff = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function calculateProfileCompletion(profile = {}) {
  const checks = [
    Boolean(profile.home_country),
    Boolean(profile.city),
    Boolean(profile.study_program),
    Boolean(profile.gender),
    Array.isArray(profile.languages) && profile.languages.length > 0,
    Array.isArray(profile.hobbies) && profile.hobbies.length > 0,
    Boolean(profile.about_you),
    Boolean(profile.profile_photo_url),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function deriveAdaptationStage({ hasBuddy, checklistProgress, profileCompletion, hasCommunityActivity }) {
  if (!hasBuddy && checklistProgress < 25) {
    return {
      key: "getting_started",
      label: "Getting Started",
      description: "Your first onboarding steps are still in progress.",
    };
  }

  if (!hasBuddy) {
    return {
      key: "waiting_for_support",
      label: "Waiting for Support",
      description: "You are making progress, but still need an active buddy.",
    };
  }

  if (checklistProgress < 60 || profileCompletion < 70) {
    return {
      key: "early_adaptation",
      label: "Early Adaptation",
      description: "Your support is active, but several important steps are still open.",
    };
  }

  if (!hasCommunityActivity || checklistProgress < 90) {
    return {
      key: "settling_in",
      label: "Settling In",
      description: "Core support is in place and you are moving through adaptation tasks.",
    };
  }

  return {
    key: "on_track",
    label: "On Track",
    description: "Your adaptation signals look healthy and consistent.",
  };
}

export function buildAdaptationInsight(signals = {}) {
  const profileCompletion = calculateProfileCompletion(signals);
  const checklistProgress = clamp(Number(signals.checklistProgress || 0), 0, 100);
  const hasBuddy = Boolean(signals.activeBuddyCount > 0);
  const pendingRequests = Number(signals.pendingRequestCount || 0);
  const sentMessages = Number(signals.sentMessageCount || 0);
  const communityActivityCount = Number(signals.communityActivityCount || 0);
  const hasCommunityActivity = communityActivityCount > 0;
  const accountAgeDays = getAccountAgeDays(signals.created_at);

  let score = 0;
  const reasons = [];

  if (!hasBuddy && pendingRequests === 0) {
    score += 28;
    reasons.push("No active buddy is assigned yet.");
  } else if (!hasBuddy && pendingRequests > 0) {
    score += 16;
    reasons.push("A buddy request is still waiting for a response.");
  }

  if (checklistProgress < 25) {
    score += 18;
    reasons.push("Checklist progress is still very low.");
  } else if (checklistProgress < 50) {
    score += 10;
    reasons.push("Important adaptation tasks are still incomplete.");
  }

  if (profileCompletion < 60) {
    score += 12;
    reasons.push("The student profile is missing important details.");
  }

  if (sentMessages === 0) {
    score += 8;
    reasons.push("No direct communication has started yet.");
  }

  if (!hasCommunityActivity) {
    score += 8;
    reasons.push("There is no activity in the community space yet.");
  }

  if (accountAgeDays >= 7 && checklistProgress < 40) {
    score += 6;
    reasons.push("The account has been active for several days with limited progress.");
  }

  if (hasBuddy) score -= 10;
  if (sentMessages > 0) score -= 6;
  if (hasCommunityActivity) score -= 4;

  score = clamp(score, 0, 100);

  let level = "low";
  let label = "Low Risk";

  if (score >= 60) {
    level = "high";
    label = "High Risk";
  } else if (score >= 30) {
    level = "medium";
    label = "Medium Risk";
  }

  const stage = deriveAdaptationStage({
    hasBuddy,
    checklistProgress,
    profileCompletion,
    hasCommunityActivity,
  });

  const recommendations = [];

  if (!hasBuddy && pendingRequests === 0) {
    recommendations.push({
      id: "find-buddy",
      title: "Find a buddy",
      description: "Choose a buddy match to unlock direct support and messages.",
      actionLabel: "Open Find Buddies",
      actionUrl: "/student/find-buddies",
    });
  }

  if (checklistProgress < 60) {
    recommendations.push({
      id: "continue-checklist",
      title: "Continue your adaptation checklist",
      description: "Finishing core tasks will lower your risk and improve readiness.",
      actionLabel: "Open Checklist",
      actionUrl: "/student/checklist",
    });
  }

  if (profileCompletion < 70) {
    recommendations.push({
      id: "complete-profile",
      title: "Complete your profile",
      description: "A fuller profile helps the system and buddies support you better.",
      actionLabel: "Open Profile",
      actionUrl: "/student/profile",
    });
  }

  if (hasBuddy && sentMessages === 0) {
    recommendations.push({
      id: "message-buddy",
      title: "Message your buddy",
      description: "Start the conversation early so support becomes active faster.",
      actionLabel: "Open Messages",
      actionUrl: "/student/messages",
    });
  }

  if (!hasCommunityActivity) {
    recommendations.push({
      id: "join-community",
      title: "Join the community board",
      description: "Community participation helps you settle in and find useful peer advice.",
      actionLabel: "Open Community",
      actionUrl: "/student/community",
    });
  }

  return {
    profileCompletion,
    checklistProgress,
    stage,
    risk: {
      score,
      level,
      label,
      reasons: reasons.slice(0, 3),
    },
    recommendations: recommendations.slice(0, 3),
  };
}

