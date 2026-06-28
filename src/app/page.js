'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Clock, Calendar, AlertCircle, Heart, ArrowRight } from 'lucide-react';

// Helper to strip HTML and calculate excerpt and reading time
function getExcerptAndReadingTime(htmlContent) {
  const text = htmlContent ? htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const words = text.split(' ').filter(w => w.length > 0);
  const wordCount = words.length;
  
  const excerpt = wordCount > 25 ? words.slice(0, 25).join(' ') + '...' : text || 'No content preview available.';
  const time = Math.max(1, Math.ceil(wordCount / 200));
  
  return { excerpt, readingTime: `${time} min read` };
}

// Helper to format date
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [exitIntro, setExitIntro] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeen) {
      setShowIntro(true);
    }
  }, []);

  const handleEnterIntro = () => {
    setExitIntro(true);
    sessionStorage.setItem('hasSeenIntro', 'true');
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError('Could not retrieve posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const { excerpt } = getExcerptAndReadingTime(post.content);
    return (
      post.title.toLowerCase().includes(query) ||
      excerpt.toLowerCase().includes(query) ||
      (post.author.name || post.author.username).toLowerCase().includes(query)
    );
  });

  if (showIntro) {
    return (
      <div className={`immersive-intro-overlay ${exitIntro ? 'exit' : ''}`}>
        <div className="intro-grid-background"></div>
        <div className="intro-content">
          <h1 className="intro-logo">Blogsy</h1>
          <p className="intro-tagline">Thoughts write themselves.</p>
          <button onClick={handleEnterIntro} className="btn-intro-enter">
            <span>Start Reading</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title text-gradient-style">Thoughts write themselves.</h1>
        <p className="hero-subtitle">
          Welcome to Blogsy. Explore deep perspectives, discover technology, design, and culture, and join the conversation.
        </p>
      </section>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon-inside" size={20} />
          <input
            className="search-input"
            type="text"
            placeholder="Search posts, summaries, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Section */}
      {loading ? (
        <div className="feed-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="post-card glass-panel" style={{ minHeight: '380px', pointerEvents: 'none' }}>
              <div className="card-cover-wrapper" style={{ animation: 'pulse 1.5s infinite' }}></div>
              <div className="card-content" style={{ gap: '12px' }}>
                <div style={{ width: '40%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ width: '90%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ width: '70%', height: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#ff79c6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={40} />
          <p>{error}</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No articles found</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Try modifying your search keywords</p>
        </div>
      ) : (
        <div className="feed-grid">
          {filteredPosts.map((post) => {
            const { excerpt, readingTime } = getExcerptAndReadingTime(post.content);
            const authorDisplayName = post.author.name || post.author.username;
            
            return (
              <Link href={`/posts/${post.id}`} key={post.id}>
                <article className="post-card glass-panel">
                  <div className="card-cover-wrapper">
                    {post.coverImage ? (
                      <img
                        className="card-cover"
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="card-no-cover">
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', opacity: 0.15 }}>BLOGSY</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <div className="card-author-row">
                      <span className="card-author-name">By {authorDisplayName}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <h2 className="card-title">{post.title}</h2>
                    <p className="card-excerpt">{excerpt}</p>
                    
                    <div className="card-footer">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {readingTime}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="card-comment-count" title="Comments">
                          <MessageSquare size={14} />
                          {post._count?.comments || 0}
                        </span>
                        
                        <span className="card-like-count" title="Likes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} style={{ fill: (post._count?.likes > 0 ? '#ff5f5f' : 'none'), color: (post._count?.likes > 0 ? '#ff5f5f' : 'var(--text-muted)') }} />
                          {post._count?.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
