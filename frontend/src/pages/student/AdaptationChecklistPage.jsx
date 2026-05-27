import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CommunityDeleteModal from "../../components/community/CommunityDeleteModal";
import ProgressOverviewCard from "../../components/checklist/ProgressOverviewCard";
import CategoryTabs from "../../components/checklist/CategoryTabs";
import ChecklistSectionCard from "../../components/checklist/ChecklistSectionCard";
import { checklistCategories } from "../../constants/checklistData";
import { apiRequest } from "../../lib/api";
import { toAstanaDateTimeInputValue } from "../../utils/datetime";
import "../../styles/checklist.css";

const emptyTaskForm = {
  title: "",
  description: "",
  category: "documents",
  priority: "medium",
  deadline: "",
};

function normalizeTask(task) {
  return {
    ...task,
    completed: Boolean(task.completed ?? task.is_completed),
    overdue: Boolean(task.deadline && !task.completed && new Date(task.deadline).getTime() < Date.now()),
    dueSoon: Boolean(
      task.deadline &&
        !task.completed &&
        new Date(task.deadline).getTime() >= Date.now() &&
        new Date(task.deadline).getTime() - Date.now() <= 48 * 60 * 60 * 1000
    ),
  };
}

function AdaptationChecklistPage() {
  const [selectedCategory, setSelectedCategory] = useState("documents");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    completedCount: 0,
    totalCount: 0,
    progress: 0,
  });
  const [formData, setFormData] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const loadChecklist = async () => {
    try {
      const response = await apiRequest("/checklist");
      const rawTasks = Array.isArray(response) ? response : response.tasks || [];
      const nextSummary = Array.isArray(response)
        ? {
            completedCount: rawTasks.filter((task) => task.completed).length,
            totalCount: rawTasks.length,
            progress: rawTasks.length
              ? Math.round((rawTasks.filter((task) => task.completed).length / rawTasks.length) * 100)
              : 0,
          }
        : response.summary || {};

      setTasks(rawTasks.map(normalizeTask));
      setSummary(nextSummary);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Could not load checklist.");
    }
  };

  useEffect(() => {
    loadChecklist().catch(() => null);
  }, []);

  const overdueTasks = useMemo(
    () => tasks.filter((task) => task.overdue && !task.completed).length,
    [tasks]
  );

  const highPriorityIncomplete = useMemo(
    () => tasks.filter((task) => !task.completed && task.priority === "high").length,
    [tasks]
  );

  const selectedCategoryData =
    checklistCategories.find((item) => item.id === selectedCategory) || checklistCategories[0];
  const selectedTasks = tasks.filter((task) => task.category === selectedCategory);

  const openTaskComposer = () => {
    setEditingTaskId(null);
    setFormData({ ...emptyTaskForm, category: selectedCategory });
    setIsTaskModalOpen(true);
  };

  const resetComposer = () => {
    setEditingTaskId(null);
    setFormData({ ...emptyTaskForm, category: selectedCategory });
    setIsTaskModalOpen(false);
  };

  useEffect(() => {
    setFormData((prev) =>
      editingTaskId
        ? prev
        : {
            ...prev,
            category: selectedCategory,
          }
    );
  }, [editingTaskId, selectedCategory]);

  const handleToggleTask = async (taskId) => {
    const response = await apiRequest(`/checklist/${taskId}/toggle`, { method: "PATCH" });
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? normalizeTask(response.task) : task))
    );
    await loadChecklist();
  };

  const handleSubmitTask = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const payload = {
        ...formData,
        deadline: formData.deadline || null,
      };

      const response = editingTaskId
        ? await apiRequest(`/checklist/${editingTaskId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/checklist", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const normalizedTask = normalizeTask(response.task);

      setTasks((prev) => {
        if (editingTaskId) {
          return prev.map((task) => (task.id === editingTaskId ? normalizedTask : task));
        }

        return [normalizedTask, ...prev];
      });

      setStatusMessage(editingTaskId ? "Task updated." : "Task created.");
      setSelectedCategory(normalizedTask.category);
      resetComposer();
      await loadChecklist();
    } catch (error) {
      setErrorMessage(error.message || "Could not save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setSelectedCategory(task.category);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "documents",
      priority: task.priority || "medium",
      deadline: toAstanaDateTimeInputValue(task.deadline),
    });
    setStatusMessage("");
    setErrorMessage("");
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (task) => {
    setDeleteError("");
    setTaskToDelete(task);
  };

  const closeDeleteModal = () => {
    if (isDeletingTask) return;
    setDeleteError("");
    setTaskToDelete(null);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeletingTask(true);
    setDeleteError("");
    try {
      await apiRequest(`/checklist/${taskToDelete.id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((item) => item.id !== taskToDelete.id));
      setStatusMessage("Task deleted.");
      if (editingTaskId === taskToDelete.id) {
        resetComposer();
      }
      setTaskToDelete(null);
      await loadChecklist();
    } catch (error) {
      setDeleteError(error.message || "Could not delete task.");
    } finally {
      setIsDeletingTask(false);
    }
  };

  return (
    <DashboardLayout title="Checklist">
      <section className="adaptation-checklist-page">
        <div className="adaptation-checklist-header">
          <div>
            <h1>Adaptation Checklist</h1>
            <p>Track university, document, housing, and personal tasks in one place.</p>
          </div>
          <button type="button" className="checklist-primary-btn" onClick={openTaskComposer}>
            Add Your Own Task
          </button>
        </div>

        {statusMessage ? <div className="checklist-status-message">{statusMessage}</div> : null}
        {errorMessage ? <div className="checklist-status-message error">{errorMessage}</div> : null}

        <div className="checklist-main-card">
          <ProgressOverviewCard
            totalProgress={summary.progress || 0}
            completedCount={summary.completedCount || 0}
            totalCount={summary.totalCount || 0}
            overdueTasks={overdueTasks}
            highPriorityIncomplete={highPriorityIncomplete}
          />
          <CategoryTabs
            categories={checklistCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <ChecklistSectionCard
          category={selectedCategoryData}
          tasks={selectedTasks}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        {isTaskModalOpen ? (
          <div className="checklist-modal-overlay" onClick={resetComposer}>
            <div className="checklist-modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="checklist-modal-close" onClick={resetComposer}>
                <X size={20} />
              </button>

              <div className="checklist-section-header checklist-modal-header">
                <div>
                  <h3>{editingTaskId ? "Edit Your Task" : "Add Your Own Task"}</h3>
                  <p>Create personal deadlines without leaving the checklist.</p>
                </div>
              </div>

              <form className="checklist-composer-form" onSubmit={handleSubmitTask}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Task title"
                />
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Describe what you need to do"
                />
                <div className="checklist-composer-grid">
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, category: event.target.value }))
                    }
                  >
                    {checklistCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.priority}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, priority: event.target.value }))
                    }
                  >
                    <option value="high">High priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="low">Low priority</option>
                  </select>
                </div>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, deadline: event.target.value }))
                  }
                />

                <div className="checklist-composer-actions">
                  <button type="button" className="checklist-secondary-btn" onClick={resetComposer}>
                    Cancel
                  </button>
                  <button type="submit" className="checklist-primary-btn" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editingTaskId
                      ? "Save Changes"
                      : "Add Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {taskToDelete ? (
          <CommunityDeleteModal
            deleteError={deleteError}
            isDeletingPost={isDeletingTask}
            onCancel={closeDeleteModal}
            onConfirm={confirmDeleteTask}
            title="Delete task?"
            description={`Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            deletingLabel="Deleting..."
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}

export default AdaptationChecklistPage;
