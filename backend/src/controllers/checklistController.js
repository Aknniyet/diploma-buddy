import {
  countUserChecklistTasks,
  getChecklistTasksByUserId,
  insertChecklistTask,
  toggleChecklistTask,
} from "../repositories/checklistRepository.js";

const defaultTasks = [
  { category: "documents", title: "Migration Registration", description: "Register at the migration office within the required time after arrival." },
  { category: "documents", title: "Get Student ID", description: "Collect your student ID from the university office or dean's office." },
  { category: "documents", title: "Prepare Passport Copies", description: "Keep printed and digital copies of your passport and visa documents." },

  { category: "housing", title: "Move Into Dormitory or Apartment", description: "Confirm your room, rental details, and key accommodation contacts." },
  { category: "housing", title: "Understand House Rules", description: "Learn the important dormitory or apartment rules and schedules." },
  { category: "housing", title: "Set Up Essentials", description: "Buy the basic items you need for daily life in your room." },

  { category: "banking", title: "Get IIN", description: "Apply for an Individual Identification Number if you still need one." },
  { category: "banking", title: "Open a Bank Account", description: "Set up a local bank account for payments, transfers, and student life." },
  { category: "banking", title: "Install a Payment App", description: "Install a local payment app such as Kaspi.kz for daily transactions." },

  { category: "healthcare", title: "Find a Nearby Clinic", description: "Identify the clinic or university medical center you can use." },
  { category: "healthcare", title: "Check Insurance Coverage", description: "Review what your medical insurance covers in Kazakhstan." },
  { category: "healthcare", title: "Save Emergency Numbers", description: "Store emergency phone numbers such as 112 and 103." },

  { category: "transport", title: "Get a Transport Card", description: "Buy or activate a public transport card for your city." },
  { category: "transport", title: "Download 2GIS", description: "Use 2GIS or another maps app to navigate your new city." },
  { category: "transport", title: "Learn Your University Route", description: "Practice the route from your accommodation to campus." },

  { category: "social", title: "Meet Your Buddy", description: "Arrange the first conversation or meeting with your buddy." },
  { category: "social", title: "Join Student Chats", description: "Join student Telegram or WhatsApp groups for updates and support." },
  { category: "social", title: "Attend an Orientation Event", description: "Take part in a welcome or orientation event and meet other students." },
];

async function ensureChecklist(userId) {
  const existing = await countUserChecklistTasks(userId);

  if (existing.rows[0]?.count > 0) {
    return;
  }

  for (const task of defaultTasks) {
    await insertChecklistTask(userId, task);
  }
}

export async function getChecklist(req, res) {
  try {
    await ensureChecklist(req.user.id);

    const result = await getChecklistTasksByUserId(req.user.id);

    const formatted = result.rows.map((item) => ({
      ...item,
      completed: item.is_completed,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Checklist load error:", error.message);
    return res.status(500).json({ message: "Could not load checklist." });
  }
}

export async function toggleTask(req, res) {
  try {
    const { taskId } = req.params;

    const result = await toggleChecklistTask(taskId, req.user.id);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({
      task: {
        ...result.rows[0],
        completed: result.rows[0].is_completed,
      },
    });
  } catch (error) {
    console.error("Checklist toggle error:", error.message);
    return res.status(500).json({ message: "Could not update checklist." });
  }
}