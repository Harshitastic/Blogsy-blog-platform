'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { 
  Loader2, Calendar, Clock, MessageSquare, 
  Trash2, Edit, Send, MessageCircle, Heart
} from 'lucide-react';
import Link from 'next/link';

// Helper to format date
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Helper to calculate reading time
function getReadingTime(htmlContent) {
  const text = htmlContent ? htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const words = text.split(' ').filter(w => w.length > 0).length;
  const time = Math.max(1, Math.ceil(words / 200));
  return `${time} min read`;
}

export default function PostDetailsPage({ params }) {
  // Unwrap parameters hook in Next.js 15
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  // Fetch post details on mount
  useEffect(() => {
    async function fetchPostDetails() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data.post);
        setLiked(data.liked);
      } catch (error) {
        console.error(error);
        showToast('error', 'Article not found');
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    fetchPostDetails();
  }, [id, router, showToast]);

  const handleLikeToggle = async () => {
    if (!user) {
      showToast('error', 'You must be signed in to like articles');
      return;
    }

    const previousLiked = liked;
    const previousCount = post._count?.likes || 0;

    setLiked(!previousLiked);
    setPost((prev) => ({
      ...prev,
      _count: {
        ...prev._count,
        likes: previousLiked ? previousCount - 1 : previousCount + 1,
      },
    }));

    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setPost((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          likes: data.liked ? previousCount + (previousLiked ? 0 : 1) : previousCount - (previousLiked ? 1 : 0),
        },
      }));
      showToast('success', data.liked ? 'Liked this post!' : 'Unliked this post');
    } catch (error) {
      setLiked(previousLiked);
      setPost((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          likes: previousCount,
        },
      }));
      showToast('error', 'Failed to toggle like');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    setDeletingPost(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete post');
      
      showToast('success', 'Post deleted successfully');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to delete post');
      setDeletingPost(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit comment');
      }

      const data = await res.json();
      
      // Update state with new comment programmatically (reactive UI)
      setPost((prev) => ({
        ...prev,
        comments: [data.comment, ...prev.comments],
      }));

      showToast('success', 'Comment added!');
      setCommentContent('');
    } catch (error) {
      console.error(error);
      showToast('error', error.message || 'Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete comment');

      // Update state programmatically
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));

      showToast('success', 'Comment deleted');
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="logo-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading article...</p>
      </div>
    );
  }

  if (!post) return null;

  const authorDisplayName = post.author.name || post.author.username;
  const isPostAuthor = user && user.id === post.authorId;
  const readingTime = getReadingTime(post.content);

  return (
    <main className="article-container container animate-fade-in">
      <article>
        <header className="article-header">
          <div className="article-meta-row">
            <span className="article-author-badge">
              By {authorDisplayName}
            </span>
            <span className="article-dot"></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatDate(post.createdAt)}
            </span>
            <span className="article-dot"></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {readingTime}
            </span>
          </div>

          <h1 className="article-title-main text-gradient-style">{post.title}</h1>

          {/* Action Row for Post Author */}
          {isPostAuthor && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Link href={`/posts/${post.id}/edit`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <Edit size={14} />
                <span>Edit Post</span>
              </Link>
              <button 
                onClick={handleDeletePost} 
                className="btn-secondary btn-icon-delete" 
                style={{ padding: '8px 14px', fontSize: '0.85rem', height: 'auto', width: 'auto' }}
                disabled={deletingPost}
              >
                <Trash2 size={14} />
                <span>{deletingPost ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}

          {/* Interaction Bar: Likes */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '10px 0' }}>
            <button 
              onClick={handleLikeToggle} 
              className={`btn-like ${liked ? 'liked' : ''}`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={20} />
              <span>{post._count?.likes || 0} Likes</span>
            </button>
          </div>
        </header>

        {/* Cover Photo */}
        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="article-large-cover animate-fade-in" 
          />
        )}

        {/* HTML Render */}
        <div 
          className="article-body-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2 className="comments-title text-gradient-style">
          <MessageCircle size={22} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-cyan)' }} />
          Discussion ({post.comments?.length || 0})
        </h2>

        {/* Comment Box Input */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              className="comment-input-area"
              placeholder="Join the discussion... Share your thoughts."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
            ></textarea>
            <div className="comment-submit-row">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submittingComment || !commentContent.trim()}
              >
                <Send size={14} />
                <span>{submittingComment ? 'Sending...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', marginBottom: '32px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '0.95rem' }}>
              You must{' '}
              <Link href="/login" className="auth-link">
                Sign In
              </Link>{' '}
              to participate in comments.
            </p>
          </div>
        )}

        {/* Comments Listing */}
        <div className="comments-list">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => {
              const commentAuthorDisplay = comment.author.name || comment.author.username;
              // Permission check: comment creator OR post creator
              const canDeleteComment = user && (user.id === comment.authorId || user.id === post.authorId);
              
              return (
                <div key={comment.id} className="comment-card glass-panel animate-fade-in">
                  <div className="comment-card-header">
                    <div className="comment-user-info">
                      <div className="comment-user-initial">
                        {comment.author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="comment-user-name">{commentAuthorDisplay}</div>
                        <div className="comment-user-date">{formatDate(comment.createdAt)}</div>
                      </div>
                    </div>

                    {canDeleteComment && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="btn-comment-delete" 
                        title="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              );
            })
          ) : (
            <p className="empty-comments-message">No comments yet. Start the conversation!</p>
          )}
        </div>
      </section>
    </main>
  );
}
