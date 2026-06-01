import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RequestsTabs from "../../components/buddy-requests/RequestsTabs";
import RequestCard from "../../components/buddy-requests/RequestCard";
import PastRequestsEmptyState from "../../components/buddy-requests/PastRequestsEmptyState";
import { apiRequest } from "../../lib/api";
import { REALTIME_WINDOW_EVENT } from "../../lib/realtime";
import "../../styles/buddy-requests.css";

function BuddyRequestsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pastRequests, setPastRequests] = useState([]);
  const [respondingRequestId, setRespondingRequestId] = useState(null);
  const [respondingAction, setRespondingAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("/buddy/requests/incoming");
      setPendingRequests(data.pending || []);
      setPastRequests(data.past || []);
      setError("");
    } catch (requestError) {
      setPendingRequests([]);
      setPastRequests([]);
      setError(requestError.message || "Could not load student requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests().catch(() => null);
  }, []);

  useEffect(() => {
    const handleRealtimeEvent = (event) => {
      const detail = event.detail || {};
      const realtimeType = detail.type;
      const notificationType = detail.payload?.notification?.type;

      if (
        realtimeType === "buddy_request.created" ||
        realtimeType === "buddy_request.updated" ||
        realtimeType === "match.updated" ||
        (realtimeType === "notification.created" &&
          ["request_received", "match_created", "match_reassigned"].includes(notificationType))
      ) {
        loadRequests().catch(() => null);
      }
    };

    window.addEventListener(REALTIME_WINDOW_EVENT, handleRealtimeEvent);
    return () => window.removeEventListener(REALTIME_WINDOW_EVENT, handleRealtimeEvent);
  }, []);

  const handleRespond = async (requestId, action) => {
    try {
      setRespondingRequestId(requestId);
      setRespondingAction(action);
      setError("");
      await apiRequest(`/buddy/requests/${requestId}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await loadRequests();
      setActiveTab("past");
    } catch (requestError) {
      setError(requestError.message || "Could not update this request.");
    } finally {
      setRespondingRequestId(null);
      setRespondingAction("");
    }
  };

  return (
    <DashboardLayout title="Student Requests" sidebarType="buddy">
      <section className="buddy-requests-page">
        <div className="buddy-requests-header">
          <h1>Student Requests</h1>
          <p>Review and respond to connection requests from international students.</p>
        </div>

        <RequestsTabs activeTab={activeTab} onChangeTab={setActiveTab} pendingCount={pendingRequests.length} />

        {error ? <div className="buddy-requests-status error">{error}</div> : null}

        {isLoading ? (
          <div className="buddy-past-empty-card">
            <div className="buddy-past-empty-content">
              <h3>Loading student requests</h3>
              <p>Please wait while we load the latest connection requests.</p>
            </div>
          </div>
        ) : activeTab === "pending" ? (
          pendingRequests.length > 0 ? (
            <div className="buddy-requests-list">
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isResponding={respondingRequestId === request.id}
                  respondingAction={respondingAction}
                  onAccept={() => handleRespond(request.id, "accept")}
                  onDecline={() => handleRespond(request.id, "decline")}
              />
            ))}
          </div>
          ) : (
            <div className="buddy-past-empty-card"><div className="buddy-past-empty-content"><h3>No pending requests</h3><p>New student requests will appear here when students contact you.</p></div></div>
          )
        ) : pastRequests.length > 0 ? (
          <div className="buddy-requests-list">
            {pastRequests.map((request) => <RequestCard key={request.id} request={request} isPast={true} />)}
          </div>
        ) : (
          <PastRequestsEmptyState />
        )}
      </section>
    </DashboardLayout>
  );
}

export default BuddyRequestsPage;
