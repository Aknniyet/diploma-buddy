function ProgressOverviewCard({
  totalProgress,
  completedTasksCount = 0,
  totalTasksCount = 0,
  nextRecommendedTask = null,
}) {
  return (
    <div className="checklist-overview-card">
      <div className="checklist-overview-header">
        <h3>Overall Progress</h3>
        <p>
          You've completed {completedTasksCount} of {totalTasksCount} adaptation tasks
        </p>
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

      {nextRecommendedTask ? (
        <div className="checklist-next-step">
          <span className={`checklist-priority-badge ${nextRecommendedTask.priority || "medium"}`}>
            {nextRecommendedTask.priority || "medium"} priority
          </span>
          <div>
            <strong>Next recommended step: {nextRecommendedTask.title}</strong>
            <p>{nextRecommendedTask.timeframe || "Start this soon"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProgressOverviewCard;
