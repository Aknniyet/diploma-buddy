import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/admin.css";

const statusLabel = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  not_applied: "Not applied",
};

function AdminBuddyProfilesPage() {
  const [buddies, setBuddies] = useState([]);
  const [reasonById, setReasonById] = useState({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const loadBuddies = async () => {
    const result = await apiRequest("/admin/matches");
    setBuddies(result.buddyProfiles || []);
  };

  useEffect(() => {
    loadBuddies().catch((loadError) => setError(loadError.message));
  }, []);

  const handleBuddyStatus = async (buddy, buddyStatus) => {
    try {
      setError("");
      const reason = reasonById[buddy.id] || "";

      await apiRequest(`/admin/buddies/${buddy.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ buddyStatus, reason }),
      });

      setStatus(buddyStatus === "approved" ? "Buddy profile approved." : `Buddy profile marked as ${buddyStatus}.`);
      setReasonById((prev) => ({ ...prev, [buddy.id]: "" }));
      await loadBuddies();
    } catch (actionError) {
      setError(actionError.message || "Could not update buddy profile.");
    }
  };

  return (
    <DashboardLayout title="Buddy Profiles" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Buddy Profiles</h1>
          <p>Review buddy applications, approve trusted buddies, or temporarily remove them from matching.</p>
        </div>

        {status ? <div className="admin-status">{status}</div> : null}
        {error ? <div className="admin-status admin-error">{error}</div> : null}

        <div className="dashboard-card admin-list-card">
          <div className="admin-section-header">
            <h3>Buddy applications</h3>
            <p>Only approved buddies with free capacity appear in Find Buddies and Match Management.</p>
          </div>

          <div className="admin-list">
            {buddies.length === 0 ? <div className="admin-empty-state">No buddy profiles yet.</div> : null}
            {buddies.map((buddy) => {
              const isApproved = buddy.buddy_status === "approved";
              const isRejected = buddy.buddy_status === "rejected";
              const isSuspended = buddy.buddy_status === "suspended";
              const activeStudents = Number(buddy.active_students_count || 0);
              const maxBuddies = Number(buddy.max_buddies || 3);
              const cannotDisable = activeStudents > 0;
              const reason = reasonById[buddy.id] || "";

              return (
                <article className="admin-list-item admin-profile-item" key={buddy.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{buddy.full_name}</h4>
                      <span className={`admin-status-pill ${buddy.buddy_status}`}>
                        {statusLabel[buddy.buddy_status] || buddy.buddy_status}
                      </span>
                    </div>
                    <p>{buddy.email}</p>
                    <div className="admin-meta">
                      <span>{buddy.city || "Kazakhstan"}</span>
                      <span>{buddy.study_program || "Program not set"}</span>
                      <span>{activeStudents}/{maxBuddies} active students</span>
                      <span>{buddy.languages?.length ? buddy.languages.join(", ") : "Languages not set"}</span>
                      <span>{buddy.hobbies?.length ? buddy.hobbies.join(", ") : "Interests not set"}</span>
                    </div>
                    <p>{buddy.about_you || "This buddy has not added a bio yet."}</p>
                    {cannotDisable ? (
                      <p className="admin-warning-text">Reassign or close active matches before rejecting or suspending this buddy.</p>
                    ) : null}
                  </div>

                  <div className="admin-action-panel">
                    <textarea
                      className="admin-note-input compact"
                      rows={2}
                      placeholder="Reason for reject/suspend, visible to buddy..."
                      value={reason}
                      onChange={(event) => setReasonById((prev) => ({ ...prev, [buddy.id]: event.target.value }))}
                    />
                    <div className="admin-inline-actions">
                      <button
                        type="button"
                        className="admin-primary-btn"
                        disabled={isApproved}
                        onClick={() => handleBuddyStatus(buddy, "approved")}
                      >
                        {isApproved ? "Approved" : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="admin-danger-btn"
                        disabled={cannotDisable || isRejected || !reason.trim()}
                        onClick={() => handleBuddyStatus(buddy, "rejected")}
                      >
                        {isRejected ? "Rejected" : "Reject"}
                      </button>
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        disabled={cannotDisable || isSuspended || !reason.trim()}
                        onClick={() => handleBuddyStatus(buddy, "suspended")}
                      >
                        {isSuspended ? "Suspended" : "Suspend"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminBuddyProfilesPage;
