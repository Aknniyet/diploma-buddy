function ProgressOverviewCard({ totalProgress }) {
  return (
    <div className="checklist-overview-card">
      <div className="checklist-overview-header">
        <h3>Overall Progress</h3>
        <p>You've completed {totalProgress}% of your adaptation tasks</p>
      </div>

      <div className="overall-progress-row">
        <div className="overall-progress-bar">
          <div
            className="overall-progress-fill"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        <span className="overall-progress-value">{totalProgress}%</span>
      </div>
    </div>
  );
}

export default ProgressOverviewCard;