import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RequestsTabs from "../../components/buddy-requests/RequestsTabs";
import RequestCard from "../../components/buddy-requests/RequestCard";
import PastRequestsEmptyState from "../../components/buddy-requests/PastRequestsEmptyState";
import { apiRequest } from "../../lib/api";
import "../../styles/buddy-requests.css";

function BuddyRequestsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pastRequests, setPastRequests] = useState([]);

  const loadRequests = async () => {
    const data = await apiRequest("/buddy/requests/incoming");
    setPendingRequests(data.pending || []);
    setPastRequests(data.past || []);
  };

  useEffect(() => {
    loadRequests().catch(() => null);
  }, []);

  const handleRespond = async (requestId, action) => {
    await apiRequest(`/buddy/requests/${requestId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    await loadRequests();
    setActiveTab("past");
  };

  return (
    <DashboardLayout title="Requests" sidebarType="buddy">
      <section className="buddy-requests-page">
        <div className="buddy-requests-header">
          <h1>Buddy Requests</h1>
          <p>Review and respond to connection requests from international students.</p>
        </div>

        <RequestsTabs activeTab={activeTab} onChangeTab={setActiveTab} pendingCount={pendingRequests.length} />

        {activeTab === "pending" ? (
          pendingRequests.length > 0 ? (
            <div className="buddy-requests-list">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} onAccept={() => handleRespond(request.id, "accept")} onDecline={() => handleRespond(request.id, "decline")} />
              ))}
            </div>
          ) : (
            <div className="buddy-past-empty-card"><div className="buddy-past-empty-content"><h3>No pending requests</h3><p>New buddy requests will appear here.</p></div></div>
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
