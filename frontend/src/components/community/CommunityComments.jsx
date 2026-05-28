import { ImagePlus, Send, Trash2, X } from "lucide-react";
import { roleLabels } from "../../constants/communityData";
import { getAvatarInitials } from "../../utils/community";

function CommunityComments({
  commentDraft,
  commentImageDraft,
  post,
  user,
  onCommentDelete,
  onCommentDraftChange,
  onCommentImageChange,
  onCommentImageRemove,
  onCommentSubmit,
}) {
  return (
    <div className="community-comments">
      {(post.comments || [])
        .slice()
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((comment) => (
          <div key={comment.id} className="community-comment">
            {comment.author_photo_url ? (
              <img
                src={comment.author_photo_url}
                alt={comment.author_name || "User"}
                className="community-comment-avatar image"
              />
            ) : (
              <div className="community-comment-avatar">
                {getAvatarInitials(comment.author_name, "U")}
              </div>
            )}
            <div className="community-comment-body">
              <div className="community-comment-author-line">
                <strong>{comment.author_name || "User"}</strong>
                <span className={`community-role-badge small community-role-${comment.author_role}`}>
                  {roleLabels[comment.author_role] || "User"}
                </span>
                {comment.author_id === user?.id ? (
                  <button
                    type="button"
                    className="community-comment-delete"
                    aria-label="Delete comment"
                    onClick={() => onCommentDelete(post.id, comment.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </div>
              {comment.text ? <p>{comment.text}</p> : null}
              {comment.image_url ? (
                <img
                  src={comment.image_url}
                  alt="Comment attachment"
                  className="community-comment-image"
                />
              ) : null}
            </div>
          </div>
        ))}

      <form className="community-comment-form" onSubmit={(event) => onCommentSubmit(event, post)}>
        {commentImageDraft ? (
          <div className="community-comment-preview">
            <img src={commentImageDraft} alt="Comment preview" />
            <button type="button" onClick={() => onCommentImageRemove(post.id)}>
              <X size={14} />
            </button>
          </div>
        ) : null}
        <input
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(post.id, event.target.value)}
          placeholder={post.author_id === user?.id ? "Reply to your post..." : "Write a comment..."}
        />
        <label className="community-comment-photo">
          <ImagePlus size={17} />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onCommentImageChange(post.id, event)}
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default CommunityComments;
