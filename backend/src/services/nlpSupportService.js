const TOPIC_CATALOG = [
  {
    key: "documents",
    label: "Documents",
    weight: 10,
    keywords: [
      "document",
      "documents",
      "passport",
      "visa",
      "migration",
      "registration",
      "iin",
      "id",
      "validity",
      "документ",
      "паспорт",
      "виза",
      "миграц",
      "регистрац",
      "иин",
      "удостовер",
    ],
  },
  {
    key: "housing",
    label: "Housing",
    weight: 10,
    keywords: [
      "housing",
      "dorm",
      "dormitory",
      "apartment",
      "rent",
      "room",
      "landlord",
      "move in",
      "общежит",
      "жиль",
      "квартира",
      "аренда",
      "комната",
      "заселен",
    ],
  },
  {
    key: "banking",
    label: "Banking",
    weight: 8,
    keywords: [
      "bank",
      "banking",
      "card",
      "kaspi",
      "payment",
      "money",
      "account",
      "transfer",
      "банк",
      "карта",
      "каспи",
      "оплат",
      "счет",
      "перевод",
      "деньги",
    ],
  },
  {
    key: "transport",
    label: "Transport",
    weight: 7,
    keywords: [
      "transport",
      "bus",
      "metro",
      "route",
      "2gis",
      "map",
      "taxi",
      "airport",
      "транспорт",
      "автобус",
      "метро",
      "маршрут",
      "карта",
      "такси",
      "аэропорт",
    ],
  },
  {
    key: "university",
    label: "University",
    weight: 7,
    keywords: [
      "university",
      "campus",
      "class",
      "classes",
      "schedule",
      "teacher",
      "professor",
      "library",
      "orientation",
      "student id",
      "университет",
      "кампус",
      "пары",
      "распис",
      "преподав",
      "библиот",
      "ориентац",
      "студенчес",
    ],
  },
  {
    key: "personal",
    label: "Personal",
    weight: 6,
    keywords: [
      "lonely",
      "homesick",
      "stress",
      "anxiety",
      "friend",
      "friends",
      "culture",
      "language barrier",
      "safety",
      "safe",
      "emergency",
      "одинок",
      "скучаю",
      "стресс",
      "тревож",
      "друз",
      "культур",
      "язык",
      "безопас",
      "экстр",
    ],
  },
];

const URGENCY_KEYWORDS = [
  "urgent",
  "emergency",
  "immediately",
  "as soon as possible",
  "asap",
  "cannot",
  "can't",
  "lost",
  "unsafe",
  "danger",
  "problem",
  "срочно",
  "экстренно",
  "немедленно",
  "не могу",
  "потерял",
  "потеряла",
  "опасно",
  "проблем",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "you",
  "your",
  "are",
  "can",
  "need",
  "help",
  "about",
  "from",
  "have",
  "will",
  "как",
  "что",
  "для",
  "мне",
  "нужно",
  "помочь",
  "помощь",
  "это",
  "или",
  "уже",
]);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-яәғқңөұүһі0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTopic(value) {
  const normalized = normalizeText(value);
  const match = TOPIC_CATALOG.find(
    (topic) =>
      normalizeText(topic.key) === normalized ||
      normalizeText(topic.label) === normalized ||
      topic.keywords.some((keyword) => normalizeText(keyword) === normalized)
  );

  return match?.key || null;
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function buildTextVector(tokens) {
  const vector = new Map();

  tokens.forEach((token) => {
    vector.set(token, (vector.get(token) || 0) + 1);
  });

  return vector;
}

function cosineSimilarity(leftTokens, rightTokens) {
  if (!leftTokens.length || !rightTokens.length) return 0;

  const leftVector = buildTextVector(leftTokens);
  const rightVector = buildTextVector(rightTokens);
  const vocabulary = new Set([...leftVector.keys(), ...rightVector.keys()]);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  vocabulary.forEach((token) => {
    const leftValue = leftVector.get(token) || 0;
    const rightValue = rightVector.get(token) || 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  });

  if (!leftMagnitude || !rightMagnitude) return 0;
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function collectTextParts(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .map((part) => (Array.isArray(part) ? part.join(" ") : String(part)))
    .join(" ");
}

export function getTopicLabels(topicKeys = []) {
  return topicKeys
    .map((key) => TOPIC_CATALOG.find((topic) => topic.key === key)?.label)
    .filter(Boolean);
}

export function detectSupportTopics(text, selectedTopics = []) {
  const detected = new Set();
  const normalizedText = normalizeText(text);

  selectedTopics.forEach((topic) => {
    const normalizedTopic = normalizeTopic(topic);
    if (normalizedTopic) detected.add(normalizedTopic);
  });

  TOPIC_CATALOG.forEach((topic) => {
    if (topic.keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)))) {
      detected.add(topic.key);
    }
  });

  return Array.from(detected);
}

