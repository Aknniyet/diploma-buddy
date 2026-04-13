import { Link } from "react-router-dom";

function NextStepsCard({ steps = [] }) {
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

      {steps.length === 0 ? (
        <p className="card-subtitle">All checklist tasks are completed </p>
      ) : (
        <div className="next-steps-list">
          {steps.map((step) => (
            <div key={step.id} className="next-step-row">
              <div className="next-step-circle" />
              <div className="next-step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NextStepsCard;