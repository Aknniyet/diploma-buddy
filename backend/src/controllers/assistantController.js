import { getChecklistTasksByUserId } from "../repositories/checklistRepository.js";
import { generateGeminiAssistantReply } from "../services/geminiAssistantService.js";

export async function chatWithAssistant(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    let checklistTasks = [];

    if (req.user.role === "international") {
      const result = await getChecklistTasksByUserId(req.user.id);
      checklistTasks = result.rows;
    }

    const reply = await generateGeminiAssistantReply(message, req.user, checklistTasks);

    return res.json({
      userMessage: message,
      reply,
    });
  } catch (error) {
    console.error("Assistant error:", error.message);
    return res.status(500).json({ message: "Could not generate assistant reply." });
  }
}
