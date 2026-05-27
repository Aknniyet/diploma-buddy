import { Link } from "react-router-dom";
import { formatAstanaDateTime } from "../../utils/datetime";

function NextStepsCard({ steps = [] }) {
  const visibleSteps = steps.slice(0, 3);

  return (
    <div className="dashboard-card">
      <div className="next-steps-header">
        <div>
          <h3 className="card-title">Next Steps</h3>
          <p className="card-subtitle">Tasks to complete in your adaptation journey</p>
        </div>
         <Link to="/student/checklist" className="view-all-btn">
          View all
        </Link>
      </div>

      {visibleSteps.length === 0 ? (
        <p className="card-subtitle">All checklist tasks are completed </p>
      ) : (
        <div className="next-steps-list">
          {visibleSteps.map((step) => (
            <div key={step.id} className="next-step-row">
              <div className="next-step-circle" />
              <div className="next-step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                <div className="next-step-meta">
                  <span className={`next-step-pill priority-${step.priority || "medium"}`}>
                    {(step.priority || "medium").toUpperCase()}
                  </span>
                  {step.deadline ? (
                    <span className={`next-step-pill ${step.overdue ? "danger" : step.dueSoon ? "warning" : ""}`}>
                      {step.overdue
                        ? "Overdue"
                        : `Due ${formatAstanaDateTime(step.deadline, {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}`}
                    </span>
                  ) : null}
                  <span className="next-step-pill subtle">{step.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NextStepsCard;
