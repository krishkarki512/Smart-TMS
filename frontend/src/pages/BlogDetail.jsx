import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import "../styles/blogd.css";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [showReplyBox, setShowReplyBox] = useState({});
  const [replyText, setReplyText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/accounts/profile/")
      .then((res) => setCurrentUserId(res.data.id))
      .catch(() => setCurrentUserId(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/blogs/${slug}/`)
      .then((res) => {
        setBlog(res.data);
        setLikesCount(res.data.likes_count);
        setLiked(res.data.is_liked);
        setError(null);
        setCurrentPage(1);
      })
      .catch(() => {
        setError("Failed to load blog");
        setBlog(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchComments = (page = 1) => {
    if (!blog) return;
    axiosInstance
      .get(`/blogs/${blog.id}/comments/?page=${page}`)
      .then((res) => {
        const topLevelComments = (res.data.results || []).filter((c) => !c.parent);
        setComments(topLevelComments);
        setNextPageUrl(res.data.next);
        setPrevPageUrl(res.data.previous);
        setTotalCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / 5));
      })
      .catch(() => {
        setComments([]);
        setTotalCount(0);
        setTotalPages(1);
      });
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [blog, currentPage]);

  const handleLike = async () => {
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login to like this blog.");
    }
    setLiked((prevLiked) => !prevLiked);
    setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));

    setActionLoading(true);
    try {
      const res = await axiosInstance.post(`/blogs/${blog.id}/toggle-like/`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch {
      setLiked((prevLiked) => !prevLiked);
      setLikesCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
      toast.error("Failed to toggle like.");
    }
    setActionLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login to comment.");
    }
    if (!newComment.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/blogs/${blog.id}/comments/`, {
        text: newComment.trim(),
      });
      setNewComment("");
      setCurrentPage(1);
      fetchComments(1);
      toast.success("Comment posted successfully!");
    } catch (error) {
      if (error.response?.data) {
        const errMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data);
        toast.error(`Failed to post comment: ${errMsg}`);
      } else {
        toast.error("Failed to post comment.");
      }
    }
    setActionLoading(false);
  };

  const toggleReplyBox = (commentId) => {
    setShowReplyBox((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyTextChange = (commentId, text) => {
    setReplyText((prev) => ({ ...prev, [commentId]: text }));
  };

  const handleReplySubmit = async (parentId) => {
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login to reply.");
    }
    if (!replyText[parentId] || !replyText[parentId].trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/blogs/${blog.id}/comments/`, {
        text: replyText[parentId].trim(),
        parent: parentId,
      });
      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setShowReplyBox((prev) => ({ ...prev, [parentId]: false }));
      setCurrentPage(1);
      fetchComments(1);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply.");
    }
    setActionLoading(false);
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const saveEditedComment = async () => {
    if (!editedCommentText.trim()) return;
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login to edit comment.");
    }
    setActionLoading(true);
    try {
      const res = await axiosInstance.put(`/blogs/comments/${editingCommentId}/`, {
        text: editedCommentText.trim(),
      });
      const updatedComment = res.data;
      const updateComments = (commentsList) =>
        commentsList.map((c) => {
          if (c.id === updatedComment.id) return updatedComment;
          if (c.replies && c.replies.length) {
            return { ...c, replies: updateComments(c.replies) };
          }
          return c;
        });
      setComments((prev) => updateComments(prev));
      toast.success("Comment updated.");
      cancelEditing();
    } catch {
      toast.error("Failed to update comment.");
    }
    setActionLoading(false);
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login required.");
    }
    setActionLoading(true);
    try {
      await axiosInstance.delete(`/blogs/comments/${commentId}/`);
      setCurrentPage(1);
      fetchComments(1);
      toast.success("Comment deleted.");
    } catch {
      toast.error("Failed to delete comment.");
    }
    setActionLoading(false);
  };

  const toggleCommentLike = async (commentId) => {
    if (!localStorage.getItem("access_token")) {
      return toast.warning("Login to like comments.");
    }
    setComments((prevComments) => {
      const toggleLikeRecursive = (list) =>
        list.map((comment) => {
          if (comment.id === commentId) {
            const likedNow = !comment.is_liked;
            const likesCountNow = likedNow
              ? comment.likes_count + 1
              : comment.likes_count - 1;
            return {
              ...comment,
              is_liked: likedNow,
              likes_count: likesCountNow,
            };
          }
          if (comment.replies && comment.replies.length) {
            return {
              ...comment,
              replies: toggleLikeRecursive(comment.replies),
            };
          }
          return comment;
        });
      return toggleLikeRecursive(prevComments);
    });

    setActionLoading(true);
    try {
      const res = await axiosInstance.post(`/blogs/comments/${commentId}/toggle-like/`);
      const updated = res.data;
      setComments((prevComments) => {
        const updateComments = (list) =>
          list.map((comment) => {
            if (comment.id === updated.id) {
              return {
                ...comment,
                is_liked: updated.is_liked,
                likes_count: updated.likes_count,
              };
            }
            if (comment.replies && comment.replies.length) {
              return { ...comment, replies: updateComments(comment.replies) };
            }
            return comment;
          });
        return updateComments(prevComments);
      });
    } catch {
      toast.error("Failed to like comment.");
      setComments((prevComments) => {
        const toggleLikeRecursive = (list) =>
          list.map((comment) => {
            if (comment.id === commentId) {
              const likedNow = !comment.is_liked;
              const likesCountNow = likedNow
                ? comment.likes_count + 1
                : comment.likes_count - 1;
              return {
                ...comment,
                is_liked: likedNow,
                likes_count: likesCountNow,
              };
            }
            if (comment.replies && comment.replies.length) {
              return {
                ...comment,
                replies: toggleLikeRecursive(comment.replies),
              };
            }
            return comment;
          });
        return toggleLikeRecursive(prevComments);
      });
    }
    setActionLoading(false);
  };

  // Recursive render of comments with Bootstrap classes
  const renderComment = (comment, isReply = false) => (
    <div
      key={comment.id}
      className={`blog-detail-comment-card${isReply ? " blog-detail-comment-reply" : ""}`}
    >
      <div className="blog-detail-comment-header">
        <span className="blog-detail-comment-author">{comment.author?.username || "Unknown"}</span>
        <span className="blog-detail-comment-date">{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      {editingCommentId === comment.id ? (
        <>
          <textarea
            className="blog-detail-comment-textarea"
            value={editedCommentText}
            onChange={(e) => setEditedCommentText(e.target.value)}
            disabled={actionLoading}
            rows={3}
          />
          <div className="blog-detail-comment-actions">
            <button
              className="blog-detail-btn is-primary"
              onClick={saveEditedComment}
              disabled={!editedCommentText.trim() || actionLoading}
            >
              Save
            </button>
            <button
              className="blog-detail-btn is-secondary"
              onClick={cancelEditing}
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="blog-detail-comment-text">{comment.text}</div>
      )}
      {editingCommentId !== comment.id && (
        <div className="blog-detail-comment-actions">
          <button
            type="button"
            className={`blog-detail-btn is-like${comment.is_liked ? " is-active-red" : ""}`}
            onClick={() => toggleCommentLike(comment.id)}
            disabled={actionLoading}
          >
            ❤️ {comment.likes_count}
          </button>
          <button
            type="button"
            className="blog-detail-btn is-reply"
            onClick={() => toggleReplyBox(comment.id)}
            disabled={actionLoading}
          >
            Reply
          </button>
          {currentUserId === comment.author?.id && (
            <>
              <button
                type="button"
                className="blog-detail-btn is-edit"
                onClick={() => startEditing(comment)}
                disabled={actionLoading}
              >
                Edit
              </button>
              <button
                type="button"
                className="blog-detail-btn is-delete"
                onClick={() => deleteComment(comment.id)}
                disabled={actionLoading}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
      {showReplyBox[comment.id] && (
        <div className="blog-detail-reply-box">
          <textarea
            className="blog-detail-comment-textarea"
            rows={2}
            placeholder="Write a reply..."
            value={replyText[comment.id] || ""}
            onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
            disabled={actionLoading}
          />
          <button
            className="blog-detail-btn is-primary"
            onClick={() => handleReplySubmit(comment.id)}
            disabled={!replyText[comment.id]?.trim() || actionLoading}
          >
            Post Reply
          </button>
        </div>
      )}
      {comment.replies &&
        comment.replies.length > 0 &&
        comment.replies.map((reply) => renderComment(reply, true))}
    </div>
  );

  if (loading) return <div className="blog-detail-loading">Loading blog...</div>;
  if (error) return <div className="blog-detail-error">{error}</div>;
  if (!blog) return <div className="blog-detail-warning">Blog not found.</div>;

  return (
    <div className="blog-detail-container">
      {/* Breadcrumbs */}
      <nav className="blog-detail-breadcrumbs">
        <Link to="/blogs">Blogs</Link>
        <span className="blog-detail-breadcrumb-sep">/</span>
        <span>{blog.title}</span>
      </nav>
      <div className="blog-detail-card">
        <h1 className="blog-detail-title">{blog.title}</h1>
        <div className="blog-detail-author">
          {blog.author?.profile_image && (
            <img
              className="blog-detail-author-img"
              src={
                blog.author.profile_image.startsWith("http")
                  ? blog.author.profile_image
                  : `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}${blog.author.profile_image}`
              }
              alt={blog.author.username}
            />
          )}
          <div>
            <span className="blog-detail-author-name">{blog.author?.username}</span>
            {blog.category_details && (
              <Link to={`/blogs?category=${blog.category_details.id}`} className="blog-detail-category">
                {blog.category_details.name}
              </Link>
            )}
          </div>
        </div>
        {blog.thumbnail && (
          <img src={blog.thumbnail} alt={blog.title} className="blog-detail-thumbnail" />
        )}
        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        {blog.tags && (
          <div className="blog-detail-tags">
            {blog.tags.split(",").map((tag, i) => (
              <span key={i} className="blog-detail-tag">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="blog-detail-actions">
          <button
            className={`blog-detail-like-btn${liked ? " is-active-red" : ""}`}
            onClick={handleLike}
            disabled={actionLoading}
          >
            {liked ? "Liked" : "Like"} <span>{likesCount}</span>
          </button>
          <span className="blog-detail-views">Views: {blog.views}</span>
        </div>
      </div>
      <div className="blog-detail-comments">
        <h4>Comments ({totalCount})</h4>
        <form onSubmit={handleCommentSubmit} className="blog-detail-comment-form">
          <textarea
            className="blog-detail-comment-textarea"
            rows={3}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            disabled={actionLoading}
          />
          <button
            type="submit"
            className="blog-detail-comment-submit"
            disabled={!newComment.trim() || actionLoading}
          >
            Post Comment
          </button>
        </form>
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <p className="blog-detail-no-comments">No comments yet.</p>
        )}
        {totalPages > 1 && (
          <nav className="blog-detail-pagination">
            <button
              className={`blog-detail-pagination-btn${!prevPageUrl ? " is-disabled" : ""}`}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={!prevPageUrl}
            >
              Previous
            </button>
            <span className="blog-detail-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={`blog-detail-pagination-btn${!nextPageUrl ? " is-disabled" : ""}`}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={!nextPageUrl}
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
