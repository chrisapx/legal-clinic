import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blogAPI, bookmarkAPI } from '../../services/api';
import '../../styles/design-system.css';
import './BlogList.css';

function BlogList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const categories = ['All', 'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 'Constitutional Law', 'Property Law'];

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getPublishedPostsPaginated(
        searchTerm,
        selectedCategory,
        currentPage,
        pageSize
      );
      setPosts(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await bookmarkAPI.getUserBookmarks(user.id, 0, 100);
      const bookmarkedIds = new Set((response.data?.content || []).map(post => post.id));
      setBookmarkedPosts(bookmarkedIds);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleBookmarkToggle = async (postId) => {
    if (!user) {
      alert('Please login to bookmark posts');
      return;
    }

    try {
      if (bookmarkedPosts.has(postId)) {
        await bookmarkAPI.removeBookmark(postId, user.id);
        setBookmarkedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await bookmarkAPI.addBookmark(postId, user.id);
        setBookmarkedPosts(prev => new Set([...prev, postId]));
      }
    } catch (error) {
      alert('Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <div className="blog-list-container">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      {/* Hero Section */}
      <div className="blog-hero gradient-bg">
        <div className="container">
          <h1 className="blog-hero-title">Legal Resources & Insights</h1>
          <p className="blog-hero-subtitle">
            Expert articles, guides, and analysis to help you understand the law
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              className="input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-chip ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>
            {totalElements} {totalElements === 1 ? 'article' : 'articles'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Blog Grid */}
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Articles Found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post) => (
              <article key={post.id} className="card blog-card">
                {post.imageUrl && (
                  <div className="blog-card-image">
                    <img src={post.imageUrl} alt={post.title} />
                    {user && (
                      <button
                        className={`bookmark-btn ${bookmarkedPosts.has(post.id) ? 'bookmarked' : ''}`}
                        onClick={() => handleBookmarkToggle(post.id)}
                        title={bookmarkedPosts.has(post.id) ? 'Remove bookmark' : 'Bookmark this post'}
                      >
                        {bookmarkedPosts.has(post.id) ? '🔖' : '📑'}
                      </button>
                    )}
                  </div>
                )}

                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="badge badge-primary">{post.category}</span>
                    <span className="blog-card-date">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h2 className="blog-card-title">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </h2>

                  {post.summary && (
                    <p className="blog-card-summary">{post.summary}</p>
                  )}

                  <div className="blog-card-footer">
                    <Link to={`/blog/${post.id}`} className="btn btn-primary">
                      Read Article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  <span>Page {currentPage + 1} of {totalPages}</span>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BlogList;
