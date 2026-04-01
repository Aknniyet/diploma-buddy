import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ProgressOverviewCard from "../../components/checklist/ProgressOverviewCard";
import CategoryTabs from "../../components/checklist/CategoryTabs";
import ChecklistSectionCard from "../../components/checklist/ChecklistSectionCard";
import { checklistCategories } from "../../constants/checklistData";
import { apiRequest } from "../../lib/api";
import "../../styles/checklist.css";

function AdaptationChecklistPage() {
  const [selectedCategory, setSelectedCategory] = useState("documents");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    apiRequest("/checklist").then(setTasks).catch(() => null);
  }, []);

  const totalProgress = useMemo(() => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  const selectedCategoryData = checklistCategories.find((item) => item.id === selectedCategory);
  const selectedTasks = tasks.filter((task) => task.category === selectedCategory);

  const handleToggleTask = async (taskId) => {
    const response = await apiRequest(`/checklist/${taskId}/toggle`, { method: "PATCH" });
    setTasks((prev) => prev.map((task) => (task.id === taskId ? response.task : task)));
  };

  return (
    <DashboardLayout title="Checklist">
      <section className="adaptation-checklist-page">
        <div className="adaptation-checklist-header">
          <h1>Adaptation Checklist</h1>
          <p>Track your progress settling into your new home</p>
        </div>

        <div className="checklist-main-card">
          <ProgressOverviewCard totalProgress={totalProgress} />
          <CategoryTabs categories={checklistCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        <ChecklistSectionCard category={selectedCategoryData} tasks={selectedTasks} onToggleTask={handleToggleTask} />
      </section>
    </DashboardLayout>
  );
}

export default AdaptationChecklistPage;