export function calculateTextSimilarity(leftText, rightText) {
  return cosineSimilarity(tokenize(leftText), tokenize(rightText));
}

export function buildNlpMatchInsights(student = {}, buddy = {}) {
  const studentText = collectTextParts(
    student.about_you,
    student.hobbies,
    student.study_program,
    student.home_country,
    student.latest_request_message,
    student.latest_support_topics
  );
  const buddyText = collectTextParts(
    buddy.about_you,
    buddy.hobbies,
    buddy.study_program,
    buddy.languages,
    buddy.city
  );
  const studentTopics = detectSupportTopics(studentText, student.latest_support_topics || []);
  const buddyTopics = detectSupportTopics(buddyText);
  const sharedTopics = studentTopics.filter((topic) => buddyTopics.includes(topic));
  const textSimilarity = calculateTextSimilarity(studentText, buddyText);
  const topicScore = studentTopics.length
    ? Math.round((sharedTopics.length / studentTopics.length) * 60)
    : 0;
  const similarityScore = Math.round(textSimilarity * 40);
  const score = Math.min(100, topicScore + similarityScore);
  const topicLabels = getTopicLabels(sharedTopics);
  const detectedTopicLabels = getTopicLabels(studentTopics);

  const reasons = [
    ...topicLabels.map((label) => `Matches ${label.toLowerCase()} support needs`),
  ];

  if (textSimilarity >= 0.18) {
    reasons.push("Profile text is similar to the student's needs");
  }

  return {
    score,
    scoreLabel: `${score}/100`,
    textSimilarity: Number(textSimilarity.toFixed(2)),
    detectedTopics: detectedTopicLabels,
    matchedTopics: topicLabels,
    reasons,
  };
}

export function buildNlpRiskInsights({
  message = "",
  supportTopics = [],
  hasBuddyMatch = false,
  hasBuddyRequest = false,
} = {}) {
  const detectedTopicKeys = detectSupportTopics(message, supportTopics);
  const detectedTopics = getTopicLabels(detectedTopicKeys);
  const normalizedMessage = normalizeText(message);
  const hasUrgentLanguage = URGENCY_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(normalizeText(keyword))
  );
  const topicBonus = detectedTopicKeys.reduce((total, key) => {
    const topic = TOPIC_CATALOG.find((item) => item.key === key);
    return total + (topic?.weight || 0);
  }, 0);
  const urgentBonus = hasUrgentLanguage ? 15 : 0;
  const noBuddyBonus = !hasBuddyMatch && detectedTopicKeys.length > 0 ? 5 : 0;
  const bonus = Math.min(35, topicBonus + urgentBonus + noBuddyBonus);
  const urgency = hasUrgentLanguage || bonus >= 25 ? "high" : bonus >= 12 ? "medium" : "normal";
  const signals = [];

  if (detectedTopics.length > 0) {
    signals.push(`Detected support topics: ${detectedTopics.join(", ")}`);
  }

  if (hasUrgentLanguage) {
    signals.push("Message contains urgent wording");
  }

  if (!hasBuddyMatch && hasBuddyRequest && detectedTopics.length > 0) {
    signals.push("Student requested help but has no active buddy yet");
  }

  const recommendation =
    urgency === "high"
      ? "Prioritize manual follow-up and connect the student with a suitable buddy."
      : detectedTopics.length > 0
      ? "Review the student's request topics and guide them to the right support."
      : "Continue monitoring standard adaptation indicators.";

  return {
    bonus,
    urgency,
    detectedTopics,
    signals,
    recommendation,
  };
}
