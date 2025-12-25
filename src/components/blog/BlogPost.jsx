import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blogAPI, bookmarkAPI } from '../../services/api';
import { useBlogViewTracking } from '../../hooks/useBlogViewTracking';
import '../../styles/design-system.css';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Track view and time spent on this blog post
  useBlogViewTracking(id, !loading && !!post);

  useEffect(() => {
    loadPost();
    if (user) {
      checkBookmark();
    }
  }, [id, user]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getPost(id);
      setPost(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await bookmarkAPI.isBookmarked(id, user.id);
      setIsBookmarked(response.data);
    } catch (error) {
      console.error('Failed to check bookmark:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert('Please login to bookmark posts');
      navigate('/login');
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkAPI.removeBookmark(id, user.id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.addBookmark(id, user.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      alert('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-container">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Article Not Found</h2>
            <p>{error || 'This article could not be found'}</p>
            <Link to="/blog" className="btn btn-primary">
              ← Back to Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="blog-post-container">
      <article className="blog-post">
        {/* Header */}
        <div className="post-header">
          <Link to="/blog" className="back-link">
            ← Back to Articles
          </Link>

          <div className="post-meta">
            <span className="badge badge-primary">{post.category}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <h1 className="post-title">{post.title}</h1>

          {post.summary && (
            <p className="post-summary">{post.summary}</p>
          )}

          <div className="post-actions-bar">
            <div className="post-stats">
              <span>👁 {post.viewCount || 0} views</span>
            </div>

            <div className="post-actions">
              {user && (
                <button
                  className={`btn ${isBookmarked ? 'btn-primary' : 'btn-outline'}`}
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                >
                  {isBookmarked ? '🔖 Saved' : '📑 Save'}
                </button>
              )}
              {isAdmin && (
                <Link to={`/admin/blog/edit/${post.id}`} className="btn btn-secondary">
                  ✏️ Edit
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="post-featured-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}

        {/* Content */}
        <div className="post-content">
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="post-tags">
            {post.tags.split(',').map((tag, index) => (
              <span key={index} className="tag">#{tag.trim()}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="post-footer">
          <div className="post-footer-content">
            <div>
              <h3>Did you find this article helpful?</h3>
              <p>Save it for later or explore more articles</p>
            </div>
            <div className="post-footer-actions">
              {user && !isBookmarked && (
                <button className="btn btn-primary" onClick={handleBookmarkToggle}>
                  📑 Save This Article
                </button>
              )}
              <Link to="/blog" className="btn btn-secondary">
                Browse More Articles
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
