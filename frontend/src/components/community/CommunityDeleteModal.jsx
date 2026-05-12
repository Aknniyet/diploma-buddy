import { Trash2 } from "lucide-react";

function CommunityDeleteModal({
  deleteError,
  isDeletingPost,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="community-confirm-backdrop" role="presentation">
      <div
        className="community-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-delete-title"
      >
        <div className="community-confirm-icon">
          <Trash2 size={20} />
        </div>
        <div>
          <h2 id="community-delete-title">Delete post?</h2>
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        </div>

        {deleteError ? <p className="community-confirm-error">{deleteError}</p> : null}

        <div className="community-confirm-actions">
          <button type="button" className="community-confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="community-confirm-delete"
            onClick={onConfirm}
            disabled={isDeletingPost}
          >
            {isDeletingPost ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityDeleteModal;
