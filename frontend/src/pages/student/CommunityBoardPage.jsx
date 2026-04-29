import { useEffect, useState } from "react";
import {
  CalendarDays,
  Edit3,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/community.css";

const categories = [
  { value: "hangout", label: "Hangout" },
  { value: "study", label: "Study" },
  { value: "sports", label: "Sports" },
  { value: "food", label: "Food" },
  { value: "question", label: "Question" },
];

const categoryLabels = {
  hangout: "Hangout",
  study: "Study",
  city: "Explore",
  sports: "Sports",
  food: "Food",
  question: "Question",
};

const roleLabels = {
  international: "International Student",
  local: "Buddy",
};

const initialForm = {
  title: "",
  description: "",
  category: "hangout",
  location: "",
  meetingTime: "",
  imageUrl: "",
};

function formatDate(value) {
  if (!value) return "Flexible time";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommunityBoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingPostId, setEditingPostId] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentImageDrafts, setCommentImageDrafts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [error, setError] = useState("");

  const loadPosts = () => {
    setIsLoading(true);
    apiRequest("/community/posts")
      .then(setPosts)
      .catch((requestError) => setError(requestError.message || "Could not load community posts."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const readImageFile = (file, onLoad) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onLoad(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    readImageFile(file, (imageUrl) => {
      setForm((current) => ({ ...current, imageUrl }));
    });
  };

  const handleCommentImageChange = (postId, event) => {
    const file = event.target.files?.[0];
    readImageFile(file, (imageUrl) => {
      setCommentImageDrafts((current) => ({ ...current, [postId]: imageUrl }));
    });
  };

  const openCreateComposer = () => {
    setEditingPostId(null);
    setForm(initialForm);
    setError("");
    setIsComposerOpen(true);
  };

  const openEditComposer = (post) => {
    setEditingPostId(post.id);
    setForm({
      title: post.title || "",
      description: post.description || "",
      category: post.category || "hangout",
      location: post.location || "",
      meetingTime: post.meeting_time ? post.meeting_time.slice(0, 16) : "",
      imageUrl: post.image_url || "",
    });
    setError("");
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setEditingPostId(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please add a title and short description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequest(editingPostId ? `/community/posts/${editingPostId}` : "/community/posts", {
        method: editingPostId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          meetingTime: form.meetingTime || null,
        }),
      });
      setForm(initialForm);
      setEditingPostId(null);
      setIsComposerOpen(false);
      loadPosts();
    } catch (requestError) {
      setError(requestError.message || "Could not create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterest = async (post) => {
    if (post.author_id === user?.id) return;

    const nextInterested = !post.is_interested;

    setPosts((currentPosts) =>
      currentPosts.map((item) =>
        item.id === post.id
          ? {
              ...item,
              is_interested: nextInterested,
              interested_count: item.interested_count + (nextInterested ? 1 : -1),
            }
          : item
      )
    );

    try {
      await apiRequest(`/community/posts/${post.id}/interest`, {
        method: "POST",
        body: JSON.stringify({ interested: nextInterested }),
      });
    } catch (requestError) {
      setError(requestError.message || "Could not update interest.");
      loadPosts();
    }
  };

  const updateCommentDraft = (postId, value) => {
    setCommentDrafts((current) => ({ ...current, [postId]: value }));
  };

  const handleCommentSubmit = async (event, post) => {
    event.preventDefault();
    const text = commentDrafts[post.id]?.trim();
    const imageUrl = commentImageDrafts[post.id] || "";

    if (!text && !imageUrl) return;

    try {
      const comment = await apiRequest(`/community/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text, imageUrl }),
      });

      setPosts((currentPosts) =>
        currentPosts.map((item) =>
          item.id === post.id ? { ...item, comments: [...(item.comments || []), comment] } : item
        )
      );
      updateCommentDraft(post.id, "");
      setCommentImageDrafts((current) => ({ ...current, [post.id]: "" }));
    } catch (requestError) {
      setError(requestError.message || "Could not add comment.");
    }
  };

  const handleDeletePost = async (post) => {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) return;

    try {
      await apiRequest(`/community/posts/${post.id}`, { method: "DELETE" });
      setPosts((currentPosts) => currentPosts.filter((item) => item.id !== post.id));
    } catch (requestError) {
      setError(requestError.message || "Could not delete post.");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await apiRequest(`/community/comments/${commentId}`, { method: "DELETE" });
      setPosts((currentPosts) =>
        currentPosts.map((item) =>
          item.id === postId
            ? { ...item, comments: (item.comments || []).filter((comment) => comment.id !== commentId) }
            : item
        )
      );
    } catch (requestError) {
      setError(requestError.message || "Could not delete comment.");
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((current) => ({ ...current, [postId]: !current[postId] }));
  };

  const sidebarType = user?.role === "local" ? "buddy" : "student";

  return (
    <DashboardLayout title="Community Board" sidebarType={sidebarType}>
      <section className="community-page">
        <div className="community-feed-header community-feed-heading">
          <div>
            <h2>Community feed</h2>
            <p>Active plans, questions, and quick updates from students and buddies.</p>
          </div>
          <button type="button" className="community-open-composer" onClick={openCreateComposer}>
            <Plus size={18} />
            New post
          </button>
        </div>

        <div className="community-feed">
          {isLoading ? (
            <div className="community-empty-card">Loading community posts...</div>
          ) : posts.length === 0 ? (
            <div className="community-empty-card">
              <MessageCircle size={28} />
              <h3>No posts yet</h3>
              <p>Be the first to invite someone for a walk, coffee, study session, or movie.</p>
              <button type="button" onClick={openCreateComposer}>
                Create first post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="community-post-card">
                <div className="community-post-header">
                  <div className="community-author">
                    {post.author_photo_url ? (
                      <img src={post.author_photo_url} alt={post.author_name || "User"} className="community-author-avatar image" />
                    ) : (
                      <div className="community-author-avatar">
                        {post.author_name?.slice(0, 1).toUpperCase() || "S"}
                      </div>
                    )}
                    <div>
                      <strong>{post.author_name || user?.full_name || "Student"}</strong>
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

                {post.author_id === user?.id && (
                  <div className="community-owner-actions">
                    <button type="button" onClick={() => openEditComposer(post)}>
                      <Edit3 size={15} />
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDeletePost(post)}>
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}

                <h3>{post.title}</h3>
                <p>{post.description}</p>

                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="community-post-image" />
                )}

                {(post.location || post.meeting_time) ? (
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
                      onClick={() => handleInterest(post)}
                    >
                      Interested
                      <span>{post.interested_count}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={expandedComments[post.id] ? "community-comment-count active" : "community-comment-count"}
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle size={16} />
                    {(post.comments || []).length} comments
                  </button>
                </div>

                {expandedComments[post.id] ? (
                  <div className="community-comments">
                    {(post.comments || [])
                      .slice()
                      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                      .map((comment) => (
                        <div key={comment.id} className="community-comment">
                          {comment.author_photo_url ? (
                            <img src={comment.author_photo_url} alt={comment.author_name || "User"} className="community-comment-avatar image" />
                          ) : (
                            <div className="community-comment-avatar">
                              {comment.author_name?.slice(0, 1).toUpperCase() || "U"}
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
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : null}
                            </div>
                            {comment.text && <p>{comment.text}</p>}
                            {comment.image_url && (
                              <img src={comment.image_url} alt="Comment attachment" className="community-comment-image" />
                            )}
                          </div>
                        </div>
                      ))}

                    <form className="community-comment-form" onSubmit={(event) => handleCommentSubmit(event, post)}>
                      {commentImageDrafts[post.id] && (
                        <div className="community-comment-preview">
                          <img src={commentImageDrafts[post.id]} alt="Comment preview" />
                          <button
                            type="button"
                            onClick={() => setCommentImageDrafts((current) => ({ ...current, [post.id]: "" }))}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => updateCommentDraft(post.id, event.target.value)}
                        placeholder={post.author_id === user?.id ? "Reply to your post..." : "Write a comment..."}
                      />
                      <label className="community-comment-photo">
                        <ImagePlus size={17} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleCommentImageChange(post.id, event)}
                        />
                      </label>
                      <button type="submit">Send</button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        {isComposerOpen && (
          <div className="community-modal-backdrop" role="presentation">
            <form className="community-modal" onSubmit={handleSubmit}>
              <div className="community-modal-header">
                <div className="community-author">
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user.full_name || "User"} className="community-author-avatar image" />
                  ) : (
                    <div className="community-author-avatar">
                      {user?.full_name?.slice(0, 1).toUpperCase() || "S"}
                    </div>
                  )}
                  <div>
                    <strong>{editingPostId ? "Edit post" : "Create new post"}</strong>
                    <span>{roleLabels[user?.role] || "Community member"}</span>
                  </div>
                </div>
                <button type="button" className="community-modal-close" onClick={closeComposer}>
                  <X size={20} />
                </button>
              </div>

              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                placeholder="Movie tonight? City walk? Need help with documents?"
                maxLength={180}
              />
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Write the details so other students understand how to join."
                rows="5"
              />

              {form.imageUrl && (
                <div className="community-image-preview">
                  <img src={form.imageUrl} alt="Post preview" />
                  <button
                    type="button"
                    className="community-remove-image"
                    onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}
                  >
                    Remove photo
                  </button>
                </div>
              )}

              <div className="community-modal-tools">
                <select name="category" value={form.category} onChange={updateForm}>
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
                  onChange={updateForm}
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="Location"
                />
              </div>

              <div className="community-modal-actions">
                <label className="community-photo-button">
                  <ImagePlus size={18} />
                  Add photo
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                <button type="submit" className="community-submit-button" disabled={isSubmitting}>
                  <Send size={16} />
                  {isSubmitting ? "Saving..." : editingPostId ? "Save" : "Post"}
                </button>
              </div>

              {error && <p className="community-error">{error}</p>}
            </form>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default CommunityBoardPage;
