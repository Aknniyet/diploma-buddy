import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { formatAstanaDate } from "../../utils/datetime";
import "../../styles/admin.css";

function getRoleLabel(role) {
  if (role === "international") return "International";
  if (role === "local") return "Buddy";
  return "Admin";
}

const initialDashboard = {
  stats: {
    totalUsers: 0,
    internationalStudents: 0,
    buddies: 0,
    activeMatches: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
  },
  recentUsers: [],
  analytics: {},
};

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    apiRequest("/admin/dashboard")
      .then((data) =>
        setDashboard({
          ...initialDashboard,
          ...data,
          stats: {
            ...initialDashboard.stats,
            ...(data?.stats || {}),
          },
          recentUsers: Array.isArray(data?.recentUsers) ? data.recentUsers : [],
        })
      )
      .catch(() => null);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, roleFilter]);

  const stats = [
    { label: "Total Users", value: dashboard.stats.totalUsers },
    { label: "International Students", value: dashboard.stats.internationalStudents },
    { label: "Buddies", value: dashboard.stats.buddies },
    { label: "Active Matches", value: dashboard.stats.activeMatches },
    { label: "Pending Requests", value: dashboard.stats.pendingRequests },
    { label: "Upcoming Events", value: dashboard.stats.upcomingEvents },
  ];

  const filteredUsers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return (dashboard.recentUsers || []).filter((user) => {
      const matchesQuery =
        !query ||
        [user.full_name, user.email, getRoleLabel(user.role)]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [dashboard.recentUsers, roleFilter, searchValue]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredUsers.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  return (
    <DashboardLayout title="Admin Dashboard" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Platform Overview</h1>
          <p>Watch adaptation progress, checklist pressure, and students who may need extra support.</p>
        </div>

        <div className="admin-stats-grid admin-stats-grid-wide">
          {stats.map((item) => (
            <div className="dashboard-card admin-stat-card" key={item.label}>
              <p className="admin-stat-label">{item.label}</p>
              <div className="admin-stat-value">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-card admin-main-panel admin-combined-panel">
          <div className="admin-toolbar-controls admin-toolbar-merged">
            <div className="admin-search">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by name, email or role"
              />
            </div>

            <select
              className="admin-select admin-toolbar-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              <option value="international">International</option>
              <option value="local">Buddy</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="admin-combined-divider" />

          <div className="admin-content-layout single-column">
            <div className="admin-section-header admin-section-header-tight">
              <h3>Recent Users</h3>
              <p>Quick visibility into new accounts and recent activity.</p>
            </div>

            {paginatedItems.length === 0 ? (
              <div className="admin-empty-state">No items match your search or filters.</div>
            ) : (
              <div className="admin-table">
                <div className="admin-table-head admin-table-head-compact">
                  <span>Name</span>
                  <span>Role</span>
                  <span>Date</span>
                </div>

                {paginatedItems.map((user) => (
                  <article className="admin-table-row" key={user.id}>
                    <div className="admin-table-primary">
                      <h4>{user.full_name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <span className="admin-table-text">{getRoleLabel(user.role)}</span>
                    <span className="admin-table-text">
                      {formatAstanaDate(user.created_at)}
                    </span>
                  </article>
                ))}
              </div>
            )}

            <div className="admin-pagination">
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`admin-page-btn ${safePage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
