import {
  createCustomChecklistTask,
  deleteCustomChecklistTask,
  getChecklistTasksByUserId,
  toggleChecklistTask,
  updateCustomChecklistTask,
} from "../repositories/checklistRepository.js";
import {
  calculateChecklistProgress,
  ensureChecklist,
  sortChecklistTasks,
} from "../services/checklistService.js";
import { processTaskReminders } from "../services/taskReminderService.js";

function triggerTaskReminders() {
  processTaskReminders().catch(() => null);
}

function formatChecklistTask(item) {
  return {
    ...item,
    completed: item.is_completed,
  };
}

function validateTaskPayload(body = {}) {
  const title = body.title?.trim();
  const description = body.description?.trim();
  const category = body.category?.trim()?.toLowerCase();
  const priority = body.priority?.trim()?.toLowerCase() || "medium";
  const deadline = body.deadline ? new Date(body.deadline) : null;

  const allowedCategories = new Set([
    "documents",
    "housing",
    "transport",
    "banking",
    "university",
    "personal",
  ]);
  const allowedPriorities = new Set(["high", "medium", "low"]);

  if (!title || title.length < 3) {
    return { error: "Task title should be at least 3 characters long." };
  }

  if (!description || description.length < 5) {
    return { error: "Task description should be at least 5 characters long." };
  }

  if (!allowedCategories.has(category)) {
    return { error: "Task category is invalid." };
  }

  if (!allowedPriorities.has(priority)) {
    return { error: "Task priority is invalid." };
  }

  if (deadline && Number.isNaN(deadline.getTime())) {
    return { error: "Task deadline is invalid." };
  }

  return {
    value: {
      title,
      description,
      category,
      priority,
      deadline: deadline ? deadline.toISOString() : null,
    },
  };
}

export async function getChecklist(req, res) {
  try {
    await ensureChecklist(req.user.id);
    triggerTaskReminders();

    const result = await getChecklistTasksByUserId(req.user.id);
    const sortedTasks = sortChecklistTasks(result.rows);
    const progress = calculateChecklistProgress(sortedTasks);

    const formatted = sortedTasks.map(formatChecklistTask);

    return res.json({
      tasks: formatted,
      summary: progress,
    });
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
      task: formatChecklistTask(result.rows[0]),
    });
  } catch (error) {
    console.error("Checklist toggle error:", error.message);
    return res.status(500).json({ message: "Could not update checklist." });
  }
}

export async function createTask(req, res) {
  try {
    await ensureChecklist(req.user.id);
    const validation = validateTaskPayload(req.body);

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const result = await createCustomChecklistTask(req.user.id, validation.value);

    return res.status(201).json({
      task: formatChecklistTask(result.rows[0]),
    });
  } catch (error) {
    console.error("Checklist create task error:", error.message);
    return res.status(500).json({ message: "Could not create task." });
  }
}

export async function updateTask(req, res) {
  try {
    await ensureChecklist(req.user.id);
    const validation = validateTaskPayload(req.body);

    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const result = await updateCustomChecklistTask(
      req.params.taskId,
      req.user.id,
      validation.value
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Custom task not found." });
    }

    return res.json({
      task: formatChecklistTask(result.rows[0]),
    });
  } catch (error) {
    console.error("Checklist update task error:", error.message);
    return res.status(500).json({ message: "Could not update task." });
  }
}

export async function deleteTask(req, res) {
  try {
    await ensureChecklist(req.user.id);
    const result = await deleteCustomChecklistTask(req.params.taskId, req.user.id);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Custom task not found." });
    }

    return res.json({ message: "Task deleted." });
  } catch (error) {
    console.error("Checklist delete task error:", error.message);
    return res.status(500).json({ message: "Could not delete task." });
  }
}
