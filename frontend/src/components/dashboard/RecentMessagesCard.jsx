import { Link } from "react-router-dom";
import { recentMessages } from "../../constants/dashboardData";

function RecentMessagesCard() {
  return (
    <section className="dashboard-card large-card">
      <div className="card-header-row">
        <div>
          <h3 className="section-title">Recent Messages</h3>
          <p className="section-subtitle">Stay connected with your buddy</p>
        </div>

        <Link to="/student/messages" className="view-all-btn">
          View all
        </Link>
      </div>

      <div className="recent-messages-list">
        {recentMessages.map((message) => (
          <div className="recent-message-item" key={message.id}>
            <img
              src={message.avatar}
              alt={message.name}
              className="recent-message-avatar"
            />

            <div className="recent-message-content">
              <h4>{message.name}</h4>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentMessagesCard;