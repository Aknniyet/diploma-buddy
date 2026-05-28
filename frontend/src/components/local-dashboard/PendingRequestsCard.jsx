import { Link } from "react-router-dom";
import { localPendingRequests } from "../../constants/localDashboardData";

function PendingRequestsCard() {
  return (
    <section className="dashboard-card large-card">
      <div className="card-header-row">
        <div>
          <h3 className="section-title">Pending Requests</h3>
          <p className="section-subtitle">Students waiting for your response</p>
        </div>

        <Link to="/buddy/buddy-requests" className="view-all-btn">
          View all
        </Link>
      </div>

      <div className="local-request-list">
        {localPendingRequests.map((request) => (
          <div className="local-request-item" key={request.id}>
            <img
              src={request.avatar}
              alt={request.name}
              className="local-request-avatar"
            />

            <div className="local-request-content">
              <h4>{request.name}</h4>
              <p>{request.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PendingRequestsCard;