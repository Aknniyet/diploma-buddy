function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="checklist-categories-grid">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;

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
            <p>{category.progress}%</p>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;