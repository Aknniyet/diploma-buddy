import {
  getAdminStats,
  getRecentBuddyRequests,
  getRecentUsers,
  getStudentAdaptationInsights,
} from "../repositories/adminRepository.js";
import { buildAdaptationRiskSummary } from "../services/adaptationRiskService.js";

function ensureAdmin(req, res) {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return false;
  }

  return true;
}

export async function getAdminDashboard(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const [statsResults, recentUsersResult, recentRequestsResult, adaptationResult] = await Promise.all([
      getAdminStats(),
      getRecentUsers(),
      getRecentBuddyRequests(),
      getStudentAdaptationInsights(),
    ]);

    const [
      totalUsers,
      internationalStudents,
      buddies,
      activeMatches,
      pendingRequests,
      upcomingEvents,
      overdueTasks,
      highPriorityIncomplete,
    ] = statsResults;

    const adaptationInsights = adaptationResult.rows.map((student) => {
      const totalTasks = Number(student.total_tasks || 0);
      const completedTasks = Number(student.completed_tasks || 0);
      const checklistProgress = totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;
      const lastActiveAt = student.last_active_at ? new Date(student.last_active_at) : null;
      const daysSinceLastActive = lastActiveAt
        ? Math.floor((Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const risk = buildAdaptationRiskSummary({
        hasBuddyMatch: Boolean(student.has_buddy_match),
        checklistProgress,
        hasBuddyRequest: Number(student.request_count || 0) > 0,
        daysSinceLastActive,
        supportNeedsCount: Number(student.support_needs_count || 0),
      });

      return {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        created_at: student.created_at,
        last_active_at: student.last_active_at,
        checklistProgress,
        totalTasks,
        completedTasks,
        overdueTasks: Number(student.overdue_tasks || 0),
        highPriorityIncomplete: Number(student.high_priority_incomplete || 0),
        hasBuddyMatch: Boolean(student.has_buddy_match),
        hasBuddyRequest: Number(student.request_count || 0) > 0,
        requestCount: Number(student.request_count || 0),
        supportNeedsCount: Number(student.support_needs_count || 0),
        risk,
      };
    });

    const highRiskStudents = adaptationInsights.filter(
      (student) => student.risk.level === "high"
    ).length;

    return res.json({
      stats: {
        totalUsers: totalUsers.rows[0]?.count || 0,
        internationalStudents: internationalStudents.rows[0]?.count || 0,
        buddies: buddies.rows[0]?.count || 0,
        activeMatches: activeMatches.rows[0]?.count || 0,
        pendingRequests: pendingRequests.rows[0]?.count || 0,
        upcomingEvents: upcomingEvents.rows[0]?.count || 0,
        overdueTasks: overdueTasks.rows[0]?.count || 0,
        highPriorityIncomplete: highPriorityIncomplete.rows[0]?.count || 0,
        highRiskStudents,
      },
      recentUsers: recentUsersResult.rows,
      recentRequests: recentRequestsResult.rows,
      adaptationInsights,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load admin dashboard." });
  }
}
