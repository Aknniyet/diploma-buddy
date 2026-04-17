import {
  findBuddyDashboardData,
  findStudentChecklistTasks,
  findStudentDashboardData,
} from "../repositories/dashboardRepository.js";

export async function getStudentDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [dashboardData, checklistResult] = await Promise.all([
      findStudentDashboardData(userId),
      findStudentChecklistTasks(userId),
    ]);

    const [matchResult, requestResult, unreadResult] = dashboardData;

    const buddy = matchResult.rows[0] || null;
    const tasks = checklistResult.rows || [];

    const completedTasks = tasks.filter((task) => task.is_completed).length;
    const progress = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    const nextSteps = tasks
      .filter((task) => !task.is_completed)
      .slice(0, 3)
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
      }));

    return res.json({
      progress,
      pendingRequests: requestResult.rows[0]?.count || 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
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

    return res.json({
      activeStudents: matchesResult.rows[0]?.count || 0,
      pendingRequests: pendingResult.rows[0]?.count || 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
      maxStudents: profile.max_buddies || 3,
      buddyStatus: profile.buddy_status || "not_applied",
    });
  } catch (error) {
    console.error("Buddy dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load dashboard." });
  }
}
