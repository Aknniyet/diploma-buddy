import { query } from "../config/db.js";

export function findCommunityPosts(userId) {
  return query(
    `SELECT
       p.id,
       p.title,
       p.description,
       p.category,
       p.location,
       p.meeting_time,
       p.image_url,
       p.created_at,
       u.id AS author_id,
       u.full_name AS author_name,
       u.role AS author_role,
       u.profile_photo_url AS author_photo_url,
       COUNT(DISTINCT i.id)::int AS interested_count,
       COALESCE(
         JSON_AGG(
           DISTINCT JSONB_BUILD_OBJECT(
             'id', c.id,
             'text', c.text,
             'image_url', c.image_url,
             'created_at', c.created_at,
             'author_id', cu.id,
             'author_name', cu.full_name,
             'author_role', cu.role,
             'author_photo_url', cu.profile_photo_url
           )
         ) FILTER (WHERE c.id IS NOT NULL),
         '[]'
       ) AS comments,
       EXISTS (
         SELECT 1
         FROM community_post_interests mine
         WHERE mine.post_id = p.id AND mine.user_id = $1
       ) AS is_interested
     FROM community_posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN community_post_interests i ON i.post_id = p.id
     LEFT JOIN community_comments c ON c.post_id = p.id
     LEFT JOIN users cu ON cu.id = c.author_id
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC`,
    [userId]
  );
}

export function createCommunityPost(userId, postData) {
  return query(
    `INSERT INTO community_posts (
       author_id, title, description, category, location, meeting_time, image_url
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, description, category, location, meeting_time, image_url, created_at`,
    [
      userId,
      postData.title,
      postData.description,
      postData.category,
      postData.location || null,
      postData.meetingTime || null,
      postData.imageUrl || null,
    ]
  );
}

export function findCommunityPostById(postId) {
  return query("SELECT id, author_id FROM community_posts WHERE id = $1", [postId]);
}

export function addCommunityInterest(postId, userId) {
  return query(
    `INSERT INTO community_post_interests (post_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING`,
    [postId, userId]
  );
}

export function removeCommunityInterest(postId, userId) {
  return query(
    "DELETE FROM community_post_interests WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );
}

export function createCommunityComment(postId, userId, text) {
  return query(
    `WITH inserted AS (
       INSERT INTO community_comments (post_id, author_id, text, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, author_id, text, image_url, created_at
     )
     SELECT
       inserted.id,
       inserted.text,
       inserted.image_url,
       inserted.created_at,
       u.id AS author_id,
       u.full_name AS author_name,
       u.role AS author_role,
       u.profile_photo_url AS author_photo_url
     FROM inserted
     JOIN users u ON u.id = inserted.author_id`,
    [postId, userId, text.text, text.imageUrl || null]
  );
}

export function updateCommunityPost(postId, userId, postData) {
  return query(
    `UPDATE community_posts
     SET title = $1,
         description = $2,
         category = $3,
         location = $4,
         meeting_time = $5,
         image_url = $6,
         updated_at = NOW()
     WHERE id = $7 AND author_id = $8
     RETURNING id, title, description, category, location, meeting_time, image_url, created_at`,
    [
      postData.title,
      postData.description,
      postData.category,
      postData.location || null,
      postData.meetingTime || null,
      postData.imageUrl || null,
      postId,
      userId,
    ]
  );
}

export function deleteCommunityPost(postId, userId) {
  return query(
    "DELETE FROM community_posts WHERE id = $1 AND author_id = $2 RETURNING id",
    [postId, userId]
  );
}

export function deleteCommunityComment(commentId, userId) {
  return query(
    "DELETE FROM community_comments WHERE id = $1 AND author_id = $2 RETURNING id",
    [commentId, userId]
  );
}
