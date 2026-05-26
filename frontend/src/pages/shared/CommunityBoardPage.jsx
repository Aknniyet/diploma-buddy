import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CommunityComposerModal from "../../components/community/CommunityComposerModal";
import CommunityDeleteModal from "../../components/community/CommunityDeleteModal";
import CommunityFeedHeader from "../../components/community/CommunityFeedHeader";
import CommunityPostCard from "../../components/community/CommunityPostCard";
import { createEditableForm } from "../../utils/community";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/community.css";

const initialForm = {
  title: "",
  description: "",
  category: "hangout",
  location: "",
  meetingTime: "",
  imageUrl: "",
};

function CommunityBoardPage({ userType = "student" }) {
  const { user } = useAuth();
  const hasCommunityAccess = user?.role !== "local" || user?.buddy_status === "approved";
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingPostId, setEditingPostId] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentImageDrafts, setCommentImageDrafts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [deleteError, setDeleteError] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortValue, setSortValue] = useState("newest");

  const loadPosts = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortValue !== "newest") params.set("sort", sortValue);

    apiRequest(`/community/posts${params.toString() ? `?${params.toString()}` : ""}`)
      .then(setPosts)
      .catch((requestError) => setError(requestError.message || "Could not load community posts."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!hasCommunityAccess) {
      setPosts([]);
      setError("");
      setIsLoading(false);
      return;
    }

    loadPosts();
  }, [hasCommunityAccess, searchValue, selectedCategory, sortValue]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const readImageFile = (file, onLoad) => {
    if (!file) {
      return;
    }

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
    setForm(createEditableForm(post));
    setError("");
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setEditingPostId(null);
    setForm(initialForm);
    setError("");
  };

  const openDeleteModal = (post) => {
    setDeleteError("");
    setPostToDelete(post);
  };

  const closeDeleteModal = () => {
    if (isDeletingPost) {
      return;
    }

    setDeleteError("");
    setPostToDelete(null);
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
    if (post.author_id === user?.id) {
      return;
    }

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

    if (!text && !imageUrl) {
      return;
    }

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

  const handleDeletePost = async () => {
    if (!postToDelete) {
      return;
    }

    try {
      setIsDeletingPost(true);
      setDeleteError("");
      await apiRequest(`/community/posts/${postToDelete.id}`, { method: "DELETE" });
      setPosts((currentPosts) => currentPosts.filter((item) => item.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (requestError) {
      setDeleteError(requestError.message || "Could not delete post.");
    } finally {
      setIsDeletingPost(false);
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

  const removeCommentImage = (postId) => {
    setCommentImageDrafts((current) => ({ ...current, [postId]: "" }));
  };

  return (
    <DashboardLayout title="Community Board" sidebarType={userType === "buddy" ? "buddy" : "student"}>
      <section className="community-page">
        <CommunityFeedHeader
          category={selectedCategory}
          hasCommunityAccess={hasCommunityAccess}
          onCategoryChange={setSelectedCategory}
          onCreatePost={openCreateComposer}
          onSearchChange={setSearchValue}
          onSortChange={setSortValue}
          searchValue={searchValue}
          sortValue={sortValue}
        />

        <div className="community-feed">
          {!hasCommunityAccess ? (
            <div className="community-empty-card">
              <MessageCircle size={28} />
              <h3>No posts yet</h3>
              <p>Community Board will become available after admin approval.</p>
            </div>
          ) : isLoading ? (
            <div className="community-empty-card">Loading community posts...</div>
          ) : posts.length === 0 ? (
            <div className="community-empty-card">
              <MessageCircle size={28} />
              <h3>No posts yet</h3>
              <p>Be the first to invite someone for a walk, coffee, study session, or movie.</p>
            </div>
          ) : (
            posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                commentDraft={commentDrafts[post.id] || ""}
                commentImageDraft={commentImageDrafts[post.id] || ""}
                expandedComments={Boolean(expandedComments[post.id])}
                post={post}
                user={user}
                onCommentDelete={handleDeleteComment}
                onCommentDraftChange={updateCommentDraft}
                onCommentImageChange={handleCommentImageChange}
                onCommentImageRemove={removeCommentImage}
                onCommentSubmit={handleCommentSubmit}
                onDeletePost={openDeleteModal}
                onEditPost={openEditComposer}
                onInterest={handleInterest}
                onToggleComments={toggleComments}
              />
            ))
          )}
        </div>

        {isComposerOpen ? (
          <CommunityComposerModal
            editingPostId={editingPostId}
            error={error}
            form={form}
            isSubmitting={isSubmitting}
            user={user}
            onClose={closeComposer}
            onFormChange={updateForm}
            onImageChange={handleImageChange}
            onRemoveImage={() => setForm((current) => ({ ...current, imageUrl: "" }))}
            onSubmit={handleSubmit}
          />
        ) : null}

        {postToDelete ? (
          <CommunityDeleteModal
            deleteError={deleteError}
            isDeletingPost={isDeletingPost}
            onCancel={closeDeleteModal}
            onConfirm={handleDeletePost}
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}

export default CommunityBoardPage;
