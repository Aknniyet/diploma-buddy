import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import NextStepsCard from "../../components/dashboard/NextStepsCard";

function StudentOverviewPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    progress: 0,
    pendingRequests: 0,
    unreadMessages: 0,
    buddy: null,
    nextSteps: [],
  });

  useEffect(() => {
    apiRequest("/dashboard/student").then(setDashboard).catch(() => null);
  }, []);

  return (
    <DashboardLayout title="Overview">
      <section className="overview-page">
        <div className="overview-welcome">
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Student"}!</h1>
          <p>Here is a real overview of your adaptation journey.</p>
        </div>

        <div className="overview-cards">
          <div className="dashboard-card">
            <h3 className="card-title">Profile Progress</h3>
            <div className="progress-value">{dashboard.progress}%</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${dashboard.progress}%` }}
              />
            </div>
            <p className="card-subtitle">
              Complete your profile and checklist to improve matching.
            </p>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Your Buddy</h3>
            {dashboard.buddy ? (
              <div className="buddy-info">
                <img
                  src={dashboard.buddy.avatar}
                  alt={dashboard.buddy.name}
                  className="buddy-avatar"
                />
                <div>
                  <h4>{dashboard.buddy.name}</h4>
                  <p>{dashboard.buddy.department}</p>
                </div>
              </div>
            ) : (
              <p className="card-subtitle">No active buddy yet.</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Unread Messages</h3>
            <div className="message-count">{dashboard.unreadMessages}</div>
            <p className="card-subtitle">
              Pending requests: {dashboard.pendingRequests}
            </p>
          </div>
        </div>

        <div className="overview-bottom-grid">
          <NextStepsCard steps={dashboard.nextSteps} />
          <div className="dashboard-card">
            <h3 className="card-title">Current Status</h3>
            <p className="card-subtitle">
              {dashboard.buddy
                ? "You already have an active buddy and can message them now."
                : "You do not have an active buddy yet. Open Find Buddies to send a request."}
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default StudentOverviewPage;