import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/local-dashboard.css";
import { formatAstanaShortDateTime } from "../../utils/datetime";

function BuddyOverviewPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    activeStudents: 0,
    pendingRequests: 0,
    unreadMessages: 0,
    maxStudents: 3,
    buddyStatus: "not_applied",
    upcomingEvents: [],
  });

  useEffect(() => {
    setIsLoading(true);
    apiRequest("/dashboard/buddy")
      .then(setDashboard)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout title="Overview" sidebarType="buddy">
      <section className="local-overview-page">
        <div className="local-overview-header">
          <h1>Welcome, {user?.full_name?.split(" ")[0] || "Buddy"}!</h1>
          <p>Thank you for helping international students adapt.</p>
        </div>

        {isLoading ? (
          <div className="dashboard-card local-overview-panel">
            <h3 className="card-title">Loading overview</h3>
            <p className="card-subtitle">Please wait while we load your latest activity.</p>
          </div>
        ) : null}

        {dashboard.buddyStatus && dashboard.buddyStatus !== "approved" ? (
          <div className="local-review-alert">
            Your buddy profile status is <strong>{dashboard.buddyStatus}</strong>. You can edit
            your profile, but you will appear in matching only after admin approval.
          </div>
        ) : null}

        {!isLoading ? <div className="local-overview-cards">
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Active Students</h3>
            <div className="local-stat-value">{dashboard.activeStudents}</div>
            <p className="local-stat-subtitle">of {dashboard.maxStudents} max students</p>
          </div>
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Pending Requests</h3>
            <div className="local-stat-value">{dashboard.pendingRequests}</div>
            <p className="local-stat-subtitle">students waiting for your response</p>
          </div>
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Unread Messages</h3>
            <div className="local-stat-value">{dashboard.unreadMessages}</div>
            <p className="local-stat-subtitle">messages waiting for you</p>
          </div>
        </div> : null}

        {!isLoading ? <div className="local-overview-bottom-grid">
          <div className="dashboard-card local-overview-panel local-events-card">
            <h3 className="card-title">Upcoming Events</h3>
            {dashboard.buddyStatus !== "approved" ? (
              <p className="card-subtitle">Upcoming events will appear after admin approval.</p>
            ) : dashboard.upcomingEvents.length > 0 ? (
              <div className="recent-messages-list">
                {dashboard.upcomingEvents.map((event) => (
                  <div key={event.id} className="local-event-item">
                    <div className="local-event-icon">
                      <CalendarDays size={18} />
                    </div>
                    <div className="recent-message-content">
                      <h4>{event.title}</h4>
                      <p>
                        {formatAstanaShortDateTime(event.event_date)}
                        {" · "}
                        {event.location || "Location TBD"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-subtitle">No upcoming events are available right now.</p>
            )}
          </div>
        </div> : null}
      </section>
    </DashboardLayout>
  );
}

export default BuddyOverviewPage;
