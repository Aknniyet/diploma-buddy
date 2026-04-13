import {
  getAdminStats,
  getRecentBuddyRequests,
  getRecentUsers,
} from "../repositories/adminRepository.js";

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

    const [statsResults, recentUsersResult, recentRequestsResult] = await Promise.all([
      getAdminStats(),
      getRecentUsers(),
      getRecentBuddyRequests(),
    ]);

    const [
      totalUsers,
      internationalStudents,
      buddies,
      activeMatches,
      pendingRequests,
      upcomingEvents,
    ] = statsResults;

    return res.json({
      stats: {
        totalUsers: totalUsers.rows[0]?.count || 0,
        internationalStudents: internationalStudents.rows[0]?.count || 0,
        buddies: buddies.rows[0]?.count || 0,
        activeMatches: activeMatches.rows[0]?.count || 0,
        pendingRequests: pendingRequests.rows[0]?.count || 0,
        upcomingEvents: upcomingEvents.rows[0]?.count || 0,
      },
      recentUsers: recentUsersResult.rows,
      recentRequests: recentRequestsResult.rows,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load admin dashboard." });
  }
}
