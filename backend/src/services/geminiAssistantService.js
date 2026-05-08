import { generateAssistantReply } from "./assistantService.js";

function buildSystemPrompt(user, checklistTasks = []) {
  const checklistText =
    checklistTasks.length > 0
      ? checklistTasks
          .map((task) => `- ${task.title}: ${task.is_completed ? "completed" : "not completed"}`)
          .join("\n")
      : "No checklist data available.";

  return `
You are KazakhBuddy Assistant, a helpful support assistant for an international student buddy platform.

Platform purpose:
- help international students adapt to university life
- help students find local buddies
- explain checklist tasks, events, documents, housing, transport, and support resources

User role:
${user?.role || "unknown"}

Student checklist:
${checklistText}

Rules:
- Answer only about student adaptation, buddy matching, platform usage, events, documents, housing, transport, healthcare, banking, and university support.
- Keep answers clear and practical.
- Do not invent exact official university rules, deadlines, or legal requirements.
- If the question needs official information, tell the user to contact the university international office or administrator.
- If the user asks unrelated questions, politely redirect them back to KazakhBuddy support topics.
`;
}

async function loadGeminiClient() {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  } catch (error) {
    console.warn("Gemini SDK unavailable, using local assistant fallback:", error.message);
    return null;
  }
}

export async function generateGeminiAssistantReply(message, user, checklistTasks = []) {
  if (!process.env.GEMINI_API_KEY) {
    return generateAssistantReply(message, user, checklistTasks);
  }

  try {
    const ai = await loadGeminiClient();

    if (!ai) {
      return generateAssistantReply(message, user, checklistTasks);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${buildSystemPrompt(user, checklistTasks)}\n\nUser question: ${message}`,
            },
          ],
        },
      ],
    });

    const answer = response.text?.trim();

    if (!answer) {
      return generateAssistantReply(message, user, checklistTasks);
    }

    return {
      intent: "gemini",
      answer,
      actions: [
        { label: "Open checklist", path: "/student/checklist" },
        { label: "Open events", path: "/student/events" },
        { label: "Open messages", path: "/student/messages" },
      ],
    };
  } catch (error) {
    console.error("Gemini assistant error:", error.message);
    return generateAssistantReply(message, user, checklistTasks);
  }
}
