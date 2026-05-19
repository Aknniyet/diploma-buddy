import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { formatAstanaDate } from "../../utils/datetime";
import "../../styles/admin.css";

function EmptyAdminState({ text }) {
  return <div className="admin-empty-state">{text}</div>;
}

function formatStatusLabel(value) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
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
  const [activeTab, setActiveTab] = useState("unmatched");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    const result = await apiRequest("/admin/matches");
    setData(result);
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchValue, filterValue]);

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

  const tabConfig = {
    unmatched: {
      label: "Unmatched Students",
      title: "Unmatched students",
      description:
        "Students who do not have an active buddy yet. Request-pending students are waiting for a buddy response.",
      empty: "No unmatched students.",
      searchPlaceholder: "Search by student, country, city, program or language",
      filterLabel: "All statuses",
      filterOptions: [
        { value: "all", label: "All statuses" },
        { value: "waiting_for_match", label: "Waiting for match" },
        { value: "request_pending", label: "Request pending" },
      ],
    },
    buddies: {
      label: "Available Buddies",
      title: "Available buddies",
      description:
        "Only approved buddies with free capacity can be used for manual matching.",
      empty: "No approved buddies with free slots.",
      searchPlaceholder: "Search by buddy, city, program or language",
      filterLabel: "All capacity",
      filterOptions: [
        { value: "all", label: "All capacity" },
        { value: "many_slots", label: "2+ slots left" },
        { value: "one_slot", label: "1 slot left" },
      ],
    },
    requests: {
      label: "Pending Requests",
      title: "Pending buddy requests",
      description:
        "Student requests waiting for review. Approving creates a match and opens chat.",
      empty: "No pending requests.",
      searchPlaceholder: "Search by student, buddy or request message",
      filterOptions: [],
    },
    recommended: {
      label: "Recommended Matches",
      title: "Recommended matches",
      description:
        "Admin can create a match from the system recommendation without waiting for a request.",
      empty: "No recommendations right now.",
      searchPlaceholder: "Search by student, buddy or recommendation reason",
      filterOptions: [],
    },
    active: {
      label: "Active Matches",
      title: "Active matches",
      description:
        "Complete successful matches, cancel problematic ones, or reassign students to another approved buddy.",
      empty: "No active matches.",
      searchPlaceholder: "Search by student, buddy or date",
      filterOptions: [],
    },
    history: {
      label: "History",
      title: "Match history",
      description:
        "Completed and cancelled matches stay here, so admin can understand what happened before.",
      empty: "No completed or cancelled matches yet.",
      searchPlaceholder: "Search by student, buddy or status",
      filterLabel: "All history",
      filterOptions: [
        { value: "all", label: "All history" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  };

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (activeTab === "unmatched") {
      return data.unmatchedStudents.filter((student) => {
        const haystack = [
          student.name,
          student.country,
          student.city,
          student.program,
          student.languages?.join(" "),
          student.interests?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesFilter =
          filterValue === "all" || student.status === filterValue;
        return matchesQuery && matchesFilter;
      });
    }

    if (activeTab === "buddies") {
      return data.availableBuddies.filter((buddy) => {
        const haystack = [
          buddy.name,
          buddy.city,
          buddy.program,
          buddy.languages?.join(" "),
          buddy.interests?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesFilter =
          filterValue === "all" ||
          (filterValue === "many_slots" && buddy.spotsAvailable >= 2) ||
          (filterValue === "one_slot" && buddy.spotsAvailable === 1);
        return matchesQuery && matchesFilter;
      });
    }

    if (activeTab === "requests") {
      return data.pendingRequests.filter((request) => {
        const haystack = [request.studentName, request.buddyName, request.message]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !query || haystack.includes(query);
      });
    }

    if (activeTab === "recommended") {
      return data.suggestedMatches.filter((item) => {
        const haystack = [item.studentName, item.buddyName, item.reasons?.join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesFilter =
          filterValue === "all" ||
          (filterValue === "with_reasons" && item.reasons?.length);
        return matchesQuery && matchesFilter;
      });
    }

    if (activeTab === "active") {
      return data.activeMatches.filter((match) => {
        const haystack = [match.student_name, match.buddy_name, match.created_at]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const hasNotes = Number(match.note_count || 0) > 0;
        const matchesFilter =
          filterValue === "all" ||
          (filterValue === "with_notes" && hasNotes) ||
          (filterValue === "without_notes" && !hasNotes);
        return matchesQuery && matchesFilter;
      });
    }

    return data.matchHistory.filter((match) => {
      const haystack = [match.student_name, match.buddy_name, match.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter = filterValue === "all" || match.status === filterValue;
      return matchesQuery && matchesFilter;
    });
  }, [activeTab, data, filterValue, searchValue]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const currentTab = tabConfig[activeTab];

  return (
    <DashboardLayout title="Match Management" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Match Management</h1>
          <p>Review unmatched students, create recommended matches, and manage active pairings.</p>
        </div>

        {status ? <div className="admin-status">{status}</div> : null}
        {error ? <div className="admin-status admin-error">{error}</div> : null}

        <div className="dashboard-card admin-main-panel admin-combined-panel">
          <div className="admin-tabs admin-match-tabs">
            {Object.entries(tabConfig).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`admin-tab-button ${activeTab === key ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(key);
                  setFilterValue("all");
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="admin-toolbar-controls admin-toolbar-merged admin-match-toolbar">
            <div className="admin-search">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={currentTab.searchPlaceholder}
              />
            </div>

            {currentTab.filterOptions.length > 0 ? (
              <select
                className="admin-select admin-toolbar-select"
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
              >
                {currentTab.filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="admin-combined-divider" />

          <div className="admin-section-header admin-section-header-tight">
            <h3>{currentTab.title}</h3>
            <p>{currentTab.description}</p>
          </div>

          <div className="admin-list">
            {paginatedItems.length === 0 ? <EmptyAdminState text={currentTab.empty} /> : null}

            {activeTab === "unmatched" &&
              paginatedItems.map((student) => (
                <article className="admin-list-item" key={student.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{student.name}</h4>
                      <span className={`admin-status-pill ${student.status}`}>
                        {formatStatusLabel(student.status)}
                      </span>
                    </div>
                    <p>{student.country} | {student.city}</p>
                    <div className="admin-meta">
                      <span>{student.program}</span>
                      <span>{student.languages?.length ? student.languages.join(", ") : "Languages not set"}</span>
                      <span>{student.interests?.length ? student.interests.join(", ") : "Interests not set"}</span>
                      <span>Registered: {formatAstanaDate(student.registeredAt)}</span>
                    </div>
                  </div>
                </article>
              ))}

            {activeTab === "buddies" &&
              paginatedItems.map((buddy) => (
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

            {activeTab === "requests" &&
              paginatedItems.map((request) => (
                <article className="admin-list-item" key={request.id}>
                  <div className="admin-item-main">
                    <h4>{request.studentName} {"=>"} {request.buddyName}</h4>
                    <p>{request.message}</p>
                    <div className="admin-meta">
                      <span>{formatAstanaDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" className="admin-primary-btn" onClick={() => handleApproveRequest(request.id)}>
                      Approve request
                    </button>
                  </div>
                </article>
              ))}

            {activeTab === "recommended" &&
              paginatedItems.map((item) => (
                <article className="admin-list-item admin-match-item" key={item.studentId}>
                  <div className="admin-item-main">
                    <h4>{item.studentName} {"=>"} {item.buddyName}</h4>
                    <p>{item.reasons?.length ? item.reasons.join(" | ") : "Available buddy with open capacity."}</p>
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

            {activeTab === "active" &&
              paginatedItems.map((match) => {
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
                        <span>Created: {formatAstanaDate(match.created_at)}</span>
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

            {activeTab === "history" &&
              paginatedItems.map((match) => (
                <article className="admin-list-item" key={match.id}>
                  <div className="admin-item-main">
                    <div className="admin-item-title-row">
                      <h4>{match.student_name} {"=>"} {match.buddy_name}</h4>
                      <span className={`admin-status-pill ${match.status}`}>
                        {formatStatusLabel(match.status)}
                      </span>
                    </div>
                    <p>
                      This pair is no longer active. If it was cancelled, the student can be matched with another buddy.
                    </p>
                    <div className="admin-meta">
                      <span>Created: {formatAstanaDate(match.created_at)}</span>
                      <span>Notes: {match.note_count}</span>
                    </div>
                  </div>
                </article>
              ))}
          </div>

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
      </section>
    </DashboardLayout>
  );
}

export default AdminMatchesPage;
