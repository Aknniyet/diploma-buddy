import {
  findChecklistTasksForReminders,
  hasTaskReminderBeenSent,
  markTaskReminderSent,
} from "../repositories/checklistRepository.js";
import { createNotification } from "./notificationService.js";

let isProcessingTaskReminders = false;

const reminderStages = [
  {
    type: "24_hours",
    maxMinutesBeforeDeadline: 24 * 60,
    title: "Task deadline tomorrow",
    buildDescription: (task) =>
      `Your task "${task.title}" is due within 24 hours.`,
  },
  {
    type: "6_hours",
    maxMinutesBeforeDeadline: 6 * 60,
    title: "Task deadline soon",
    buildDescription: (task) =>
      `Your task "${task.title}" is due within 6 hours.`,
  },
  {
    type: "overdue",
    maxMinutesBeforeDeadline: 0,
    title: "Task is overdue",
    buildDescription: (task) =>
      `Your task "${task.title}" has passed its deadline and is still incomplete.`,
  },
];

export async function processTaskReminders() {
  if (isProcessingTaskReminders) {
    return;
  }

  isProcessingTaskReminders = true;

  try {
    const tasksResult = await findChecklistTasksForReminders();
    const now = Date.now();

    for (const task of tasksResult.rows) {
      const deadline = new Date(task.deadline).getTime();
      const minutesUntilDeadline = Math.floor((deadline - now) / 60000);

      const dueStages = reminderStages.filter((stage) => {
        if (stage.type === "overdue") {
          return minutesUntilDeadline < 0;
        }

        return minutesUntilDeadline >= 0 && minutesUntilDeadline <= stage.maxMinutesBeforeDeadline;
      });

      for (const stage of dueStages) {
        const existingResult = await hasTaskReminderBeenSent(
          task.id,
          task.user_id,
          stage.type
        );

        if (existingResult.rows.length > 0) {
          continue;
        }

        await createNotification({
          userId: task.user_id,
          type: stage.type === "overdue" ? "task_overdue" : "task_deadline_reminder",
          title: stage.title,
          description: stage.buildDescription(task),
          referenceType: "checklist_task",
          referenceId: task.id,
        }).catch(() => null);

        await markTaskReminderSent(task.id, task.user_id, stage.type).catch(() => null);
      }
    }
  } catch (error) {
    console.error("Process task reminders error:", error.message);
  } finally {
    isProcessingTaskReminders = false;
  }
}
