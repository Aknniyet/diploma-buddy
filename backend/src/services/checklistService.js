import {
  getChecklistTasksByUserId,
  insertChecklistTask,
  updateChecklistTaskMetadata,
} from "../repositories/checklistRepository.js";
import { query } from "../config/db.js";
import { ensurePlatformEnhancements } from "./platformSetupService.js";

const CATEGORY_ORDER = [
  "documents",
  "housing",
  "transport",
  "banking",
  "university",
  "personal",
];

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

export const defaultChecklistTasks = [
  {
    category: "documents",
    title: "Migration Registration",
    description: "Confirm your migration registration soon after arrival and keep the confirmation safe.",
    priority: "high",
    timeframe: "First 3 days",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "documents",
    title: "Check Visa and Stay Validity",
    description: "Double-check your visa dates or allowed stay period so you do not miss any deadlines.",
    priority: "high",
    timeframe: "Arrival week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "documents",
    title: "Get Student ID",
    description: "Collect your student ID from the university office or dean's office and keep it with you on campus.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "housing",
    title: "Move Into Dormitory or Apartment",
    description: "Confirm your room, rental details, and the basic move-in steps for your new accommodation.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "housing",
    title: "Understand House Rules",
    description: "Learn the important dormitory or apartment rules, including quiet hours and visitor policies.",
    priority: "medium",
    timeframe: "Arrival week",
  },
  {
    category: "transport",
    title: "Get a Transport Card",
    description: "Buy or activate a local transport card for buses or other public transport in your city.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "transport",
    title: "Learn Your University Route",
    description: "Practice the route from your accommodation to campus before a busy study day starts.",
    priority: "high",
    timeframe: "First week",
  },
  {
    category: "banking",
    title: "Get IIN",
    description: "Apply for an Individual Identification Number if you still need one for banking and other services.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "banking",
    title: "Open a Bank Account",
    description: "Set up a local bank account for payments, transfers, and everyday student expenses.",
    priority: "high",
    timeframe: "First 2 weeks",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "university",
    title: "Save International Office Contact",
    description: "Store the international office email, room number, and working hours for quick help later.",
    priority: "medium",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "university",
    title: "Join Student Chats",
    description: "Join student Telegram or WhatsApp groups so you do not miss announcements and informal support.",
    priority: "high",
    timeframe: "Arrival week",
    actionLabel: "Open community",
    actionUrl: "/student/community",
  },
  {
    category: "university",
    title: "Attend an Orientation Event",
    description: "Take part in a welcome or orientation event and meet other students in a low-pressure setting.",
    priority: "medium",
    timeframe: "First month",
    actionLabel: "Open events",
    actionUrl: "/student/events",
  },
  {
    category: "personal",
    title: "Meet Your Buddy",
    description: "Arrange your first conversation or meeting with your buddy and ask your first practical questions.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Find a buddy",
    actionUrl: "/student/find-buddies",
  },
  {
    category: "personal",
    title: "Keep Emergency Numbers Ready",
    description: "Save emergency contacts, student support numbers, and at least one trusted contact in Kazakhstan.",
    priority: "medium",
    timeframe: "Arrival week",
  },
  {
    category: "personal",
    title: "Visit One Club or Community Event",
    description: "Try at least one student club, meetup, or informal event to feel more connected on campus.",
    priority: "low",
    timeframe: "First month",
    actionLabel: "Open events",
    actionUrl: "/student/events",
  },
];

function getCategoryOrder(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getPriorityOrder(priority) {
  return PRIORITY_ORDER[priority] ?? PRIORITY_ORDER.medium;
}

function getDeadlineTime(task) {
  if (!task.deadline) return Number.MAX_SAFE_INTEGER;
  const time = new Date(task.deadline).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function isTaskOverdue(task) {
  if (task.is_completed || task.completed) return false;
  if (!task.deadline) return false;
  return new Date(task.deadline).getTime() < Date.now();
}

export function isTaskDueSoon(task, withinHours = 48) {
  if (task.is_completed || task.completed) return false;
  if (!task.deadline) return false;
  const diff = new Date(task.deadline).getTime() - Date.now();
  return diff >= 0 && diff <= withinHours * 60 * 60 * 1000;
}

export function calculateChecklistProgress(tasks = []) {
  if (!tasks.length) {
    return { completedCount: 0, totalCount: 0, progress: 0 };
  }

  const completedCount = tasks.filter((task) => task.is_completed || task.completed).length;
  return {
    completedCount,
    totalCount: tasks.length,
    progress: Math.round((completedCount / tasks.length) * 100),
  };
}

export async function ensureChecklist(userId) {
  await ensurePlatformEnhancements();

  const existing = await getChecklistTasksByUserId(userId);
  const existingTitles = new Set(existing.rows.map((task) => task.title));
  const validSystemTitles = new Set(defaultChecklistTasks.map((task) => task.title));

  for (const task of defaultChecklistTasks) {
    if (!existingTitles.has(task.title)) {
      await insertChecklistTask(userId, task);
    } else {
      await updateChecklistTaskMetadata(userId, task);
    }
  }

  await query(
    `DELETE FROM adaptation_checklist_tasks
     WHERE user_id = $1
       AND COALESCE(is_custom, FALSE) = FALSE
       AND title <> ALL($2::text[])`,
    [userId, Array.from(validSystemTitles)]
  );
}

export function sortChecklistTasks(tasks) {
  const orderMap = new Map(
    defaultChecklistTasks.map((task, index) => [task.title, index])
  );

  return [...tasks].sort((first, second) => {
    const firstCategory = getCategoryOrder(first.category);
    const secondCategory = getCategoryOrder(second.category);
    if (firstCategory !== secondCategory) return firstCategory - secondCategory;

    if (Boolean(first.is_completed) !== Boolean(second.is_completed)) {
      return Number(first.is_completed) - Number(second.is_completed);
    }

    if (isTaskOverdue(first) !== isTaskOverdue(second)) {
      return isTaskOverdue(first) ? -1 : 1;
    }

    const firstPriority = getPriorityOrder(first.priority);
    const secondPriority = getPriorityOrder(second.priority);
    if (firstPriority !== secondPriority) return firstPriority - secondPriority;

    const firstDeadline = getDeadlineTime(first);
    const secondDeadline = getDeadlineTime(second);
    if (firstDeadline !== secondDeadline) return firstDeadline - secondDeadline;

    const firstOrder = orderMap.get(first.title) ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = orderMap.get(second.title) ?? Number.MAX_SAFE_INTEGER;
    if (firstOrder !== secondOrder) return firstOrder - secondOrder;

    return first.title.localeCompare(second.title);
  });
}

export function buildNextSteps(tasks = [], limit = 3) {
  return sortChecklistTasks(tasks)
    .filter((task) => !task.is_completed)
    .sort((first, second) => {
      if (isTaskOverdue(first) !== isTaskOverdue(second)) {
        return isTaskOverdue(first) ? -1 : 1;
      }

      if (isTaskDueSoon(first) !== isTaskDueSoon(second)) {
        return isTaskDueSoon(first) ? -1 : 1;
      }

      const firstPriority = getPriorityOrder(first.priority);
      const secondPriority = getPriorityOrder(second.priority);
      if (firstPriority !== secondPriority) return firstPriority - secondPriority;

      return getDeadlineTime(first) - getDeadlineTime(second);
    })
    .slice(0, limit);
}
