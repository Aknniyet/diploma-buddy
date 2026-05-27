import { ImagePlus, Send, X } from "lucide-react";
import { categories, roleLabels } from "../../constants/communityData";
import { getAvatarInitials } from "../../utils/community";

function CommunityComposerModal({
  editingPostId,
  error,
  form,
  isSubmitting,
  user,
  onClose,
  onFormChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
}) {
  const displayName = user?.full_name || "Student";

  return (
    <div className="community-modal-backdrop" role="presentation">
      <form className="community-modal" onSubmit={onSubmit}>
        <div className="community-modal-header">
          <div className="community-author">
            {user?.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt={displayName}
                className="community-author-avatar image"
              />
            ) : (
              <div className="community-author-avatar">
                {getAvatarInitials(displayName, "S")}
              </div>
            )}
            <div>
              <strong>{editingPostId ? "Edit post" : "Create new post"}</strong>
              <span>{roleLabels[user?.role] || "Community member"}</span>
            </div>
          </div>
          <button type="button" className="community-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="community-modal-body">
          <input
            name="title"
            value={form.title}
            onChange={onFormChange}
            placeholder="Movie tonight? City walk? Need help with documents?"
            maxLength={180}
          />
          <textarea
            name="description"
            value={form.description}
            onChange={onFormChange}
            placeholder="Write the details so other students understand how to join."
            rows="5"
          />

          {form.imageUrl ? (
            <div className="community-image-preview">
              <img src={form.imageUrl} alt="Post preview" />
              <button
                type="button"
                className="community-remove-image"
                onClick={onRemoveImage}
              >
                Remove photo
              </button>
            </div>
          ) : null}

          <div className="community-modal-tools">
            <select name="category" value={form.category} onChange={onFormChange}>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="meetingTime"
              value={form.meetingTime}
              onChange={onFormChange}
            />
            <input
              name="location"
              value={form.location}
              onChange={onFormChange}
              placeholder="Location"
            />
          </div>
        </div>

        <div className="community-modal-actions">
          <label className="community-photo-button">
            <ImagePlus size={18} />
            Add photo
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>
          <button type="submit" className="community-submit-button" disabled={isSubmitting}>
            <Send size={16} />
            {isSubmitting ? "Saving..." : editingPostId ? "Save" : "Post"}
          </button>
        </div>

        {error ? <p className="community-error">{error}</p> : null}
      </form>
    </div>
  );
}

export default CommunityComposerModal;
