'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { 
  Plus, Edit, Trash2, Loader2, FileText, 
  MessageSquare, Layers, EyeOff, Eye, Image as ImageIcon, Heart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper to format date
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchUserPosts() {
      try {
        const res = await fetch(`/api/posts?authorId=${user.id}`);
        if (!res.ok) throw new Error('Failed to retrieve your posts');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error(error);
        showToast('error', 'Could not load your articles');
      } finally {
        setLoading(false);
      }
    }

    fetchUserPosts();
  }, [user, showToast]);

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    setDeletingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('success', 'Article deleted successfully');
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not delete article');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="logo-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard panel...</p>
      </div>
    );
  }

  if (!user) return null;

  // Stats calculators
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.published).length;
  const draftPosts = totalPosts - publishedPosts;
  const totalComments = posts.reduce((sum, p) => sum + (p._count?.comments || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0);

  return (
    <div className="dashboard-container container animate-fade-in">
      <div className="dashboard-heading-section">
        <div>
          <h1 className="dashboard-title text-gradient-style">Writer Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Welcome back, {user.name || user.username}! Manage your writings here.
          </p>
        </div>

        <Link href="/posts/new" className="btn-primary">
          <Plus size={16} />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-value">{totalPosts}</div>
          <div className="stat-label">Total Articles</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value" style={{ color: '#50fa7b' }}>{publishedPosts}</div>
          <div className="stat-label">Published Articles</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value" style={{ color: '#ffb86c' }}>{draftPosts}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{totalComments}</div>
          <div className="stat-label">Total Comments</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value" style={{ color: '#ff79c6' }}>{totalLikes}</div>
          <div className="stat-label">Total Likes</div>
        </div>
      </div>

      {/* Posts List */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '700' }} className="text-gradient-style">
        Your Articles
      </h2>

      {posts.length === 0 ? (
        <div className="glass-panel empty-state">
          <FileText size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">You haven't written any posts yet</h3>
          <p className="empty-state-desc">Share your knowledge, ideas, and stories with the world.</p>
          <Link href="/posts/new" className="btn-primary">
            <Plus size={16} />
            <span>Create Your First Post</span>
          </Link>
        </div>
      ) : (
        <div className="dashboard-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="glass-panel dashboard-post-item animate-fade-in">
              <div className="dash-post-info">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="dash-post-thumbnail" />
                ) : (
                  <div className="dash-post-no-thumbnail">
                    <ImageIcon size={16} />
                  </div>
                )}
                
                <div className="dash-post-text">
                  <Link href={`/posts/${post.id}`} className="dash-post-title" style={{ hover: { color: 'var(--accent-cyan)' } }}>
                    {post.title}
                  </Link>
                  <div className="dash-post-meta">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
                      {post.published ? <Eye size={12} style={{ color: '#50fa7b' }} /> : <EyeOff size={12} style={{ color: '#ffb86c' }} />}
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span>Created: {formatDate(post.createdAt)}</span>
                    <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={12} />
                      {post._count?.comments || 0}
                    </span>
                    <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Heart size={12} style={{ fill: (post._count?.likes > 0 ? '#ff5f5f' : 'none'), color: (post._count?.likes > 0 ? '#ff5f5f' : 'var(--text-muted)') }} />
                      {post._count?.likes || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dash-post-actions">
                <Link href={`/posts/${post.id}`} className="btn-secondary btn-icon" title="View Post">
                  <Eye size={16} />
                </Link>
                
                <Link href={`/posts/${post.id}/edit`} className="btn-secondary btn-icon" title="Edit Post">
                  <Edit size={16} />
                </Link>

                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="btn-secondary btn-icon btn-icon-delete"
                  disabled={deletingId === post.id}
                  title="Delete Post"
                >
                  {deletingId === post.id ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
