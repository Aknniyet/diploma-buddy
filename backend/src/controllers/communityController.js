import {
  addCommunityInterest,
  createCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  findCommunityPostById,
  findCommunityPosts,
  removeCommunityInterest,
  updateCommunityPost,
} from "../repositories/communityRepository.js";
import {
  createNotification,
  deleteNotificationsByReference,
} from "../repositories/notificationRepository.js";
import { findCommunityNotificationRecipients, findUserProfileById } from "../repositories/userRepository.js";

const allowedCategories = ["hangout", "study", "sports", "food", "question", "city"];

function ensureCommunityMember(req, res) {
  if (!["international", "local"].includes(req.user.role)) {
    res.status(403).json({ message: "Community board is available for students and buddies." });
    return false;
  }

  return true;
}

export async function getCommunityPosts(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const result = await findCommunityPosts(req.user.id);
    return res.json(result.rows);
  } catch (error) {
    console.error("Community posts error:", error.message);
    return res.status(500).json({ message: "Could not load community posts." });
  }
}

export async function createCommunityPostByStudent(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const { title, description, category, location, meetingTime, imageUrl } = req.body;
    const cleanTitle = title?.trim();
    const cleanDescription = description?.trim();
    const cleanCategory = allowedCategories.includes(category) ? category : "hangout";

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const result = await createCommunityPost(req.user.id, {
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      location: location?.trim(),
      meetingTime,
      imageUrl,
    });

    const authorProfile = await findUserProfileById(req.user.id).catch(() => ({ rows: [] }));
    const authorName = authorProfile.rows[0]?.full_name || req.user.email || "A community member";
    const recipients = await findCommunityNotificationRecipients(req.user.id).catch(() => ({ rows: [] }));

    await Promise.all(
      recipients.rows.map((recipient) =>
        createNotification({
          userId: recipient.id,
          type: "community_post",
          title: "New community post",
          description: `${authorName} posted "${cleanTitle}".`,
          referenceType: "community_post",
          referenceId: result.rows[0].id,
        }).catch(() => null)
      )
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create community post error:", error.message);
    return res.status(500).json({ message: "Could not create community post." });
  }
}

export async function updateCommunityPostByAuthor(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const { postId } = req.params;
    const { title, description, category, location, meetingTime, imageUrl } = req.body;
    const cleanTitle = title?.trim();
    const cleanDescription = description?.trim();
    const cleanCategory = allowedCategories.includes(category) ? category : "hangout";

    if (!cleanTitle || !cleanDescription) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const result = await updateCommunityPost(postId, req.user.id, {
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      location: location?.trim(),
      meetingTime,
      imageUrl,
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found or you are not the author." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update community post error:", error.message);
    return res.status(500).json({ message: "Could not update community post." });
  }
}

export async function deleteCommunityPostByAuthor(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const postId = Number(req.params.postId);
    const result = await deleteCommunityPost(postId, req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found or you are not the author." });
    }

    await deleteNotificationsByReference("community_post", postId).catch(() => null);

    return res.json({ message: "Community post deleted." });
  } catch (error) {
    console.error("Delete community post error:", error.message);
    return res.status(500).json({ message: "Could not delete community post." });
  }
}

export async function toggleCommunityInterest(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const { postId } = req.params;
    const { interested } = req.body;
    const post = await findCommunityPostById(postId);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Community post not found." });
    }

    if (post.rows[0].author_id === req.user.id) {
      return res.status(400).json({ message: "You cannot mark your own post as interested." });
    }

    if (interested) {
      await addCommunityInterest(postId, req.user.id);
    } else {
      await removeCommunityInterest(postId, req.user.id);
    }

    return res.json({ message: interested ? "Interest added." : "Interest removed." });
  } catch (error) {
    console.error("Community interest error:", error.message);
    return res.status(500).json({ message: "Could not update interest." });
  }
}

export async function createCommunityCommentByMember(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const { postId } = req.params;
    const { text, imageUrl } = req.body;
    const cleanText = text?.trim();
    const post = await findCommunityPostById(postId);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Community post not found." });
    }

    if (!cleanText && !imageUrl) {
      return res.status(400).json({ message: "Comment text or image is required." });
    }

    const result = await createCommunityComment(postId, req.user.id, {
      text: cleanText || "",
      imageUrl,
    });

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Community comment error:", error.message);
    return res.status(500).json({ message: "Could not create comment." });
  }
}

export async function deleteCommunityCommentByAuthor(req, res) {
  try {
    if (!ensureCommunityMember(req, res)) return;

    const result = await deleteCommunityComment(req.params.commentId, req.user.id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found or you are not the author." });
    }

    return res.json({ message: "Comment deleted." });
  } catch (error) {
    console.error("Delete community comment error:", error.message);
    return res.status(500).json({ message: "Could not delete comment." });
  }
}
