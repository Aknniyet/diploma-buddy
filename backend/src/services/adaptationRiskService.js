const RISK_LEVELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function getRiskLevelLabel(level) {
  return RISK_LEVELS[level] || "Unknown";
}

export function buildAdaptationRiskSummary(metrics = {}) {
  let score = 0;
  const reasons = [];

  if (!metrics.hasBuddyMatch) {
    score += 30;
    reasons.push("No active buddy match");
  }

  if (metrics.checklistProgress < 30) {
    score += 25;
    reasons.push("Checklist progress is below 30%");
  }

  if (!metrics.hasBuddyRequest) {
    score += 15;
    reasons.push("No buddy request sent yet");
  }

  if ((metrics.daysSinceLastActive || 0) >= 7) {
    score += 15;
    reasons.push("Inactive for more than 7 days");
  }

  if ((metrics.supportNeedsCount || 0) >= 3) {
    score += 10;
    reasons.push("Several support needs selected");
  } else if ((metrics.supportNeedsCount || 0) >= 1) {
    score += 5;
    reasons.push("Some support needs selected");
  }

  if ((metrics.nlpRiskBonus || 0) > 0) {
    score += metrics.nlpRiskBonus;
    reasons.push("NLP detected support risk signals");
  }

  const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  return {
    score,
    level,
    label: getRiskLevelLabel(level),
    reasons,
  };
}
