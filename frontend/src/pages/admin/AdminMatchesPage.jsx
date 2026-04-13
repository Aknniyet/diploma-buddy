import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/admin.css";

function AdminMatchesPage() {
  const [data, setData] = useState({
    pendingRequests: [],
    activeMatches: [],
    suggestedMatches: [],
    buddyProfiles: [],
    availableBuddies: [],
  });
  const [status, setStatus] = useState("");
  const [noteByMatch, setNoteByMatch] = useState({});
  const [reassignBuddyByMatch, setReassignBuddyByMatch] = useState({});

  const loadData = async () => {
    const result = await apiRequest("/admin/matches");
    setData(result);
  };

  useEffect(() => {
    loadData().catch(() => null);
  }, []);

  const handleApproveRequest = async (requestId) => {
    await apiRequest(`/admin/requests/${requestId}/approve`, { method: "POST" });
    setStatus("Request approved and match created.");
    await loadData();
  };

  const handleBuddyStatus = async (buddyId, buddyStatus) => {
    await apiRequest(`/admin/buddies/${buddyId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ buddyStatus }),
    });
    setStatus("Buddy profile updated.");
    await loadData();
  };

  const handleMatchStatus = async (matchId, newStatus) => {
    await apiRequest(`/admin/matches/${matchId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
        note: noteByMatch[matchId] || "",
      }),
    });
    setStatus(`Match marked as ${newStatus}.`);
    setNoteByMatch((prev) => ({ ...prev, [matchId]: "" }));
    await loadData();
  };

  const handleReassign = async (matchId) => {
    const newBuddyId = reassignBuddyByMatch[matchId];
    if (!newBuddyId) return;

    await apiRequest(`/admin/matches/${matchId}/reassign`, {
      method: "PATCH",
      body: JSON.stringify({
        newBuddyId: Number(newBuddyId),
        note: noteByMatch[matchId] || "",
      }),
    });
    setStatus("Buddy reassigned successfully.");
    setNoteByMatch((prev) => ({ ...prev, [matchId]: "" }));
    await loadData();
  };

  return (
    <DashboardLayout title="Match Management" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Match Management</h1>
          <p>Approve requests, review suggested matches, reassign buddies, and manage match lifecycle.</p>
        </div>

        {status ? <div className="admin-status">{status}</div> : null}

        <div className="admin-three-stack">
          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Pending buddy requests</h3>
              <p>Admin can approve requests directly when a good pair is already waiting.</p>
            </div>

            <div className="admin-list">
              {data.pendingRequests.map((request) => (
                <article className="admin-list-item" key={request.id}>
                  <div>
                    <h4>{request.studentName} {"=>"} {request.buddyName}</h4>
                    <p>{request.message}</p>
                    <div className="admin-meta">
                      <span>Score: {request.score}</span>
                      <span>{new Date(request.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" className="admin-primary-btn" onClick={() => handleApproveRequest(request.id)}>
                      Approve
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Recommended matches</h3>
              <p>System suggestions for students who still do not have an active buddy.</p>
            </div>

            <div className="admin-list">
              {data.suggestedMatches.map((item) => (
                <article className="admin-list-item" key={item.studentId}>
                  <div>
                    <h4>{item.studentName} {"=>"} {item.buddyName}</h4>
                    <p>{item.reasons?.length ? item.reasons.join(" • ") : "Recommended by system score."}</p>
                    <div className="admin-meta">
                      <span>Score: {item.score}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Active matches</h3>
              <p>Reassign, complete, or cancel matches and leave internal admin notes.</p>
            </div>

            <div className="admin-list">
              {data.activeMatches.map((match) => (
                <article className="admin-list-item admin-match-item" key={match.id}>
                  <div>
                    <h4>{match.student_name} {"=>"} {match.buddy_name}</h4>
                    <p>Current status: {match.status}</p>
                    <div className="admin-meta">
                      <span>Created: {new Date(match.created_at).toLocaleDateString("en-GB")}</span>
                      <span>Notes: {match.note_count}</span>
                    </div>
                  </div>

                  <div className="admin-match-controls">
                    <textarea
                      className="admin-note-input"
                      rows={3}
                      placeholder="Add internal comment about this match..."
                      value={noteByMatch[match.id] || ""}
                      onChange={(e) =>
                        setNoteByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))
                      }
                    />

                    <div className="admin-inline-actions">
                      <select
                        className="admin-select"
                        value={reassignBuddyByMatch[match.id] || ""}
                        onChange={(e) =>
                          setReassignBuddyByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))
                        }
                      >
                        <option value="">Choose new buddy</option>
                        {data.availableBuddies.map((buddy) => (
                          <option key={buddy.id} value={buddy.id}>
                            {buddy.name} ({buddy.spotsAvailable} spots left)
                          </option>
                        ))}
                      </select>
                      <button type="button" className="admin-secondary-btn" onClick={() => handleReassign(match.id)}>
                        Reassign
                      </button>
                      <button type="button" className="admin-secondary-btn" onClick={() => handleMatchStatus(match.id, "completed")}>
                        Complete
                      </button>
                      <button type="button" className="admin-danger-btn" onClick={() => handleMatchStatus(match.id, "cancelled")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Buddy profiles</h3>
              <p>Admin can approve or reject buddy participation manually.</p>
            </div>

            <div className="admin-list">
              {data.buddyProfiles.map((buddy) => (
                <article className="admin-list-item" key={buddy.id}>
                  <div>
                    <h4>{buddy.full_name}</h4>
                    <p>{buddy.email}</p>
                    <div className="admin-meta">
                      <span>{buddy.city || "Kazakhstan"}</span>
                      <span>{buddy.study_program || "Program not set"}</span>
                      <span>Status: {buddy.buddy_status}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" className="admin-primary-btn" onClick={() => handleBuddyStatus(buddy.id, "approved")}>
                      Approve
                    </button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleBuddyStatus(buddy.id, "rejected")}>
                      Reject
                    </button>
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

export default AdminMatchesPage;
