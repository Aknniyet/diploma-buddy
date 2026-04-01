import { Users } from "lucide-react";
import { myBuddiesEmptyState } from "../../constants/localDashboardData";
import { Link } from "react-router-dom";

function MyBuddiesCard() {
  return (
    <section className="dashboard-card large-card">
      <div className="card-header-row">
        <div>
          <h3 className="section-title">My Buddies</h3>
          <p className="section-subtitle">
            International students you're helping
          </p>
        </div>

        <Link to="/buddy/my-buddies" className="view-all-btn">
          View all
        </Link>
      </div>

      <div className="local-empty-state">
        <Users size={42} />
        <h4>{myBuddiesEmptyState.title}</h4>
        <p>{myBuddiesEmptyState.subtitle}</p>
      </div>
    </section>
  );
}

export default MyBuddiesCard;