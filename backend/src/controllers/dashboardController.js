import {
  findBuddyDashboardData,
  findUpcomingDashboardEvents,
  findStudentChecklistTasks,
  findStudentDashboardData,
} from "../repositories/dashboardRepository.js";
import {
  buildNextSteps,
  calculateChecklistProgress,
  ensureChecklist,
  isTaskDueSoon,
  isTaskOverdue,
} from "../services/checklistService.js";
import { processTaskReminders } from "../services/taskReminderService.js";

function triggerTaskReminders() {
  processTaskReminders().catch(() => null);
}

export async function getStudentDashboard(req, res) {
  try {
    const userId = req.user.id;
    await ensureChecklist(userId);
    triggerTaskReminders();

    const [dashboardData, checklistResult, upcomingEventsResult] = await Promise.all([
      findStudentDashboardData(userId),
      findStudentChecklistTasks(userId),
      findUpcomingDashboardEvents(2),
    ]);

    const [matchResult, requestResult, unreadResult, eventEngagementResult] = dashboardData;

    const buddy = matchResult.rows[0] || null;
    const tasks = checklistResult.rows || [];
    const progressSummary = calculateChecklistProgress(tasks);

    const nextSteps = buildNextSteps(tasks, 4).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        deadline: task.deadline,
        overdue: isTaskOverdue(task),
        dueSoon: isTaskDueSoon(task),
        isCustom: Boolean(task.is_custom),
      }));

    return res.json({
      progress: progressSummary.progress,
      checklistSummary: {
        ...progressSummary,
        overdueTasks: tasks.filter((task) => isTaskOverdue(task)).length,
        highPriorityIncomplete: tasks.filter(
          (task) => !task.is_completed && task.priority === "high"
        ).length,
      },
      pendingRequests: requestResult.rows[0]?.pending_count || 0,
      hasBuddyRequest: Number(requestResult.rows[0]?.total_count || 0) > 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
      eventEngagementCount: eventEngagementResult.rows[0]?.count || 0,
      buddy: buddy
        ? {
            name: buddy.full_name,
            department: buddy.study_program || "Not specified",
            avatar:
              buddy.profile_photo_url ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }
        : null,
      nextSteps,
      upcomingEvents: upcomingEventsResult.rows || [],
    });
  } catch (error) {
    console.error("Student dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load dashboard." });
  }
}

export async function getBuddyDashboard(req, res) {
  try {
    const [matchesResult, pendingResult, unreadResult, profileResult] =
      await findBuddyDashboardData(req.user.id);
    const profile = profileResult.rows[0] || {};
    const upcomingEventsResult =
      profile.buddy_status === "approved"
        ? await findUpcomingDashboardEvents(2)
        : { rows: [] };

    return res.json({
      activeStudents: matchesResult.rows[0]?.count || 0,
      pendingRequests: pendingResult.rows[0]?.count || 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
      maxStudents: profile.max_buddies || 3,
      buddyStatus: profile.buddy_status || "not_applied",
      upcomingEvents: upcomingEventsResult.rows || [],
    });
  } catch (error) {
    console.error("Buddy dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load dashboard." });
  }
}
