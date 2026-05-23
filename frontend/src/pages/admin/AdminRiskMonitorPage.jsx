import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { formatAstanaRelativeDateLabel } from "../../utils/datetime";
import "../../styles/admin.css";

function riskRank(level) {
  if (level === "high") return 0;
  if (level === "medium") return 1;
  return 2;
}

function AdminRiskMonitorPage() {
  const [dashboard, setDashboard] = useState({
    adaptationInsights: [],
    stats: {
      highRiskStudents: 0,
      overdueTasks: 0,
      highPriorityIncomplete: 0,
    },
  });
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  useEffect(() => {
    apiRequest("/admin/dashboard").then(setDashboard).catch(() => null);
  }, []);

  const filteredInsights = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return (dashboard.adaptationInsights || [])
      .filter((student) => {
        const haystack = [
          student.full_name,
          student.email,
          student.risk?.label,
          student.risk?.reasons?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesRisk = riskFilter === "all" || student.risk?.level === riskFilter;
        return matchesQuery && matchesRisk;
      })
      .sort((first, second) => {
        const riskDiff = riskRank(first.risk?.level) - riskRank(second.risk?.level);
        if (riskDiff !== 0) return riskDiff;
        return (second.risk?.score || 0) - (first.risk?.score || 0);
      });
  }, [dashboard.adaptationInsights, riskFilter, searchValue]);

  return (
    <DashboardLayout title="Risk Monitor" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Adaptation Risk Monitor</h1>
          <p>See which students may need support first based on checklist, buddy matching, activity, and engagement.</p>
        </div>

        <div className="admin-stats-grid compact-grid">
          <div className="dashboard-card admin-stat-card">
            <p className="admin-stat-label">High Risk Students</p>
            <div className="admin-stat-value">{dashboard.stats.highRiskStudents || 0}</div>
          </div>
          <div className="dashboard-card admin-stat-card">
            <p className="admin-stat-label">Overdue Tasks</p>
            <div className="admin-stat-value">{dashboard.stats.overdueTasks || 0}</div>
          </div>
          <div className="dashboard-card admin-stat-card">
            <p className="admin-stat-label">High Priority Open</p>
            <div className="admin-stat-value">{dashboard.stats.highPriorityIncomplete || 0}</div>
          </div>
        </div>

        <div className="dashboard-card admin-main-panel admin-combined-panel">
          <div className="admin-toolbar-controls admin-toolbar-merged">
            <div className="admin-search">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search students, emails, or risk reasons"
              />
            </div>

            <select
              className="admin-select admin-toolbar-select"
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
            >
              <option value="all">All risk levels</option>
              <option value="high">High risk</option>
              <option value="medium">Medium risk</option>
              <option value="low">Low risk</option>
            </select>
          </div>

          <div className="admin-combined-divider" />

          <div className="admin-section-header admin-section-header-tight">
            <h3>Students Needing Attention</h3>
            <p>The list is automatically ranked by risk level first and score second.</p>
          </div>

          <div className="admin-list">
            {filteredInsights.length === 0 ? (
              <div className="admin-empty-state">No students match the current risk filter.</div>
            ) : (
              filteredInsights.map((student) => (
                <article className="admin-list-item" key={student.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{student.full_name}</h4>
                      <span className={`admin-status-pill risk-${student.risk.level}`}>
                        {student.risk.label} risk
                      </span>
                      <span className="admin-status-pill">Score {student.risk.score}</span>
                    </div>
                    <p>{student.email}</p>
                    <div className="admin-meta">
                      <span>Checklist {student.checklistProgress}%</span>
                      <span>{student.overdueTasks} overdue</span>
                      <span>{student.highPriorityIncomplete} high priority open</span>
                      <span>{student.hasBuddyMatch ? "Buddy matched" : "No buddy yet"}</span>
                      <span>{student.hasBuddyRequest ? "Request sent" : "No request sent"}</span>
                      <span>
                        Last active{" "}
                        {student.last_active_at
                          ? formatAstanaRelativeDateLabel(student.last_active_at)
                          : "Not tracked yet"}
                      </span>
                    </div>
                    {student.risk.reasons?.length ? (
                      <div className="admin-match-reasons preview">
                        {student.risk.reasons.map((reason) => (
                          <span key={reason} className="admin-match-reason-pill compact">
                            {reason}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminRiskMonitorPage;
