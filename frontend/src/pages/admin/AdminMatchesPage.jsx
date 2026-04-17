import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/admin.css";

function EmptyAdminState({ text }) {
  return <div className="admin-empty-state">{text}</div>;
}

function AdminMatchesPage() {
  const [data, setData] = useState({
    pendingRequests: [],
    activeMatches: [],
    matchHistory: [],
    unmatchedStudents: [],
    suggestedMatches: [],
    availableBuddies: [],
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [noteByMatch, setNoteByMatch] = useState({});
  const [reassignBuddyByMatch, setReassignBuddyByMatch] = useState({});
  const [suggestionNoteByStudent, setSuggestionNoteByStudent] = useState({});

  const loadData = async () => {
    const result = await apiRequest("/admin/matches");
    setData(result);
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  const runAction = async (action, successMessage) => {
    try {
      setError("");
      await action();
      setStatus(successMessage);
      await loadData();
    } catch (actionError) {
      setError(actionError.message || "Admin action failed.");
    }
  };

  const handleApproveRequest = async (requestId) => {
    await runAction(
      () => apiRequest(`/admin/requests/${requestId}/approve`, { method: "POST" }),
      "Request approved and match created."
    );
  };

  const handleCreateSuggestedMatch = async (item) => {
    await runAction(
      () =>
        apiRequest("/admin/matches/manual", {
          method: "POST",
          body: JSON.stringify({
            studentId: item.studentId,
            buddyId: item.buddyId,
            note: suggestionNoteByStudent[item.studentId] || "Created from system recommendation.",
          }),
        }),
      "Recommended match created."
    );
    setSuggestionNoteByStudent((prev) => ({ ...prev, [item.studentId]: "" }));
  };

  const handleMatchStatus = async (matchId, newStatus) => {
    await runAction(
      () =>
        apiRequest(`/admin/matches/${matchId}/status`, {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
            note: noteByMatch[matchId] || "",
          }),
        }),
      newStatus === "completed" ? "Match completed." : "Match cancelled."
    );
    setNoteByMatch((prev) => ({ ...prev, [matchId]: "" }));
  };

  const handleReassign = async (matchId) => {
    const newBuddyId = reassignBuddyByMatch[matchId];
    if (!newBuddyId) return;

    await runAction(
      () =>
        apiRequest(`/admin/matches/${matchId}/reassign`, {
          method: "PATCH",
          body: JSON.stringify({
            newBuddyId: Number(newBuddyId),
            note: noteByMatch[matchId] || "Reassigned by admin.",
          }),
        }),
      "Buddy reassigned successfully."
    );
    setNoteByMatch((prev) => ({ ...prev, [matchId]: "" }));
    setReassignBuddyByMatch((prev) => ({ ...prev, [matchId]: "" }));
  };

  return (
    <DashboardLayout title="Match Management" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Match Management</h1>
          <p>Review unmatched students, create recommended matches, and manage active pairings.</p>
        </div>

        {status ? <div className="admin-status">{status}</div> : null}
        {error ? <div className="admin-status admin-error">{error}</div> : null}

        <div className="admin-three-stack">
          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Unmatched students</h3>
              <p>Students who do not have an active buddy yet. Request-pending students are waiting for a buddy response.</p>
            </div>

            <div className="admin-list">
              {data.unmatchedStudents.length === 0 ? <EmptyAdminState text="No unmatched students." /> : null}
              {data.unmatchedStudents.map((student) => (
                <article className="admin-list-item" key={student.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{student.name}</h4>
                      <span className={`admin-status-pill ${student.status}`}>{student.status}</span>
                    </div>
                    <p>{student.country} | {student.city}</p>
                    <div className="admin-meta">
                      <span>{student.program}</span>
                      <span>{student.languages?.length ? student.languages.join(", ") : "Languages not set"}</span>
                      <span>{student.interests?.length ? student.interests.join(", ") : "Interests not set"}</span>
                      <span>Registered: {new Date(student.registeredAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Available buddies</h3>
              <p>Only approved buddies with free capacity can be used for manual matching.</p>
            </div>

            <div className="admin-list">
              {data.availableBuddies.length === 0 ? <EmptyAdminState text="No approved buddies with free slots." /> : null}
              {data.availableBuddies.map((buddy) => (
                <article className="admin-list-item" key={buddy.id}>
                  <div className="admin-item-main">
                    <h4>{buddy.name}</h4>
                    <p>{buddy.city} | {buddy.program}</p>
                    <div className="admin-meta">
                      <span>{buddy.activeStudents}/{buddy.maxBuddies} active</span>
                      <span>{buddy.spotsAvailable} slots left</span>
                      <span>{buddy.languages?.length ? buddy.languages.join(", ") : "Languages not set"}</span>
                      <span>{buddy.interests?.length ? buddy.interests.join(", ") : "Interests not set"}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Pending buddy requests</h3>
              <p>Student requests waiting for review. Approving creates a match and opens chat.</p>
            </div>

            <div className="admin-list">
              {data.pendingRequests.length === 0 ? <EmptyAdminState text="No pending requests." /> : null}
              {data.pendingRequests.map((request) => (
                <article className="admin-list-item" key={request.id}>
                  <div className="admin-item-main">
                    <h4>{request.studentName} {"=>"} {request.buddyName}</h4>
                    <p>{request.message}</p>
                    <div className="admin-meta">
                      <span>Score: {request.score}</span>
                      <span>{new Date(request.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" className="admin-primary-btn" onClick={() => handleApproveRequest(request.id)}>
                      Approve request
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Recommended matches</h3>
              <p>Admin can create a match from the system recommendation without waiting for a request.</p>
            </div>

            <div className="admin-list">
              {data.suggestedMatches.length === 0 ? <EmptyAdminState text="No recommendations right now." /> : null}
              {data.suggestedMatches.map((item) => (
                <article className="admin-list-item admin-match-item" key={item.studentId}>
                  <div className="admin-item-main">
                    <h4>{item.studentName} {"=>"} {item.buddyName}</h4>
                    <p>{item.reasons?.length ? item.reasons.join(" | ") : "Recommended by compatibility score."}</p>
                    <div className="admin-meta">
                      <span>Score: {item.score}</span>
                    </div>
                  </div>

                  <div className="admin-action-panel">
                    <textarea
                      className="admin-note-input compact"
                      rows={2}
                      placeholder="Internal note for this recommendation..."
                      value={suggestionNoteByStudent[item.studentId] || ""}
                      onChange={(event) =>
                        setSuggestionNoteByStudent((prev) => ({ ...prev, [item.studentId]: event.target.value }))
                      }
                    />
                    <button type="button" className="admin-primary-btn" onClick={() => handleCreateSuggestedMatch(item)}>
                      Create match
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Active matches</h3>
              <p>Complete successful matches, cancel problematic ones, or reassign students to another approved buddy.</p>
            </div>

            <div className="admin-list">
              {data.activeMatches.length === 0 ? <EmptyAdminState text="No active matches." /> : null}
              {data.activeMatches.map((match) => {
                const note = noteByMatch[match.id] || "";
                const noteMissing = !note.trim();
                const reassignOptions = data.availableBuddies.filter(
                  (buddy) => buddy.id !== match.buddy_id && buddy.spotsAvailable > 0
                );

                return (
                  <article className="admin-list-item admin-match-item" key={match.id}>
                    <div className="admin-item-main">
                      <h4>{match.student_name} {"=>"} {match.buddy_name}</h4>
                      <p>Active pairing. Chat is available while this match stays active.</p>
                      <div className="admin-meta">
                        <span>Created: {new Date(match.created_at).toLocaleDateString("en-GB")}</span>
                        <span>Notes: {match.note_count}</span>
                      </div>
                    </div>

                    <div className="admin-action-panel wide">
                      <textarea
                        className="admin-note-input"
                        rows={3}
                        placeholder="Required reason for complete/cancel, optional for reassign..."
                        value={note}
                        onChange={(event) =>
                          setNoteByMatch((prev) => ({ ...prev, [match.id]: event.target.value }))
                        }
                      />

                      <div className="admin-inline-actions">
                        <select
                          className="admin-select"
                          value={reassignBuddyByMatch[match.id] || ""}
                          onChange={(event) =>
                            setReassignBuddyByMatch((prev) => ({ ...prev, [match.id]: event.target.value }))
                          }
                        >
                          <option value="">Choose new buddy</option>
                          {reassignOptions.map((buddy) => (
                            <option key={buddy.id} value={buddy.id}>
                              {buddy.name} ({buddy.spotsAvailable} spots left)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="admin-secondary-btn"
                          disabled={!reassignBuddyByMatch[match.id]}
                          onClick={() => handleReassign(match.id)}
                        >
                          Reassign
                        </button>
                        <button
                          type="button"
                          className="admin-secondary-btn"
                          disabled={noteMissing}
                          onClick={() => handleMatchStatus(match.id, "completed")}
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          className="admin-danger-btn"
                          disabled={noteMissing}
                          onClick={() => handleMatchStatus(match.id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>Match history</h3>
              <p>Completed and cancelled matches stay here, so admin can understand what happened before.</p>
            </div>

            <div className="admin-list">
              {data.matchHistory.length === 0 ? <EmptyAdminState text="No completed or cancelled matches yet." /> : null}
              {data.matchHistory.map((match) => (
                <article className="admin-list-item" key={match.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{match.student_name} {"=>"} {match.buddy_name}</h4>
                      <span className={`admin-status-pill ${match.status}`}>{match.status}</span>
                    </div>
                    <p>
                      This pair is no longer active. If it was cancelled, the student can be matched with another buddy.
                    </p>
                    <div className="admin-meta">
                      <span>Created: {new Date(match.created_at).toLocaleDateString("en-GB")}</span>
                      <span>Notes: {match.note_count}</span>
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

export default AdminMatchesPage;
