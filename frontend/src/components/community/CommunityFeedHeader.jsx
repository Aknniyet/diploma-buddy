import { Plus } from "lucide-react";
import { categories } from "../../constants/communityData";

function CommunityFeedHeader({
  category,
  hasCommunityAccess,
  onCategoryChange,
  onCreatePost,
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}) {
  return (
    <div className="community-feed-heading">
      <div className="community-feed-header">
        <div>
          <h2>Community feed</h2>
          <p>Active plans, questions, and quick updates from students and buddies.</p>
        </div>
        {hasCommunityAccess ? (
          <button type="button" className="community-open-composer" onClick={onCreatePost}>
            <Plus size={18} />
            New post
          </button>
        ) : null}
      </div>

      <div className="community-toolbar">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search posts, places or authors"
        />

        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select value={sortValue} onChange={(event) => onSortChange(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="popular">Most popular</option>
        </select>
      </div>
    </div>
  );
}

export default CommunityFeedHeader;
