import { Plus } from "lucide-react";

function CommunityFeedHeader({ hasCommunityAccess, onCreatePost }) {
  return (
    <div className="community-feed-header community-feed-heading">
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
  );
}

export default CommunityFeedHeader;
