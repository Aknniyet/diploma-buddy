import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { overviewCards } from "../../constants/dashboardData";

function OverviewCards() {
  return (
    <div className="overview-cards">
      {overviewCards.map((card) => {
        if (card.type === "progress") {
          return (
            <div className="dashboard-card" key={card.id}>
              <h3 className="card-title">{card.title}</h3>

              <div className="progress-value">{card.progress}%</div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${card.progress}%` }}
                />
              </div>

              <p className="card-subtitle">{card.subtitle}</p>
            </div>
          );
        }

        if (card.type === "buddy") {
          return (
            <div className="dashboard-card" key={card.id}>
              <h3 className="card-title">{card.title}</h3>

              <div className="buddy-info">
                <img src={card.avatar} alt={card.name} className="buddy-avatar" />
                <div>
                  <h4>{card.name}</h4>
                  <p>{card.department}</p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="dashboard-card" key={card.id}>
            <h3 className="card-title">{card.title}</h3>

            <div className="message-count">{card.count}</div>

            <Link to="/student/messages" className="text-link">
              <span>{card.actionText}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default OverviewCards;