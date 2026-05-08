function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function includesAny(message, keywords) {
  return keywords.some((keyword) => message.includes(keyword));
}

const assistantIntents = [
  {
    intent: "iin",
    keywords: ["iin", "individual identification", "identification number"],
    answer:
      "IIN is often needed for banking, SIM cards, and some local services in Kazakhstan. You can start by checking the documents section of your adaptation checklist.",
    actions: [
      { label: "Open checklist", path: "/student/checklist" },
      { label: "View guide", path: "/guide" },
    ],
  },
  {
    intent: "bank",
    keywords: ["bank", "card", "kaspi", "payment", "money"],
    answer:
      "To open a bank account, international students usually need identification documents. Your checklist includes banking-related steps such as getting IIN and opening a bank account.",
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  },
  {
    intent: "documents",
    keywords: ["document", "passport", "visa", "migration", "registration"],
    answer:
      "For document-related adaptation, focus on migration registration, passport copies, student ID, and university requirements. You can track these tasks in your checklist.",
    actions: [
      { label: "Open checklist", path: "/student/checklist" },
      { label: "View guide", path: "/guide" },
    ],
  },
  {
    intent: "buddy",
    keywords: ["buddy", "match", "request", "connect", "find buddy"],
    answer:
      "You can find available local buddies, send a connection request, and wait for approval. After approval, you can message your buddy directly.",
    actions: [
      { label: "Find buddies", path: "/student/find-buddies" },
      { label: "Open messages", path: "/student/messages" },
    ],
  },
  {
    intent: "checklist",
    keywords: ["checklist", "task", "progress", "next step", "what should i do"],
    answer:
      "Your adaptation checklist helps you track important steps such as documents, housing, banking, healthcare, transport, and social integration.",
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  },
  {
    intent: "events",
    keywords: ["event", "orientation", "meeting", "activity", "tour"],
    answer:
      "Events help international students meet others and adapt faster. You can check upcoming activities in the Events section.",
    actions: [{ label: "Open events", path: "/student/events" }],
  },
  {
    intent: "housing",
    keywords: ["dormitory", "dorm", "housing", "apartment", "room"],
    answer:
      "For housing, make sure you confirm your room or rental details, understand house rules, and save important accommodation contacts.",
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  },
  {
    intent: "transport",
    keywords: ["transport", "bus", "metro", "route", "2gis", "map"],
    answer:
      "For transport, you can download 2GIS, learn your route to university, and prepare a public transport card if needed.",
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  },
  {
    intent: "healthcare",
    keywords: ["health", "clinic", "doctor", "insurance", "emergency"],
    answer:
      "For healthcare, check your insurance coverage, find a nearby clinic, and save emergency numbers such as 112 and 103.",
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  },
];

function buildChecklistAnswer(tasks = []) {
  const incompleteTasks = tasks.filter((task) => !task.is_completed).slice(0, 3);

  if (incompleteTasks.length === 0) {
    return {
      answer:
        "Great job! Your checklist looks complete. You can continue by joining events, communicating with your buddy, and checking useful information.",
      actions: [
        { label: "Open events", path: "/student/events" },
        { label: "Open messages", path: "/student/messages" },
      ],
    };
  }

  const taskList = incompleteTasks
    .map((task, index) => `${index + 1}. ${task.title}`)
    .join("\n");

  return {
    answer: `Based on your checklist, your next recommended steps are:\n${taskList}`,
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  };
}

export function generateAssistantReply(message, user, checklistTasks = []) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return {
      answer: "Please write your question, and I will try to guide you.",
      intent: "empty",
      actions: [],
    };
  }

  if (
    includesAny(normalizedMessage, [
      "what should i do",
      "next step",
      "next steps",
      "what next",
      "recommend",
    ])
  ) {
    const checklistAnswer = buildChecklistAnswer(checklistTasks);

    return {
      intent: "next_steps",
      ...checklistAnswer,
    };
  }

  const matchedIntent = assistantIntents.find((item) =>
    includesAny(normalizedMessage, item.keywords)
  );

  if (matchedIntent) {
    return {
      intent: matchedIntent.intent,
      answer: matchedIntent.answer,
      actions: matchedIntent.actions,
    };
  }

  const roleText =
    user?.role === "local"
      ? "As a local buddy, you can support students through messages, requests, events, and profile updates."
      : "As an international student, you can use the checklist, find a buddy, view events, and message your buddy.";

  return {
    intent: "fallback",
    answer: `${roleText} I could not find an exact answer, but you can try asking about documents, IIN, banking, housing, transport, events, checklist, or buddy matching.`,
    actions: [
      { label: "Open checklist", path: "/student/checklist" },
      { label: "Open messages", path: "/student/messages" },
    ],
  };
}
