import {
  getBuddyStatusDistribution,
  getCommunityPostsByCategory,
  getAdminStats,
  getRegistrationsByWeek,
  getRecentBuddyRequests,
  getRecentUsers,
  getStudentAttentionSignals,
  getStudentsWithoutBuddyCount,
  getUsersByRole,
} from "../repositories/adminRepository.js";
import { buildAdaptationInsight } from "../services/adaptationInsightService.js";

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

    const [
      statsResults,
      recentUsersResult,
      recentRequestsResult,
      usersByRoleResult,
      buddyStatusesResult,
      communityCategoriesResult,
      registrationsByWeekResult,
      studentsWithoutBuddyResult,
      attentionSignalsResult,
    ] = await Promise.all([
      getAdminStats(),
      getRecentUsers(),
      getRecentBuddyRequests(),
      getUsersByRole(),
      getBuddyStatusDistribution(),
      getCommunityPostsByCategory(),
      getRegistrationsByWeek(),
      getStudentsWithoutBuddyCount(),
      getStudentAttentionSignals(),
    ]);
    const [totalUsers, internationalStudents, buddies, activeMatches, pendingRequests, upcomingEvents] = statsResults;
    const attentionQueue = (attentionSignalsResult.rows || [])
      .map((student) => {
        const insight = buildAdaptationInsight({
          ...student,
          pendingRequestCount: student.pending_request_count,
          activeBuddyCount: student.active_buddy_count,
          sentMessageCount: student.sent_message_count,
          communityActivityCount: student.community_activity_count,
          checklistProgress: student.checklist_progress,
        });

        return {
          id: student.id,
          fullName: student.full_name,
          email: student.email,
          city: student.city || "Not provided",
          studyProgram: student.study_program || "Not provided",
          profileCompletion: insight.profileCompletion,
          checklistProgress: insight.checklistProgress,
          stage: insight.stage,
          risk: insight.risk,
          hasBuddy: student.active_buddy_count > 0,
          pendingRequests: student.pending_request_count || 0,
        };
      })
      .filter((student) => student.risk.score > 0)
      .sort((a, b) => b.risk.score - a.risk.score)
      .slice(0, 6);

    return res.json({
      stats: {
        totalUsers: totalUsers.rows[0]?.count || 0,
        internationalStudents: internationalStudents.rows[0]?.count || 0,
        buddies: buddies.rows[0]?.count || 0,
        activeMatches: activeMatches.rows[0]?.count || 0,
        pendingRequests: pendingRequests.rows[0]?.count || 0,
        upcomingEvents: upcomingEvents.rows[0]?.count || 0,
        studentsWithoutBuddy: studentsWithoutBuddyResult.rows[0]?.count || 0,
      },
      recentUsers: recentUsersResult.rows,
      recentRequests: recentRequestsResult.rows,
      attentionQueue,
      analytics: {
        usersByRole: usersByRoleResult.rows,
        buddyStatuses: buddyStatusesResult.rows,
        communityCategories: communityCategoriesResult.rows,
        registrationsByWeek: registrationsByWeekResult.rows.reverse(),
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load admin dashboard." });
  }
}
