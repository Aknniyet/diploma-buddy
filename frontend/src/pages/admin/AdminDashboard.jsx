import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/admin.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      internationalStudents: 0,
      buddies: 0,
      activeMatches: 0,
      pendingRequests: 0,
      upcomingEvents: 0,
    },
    recentUsers: [],
    recentRequests: [],
  });

  useEffect(() => {
    apiRequest("/admin/dashboard").then(setDashboard).catch(() => null);
  }, []);

  const stats = [
    { label: "Total Users", value: dashboard.stats.totalUsers },
    { label: "International Students", value: dashboard.stats.internationalStudents },
    { label: "Buddies", value: dashboard.stats.buddies },
    { label: "Active Matches", value: dashboard.stats.activeMatches },
    { label: "Pending Requests", value: dashboard.stats.pendingRequests },
    { label: "Upcoming Events", value: dashboard.stats.upcomingEvents },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Platform Overview</h1>
          <p>Monitor user growth, matching activity, and campus events from one place.</p>
        </div>

        <div className="admin-stats-grid">
          {stats.map((item) => (
            <div className="dashboard-card admin-stat-card" key={item.label}>
              <p className="admin-stat-label">{item.label}</p>
              <div className="admin-stat-value">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="admin-two-column">
          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Recent users</h3>
              <p>Newest accounts registered on the platform.</p>
            </div>

            <div className="admin-list">
              {dashboard.recentUsers.map((user) => (
                <article className="admin-list-item" key={user.id}>
                  <div>
                    <h4>{user.full_name}</h4>
                    <p>{user.email}</p>
                    <div className="admin-meta">
                      <span>{user.role}</span>
                      <span>{new Date(user.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Recent requests</h3>
              <p>Latest buddy requests created in the system.</p>
            </div>

            <div className="admin-list">
              {dashboard.recentRequests.map((request) => (
                <article className="admin-list-item" key={request.id}>
                  <div>
                    <h4>{request.student_name} {"=>"} {request.buddy_name}</h4>
                    <p>Status: {request.status}</p>
                    <div className="admin-meta">
                      <span>{new Date(request.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
