import { Link } from "react-router-dom";
import { nextSteps } from "../../constants/dashboardData";

function NextStepsCard() {
  return (
    <section className="dashboard-card large-card">
      <div className="card-header-row">
        <div>
          <h3 className="section-title">Next Steps</h3>
          <p className="section-subtitle">
            Tasks to complete in your adaptation journey
          </p>
        </div>

        <Link to="/student/checklist" className="view-all-btn">
          View all
        </Link>
      </div>

      <div className="steps-list">
        {nextSteps.map((step) => (
          <div className="step-item" key={step.id}>
            <div className="step-circle" />
            <div className="step-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NextStepsCard;