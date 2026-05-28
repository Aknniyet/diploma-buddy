import { CalendarDays, Edit3, MapPin, MessageCircle, Trash2 } from "lucide-react";
import CommunityComments from "./CommunityComments";
import { categoryLabels, roleLabels } from "../../constants/communityData";
import { formatDate, getAvatarInitials } from "../../utils/community";

function CommunityPostCard({
  commentDraft,
  commentImageDraft,
  expandedComments,
  post,
  user,
  onCommentDelete,
  onCommentDraftChange,
  onCommentImageChange,
  onCommentImageRemove,
  onCommentSubmit,
  onDeletePost,
  onEditPost,
  onInterest,
  onToggleComments,
}) {
  const displayName = post.author_name || user?.full_name || "Student";

  return (
    <article className="community-post-card">
      <div className="community-post-header">
        <div className="community-author">
          {post.author_photo_url ? (
            <img
              src={post.author_photo_url}
              alt={displayName}
              className="community-author-avatar image"
            />
          ) : (
            <div className="community-author-avatar">
              {getAvatarInitials(displayName, "S")}
            </div>
          )}
          <div>
            <strong>{displayName}</strong>
            <span>
              {formatDate(post.created_at)} · {categoryLabels[post.category] || "Post"}
            </span>
          </div>
        </div>
        <div className="community-post-badges">
          <span className={`community-role-badge community-role-${post.author_role}`}>
            {roleLabels[post.author_role] || "User"}
          </span>
          <span className={`community-category community-category-${post.category}`}>
            {categoryLabels[post.category] || "Post"}
          </span>
        </div>
      </div>

      <div className="community-post-content-header">
        <div className="community-post-copy">
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </div>

        {post.author_id === user?.id ? (
          <div className="community-owner-actions">
            <button type="button" onClick={() => onEditPost(post)}>
              <Edit3 size={15} />
              Edit
            </button>
            <button type="button" className="danger" onClick={() => onDeletePost(post)}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {post.image_url ? (
        <img src={post.image_url} alt={post.title} className="community-post-image" />
      ) : null}

      {post.location || post.meeting_time ? (
        <div className="community-post-meta">
          {post.location ? (
            <span>
              <MapPin size={16} />
              {post.location}
            </span>
          ) : null}
          {post.meeting_time ? (
            <span>
              <CalendarDays size={16} />
              {formatDate(post.meeting_time)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="community-post-footer">
        {post.author_id === user?.id ? (
          <button type="button" className="community-interest own-post" disabled>
            Your post
            <span>{post.interested_count}</span>
          </button>
        ) : (
          <button
            type="button"
            className={post.is_interested ? "community-interest active" : "community-interest"}
            onClick={() => onInterest(post)}
          >
            Interested
            <span>{post.interested_count}</span>
          </button>
        )}
        <button
          type="button"
          className={expandedComments ? "community-comment-count active" : "community-comment-count"}
          onClick={() => onToggleComments(post.id)}
        >
          <MessageCircle size={16} />
          {(post.comments || []).length} comments
        </button>
      </div>

      {expandedComments ? (
        <CommunityComments
          commentDraft={commentDraft}
          commentImageDraft={commentImageDraft}
          post={post}
          user={user}
          onCommentDelete={onCommentDelete}
          onCommentDraftChange={onCommentDraftChange}
          onCommentImageChange={onCommentImageChange}
          onCommentImageRemove={onCommentImageRemove}
          onCommentSubmit={onCommentSubmit}
        />
      ) : null}
    </article>
  );
}

export default CommunityPostCard;
