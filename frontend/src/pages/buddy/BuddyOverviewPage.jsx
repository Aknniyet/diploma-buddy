import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/local-dashboard.css";

function BuddyOverviewPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({ activeStudents: 0, pendingRequests: 0, unreadMessages: 0, maxStudents: 3 });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiRequest("/dashboard/buddy").then(setDashboard).catch(() => null);
    apiRequest("/events")
      .then((data) => setEvents((Array.isArray(data) ? data : []).slice(0, 2)))
      .catch(() => null);
  }, []);

  return (
    <DashboardLayout title="Overview" sidebarType="buddy">
      <section className="local-overview-page">
        <div className="local-overview-header">
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Buddy"}!</h1>
          <p>Thank you for helping international students adapt.</p>
        </div>

        <div className="local-overview-cards">
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Active Students</h3>
            <div className="local-stat-value">{dashboard.activeStudents}</div>
            <p className="local-stat-subtitle">of {dashboard.maxStudents} max students</p>
          </div>
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Pending Requests</h3>
            <div className="local-stat-value">{dashboard.pendingRequests}</div>
            <p className="local-stat-subtitle">students waiting for your answer</p>
          </div>
          <div className="dashboard-card local-stat-card">
            <h3 className="card-title">Unread Messages</h3>
            <div className="local-stat-value">{dashboard.unreadMessages}</div>
            <p className="local-stat-subtitle">messages waiting for you</p>
          </div>
        </div>

        <div className="local-overview-bottom-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Capacity</h3>
            <p className="card-subtitle">You can support up to 3 active students at the same time.</p>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Action</h3>
            <p className="card-subtitle">Open Buddy Requests to accept or decline incoming requests.</p>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Upcoming Events</h3>
            {events.length > 0 ? (
              <div className="recent-messages-list">
                {events.map((event) => (
                  <div key={event.id} className="recent-message-content">
                    <h4>{event.title}</h4>
                    <p>
                      {new Date(event.event_date).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {event.location || "Location TBD"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-subtitle">No upcoming events yet.</p>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default BuddyOverviewPage;
