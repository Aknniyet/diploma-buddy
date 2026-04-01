import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { localOverviewCards } from "../../constants/localDashboardData";

function LocalOverviewCards() {
  return (
    <div className="local-overview-cards">
      {localOverviewCards.map((card) => (
        <div className="dashboard-card local-stat-card" key={card.id}>
          <h3 className="card-title">{card.title}</h3>

          <div className="local-stat-value">{card.value}</div>

          <p className="local-stat-subtitle">{card.subtitle}</p>

          <Link to={card.actionPath} className="text-link">
            <span>{card.actionText}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default LocalOverviewCards; 