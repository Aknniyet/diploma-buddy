import { Check, Pencil, Trash2 } from "lucide-react";
import { formatAstanaDateTime } from "../../utils/datetime";

function formatPriorityLabel(priority) {
  if (!priority) return "Medium";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function ChecklistSectionCard({
  category,
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="checklist-section-card">
      <div className="checklist-section-header">
        <div className="section-title-wrap">
          <div className="section-main-icon">
            <category.icon size={18} />
          </div>

          <div>
            <h3>{category.title}</h3>
            <p>
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
        </div>

        <div className="section-count-badge">
          {completedCount}/{tasks.length}
        </div>
      </div>

      <div className="checklist-tasks">
        {tasks.length === 0 ? (
          <div className="checklist-empty-state">
            No tasks in this category yet. Add one from the composer above.
          </div>
        ) : null}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={task.completed ? "checklist-task completed" : "checklist-task"}
          >
            <button
              type="button"
              className="checklist-task-main"
              onClick={() => onToggleTask(task.id)}
            >
              <div className="task-check">{task.completed ? <Check size={14} /> : null}</div>

              <div className="task-content">
                <div className="task-title-row">
                  <h4>{task.title}</h4>
                  <div className="task-pill-row">
                    <span className={`task-meta-pill priority-${task.priority || "medium"}`}>
                      {formatPriorityLabel(task.priority)}
                    </span>
                    {task.deadline ? (
                      <span
                        className={`task-meta-pill ${
                          task.overdue ? "deadline-overdue" : task.dueSoon ? "deadline-soon" : ""
                        }`}
                      >
                        {task.overdue
                          ? "Overdue"
                          : `Due ${formatAstanaDateTime(task.deadline, {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}`}
                      </span>
                    ) : null}
                    {task.is_custom ? (
                      <span className="task-meta-pill source-custom">My task</span>
                    ) : null}
                  </div>
                </div>

                <p>{task.description}</p>
              </div>
            </button>

            <div className="task-side-actions">
              <div className="task-action-text">{task.completed ? "Completed" : "Mark complete"}</div>

              {task.is_custom ? (
                <div className="task-icon-actions">
                  <button type="button" className="task-icon-btn" onClick={() => onEditTask?.(task)}>
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="task-icon-btn danger"
                    onClick={() => onDeleteTask?.(task)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChecklistSectionCard;
