import { env } from "../config/env.js";
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
- Reply in the same language as the user message whenever possible.
- Use the user's role and checklist progress to personalize the answer.
- Avoid sounding like a template. Prefer 2-4 concrete next steps when relevant.
- Do not invent exact official university rules, deadlines, or legal requirements.
- If the question needs official information, tell the user to contact the university international office or administrator.
- If the user asks unrelated questions, politely redirect them back to KazakhBuddy support topics.
`;
}

async function loadGeminiClient() {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    return new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });
  } catch (error) {
    console.warn("Gemini SDK unavailable, trying REST fallback:", error.message);
    return null;
  }
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
}

async function generateViaGeminiRest(message, user, checklistTasks) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
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
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const messageText = payload?.error?.message || `Gemini REST request failed with ${response.status}`;
    throw new Error(messageText);
  }

  return extractGeminiText(payload);
}

export async function generateGeminiAssistantReply(message, user, checklistTasks = []) {
  if (!env.geminiApiKey) {
    return generateAssistantReply(message, user, checklistTasks);
  }

  try {
    const ai = await loadGeminiClient();
    let answer = "";

    if (ai) {
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

      answer = response.text?.trim() || "";
    }

    if (!answer) {
      answer = await generateViaGeminiRest(message, user, checklistTasks);
    }

    if (!answer) {
      return generateAssistantReply(message, user, checklistTasks);
    }

    const isLocalUser = user?.role === "local";

    return {
      intent: "gemini",
      answer,
      actions: isLocalUser
        ? [
            { label: "Open events", path: "/buddy/events" },
            { label: "Open messages", path: "/buddy/messages" },
            { label: "Open community", path: "/buddy/community" },
          ]
        : [
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
