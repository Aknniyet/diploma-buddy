import {
  getChecklistTasksByUserId,
  toggleChecklistTask,
} from "../repositories/checklistRepository.js";
import {
  ensureChecklist,
  sortChecklistTasks,
} from "../services/checklistService.js";

export async function getChecklist(req, res) {
  try {
    await ensureChecklist(req.user.id);

    const result = await getChecklistTasksByUserId(req.user.id);

    const formatted = sortChecklistTasks(result.rows).map((item) => ({
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
