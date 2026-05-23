function ProgressOverviewCard({
  totalProgress,
  completedCount = 0,
  totalCount = 0,
  overdueTasks = 0,
  highPriorityIncomplete = 0,
  onAddTask,
}) {
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

      <div className="checklist-summary-pills">
        <span className="checklist-summary-pill">
          {completedCount}/{totalCount} completed
        </span>
        <span className="checklist-summary-pill warning">
          {highPriorityIncomplete} high priority left
        </span>
        <span className={`checklist-summary-pill ${overdueTasks > 0 ? "danger" : ""}`}>
          {overdueTasks} overdue
        </span>
      </div>

      {onAddTask ? (
        <div className="checklist-overview-actions">
          <button type="button" className="checklist-primary-btn" onClick={onAddTask}>
            Add Your Own Task
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProgressOverviewCard;
