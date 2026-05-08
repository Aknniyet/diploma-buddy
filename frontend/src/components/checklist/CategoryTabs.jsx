function CategoryTabs({ categories, tasks = [], selectedCategory, onSelectCategory }) {
  return (
    <div className="checklist-categories-grid">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;
        const categoryTasks = tasks.filter((task) => task.category === category.id);
        const completedCount = categoryTasks.filter((task) => task.completed).length;

        return (
          <button
            key={category.id}
            type="button"
            className={
              isActive
                ? `category-card active ${category.colorClass}`
                : `category-card ${category.colorClass}`
            }
            onClick={() => onSelectCategory(category.id)}
          >
            <div className={`category-icon ${category.colorClass}`}>
              <Icon size={18} />
            </div>

            <h4>{category.title}</h4>
            <p>
              {completedCount}/{categoryTasks.length || 0} done
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;
